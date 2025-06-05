// server/Features/Payments/Services/PaymentService.cs
using System;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Stripe;
using Stripe.Checkout;
using server.Features.Orders.Services;

namespace server.Features.Payments.Services
{
    public class PaymentService
    {
        private readonly IConfiguration _config;
        private readonly OrderService _orderService;

        public PaymentService(IConfiguration config, OrderService orderService)
        {
            _config = config;
            _orderService = orderService;
        }

        /// <summary>
        /// Crea una CheckoutSession en Stripe para todo el carrito del usuario,
        /// devolviendo la URL a la que redirigir al cliente.
        /// </summary>
        public async Task<string> CreateCheckoutSessionAsync(
            Guid userId,
            decimal totalAmount,
            string successUrl,
            string cancelUrl)
        {
            // Redondeamos a 2 decimales para evitar valores exponenciales o demasiados dígitos
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
            return session.Url;
        }

        /// <summary>
        /// Confirma que la sesión se pagó correctamente en Stripe y, de ser así,
        /// crea el pedido en BD copiando el carrito a Orders/OrderItems.
        /// </summary>
        public async Task<Guid> ConfirmAndCreateOrderAsync(Guid userId, string sessionId)
        {
            var service = new SessionService();
            Session session = await service.GetAsync(sessionId);

            if (session.PaymentStatus != "paid")
                throw new InvalidOperationException("El pago no se completó.");

            // El pago está OK; creamos el pedido en BD
            Guid newOrderId = await _orderService.CreateOrderFromCartAsync(userId);
            return newOrderId;
        }
    }
}
