// server/Features/Orders/Models/Order.cs
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace server.Features.Orders.Models
{
    public class Order
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public Guid UserId { get; set; }

        [Required, MaxLength(200)]
        public string CustomerName { get; set; } = string.Empty;

        [Required, MaxLength(255)]
        public string CustomerEmail { get; set; } = string.Empty;

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Total { get; set; }

        [Required, MaxLength(20)]
        public string Status { get; set; } = "pending"; // "pending","ready","collected"

        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Required]
        public DateTime PendingAt { get; set; } = DateTime.UtcNow;

        public DateTime? ReadyAt { get; set; }

        public DateTime? CollectedAt { get; set; }

        public DateTime? PaidAt { get; set; }

        [Required, MaxLength(8)]
        public string ShortCode { get; set; } = string.Empty;
    }
}
