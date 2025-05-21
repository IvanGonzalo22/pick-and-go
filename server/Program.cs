using Microsoft.EntityFrameworkCore;
using PickAndGo.Api.Features.Auth.Services;
using PickAndGo.Api.Infrastructure.Persistence;

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
app.Run();
