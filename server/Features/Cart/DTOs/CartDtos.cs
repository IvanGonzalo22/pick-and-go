// server/Features/Cart/DTOs/CartDtos.cs
using System;

namespace server.Features.Cart.DTOs
{
    public class CartItemDto
    {
        public Guid ProductId    { get; set; }
        public string Name       { get; set; } = null!;
        public decimal Price     { get; set; }
        public int Quantity      { get; set; }
        public int Stock         { get; set; }
        public string ImageUrl   { get; set; } = null!;
        public string Category   { get; set; } = null!;
        public string Subcategory{ get; set; } = null!;
        public string? Comment   { get; set; }
    }

    public class AddCartItemDto
    {
        public Guid ProductId { get; set; }
        public int Quantity   { get; set; }
    }

    public class UpdateCartItemDto
    {
        public Guid ProductId { get; set; }
        public int Quantity   { get; set; }
    }
}
