using Microsoft.EntityFrameworkCore;
using server.Features.Auth.Models;

namespace server.Infrastructure.Persistence
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> opts) : base(opts) { }

        public DbSet<User> Users { get; set; }

        // ... otros DbSet para productos, carrito, pedidos ...
    }
}