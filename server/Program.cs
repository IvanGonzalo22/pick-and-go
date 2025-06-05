using Hangfire;
using Hangfire.SqlServer;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.SqlServer;
using server.Features.Auth.Services;
using server.Features.Cart.Services;
using server.Features.Products.Services;
using server.Features.Orders.Services;
using server.Features.Payments.Services;
using server.Infrastructure.Configuration;
using server.Infrastructure.Persistence;
// ↑ NO hay 'using Stripe;' aquí

var builder = WebApplication.CreateBuilder(args);

// ────────────────────────────────────────────────────────────────────────────────
// 1) Habilitar HTTPS Redirection
builder.Services.AddHttpsRedirection(options =>
{
    options.RedirectStatusCode = StatusCodes.Status307TemporaryRedirect;
    options.HttpsPort = 5001;
});

// ────────────────────────────────────────────────────────────────────────────────
// 2) CORS: permitir credenciales desde el frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontendWithCredentials", policy =>
    {
        policy
            .WithOrigins("https://localhost:5173")
            .AllowCredentials()
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

// ────────────────────────────────────────────────────────────────────────────────
// 3) EF Core: SQL Server para datos de aplicación
builder.Services.AddDbContext<AppDbContext>(opt =>
    opt.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// ────────────────────────────────────────────────────────────────────────────────
// 4) Distributed SQL Server Cache para sesiones (SessionCache table)
builder.Services.AddDistributedSqlServerCache(options =>
{
    options.ConnectionString = builder.Configuration.GetConnectionString("DefaultConnection");
    options.SchemaName      = "dbo";
    options.TableName       = "SessionCache";
});

// ────────────────────────────────────────────────────────────────────────────────
// 5) Session Middleware (30 min timeout)
builder.Services.AddSession(opts =>
{
    opts.Cookie.Name     = "PickAndGo.Session";
    opts.IdleTimeout     = TimeSpan.FromMinutes(30);
    opts.Cookie.HttpOnly = true;
    opts.Cookie.SameSite = SameSiteMode.None;     
    opts.Cookie.SecurePolicy = CookieSecurePolicy.Always;
});

// ────────────────────────────────────────────────────────────────────────────────
// 6) Cookie Authentication (30 min, sin sliding)
builder.Services
    .AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(options =>
    {
        options.Cookie.Name        = "PickAndGo.Auth";
        options.LoginPath          = "/auth/login";
        options.LogoutPath         = "/auth/logout";
        options.ExpireTimeSpan     = TimeSpan.FromMinutes(30);
        options.SlidingExpiration  = false;
        options.Cookie.HttpOnly    = true;

        // <<< Esto es lo importante: SameSite=None + Secure >>>
        options.Cookie.SameSite    = SameSiteMode.None;
        options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
    });

// ────────────────────────────────────────────────────────────────────────────────
// 7) Hangfire en background
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
// 8) SMTP, AuthService, etc.
builder.Services.Configure<SmtpSettings>(
    builder.Configuration.GetSection("SmtpSettings")
);
builder.Services.AddScoped<EmailService>();
builder.Services.AddScoped<AuthService>();

// ────────────────────────────────────────────────────────────────────────────────
// 9) Swagger / OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// ────────────────────────────────────────────────────────────────────────────────
// 10) Servicios de dominio
builder.Services.AddScoped<server.Features.Products.Services.ProductService>(); // tu ProductService
builder.Services.AddScoped<CartService>();
builder.Services.AddScoped<OrderService>();
builder.Services.AddScoped<PaymentService>();

// ────────────────────────────────────────────────────────────────────────────────
// 11) Controladores Web API
builder.Services.AddControllers();

// ────────────────────────────────────────────────────────────────────────────────
// 12) Inicializar Stripe con la SecretKey (sin 'using Stripe;')
Stripe.StripeConfiguration.ApiKey = builder.Configuration["Stripe:SecretKey"];

var app = builder.Build();

// ────────────────────────────────────────────────────────────────────────────────
// 13) Forzar URLs (HTTP y HTTPS)
app.Urls.Clear();
app.Urls.Add("http://localhost:5000");
app.Urls.Add("https://localhost:5001");

// ────────────────────────────────────────────────────────────────────────────────
// 14) Pipeline de middleware
app.UseHttpsRedirection();
app.UseRouting();

app.UseCors("AllowFrontendWithCredentials");

app.UseSession();
app.UseAuthentication();
app.UseAuthorization();

app.UseHangfireDashboard("/hangfire");

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "PickAndGo API V1");
        c.RoutePrefix = "swagger";
    });
}

app.MapControllers();

// ────────────────────────────────────────────────────────────────────────────────
// 15) Job periódico
RecurringJob.AddOrUpdate<CartService>(
    "CleanupCartItems",
    svc => svc.CleanupExpiredCartItems(),
    "*/10 * * * *"
);

// ────────────────────────────────────────────────────────────────────────────────
// 16) Arrancar aplicación
app.Run();
