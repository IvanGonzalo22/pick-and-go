// server/Features/Orders/DTOs/EmployeeOrderDto.cs
using System;
using System.Collections.Generic;

namespace server.Features.Orders.DTOs
{
    public class EmployeeOrderDto
    {
        public Guid OrderId { get; set; }
        public string ShortCode { get; set; } = string.Empty;

        public string CustomerName { get; set; } = string.Empty;
        public string CustomerEmail { get; set; } = string.Empty;

        public decimal Total { get; set; }
        public string Status { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; }
        public DateTime PendingAt { get; set; }
        public DateTime? ReadyAt { get; set; }
        public DateTime? CollectedAt { get; set; }
        public DateTime? PaidAt { get; set; }

        public List<EmployeeOrderItemDto> Items { get; set; } = new();

        // Nota: los cálculos de "tiempo en pending" o "tiempo en ready" se harán en el frontend,
        // restando (Now − PendingAt) o (Now − ReadyAt). Cuando el estado cambie, ReadyAt y/of CollectedAt ya estarán fijados.
    }
}
