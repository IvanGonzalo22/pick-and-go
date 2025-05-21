using Microsoft.EntityFrameworkCore;
using PickAndGo.Api.Features.Auth.Models;

namespace PickAndGo.Api.Infrastructure.Persistence
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> opts) : base(opts) { }

        public DbSet<User> Users { get; set; }

        // ... otros DbSet para productos, carrito, pedidos ...
    }
}
