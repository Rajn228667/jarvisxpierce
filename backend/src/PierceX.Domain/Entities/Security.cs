using System;
using System.Collections.Generic;
using PierceX.Domain.Common;
using PierceX.Domain.Enums;

namespace PierceX.Domain.Entities;

public class AuditLog : Entity
{
    public Guid? UserId { get; set; }
    public User? User { get; set; }
    public AuditAction Action { get; set; }
    public string EntityType { get; set; } = string.Empty;
    public string? EntityId { get; set; }
    public string? Details { get; set; }
    public string? Ip { get; set; }
    public string? UserAgent { get; set; }
}

public class AIChat : Entity
{
    public Guid UserId { get; set; }
    public User? User { get; set; }
    public string Title { get; set; } = "Новый чат";
    public string Model { get; set; } = "groq";
    public string? ContextTag { get; set; }
    public ICollection<AIChatMessage> Messages { get; set; } = new List<AIChatMessage>();
}

public class AIChatMessage : Entity
{
    public Guid ChatId { get; set; }
    public AIChat? Chat { get; set; }
    public string Role { get; set; } = "user"; // user, assistant, system
    public string Content { get; set; } = string.Empty;
    public int? Tokens { get; set; }
    public string? Model { get; set; }
}

public class MonitoredDomain : Entity
{
    public string Url { get; set; } = string.Empty;
    public string? Host { get; set; }
    public DomainCategory Category { get; set; } = DomainCategory.Unknown;
    public RiskLevel Risk { get; set; } = RiskLevel.None;
    public double RiskScore { get; set; }
    public string? Country { get; set; }
    public string? AiAnalysisJson { get; set; }
    public string? Reasons { get; set; }
    public DateTime? LastCheckedAt { get; set; }
    public bool IsBlacklisted { get; set; }
    public string? AddedByUserId { get; set; }
}

public class FraudCase : Entity
{
    public string Code { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public RiskLevel Risk { get; set; } = RiskLevel.Medium;
    public FraudCaseStatus Status { get; set; } = FraudCaseStatus.Open;
    public string Category { get; set; } = "general"; // laundering, gambling, phishing, procurement, telegram
    public Guid? AssignedAnalystUserId { get; set; }
    public User? AssignedAnalystUser { get; set; }
    public string? EvidenceJson { get; set; }
    public string? AiSummary { get; set; }
    public double AiConfidence { get; set; }
}

public class RiskScore : Entity
{
    public string SubjectType { get; set; } = string.Empty; // student, domain, vendor, transaction
    public string SubjectId { get; set; } = string.Empty;
    public double Score { get; set; }
    public RiskLevel Level { get; set; }
    public string? FactorsJson { get; set; }
    public string? Notes { get; set; }
}

public class Alert : Entity
{
    public string Title { get; set; } = string.Empty;
    public string? Body { get; set; }
    public string Category { get; set; } = "system"; // dropout, fraud, attendance, finance, security
    public NotificationSeverity Severity { get; set; } = NotificationSeverity.Warning;
    public string? SubjectType { get; set; }
    public string? SubjectId { get; set; }
    public bool IsResolved { get; set; }
}

public class Prediction : Entity
{
    public string ModelName { get; set; } = "groq";
    public string Type { get; set; } = string.Empty; // dropout, forecast, fraud, match
    public string SubjectType { get; set; } = string.Empty;
    public string SubjectId { get; set; } = string.Empty;
    public double Value { get; set; }
    public string? Explanation { get; set; }
    public string? PayloadJson { get; set; }
}

public class Document : Entity
{
    public DocumentType Type { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid? OwnerUserId { get; set; }
    public User? OwnerUser { get; set; }
    public string? FileUrl { get; set; }
    public string? Mime { get; set; }
    public long SizeBytes { get; set; }
    public DateTime IssuedAt { get; set; } = DateTime.UtcNow;
}
