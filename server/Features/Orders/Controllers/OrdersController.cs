// server/Features/Orders/Controllers/OrdersController.cs
using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using server.Features.Orders.DTOs;
using server.Features.Orders.Services;

namespace server.Features.Orders.Controllers
{
    [ApiController]
    [Route("orders")]
    [Authorize(Roles = "Employee,SuperAdmin")]
    public class OrdersController : ControllerBase
    {
        private readonly OrderService _orderService;
        public OrdersController(OrderService orderService)
        {
            _orderService = orderService;
        }

        /// <summary>
        /// GET /orders
        /// Devuelve todas las órdenes con sus líneas para la vista de empleado.
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var orders = await _orderService.GetAllForEmployeeAsync();
                return Ok(orders);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        /// <summary>
        /// PUT /orders/{id}/ready
        /// Marca la orden especificada como "ready".
        /// </summary>
        [HttpPut("{id:guid}/ready")]
        public async Task<IActionResult> MarkReady(Guid id)
        {
            try
            {
                await _orderService.MarkAsReadyAsync(id);
                return Ok(new { Message = "Orden marcada como ‘ready’." });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        /// <summary>
        /// PUT /orders/{id}/collected
        /// Marca la orden especificada como "collected".
        /// </summary>
        [HttpPut("{id:guid}/collected")]
        public async Task<IActionResult> MarkCollected(Guid id)
        {
            try
            {
                await _orderService.MarkAsCollectedAsync(id);
                return Ok(new { Message = "Orden marcada como ‘collected’." });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }
    }
}
