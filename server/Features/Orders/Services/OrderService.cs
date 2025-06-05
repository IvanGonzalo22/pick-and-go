using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using server.Features.Cart.Services;
using server.Features.Cart.DTOs;
using server.Features.Orders.Models;
using server.Features.Products.Models;
using server.Infrastructure.Persistence;

namespace server.Features.Orders.Services
{
    public class OrderService
    {
        private readonly AppDbContext _db;
        private readonly CartService _cartService;

        public OrderService(AppDbContext db, CartService cartService)
        {
            _db = db;
            _cartService = cartService;
        }

        /// <summary>
        /// Crea un pedido a partir del carrito del usuario. 
        /// - Copia cada CartItem a OrderItem, descuenta stock, 
        ///   vacía carrito y retorna el Id del nuevo pedido.
        /// </summary>
        public async Task<Guid> CreateOrderFromCartAsync(Guid userId)
        {
            // 1) Obtener datos del carrito
            List<CartItemDto> cartItems = await _cartService.GetCartAsync(userId);
            if (cartItems == null || !cartItems.Any())
                throw new InvalidOperationException("El carrito está vacío.");

            // 2) Calcular total
            decimal total = cartItems.Sum(ci => ci.Price * ci.Quantity);

            // 3) Generar ShortCode (8 primeros caracteres de un GUID)
            string shortCode = Guid.NewGuid().ToString("N").Substring(0, 8).ToUpper();

            // 4) Iniciar transacción
            using var transaction = await _db.Database.BeginTransactionAsync();
            try
            {
                // 5) Crear registro en Orders
                var newOrder = new Order
                {
                    Id = Guid.NewGuid(),
                    UserId = userId,
                    Total = total,
                    Status = "pending",
                    CreatedAt = DateTime.UtcNow,
                    ShortCode = shortCode
                };
                await _db.Orders.AddAsync(newOrder);
                await _db.SaveChangesAsync();

                // 6) Para cada CartItem, crear OrderItem y descontar stock de Product
                foreach (var ci in cartItems)
                {
                    // 6.a) Crear OrderItem
                    var orderItem = new OrderItem
                    {
                        Id = Guid.NewGuid(),
                        OrderId = newOrder.Id,
                        ProductId = ci.ProductId,
                        Quantity = ci.Quantity,
                        UnitPrice = ci.Price
                    };
                    await _db.OrderItems.AddAsync(orderItem);

                    // 6.b) Descontar stock en Products
                    var productEntity = await _db.Products.FindAsync(ci.ProductId);
                    if (productEntity == null)
                        throw new Exception("Producto no encontrado durante la creación del pedido.");

                    if (ci.Quantity > productEntity.Stock)
                        throw new InvalidOperationException($"Stock insuficiente para {productEntity.Name}.");

                    productEntity.Stock -= ci.Quantity;
                    _db.Products.Update(productEntity);
                }

                // 7) Vaciar el carrito (CartItems) del usuario
                var existingCartItems = await _db.CartItems
                    .Where(x => x.UserId == userId)
                    .ToListAsync();
                _db.CartItems.RemoveRange(existingCartItems);

                // 8) Guardar todos los cambios y confirmar transacción
                await _db.SaveChangesAsync();
                await transaction.CommitAsync();

                return newOrder.Id;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }
    }
}
