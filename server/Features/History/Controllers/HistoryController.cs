// server/Features/History/Controllers/HistoryController.cs
using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using server.Features.History.DTOs;
using server.Features.Orders.Services;
using System.Security.Claims;

namespace server.Features.History.Controllers
{
    [ApiController]
    [Route("history")]
    [Authorize]
    public class HistoryController : ControllerBase
    {
        private readonly OrderService _orderService;

        public HistoryController(OrderService orderService)
        {
            _orderService = orderService;
        }

        // Propiedad para obtener el userId del token/cookie
        private Guid UserId
        {
            get
            {
                var str = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(str) || !Guid.TryParse(str, out Guid id))
                    throw new UnauthorizedAccessException("Usuario no autenticado.");
                return id;
            }
        }

        /// <summary>
        /// GET /history
        /// Devuelve la lista de pedidos del usuario, con sus líneas.
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetHistory()
        {
            try
            {
                var userId = UserId;
                var history = await _orderService.GetOrdersByUserAsync(userId);
                return Ok(history);
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized();
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }
    }
}

