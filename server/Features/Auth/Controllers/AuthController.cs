// server/Features/Auth/Controllers/AuthController.cs
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Mvc;
using server.Features.Auth.DTOs;
using server.Features.Auth.Services;

namespace server.Features.Auth.Controllers
{
    [ApiController]
    [Route("auth")]
    public class AuthController : ControllerBase
    {
        private readonly AuthService  _authService;
        private readonly EmailService _emailService;

        // Inyectamos AuthService (lógica de autenticación y sesiones)
        // e EmailService (para envío de correos)
        public AuthController(AuthService authService, EmailService emailService)
        {
            _authService  = authService;
            _emailService = emailService;
        }

        // ************* Registro de nuevo cliente *************
        // POST /auth/register-client
        // Crea un usuario con rol "Client", almacena su hash de contraseña y devuelve sus datos (sin la contraseña)
        [HttpPost("register-client")]
        public async Task<IActionResult> RegisterClient([FromBody] RegisterClientDto dto)
        {
            var user = await _authService.RegisterClientAsync(dto);
            return CreatedAtAction(
                nameof(Login),
                new { id = user.Id },
                user
            );
        }

        // ************* Registro de nuevo empleado *************
        // POST /auth/register-employee
        // Crea un usuario con rol "Employee" (solo accesible por SuperAdmin)
        [HttpPost("register-employee")]
        public async Task<IActionResult> RegisterEmployee([FromBody] RegisterClientDto dto)
        {
            var user = await _authService.RegisterEmployeeAsync(dto);
            return CreatedAtAction(
                nameof(Login),
                new { id = user.Id },
                user
            );
        }

        // ************* Inicio de sesión *************
        // POST /auth/login
        // Valida credenciales, genera Claims, firma la cookie de autenticación y devuelve datos del usuario
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            // 1) Validar credenciales y obtener datos del usuario
            var user = await _authService.LoginAsync(dto);

            // 2) Crear lista de Claims con la información necesaria
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, $"{user.FirstName} {user.LastName}"),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role)
            };

            // 3) Construir el principal y firmar la cookie
            var identity  = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
            var principal = new ClaimsPrincipal(identity);

            await HttpContext.SignInAsync(
                CookieAuthenticationDefaults.AuthenticationScheme,
                principal,
                new AuthenticationProperties
                {
                    IsPersistent  = true,                           // persiste tras cerrar el navegador
                    ExpiresUtc    = DateTimeOffset.UtcNow.AddHours(1)
                }
            );

            return Ok(user);
        }

        // ************* Logout *************
        // POST /auth/logout
        // Destruye la cookie de autenticación y finaliza la sesión
        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            return NoContent();
        }

        // ************* Consulta de usuario actual *************
        // GET /auth/me
        // Devuelve datos del usuario logueado leyendo la cookie; 401 si no está autenticado
        [HttpGet("me")]
        public IActionResult Me()
        {
            if (!(User.Identity?.IsAuthenticated ?? false))
                return Unauthorized();

            return Ok(new
            {
                Id    = User.FindFirstValue(ClaimTypes.NameIdentifier),
                Email = User.FindFirstValue(ClaimTypes.Email),
                Role  = User.FindFirstValue(ClaimTypes.Role),
                Name  = User.FindFirstValue(ClaimTypes.Name)
            });
        }

        // ************* Solicitud de reseteo de contraseña *************
        // POST /auth/forgot-password
        // Genera un código, lo guarda con expiración y encola el envío de email
        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotDto dto)
        {
            await _authService.EnqueuePasswordResetAsync(dto.Email);
            return Ok(new
            {
                Message = "Si existe una cuenta asociada, recibirás un correo con instrucciones."
            });
        }

        // ************* Validación del código de reseteo *************
        // GET /auth/validate-reset?code={guid}
        // Comprueba que el código existe y no ha caducado, devuelve el nombre para la UI
        [HttpGet("validate-reset")]
        public async Task<IActionResult> ValidateReset([FromQuery] Guid code)
        {
            var (isValid, firstName) = await _authService.ValidateResetCodeAsync(code);
            if (!isValid)
                return BadRequest(new { Error = "Código inválido o expirado." });

            return Ok(new { FirstName = firstName });
        }

        // ************* Aplicar nueva contraseña *************
        // POST /auth/reset-password
        // Re-hasea la contraseña, limpia el código y actualiza el timestamp de cambio
        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetDto dto)
        {
            await _authService.ResetPasswordAsync(dto.Code, dto.NewPassword);
            return Ok(new { Message = "Contraseña actualizada correctamente." });
        }
    }
}