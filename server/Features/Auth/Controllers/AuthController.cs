using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using PickAndGo.Api.Features.Auth.DTOs;
using PickAndGo.Api.Features.Auth.Services;

namespace PickAndGo.Api.Features.Auth.Controllers
{
    [ApiController]
    [Route("auth")]
    public class AuthController : ControllerBase
    {
        private readonly AuthService _authService;
        public AuthController(AuthService authService) 
            => _authService = authService;

        [HttpPost("register-client")]
        public async Task<IActionResult> RegisterClient([FromBody] RegisterClientDto dto)
        {
            var user = await _authService.RegisterClientAsync(dto);
            return CreatedAtAction(nameof(Login), new { id = user.Id }, user);
        }

        [HttpPost("register-employee")]
        public async Task<IActionResult> RegisterEmployee([FromBody] RegisterClientDto dto)
        {
            var user = await _authService.RegisterEmployeeAsync(dto);
            return CreatedAtAction(nameof(Login), new { id = user.Id }, user);
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            var user = await _authService.LoginAsync(dto);
            return Ok(user);
        }
    }
}
