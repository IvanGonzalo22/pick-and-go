using System;
using System.Linq;
using System.Security.Cryptography;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using server.Features.Auth.DTOs;
using server.Features.Auth.Models;
using server.Infrastructure.Persistence;
using Hangfire;


namespace server.Features.Auth.Services
{
    public class AuthService
    {
        private readonly AppDbContext _context;
        private readonly EmailService _emailService;
        
        // Constructor recibe ambos servicios por DI
        public AuthService(AppDbContext context, EmailService emailService)
        {
            _context = context;
            _emailService = emailService;
        }

        // ************* Registro de cliente *************
        // Crea un nuevo usuario con rol "Client", genera salt y hash, y lo guarda en la BBDD
        public async Task<AuthResponseDto> RegisterClientAsync(RegisterClientDto dto)
            => await RegisterAsync(dto, "Client");

        // ************* Registro de empleado *************
        // Crea un nuevo usuario con rol "Employee" (solo accesible para SuperAdmin)
        public async Task<AuthResponseDto> RegisterEmployeeAsync(RegisterClientDto dto)
            => await RegisterAsync(dto, "Employee");

        // ************* Lógica común de registro *************
        // Genera salt aleatorio, hashea la contraseña + salt, crea la entidad, y la persiste
        private async Task<AuthResponseDto> RegisterAsync(RegisterClientDto dto, string role)
        {
            // Generar salt de 16 bytes
            byte[] salt = new byte[16];
            RandomNumberGenerator.Fill(salt);

            // Construir hash SHA-256 de (password + salt)
            byte[] plain = System.Text.Encoding.UTF8.GetBytes(dto.Password);
            byte[] hashInput = plain.Concat(salt).ToArray();
            byte[] hash = SHA256.HashData(hashInput);

            var user = new User
            {
                FirstName    = dto.FirstName,
                LastName     = dto.LastName,
                Email        = dto.Email,
                Salt         = salt,
                PasswordHash = hash,
                Role         = role,
                CreatedAt    = DateTime.UtcNow,
                // PasswordLastChanged se deja NULL para nuevos usuarios
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return new AuthResponseDto
            {
                Id        = user.Id,
                FirstName = user.FirstName,
                LastName  = user.LastName,
                Email     = user.Email,
                Role      = user.Role
            };
        }

        // ************* Inicio de sesión *************
        // Valida credenciales: reconstruye el hash con la misma salt y compara timing-safe
        public async Task<AuthResponseDto> LoginAsync(LoginDto dto)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == dto.Email);
            if (user == null)
                throw new Exception("Credenciales inválidas");

            byte[] attempt = SHA256.HashData(
                System.Text.Encoding.UTF8.GetBytes(dto.Password)
                .Concat(user.Salt).ToArray()
            );

            if (!CryptographicOperations.FixedTimeEquals(attempt, user.PasswordHash))
                throw new Exception("Credenciales inválidas");

            return new AuthResponseDto
            {
                Id        = user.Id,
                FirstName = user.FirstName,
                LastName  = user.LastName,
                Email     = user.Email,
                Role      = user.Role
            };
        }

        // ************* Encolar reseteo de contraseña *************
        // Genera un código único, lo guarda con expiración, y encola el envío del email en Hangfire
         public async Task EnqueuePasswordResetAsync(string email)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == email);
            if (user == null)
                return;

            user.PasswordResetCode    = Guid.NewGuid();
            user.PasswordResetExpires = DateTime.UtcNow.AddMinutes(15);
            await _context.SaveChangesAsync();

            // Ahora _emailService existe y puedes encolarlo
            BackgroundJob.Enqueue(() =>
                _emailService.SendResetPasswordEmail(user.Email, user.PasswordResetCode.Value)
            );
        }

        // ************* Validar código de reseteo *************
        // Comprueba que el GUID existe y aún no ha expirado
        public async Task<(bool IsValid, string FirstName)> ValidateResetCodeAsync(Guid code)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.PasswordResetCode == code
                                    && u.PasswordResetExpires > DateTime.UtcNow);
            if (user == null)
                return (false, string.Empty);
            return (true, user.FirstName);
        }


        // ************* Aplicar nueva contraseña *************
        // Re-hasea, limpia el código y actualiza PasswordLastChanged timestamp
        public async Task ResetPasswordAsync(Guid code, string newPassword)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.PasswordResetCode == code
                                    && u.PasswordResetExpires > DateTime.UtcNow);
            if (user == null)
                throw new Exception("Código inválido o caducado");

            byte[] salt = new byte[16];
            RandomNumberGenerator.Fill(salt);
            byte[] hash = SHA256.HashData(
                System.Text.Encoding.UTF8.GetBytes(newPassword).Concat(salt).ToArray()
            );

            user.PasswordHash         = hash;
            user.Salt                 = salt;
            user.PasswordResetCode    = null;
            user.PasswordResetExpires = null;
            user.PasswordLastChanged  = DateTime.UtcNow;

            await _context.SaveChangesAsync();
        }
    }
}