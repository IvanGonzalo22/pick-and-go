// server/Features/History/DTOs/HistoryDtos.cs
using System;
using System.Collections.Generic;

namespace server.Features.History.DTOs
{
    public class OrderItemHistoryDto
    {
        public Guid ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal Subtotal => UnitPrice * Quantity;
    }

    public class OrderHistoryDto
    {
        public Guid OrderId { get; set; }
        public string ShortCode { get; set; } = string.Empty;
        public decimal Total { get; set; }
        public string Status { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; }
        public DateTime PendingAt { get; set; }
        public DateTime? ReadyAt { get; set; }
        public DateTime? CollectedAt { get; set; }
        public DateTime? PaidAt { get; set; }

        public List<OrderItemHistoryDto> Items { get; set; } = new();

        // Para el cliente puede resultar útil: 
        // el tiempo que lleva en “pending” o “ready” se calcula en el frontend, restando timestamps.
    }
}
