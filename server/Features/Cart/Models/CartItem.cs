// server/Features/Cart/Models/CartItem.cs
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace server.Features.Cart.Models
{
    public class CartItem
    {
        public Guid UserId { get; set; }

        public Guid ProductId { get; set; }

        public int Quantity { get; set; }

        public DateTime LastModified { get; set; } = DateTime.UtcNow;
    }
}
