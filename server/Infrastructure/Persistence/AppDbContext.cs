using Microsoft.EntityFrameworkCore;
using server.Features.Cart.Models;
using server.Features.Auth.Models;
using server.Features.Products.Models;
using server.Features.Orders.Models;

namespace server.Infrastructure.Persistence
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> opts) : base(opts) { }

        public DbSet<User> Users { get; set; }
        
        // Antes: public DbSet<server.Features.Products.Models.Product> Products { get; set; }
        public DbSet<Product> Products { get; set; } 

        // Antes: public DbSet<server.Features.Cart.Models.CartItem> CartItems { get; set; }
        public DbSet<CartItem> CartItems { get; set; }
        
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }

        // ... otros DbSet ...

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Definir clave primaria compuesta para CartItem
            modelBuilder.Entity<CartItem>()
                .HasKey(ci => new { ci.UserId, ci.ProductId });
        }
    }
}
