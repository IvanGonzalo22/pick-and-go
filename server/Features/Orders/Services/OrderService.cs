// server/Features/Orders/Services/OrderService.cs
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using server.Features.Cart.DTOs;
using server.Features.Cart.Services;
using server.Features.History.DTOs;
using server.Features.Orders.DTOs;
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

        // -------------------------------------------------------
        // 1) CREAR PEDIDO DESDE CARRITO (Client) 
        // -------------------------------------------------------
        public async Task<Guid> CreateOrderFromCartAsync(Guid userId)
        {
            // (idéntico al código anterior)
            List<CartItemDto> cartItems = await _cartService.GetCartAsync(userId);
            if (cartItems == null || !cartItems.Any())
                throw new InvalidOperationException("El carrito está vacío.");

            // NUEVO: Validar que ninguno de los productos esté oculto
            var productIds = cartItems.Select(ci => ci.ProductId).ToList();
            bool hasHidden = await _db.Products
                .Where(p => productIds.Contains(p.Id))
                .AnyAsync(p => !p.Visible);
            if (hasHidden)
                throw new InvalidOperationException("Uno de los productos ya no está disponible.");

            decimal total = cartItems.Sum(ci => ci.Price * ci.Quantity);

            var user = await _db.Users.FindAsync(userId);
            if (user == null)
                throw new Exception("Usuario no encontrado.");

            string customerName = $"{user.FirstName} {user.LastName}";
            string customerEmail = user.Email;

            string shortCode = Guid.NewGuid().ToString("N").Substring(0, 8).ToUpper();

            using var transaction = await _db.Database.BeginTransactionAsync();
            try
            {
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

                foreach (var ci in cartItems)
                {
                    var orderItem = new OrderItem
                    {
                        Id = Guid.NewGuid(),
                        OrderId = newOrder.Id,
                        ProductId = ci.ProductId,
                        Quantity = ci.Quantity,
                        UnitPrice = ci.Price
                    };
                    await _db.OrderItems.AddAsync(orderItem);

                    var productEntity = await _db.Products.FindAsync(ci.ProductId);
                    if (productEntity == null)
                        throw new Exception("Producto no encontrado durante la creación del pedido.");

                    if (ci.Quantity > productEntity.Stock)
                        throw new InvalidOperationException($"Stock insuficiente para {productEntity.Name}.");

                    productEntity.Stock -= ci.Quantity;
                    _db.Products.Update(productEntity);
                }

                var existingCartItems = await _db.CartItems
                    .Where(x => x.UserId == userId)
                    .ToListAsync();
                _db.CartItems.RemoveRange(existingCartItems);

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

        // -------------------------------------------------------
        // 2) OBTENER HISTORIAL DE USUARIO (HistoryController)
        // -------------------------------------------------------
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

            // 4) Mapear a OrderHistoryDto
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

        // -------------------------------------------------------
        // 3) OBTENER TODAS LAS ÓRDENES (Empleado) – EmployeeOrderDto
        // -------------------------------------------------------
        public async Task<List<EmployeeOrderDto>> GetAllForEmployeeAsync()
        {
            var orders = await _db.Orders
                .OrderByDescending(o => o.CreatedAt)
                .ToListAsync();

            if (!orders.Any())
                return new List<EmployeeOrderDto>();

            var orderIds = orders.Select(o => o.Id).ToList();
            var items = await _db.OrderItems
                .Where(oi => orderIds.Contains(oi.OrderId))
                .ToListAsync();

            var productIds = items.Select(i => i.ProductId).Distinct().ToList();
            var prods = await _db.Products
                .Where(p => productIds.Contains(p.Id))
                .ToListAsync();

            var result = orders.Select(o =>
            {
                var dto = new EmployeeOrderDto
                {
                    OrderId = o.Id,
                    ShortCode = o.ShortCode,
                    CustomerName = o.CustomerName,
                    CustomerEmail = o.CustomerEmail,
                    Total = o.Total,
                    Status = o.Status,
                    CreatedAt = o.CreatedAt,
                    PendingAt = o.PendingAt,
                    ReadyAt = o.ReadyAt,
                    CollectedAt = o.CollectedAt,
                    PaidAt = o.PaidAt,
                    Items = new List<EmployeeOrderItemDto>()
                };

                var relatedItems = items.Where(i => i.OrderId == o.Id);
                foreach (var oi in relatedItems)
                {
                    var prod = prods.FirstOrDefault(p => p.Id == oi.ProductId);
                    dto.Items.Add(new EmployeeOrderItemDto
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

        // -------------------------------------------------------
        // 4) MARCAR ÓRDEN COMO “READY” (Empleado)
        // -------------------------------------------------------
        public async Task MarkAsReadyAsync(Guid orderId)
        {
            var order = await _db.Orders.FindAsync(orderId);
            if (order == null)
                throw new InvalidOperationException("Orden no encontrada.");

            if (order.Status != "pending")
                throw new InvalidOperationException("Solo se puede marcar como 'ready' desde 'pending'.");

            order.Status = "ready";
            order.ReadyAt = DateTime.UtcNow;
            _db.Orders.Update(order);
            await _db.SaveChangesAsync();
        }

        // -------------------------------------------------------
        // 5) MARCAR ÓRDEN COMO “COLLECTED” (Empleado)
        // -------------------------------------------------------
        public async Task MarkAsCollectedAsync(Guid orderId)
        {
            var order = await _db.Orders.FindAsync(orderId);
            if (order == null)
                throw new InvalidOperationException("Orden no encontrada.");

            if (order.Status != "ready")
                throw new InvalidOperationException("Solo se puede marcar como 'collected' desde 'ready'.");

            order.Status = "collected";
            order.CollectedAt = DateTime.UtcNow;
            _db.Orders.Update(order);
            await _db.SaveChangesAsync();
        }
    }
}
