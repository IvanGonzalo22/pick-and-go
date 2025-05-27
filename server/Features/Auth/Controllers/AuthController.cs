using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using server.Features.Auth.DTOs;
using server.Features.Auth.Services;

namespace server.Features.Auth.Controllers
{
    [ApiController]
    [Route("auth")]
    public class AuthController : ControllerBase
    {
        private readonly AuthService _authService;
        public AuthController(AuthService authService)
            => _authService = authService;

        // ************* Registro de nuevo cliente *************
        // Crea un usuario con rol "Client" y devuelve sus datos (sin credenciales)
        [HttpPost("register-client")]
        public async Task<IActionResult> RegisterClient([FromBody] RegisterClientDto dto)
        {
            var user = await _authService.RegisterClientAsync(dto);
            return CreatedAtAction(nameof(Login), new { id = user.Id }, user);
        }

        // ************* Registro de nuevo empleado *************
        // Crea un usuario con rol "Employee" (solo accesible para SuperAdmin)
        [HttpPost("register-employee")]
        public async Task<IActionResult> RegisterEmployee([FromBody] RegisterClientDto dto)
        {
            var user = await _authService.RegisterEmployeeAsync(dto);
            return CreatedAtAction(nameof(Login), new { id = user.Id }, user);
        }

        // ************* Inicio de sesión *************
        // Valida credenciales y devuelve datos del usuario (sin contraseña)
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            var user = await _authService.LoginAsync(dto);
            return Ok(user);
        }

        // ************* Solicitud de reseteo de contraseña *************
        // Genera un código único, lo guarda con expiración y encola un email
        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotDto dto)
        {
            await _authService.EnqueuePasswordResetAsync(dto.Email);
            return Ok(new { Message = "Si existe una cuenta asociada, recibirás un correo con instrucciones." });
        }

        // ************* Validación del código de reseteo *************
        // Comprueba que el código existe y no ha expirado, retorna el primer nombre para la UI
        [HttpGet("validate-reset")]
        public async Task<IActionResult> ValidateReset([FromQuery] Guid code)
        {
            var (isValid, firstName) = await _authService.ValidateResetCodeAsync(code);
            if (isValid)
                return Ok(new { FirstName = firstName });
            return BadRequest(new { Error = "Código inválido o expirado." });
        }


        // ************* Aplicar nueva contraseña *************
        // Verifica el código, rehasea la contraseña, limpia el código y actualiza PasswordLastChanged
        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetDto dto)
        {
            await _authService.ResetPasswordAsync(dto.Code, dto.NewPassword);
            return Ok(new { Message = "Contraseña actualizada correctamente." });
        }
    }
}