// server/Features/Payments/Controllers/PaymentsController.cs
using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using server.Features.Payments.Services;
using server.Features.Payments.DTOs;

namespace server.Features.Payments.Controllers
{
    [ApiController]
    [Route("payments")]
    [Authorize]
    public class PaymentsController : ControllerBase
    {
        private readonly PaymentService _paymentService;

        public PaymentsController(PaymentService paymentService)
        {
            _paymentService = paymentService;
        }

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
        /// POST /payments/create-checkout-session
        /// Recibe: CreateCheckoutSessionRequest { Total }
        /// Devuelve: { url: string }
        /// </summary>
        [HttpPost("create-checkout-session")]
        public async Task<IActionResult> CreateCheckout([FromBody] CreateCheckoutSessionRequest req)
        {
            try
            {
                var userId = UserId;
                string successUrl = Request.Headers["Origin"] + "/success";
                string cancelUrl  = Request.Headers["Origin"] + "/cart";

                var sessionUrl = await _paymentService.CreateCheckoutSessionAsync(
                    userId,
                    req.Total,
                    successUrl,
                    cancelUrl
                );

                return Ok(new { url = sessionUrl });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        /// <summary>
        /// POST /payments/confirm
        /// Recibe: ConfirmPaymentRequest { SessionId }
        /// Confirma en Stripe y crea pedido en BD
        /// </summary>
        [HttpPost("confirm")]
        public async Task<IActionResult> ConfirmPayment([FromBody] ConfirmPaymentRequest req)
        {
            try
            {
                var userId = UserId;
                Guid newOrderId = await _paymentService.ConfirmAndCreateOrderAsync(userId, req.SessionId);
                return Ok(new { orderId = newOrderId });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }
    }
}
