// server/Features/Products/DTOs/ProductDto.cs
using System;

namespace server.Features.Products.DTOs
{
    public class ProductDto
    {
        public Guid Id { get; set; }            // Para GET/PUT
        public string Name { get; set; } = null!;
        public decimal Price { get; set; }
        public int Stock { get; set; }
        public string ImageUrl { get; set; } = null!;
        public string Category { get; set; } = null!;
        public string Subcategory { get; set; } = null!;
        public string? Comment { get; set; }
        public bool Visible { get; set; }
    }

    public class CreateProductDto
    {
        public string Name { get; set; } = null!;
        public decimal Price { get; set; }
        public int Stock { get; set; }
        public string ImageUrl { get; set; } = null!;
        public string Category { get; set; } = null!;
        public string Subcategory { get; set; } = null!;
        public string? Comment { get; set; }
        public bool Visible { get; set; }
    }

    public class UpdateProductDto : CreateProductDto
    {
        public Guid Id { get; set; }
    }
}
