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

        // nombre del cliente (al crear el pedido)
        [Required, MaxLength(200)]
        public string CustomerName { get; set; } = string.Empty;

        // email del cliente (al crear el pedido)
        [Required, MaxLength(255)]
        public string CustomerEmail { get; set; } = string.Empty;

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Total { get; set; }

        [Required, MaxLength(20)]
        public string Status { get; set; } = "pending"; 
        // Solo valores permitidos: "pending", "ready", "collected"

        // fecha de creación (mismo que PendingAt en la práctica)
        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // fecha en que se marcó “pending” (se inicializa igual que CreatedAt)
        [Required]
        public DateTime PendingAt { get; set; } = DateTime.UtcNow;

        // fecha en que se marcó “ready”
        public DateTime? ReadyAt { get; set; }

        // fecha en que se marcó “collected”
        public DateTime? CollectedAt { get; set; }

        // fecha en que Stripe confirmó el pago
        public DateTime? PaidAt { get; set; }

        [Required, MaxLength(8)]
        public string ShortCode { get; set; } = string.Empty;
    }
}
