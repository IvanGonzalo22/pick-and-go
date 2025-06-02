// server/Features/Cart/Controllers/CartController.cs
using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using server.Features.Cart.DTOs;
using server.Features.Cart.Services;

namespace server.Features.Cart.Controllers
{
    [ApiController]
    [Route("cart")]
    [Authorize]
    public class CartController : ControllerBase
    {
        private readonly CartService _svc;
        public CartController(CartService svc) => _svc = svc;

        // Propiedad corregida:
        private Guid UserId
        {
            get
            {
                var str = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(str) || !Guid.TryParse(str, out Guid id))
                {
                    throw new UnauthorizedAccessException("Usuario no autenticado");
                }
                return id;
            }
        }

        [HttpGet]
        public async Task<IActionResult> Get() =>
            Ok(await _svc.GetCartAsync(UserId));

        [HttpPost("add")]
        public async Task<IActionResult> Add([FromBody] AddCartItemDto dto)
        {
            try
            {
                await _svc.AddToCartAsync(UserId, dto);
                return Ok();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { Error = ex.Message });
            }
        }

        [HttpPut("update")]
        public async Task<IActionResult> Update([FromBody] UpdateCartItemDto dto)
        {
            try
            {
                await _svc.UpdateCartItemAsync(UserId, dto);
                return Ok();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { Error = ex.Message });
            }
        }

        [HttpDelete("remove/{productId:guid}")]
        public async Task<IActionResult> Remove(Guid productId)
        {
            await _svc.RemoveCartItemAsync(UserId, productId);
            return NoContent();
        }

        [HttpPost("validate")]
        public async Task<IActionResult> Validate()
        {
            try
            {
                await _svc.ValidateCartAsync(UserId);
                return Ok();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { Error = ex.Message });
            }
        }

        [HttpPost("checkout")]
        public async Task<IActionResult> Checkout()
        {
            try
            {
                await _svc.CheckoutAsync(UserId);
                return Ok(new { Message = "Pago completado y carrito vaciado" });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { Error = ex.Message });
            }
        }
    }
}
