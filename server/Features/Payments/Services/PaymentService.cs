// server/Features/Payments/Services/PaymentService.cs
using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Stripe;
using Stripe.Checkout;
using server.Features.Orders.Services;
using server.Infrastructure.Persistence;

namespace server.Features.Payments.Services
{
    public class PaymentService
    {
        private readonly IConfiguration _config;
        private readonly OrderService _orderService;
        private readonly AppDbContext _db; // Necesitamos el contexto para actualizar PaidAt

        public PaymentService(IConfiguration config, OrderService orderService, AppDbContext db)
        {
            _config = config;
            _orderService = orderService;
            _db = db;
        }

        public async Task<string> CreateCheckoutSessionAsync(
            Guid userId,
            decimal totalAmount,
            string successUrl,
            string cancelUrl)
        {
            decimal roundedTotal = Math.Round(totalAmount, 2, MidpointRounding.ToEven);

            var options = new SessionCreateOptions
            {
                PaymentMethodTypes = new List<string> { "card" },
                Mode = "payment",
                LineItems = new List<SessionLineItemOptions>
                {
                    new SessionLineItemOptions
                    {
                        PriceData = new SessionLineItemPriceDataOptions
                        {
                            UnitAmountDecimal = roundedTotal * 100m,
                            Currency = "eur",
                            ProductData = new SessionLineItemPriceDataProductDataOptions
                            {
                                Name = $"Carrito {userId}"
                            }
                        },
                        Quantity = 1
                    }
                },
                SuccessUrl = $"{successUrl}?session_id={{CHECKOUT_SESSION_ID}}",
                CancelUrl = cancelUrl
            };

            var service = new SessionService();
            Session session = await service.CreateAsync(options);
            return session.Url!;
        }

        public async Task<Guid> ConfirmAndCreateOrderAsync(Guid userId, string sessionId)
        {
            var stripeService = new SessionService();
            Session session = await stripeService.GetAsync(sessionId);

            if (session.PaymentStatus != "paid")
                throw new InvalidOperationException("El pago no se completó.");

            // 1) Crear la orden en BD (corta el carrito)
            Guid newOrderId = await _orderService.CreateOrderFromCartAsync(userId);

            // 2) Actualizar PaidAt en la orden recién creada
            var order = await _db.Orders.FirstOrDefaultAsync(o => o.Id == newOrderId);
            if (order != null)
            {
                order.PaidAt = DateTime.UtcNow;
                _db.Orders.Update(order);
                await _db.SaveChangesAsync();
            }

            return newOrderId;
        }
    }
}
