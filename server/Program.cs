using Hangfire;
using Hangfire.SqlServer;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.SqlServer;
using server.Features.Auth.Services;
using server.Infrastructure.Configuration;
using server.Infrastructure.Persistence;

var builder = WebApplication.CreateBuilder(args);

// ────────────────────────────────────────────────────────────────────────────────
// 1) EF Core: SQL Server para datos de aplicación
builder.Services.AddDbContext<AppDbContext>(opt =>
    opt.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// ────────────────────────────────────────────────────────────────────────────────
// 2) Distributed SQL Server Cache para sesiones (SessionCache table)
builder.Services.AddDistributedSqlServerCache(options =>
{
    options.ConnectionString = builder.Configuration.GetConnectionString("DefaultConnection");
    options.SchemaName      = "dbo";
    options.TableName       = "SessionCache";
});

// 3) Session Middleware (usa la tabla SessionCache por debajo)
builder.Services.AddSession(opts =>
{
    opts.Cookie.Name     = "PickAndGo.Session";
    opts.IdleTimeout     = TimeSpan.FromHours(1);
    opts.Cookie.HttpOnly = true;
    opts.Cookie.SameSite = SameSiteMode.Lax;
});

// ────────────────────────────────────────────────────────────────────────────────
// 4) Cookie Authentication (stateful, sin JWT)
builder.Services
    .AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(options =>
    {
        options.Cookie.Name        = "PickAndGo.Auth";
        options.LoginPath          = "/auth/login";
        options.LogoutPath         = "/auth/logout";
        options.ExpireTimeSpan     = TimeSpan.FromHours(1);
        options.SlidingExpiration  = true;
        options.Cookie.HttpOnly    = true;
        options.Cookie.SameSite    = SameSiteMode.Lax;
    });

// ────────────────────────────────────────────────────────────────────────────────
// 5) Hangfire para jobs en background
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
// 6) Registro de configuración SMTP y servicios de aplicación
builder.Services.Configure<SmtpSettings>(
    builder.Configuration.GetSection("SmtpSettings")
);
builder.Services.AddScoped<EmailService>();
builder.Services.AddScoped<AuthService>();

// ────────────────────────────────────────────────────────────────────────────────
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// ────────────────────────────────────────────────────────────────────────────────
// 7) Controladores Web API
builder.Services.AddControllers();

var app = builder.Build();

// ────────────────────────────────────────────────────────────────────────────────
// 8) Forzar URL de la API
app.Urls.Clear();
app.Urls.Add("http://localhost:5000");

// ────────────────────────────────────────────────────────────────────────────────
// 9) Pipeline de middleware
app.UseSession();              // Carga y guarda HttpContext.Session desde SessionCache
app.UseAuthentication();       // Valida la cookie PickAndGo.Auth
app.UseAuthorization();        // Aplica políticas [Authorize]

// ────────────────────────────────────────────────────────────────────────────────
// 10) Montar el Dashboard de Hangfire en /hangfire
app.UseHangfireDashboard("/hangfire");

// ────────────────────────────────────────────────────────────────────────────────
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();              // genera el JSON de especificación
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "PickAndGo API V1");
        c.RoutePrefix = "swagger";  // accederás en /swagger
    });
}

// ────────────────────────────────────────────────────────────────────────────────
// 11) Habilitar el routing y mapear todos los controladores a sus rutas
app.UseRouting();
app.MapControllers();

// ────────────────────────────────────────────────────────────────────────────────
// 12) Arrancar la aplicación
app.Run();
