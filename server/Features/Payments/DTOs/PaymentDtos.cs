// server/Features/Payments/DTOs/PaymentDtos.cs
namespace server.Features.Payments.DTOs
{
    public class CreateCheckoutSessionRequest
    {
        public decimal Total { get; set; }
    }

    public class ConfirmPaymentRequest
    {
        public string SessionId { get; set; } = string.Empty;
    }
}
