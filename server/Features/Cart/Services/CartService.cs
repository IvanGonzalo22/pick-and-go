using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using server.Features.Cart.DTOs;
using server.Features.Cart.Models;
using server.Features.Products.Models;
using server.Infrastructure.Persistence;

namespace server.Features.Cart.Services
{
    public class CartService
    {
        private readonly AppDbContext _db;
        public CartService(AppDbContext db) => _db = db;

        // 1. Obtener carrito del usuario
        public async Task<List<CartItemDto>> GetCartAsync(Guid userId)
        {
            var items = await _db.CartItems
                .Where(ci => ci.UserId == userId)
                .ToListAsync();

            var productIds = items.Select(ci => ci.ProductId).ToList();
            var prods = await _db.Products
                .Where(p => productIds.Contains(p.Id))
                .ToListAsync();

            return items.Select(ci => {
                var p = prods.First(p2 => p2.Id == ci.ProductId);
                return new CartItemDto {
                    ProductId    = p.Id,
                    Name         = p.Name,
                    Price        = p.Price,
                    Quantity     = ci.Quantity,
                    Stock        = p.Stock,
                    ImageUrl     = p.ImageUrl,
                    Category     = p.Category,
                    Subcategory  = p.Subcategory,
                    Comment      = p.Comment
                };
            }).ToList();
        }

        // 2. Añadir o sumar cantidad
        public async Task AddToCartAsync(Guid userId, AddCartItemDto dto)
        {
            var prod = await _db.Products.FindAsync(dto.ProductId)
                ?? throw new Exception("Producto no encontrado");

            var existing = await _db.CartItems
                .FindAsync(userId, dto.ProductId);

            var newQty = (existing?.Quantity ?? 0) + dto.Quantity;
            if (newQty > prod.Stock)
                throw new InvalidOperationException($"Stock insuficiente:{prod.Stock}");

            if (existing == null)
            {
                _db.CartItems.Add(new CartItem {
                    UserId       = userId,
                    ProductId    = dto.ProductId,
                    Quantity     = dto.Quantity
                });
            }
            else
            {
                existing.Quantity     = newQty;
                existing.LastModified = DateTime.UtcNow;
            }

            await _db.SaveChangesAsync();
        }

        // 3. Actualizar cantidad
        public async Task UpdateCartItemAsync(Guid userId, UpdateCartItemDto dto)
        {
            var prod = await _db.Products.FindAsync(dto.ProductId)
                ?? throw new Exception("Producto no encontrado");

            if (dto.Quantity > prod.Stock)
                throw new InvalidOperationException($"Stock insuficiente:{prod.Stock}");

            var existing = await _db.CartItems.FindAsync(userId, dto.ProductId)
                ?? throw new Exception("Ítem no existe en carrito");

            existing.Quantity     = dto.Quantity;
            existing.LastModified = DateTime.UtcNow;
            await _db.SaveChangesAsync();
        }

        // 4. Eliminar línea
        public async Task RemoveCartItemAsync(Guid userId, Guid productId)
        {
            var existing = await _db.CartItems.FindAsync(userId, productId);
            if (existing != null)
            {
                _db.CartItems.Remove(existing);
                await _db.SaveChangesAsync();
            }
        }

        // 5. Validación dry‐run antes de pago
        public async Task ValidateCartAsync(Guid userId)
        {
            var cart = await GetCartAsync(userId);
            var conflicts = cart
                .Where(ci => ci.Quantity > ci.Stock)
                .Select(ci => new {
                    ci.ProductId,
                    available = ci.Stock,
                    requested = ci.Quantity
                }).ToList();

            if (conflicts.Any())
                throw new InvalidOperationException($"Stock insuficiente:{conflicts.First().available}");
        }

        // 6. Checkout definitivo
        public async Task CheckoutAsync(Guid userId)
        {
            using var tx = await _db.Database.BeginTransactionAsync();
            try
            {
                var items = await _db.CartItems
                    .Where(ci => ci.UserId == userId)
                    .ToListAsync();

                foreach (var ci in items)
                {
                    var p = await _db.Products.FindAsync(ci.ProductId)
                        ?? throw new Exception("Producto no encontrado");

                    if (ci.Quantity > p.Stock)
                        throw new InvalidOperationException($"Stock insuficiente:{p.Stock}");

                    p.Stock -= ci.Quantity;
                }

                _db.CartItems.RemoveRange(items);
                await _db.SaveChangesAsync();
                await tx.CommitAsync();
            }
            catch
            {
                await tx.RollbackAsync();
                throw;
            }
        }

        // 7. Limpieza de carrito expirado (>30m)
        public async Task CleanupExpiredCartItems()
        {
            var cutoff = DateTime.UtcNow.AddMinutes(-30);
            var old = _db.CartItems.Where(ci => ci.LastModified < cutoff);
            _db.CartItems.RemoveRange(old);
            await _db.SaveChangesAsync();
        }
    }
}
