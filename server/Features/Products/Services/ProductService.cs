using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using server.Features.Products.DTOs;
using server.Features.Products.Models;
using server.Infrastructure.Persistence;

namespace server.Features.Products.Services
{
    public class ProductService
    {
        private readonly AppDbContext _db;
        public ProductService(AppDbContext db) => _db = db;

        public async Task<List<ProductDto>> GetAllAsync(string? category = null)
        {
            var query = _db.Products.AsQueryable();
            if (!string.IsNullOrEmpty(category))
                query = query.Where(p => p.Category == category);
            var list = await query.ToListAsync();
            return list.ConvertAll(ToDto);
        }

        public async Task<ProductDto?> GetByIdAsync(Guid id)
        {
            var p = await _db.Products.FindAsync(id);
            return p is null ? null : ToDto(p);
        }

        public async Task<ProductDto> CreateAsync(CreateProductDto dto)
        {
            var p = new Product {
                Id = Guid.NewGuid(),
                Name = dto.Name,
                Price = dto.Price,
                Stock = dto.Stock,
                ImageUrl = dto.ImageUrl,
                Category = dto.Category,
                Subcategory = dto.Subcategory,
                Comment = dto.Comment,
                Visible = dto.Visible
            };
            _db.Products.Add(p);
            await _db.SaveChangesAsync();
            return ToDto(p);
        }

        public async Task<ProductDto?> UpdateAsync(UpdateProductDto dto)
        {
            var p = await _db.Products.FindAsync(dto.Id);
            if (p == null) return null;
            p.Name = dto.Name;
            p.Price = dto.Price;
            p.Stock = dto.Stock;
            p.ImageUrl = dto.ImageUrl;
            p.Category = dto.Category;
            p.Subcategory = dto.Subcategory;
            p.Comment = dto.Comment;
            p.Visible = dto.Visible;
            await _db.SaveChangesAsync();
            return ToDto(p);
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var p = await _db.Products.FindAsync(id);
            if (p == null) return false;
            _db.Products.Remove(p);
            await _db.SaveChangesAsync();
            return true;
        }

        private static ProductDto ToDto(Product p) => new() {
            Id = p.Id,
            Name = p.Name,
            Price = p.Price,
            Stock = p.Stock,
            ImageUrl = p.ImageUrl,
            Category = p.Category,
            Subcategory = p.Subcategory,
            Comment = p.Comment,
            Visible = p.Visible
        };
    }
}
