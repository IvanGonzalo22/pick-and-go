using System;
using System.Linq;
using System.Security.Cryptography;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using PickAndGo.Api.Features.Auth.DTOs;
using PickAndGo.Api.Features.Auth.Models;
using PickAndGo.Api.Infrastructure.Persistence;

namespace PickAndGo.Api.Features.Auth.Services
{
    public class AuthService
    {
        private readonly AppDbContext _context;
        public AuthService(AppDbContext context) => _context = context;

        public async Task<AuthResponseDto> RegisterClientAsync(RegisterClientDto dto)
            => await RegisterAsync(dto, "Client");

        public async Task<AuthResponseDto> RegisterEmployeeAsync(RegisterClientDto dto)
            => await RegisterAsync(dto, "Employee");

        private async Task<AuthResponseDto> RegisterAsync(RegisterClientDto dto, string role)
        {
            // Generar salt aleatorio
            byte[] salt = new byte[16];
            RandomNumberGenerator.Fill(salt);

            // Crear hash SHA-256 de (password + salt)
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
                CreatedAt    = DateTime.UtcNow
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
    }
}
