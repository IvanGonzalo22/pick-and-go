using Microsoft.EntityFrameworkCore;
using server.Features.Auth.Services;
using server.Infrastructure.Persistence;

var builder = WebApplication.CreateBuilder(args);

// 1) Contexto EF Core
builder.Services.AddDbContext<AppDbContext>(opt =>
    opt.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// 2) Servicio de autenticación
builder.Services.AddScoped<AuthService>();

builder.Services.AddControllers();
var app = builder.Build();

app.UseRouting();
app.MapControllers();

// Fuerza la escucha en http://localhost:5000
app.Urls.Clear();
app.Urls.Add("http://localhost:5000");
app.Run();