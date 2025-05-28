using Hangfire;
using Hangfire.SqlServer;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.SqlServer;
using server.Features.Auth.Services;
using server.Infrastructure.Configuration;
using server.Infrastructure.Persistence;

var builder = WebApplication.CreateBuilder(args);

// 1) EF Core: SQL Server para datos de aplicación
builder.Services.AddDbContext<AppDbContext>(opt =>
    opt.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// 2) Distributed SQL Server Cache para sesiones
builder.Services.AddDistributedSqlServerCache(options =>
{
    options.ConnectionString = builder.Configuration.GetConnectionString("DefaultConnection");
    options.SchemaName      = "dbo";
    options.TableName       = "SessionCache";
});

// 3) Session Middleware
builder.Services.AddSession(opts =>
{
    opts.Cookie.Name     = "PickAndGo.Session";
    opts.IdleTimeout     = TimeSpan.FromHours(1);
    opts.Cookie.HttpOnly = true;
    opts.Cookie.SameSite = SameSiteMode.Lax;
});

// 4) Cookie Authentication
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

// 6) SMTP y servicios de aplicación
builder.Services.Configure<SmtpSettings>(
    builder.Configuration.GetSection("SmtpSettings")
);
builder.Services.AddScoped<EmailService>();
builder.Services.AddScoped<AuthService>();

// 7) Swagger / OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// 8) Registrar ProductService y controladores
builder.Services.AddScoped<server.Features.Products.Services.ProductService>();
builder.Services.AddControllers();

var app = builder.Build();

// 9) Forzar URL de la API
app.Urls.Clear();
app.Urls.Add("http://localhost:5000");

// ── Pipeline de middleware ordenado ────────────────────────────────────────────

// 10) Routing: determina el endpoint antes de auth
app.UseRouting();

// 11) Session
app.UseSession();

// 12) Authentication y Authorization
app.UseAuthentication();
app.UseAuthorization();

// 13) Dashboard de Hangfire
app.UseHangfireDashboard("/hangfire");

// 14) Swagger UI en desarrollo
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "PickAndGo API V1");
        c.RoutePrefix = "swagger";
    });
}

// 15) Mapear controladores (equiv. UseEndpoints)
app.MapControllers();

// 16) Arrancar la aplicación
app.Run();
