// server/Features/Orders/DTOs/EmployeeOrderItemDto.cs
using System;

namespace server.Features.Orders.DTOs
{
    public class EmployeeOrderItemDto
    {
        public Guid ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal Subtotal => UnitPrice * Quantity;
    }
}
