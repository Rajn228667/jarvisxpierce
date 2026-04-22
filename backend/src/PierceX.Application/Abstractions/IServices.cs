using System.Security.Claims;
using PierceX.Application.Common;
using PierceX.Application.DTOs;
using PierceX.Domain.Entities;

namespace PierceX.Application.Abstractions;

public interface IJwtService
{
    (string accessToken, DateTime expiresAt) GenerateAccessToken(User user);
    string GenerateRefreshToken();
    ClaimsPrincipal? ValidateToken(string token);
}

public interface IEmailService
{
    Task SendVerificationEmailAsync(string toEmail, string toName, string code, CancellationToken ct = default);
    Task SendPasswordResetEmailAsync(string toEmail, string toName, string link, CancellationToken ct = default);
    Task SendGenericEmailAsync(string toEmail, string subject, string htmlBody, CancellationToken ct = default);
}

public interface ICurrentUserService
{
    Guid? UserId { get; }
    string? Email { get; }
    string? Role { get; }
    string? Ip { get; }
    string? UserAgent { get; }
    bool IsAuthenticated { get; }
}

public interface IAuditService
{
    Task LogAsync(string action, string entityType, string? entityId = null, string? details = null, CancellationToken ct = default);
}

public interface IGroqService
{
    Task<string> ChatAsync(string systemPrompt, IEnumerable<GroqMessage> messages, CancellationToken ct = default);
    Task<GroqDomainAnalysis> AnalyzeDomainAsync(string url, CancellationToken ct = default);
    bool IsConfigured { get; }
}

public record GroqMessage(string Role, string Content);

public record GroqDomainAnalysis(
    string Category,
    double RiskScore,
    string RiskLevel,
    string[] Reasons,
    string Summary
);
