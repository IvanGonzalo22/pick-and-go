using Hangfire;
using Hangfire.SqlServer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using server.Features.Auth.Services;
using server.Infrastructure.Configuration;
using server.Infrastructure.Persistence;

var builder = WebApplication.CreateBuilder(args);

// ────────────────────────────────────────────────────────────────────────────────
// 1) Configurar EF Core con SQL Server para la persistencia de datos
builder.Services.AddDbContext<AppDbContext>(opt =>
    opt.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// ────────────────────────────────────────────────────────────────────────────────
// 2) Configurar Hangfire para procesamiento de jobs en segundo plano
builder.Services.AddHangfire(cfg => cfg
    .UseSimpleAssemblyNameTypeSerializer()
    .UseRecommendedSerializerSettings()
    .UseSqlServerStorage(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        new SqlServerStorageOptions { PrepareSchemaIfNecessary = true }
    )
);
builder.Services.AddHangfireServer();

// ────────────────────────────────────────────────────────────────────────────────
// 2.1) Registrar configuración de SMTP (appsettings.json → SmtpSettings POCO)
builder.Services.Configure<SmtpSettings>(
    builder.Configuration.GetSection("SmtpSettings")
);

// ────────────────────────────────────────────────────────────────────────────────
// 3) Registrar servicios de la aplicación en el contenedor de DI
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<EmailService>();

// ────────────────────────────────────────────────────────────────────────────────
// 4) Añadir soporte para controladores de Web API
builder.Services.AddControllers();

var app = builder.Build();

// ────────────────────────────────────────────────────────────────────────────────
// 5) Forzar la URL de escucha de la API en HTTP://localhost:5000
app.Urls.Clear();
app.Urls.Add("http://localhost:5000");

// ────────────────────────────────────────────────────────────────────────────────
// 6) Montar el Dashboard de Hangfire en /hangfire
app.UseHangfireDashboard("/hangfire");

// ────────────────────────────────────────────────────────────────────────────────
// 7) Habilitar el routing y mapear todos los controladores a sus rutas
app.UseRouting();
app.MapControllers();

// ────────────────────────────────────────────────────────────────────────────────
// 8) Arrancar la aplicación
app.Run();
