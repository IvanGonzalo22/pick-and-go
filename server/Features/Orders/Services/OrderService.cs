// server/Features/Orders/Services/OrderService.cs
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using server.Features.Cart.DTOs;
using server.Features.Cart.Services;
using server.Features.Orders.Models;
using server.Infrastructure.Persistence;
using server.Features.History.DTOs;
using server.Features.Products.Models;

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
        /// Copia cada CartItem a OrderItem, descuenta stock, 
        /// vacía carrito y retorna el Id del nuevo pedido.
        /// También rellena CustomerName, CustomerEmail y PendingAt.
        /// </summary>
        public async Task<Guid> CreateOrderFromCartAsync(Guid userId)
        {
            // 1) Obtener datos del carrito
            List<CartItemDto> cartItems = await _cartService.GetCartAsync(userId);
            if (cartItems == null || !cartItems.Any())
                throw new InvalidOperationException("El carrito está vacío.");

            // 2) Calcular total
            decimal total = cartItems.Sum(ci => ci.Price * ci.Quantity);

            // 3) Obtener datos del usuario para CustomerName/CustomerEmail
            var user = await _db.Users.FindAsync(userId);
            if (user == null)
                throw new Exception("Usuario no encontrado.");

            string customerName = $"{user.FirstName} {user.LastName}";
            string customerEmail = user.Email;

            // 4) Generar ShortCode (8 primeros caracteres de un GUID)
            string shortCode = Guid.NewGuid().ToString("N").Substring(0, 8).ToUpper();

            // 5) Iniciar transacción
            using var transaction = await _db.Database.BeginTransactionAsync();
            try
            {
                // 6) Crear registro en Orders
                var newOrder = new Order
                {
                    Id = Guid.NewGuid(),
                    UserId = userId,
                    CustomerName = customerName,
                    CustomerEmail = customerEmail,
                    Total = total,
                    Status = "pending",
                    CreatedAt = DateTime.UtcNow,
                    PendingAt = DateTime.UtcNow,
                    ShortCode = shortCode
                };
                await _db.Orders.AddAsync(newOrder);
                await _db.SaveChangesAsync();

                // 7) Para cada CartItem, crear OrderItem y descontar stock de Product
                foreach (var ci in cartItems)
                {
                    // 7.a) Crear OrderItem
                    var orderItem = new OrderItem
                    {
                        Id = Guid.NewGuid(),
                        OrderId = newOrder.Id,
                        ProductId = ci.ProductId,
                        Quantity = ci.Quantity,
                        UnitPrice = ci.Price
                    };
                    await _db.OrderItems.AddAsync(orderItem);

                    // 7.b) Descontar stock en Products
                    var productEntity = await _db.Products.FindAsync(ci.ProductId);
                    if (productEntity == null)
                        throw new Exception("Producto no encontrado durante la creación del pedido.");

                    if (ci.Quantity > productEntity.Stock)
                        throw new InvalidOperationException($"Stock insuficiente para {productEntity.Name}.");

                    productEntity.Stock -= ci.Quantity;
                    _db.Products.Update(productEntity);
                }

                // 8) Vaciar el carrito (CartItems) del usuario
                var existingCartItems = await _db.CartItems
                    .Where(x => x.UserId == userId)
                    .ToListAsync();
                _db.CartItems.RemoveRange(existingCartItems);

                // 9) Guardar todos los cambios y confirmar transacción
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

        /// <summary>
        /// Recupera todos los pedidos de un usuario junto con sus líneas.
        /// Devuelve una lista de OrderHistoryDto ordenada por CreatedAt descendente.
        /// </summary>
        public async Task<List<OrderHistoryDto>> GetOrdersByUserAsync(Guid userId)
        {
            // 1) Traer todos los pedidos del usuario
            var orders = await _db.Orders
                .Where(o => o.UserId == userId)
                .OrderByDescending(o => o.CreatedAt)
                .ToListAsync();

            if (!orders.Any())
                return new List<OrderHistoryDto>();

            // 2) Obtener todos los OrderItems de esos pedidos
            var orderIds = orders.Select(o => o.Id).ToList();
            var items = await _db.OrderItems
                .Where(oi => orderIds.Contains(oi.OrderId))
                .ToListAsync();

            // 3) Obtener nombre del producto para cada OrderItem
            var productIds = items.Select(i => i.ProductId).Distinct().ToList();
            var prods = await _db.Products
                .Where(p => productIds.Contains(p.Id))
                .ToListAsync();

            // 4) Mapear a DTOs
            var result = orders.Select(o =>
            {
                var dto = new OrderHistoryDto
                {
                    OrderId = o.Id,
                    ShortCode = o.ShortCode,
                    Total = o.Total,
                    Status = o.Status,
                    CreatedAt = o.CreatedAt,
                    PendingAt = o.PendingAt,
                    ReadyAt = o.ReadyAt,
                    CollectedAt = o.CollectedAt,
                    PaidAt = o.PaidAt,
                    Items = new List<OrderItemHistoryDto>()
                };

                // Filtrar líneas que pertenecen a este pedido
                var relatedItems = items.Where(i => i.OrderId == o.Id);
                foreach (var oi in relatedItems)
                {
                    var prod = prods.FirstOrDefault(p => p.Id == oi.ProductId);
                    dto.Items.Add(new OrderItemHistoryDto
                    {
                        ProductId = oi.ProductId,
                        ProductName = prod?.Name ?? "(Desconocido)",
                        Quantity = oi.Quantity,
                        UnitPrice = oi.UnitPrice
                    });
                }

                return dto;
            }).ToList();

            return result;
        }
    }
}
