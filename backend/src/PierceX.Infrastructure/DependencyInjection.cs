using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using PierceX.Application.Abstractions;
using PierceX.Application.Services;
using PierceX.Infrastructure.Persistence;
using PierceX.Infrastructure.Services;

namespace PierceX.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration config)
    {
        var provider = (config["Database:Provider"] ?? "sqlite").ToLowerInvariant();
        var conn = config.GetConnectionString("Default") ?? "Data Source=piercex.db";

        services.AddDbContext<AppDbContext>(opts =>
        {
            if (provider == "sqlserver") opts.UseSqlServer(conn);
            else opts.UseSqlite(conn);
        });
        services.AddScoped<IAppDb>(sp => sp.GetRequiredService<AppDbContext>());

        services.Configure<JwtOptions>(config.GetSection("Jwt"));
        services.Configure<SmtpOptions>(config.GetSection("Smtp"));
        services.Configure<GroqOptions>(o =>
        {
            config.GetSection("Groq").Bind(o);
            var key = Environment.GetEnvironmentVariable("GROQ_API_KEY");
            if (!string.IsNullOrWhiteSpace(key)) o.ApiKey = key;
        });

        services.AddHttpContextAccessor();
        services.AddSingleton<IJwtService, JwtService>();
        services.AddScoped<IEmailService, EmailService>();
        services.AddScoped<ICurrentUserService, CurrentUserService>();
        services.AddScoped<IAuditService, AuditService>();
        services.AddHttpClient<IGroqService, GroqService>();

        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IDashboardService, DashboardService>();
        services.AddScoped<IStudentService, StudentService>();
        services.AddScoped<IFinanceService, FinanceService>();
        services.AddScoped<IVacancyService, VacancyService>();
        services.AddScoped<ISecurityService, SecurityService>();
        services.AddScoped<IAIChatService, AIChatService>();
        services.AddScoped<INotificationService, NotificationService>();
        services.AddScoped<IProfileService, ProfileService>();

        services.AddScoped<SeedService>();

        return services;
    }
}
