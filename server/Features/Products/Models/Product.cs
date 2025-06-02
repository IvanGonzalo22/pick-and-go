using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace server.Features.Products.Models
{
    public class Product
    {
        [Key]
        public Guid Id { get; set; }

        [Required, MaxLength(200)]
        public string Name { get; set; } = string.Empty;

        [Required, DataType(DataType.Currency)]
        [Column(TypeName = "decimal(18,2)")]       // <-- Precisión y escala explícitas
        public decimal Price { get; set; }

        [Required]
        public int Stock { get; set; }

        [Required, MaxLength(500)]
        public string ImageUrl { get; set; } = string.Empty;

        [Required, MaxLength(100)]
        public string Category { get; set; } = string.Empty;

        [Required, MaxLength(100)]
        public string Subcategory { get; set; } = string.Empty;

        [MaxLength(1000)]
        public string? Comment { get; set; }

        [Required]
        public bool Visible { get; set; } = true;
    }
}
