using System;
using System.Collections.Generic;
using PierceX.Domain.Common;
using PierceX.Domain.Enums;

namespace PierceX.Domain.Entities;

public class User : Entity
{
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string Surname { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Patronymic { get; set; }
    public DateTime? BirthDate { get; set; }
    public string? Institution { get; set; }
    public string? AvatarUrl { get; set; }
    public string? Phone { get; set; }
    public UserRole Role { get; set; } = UserRole.Student;
    public Guid? InstitutionId { get; set; }
    public Institution? InstitutionEntity { get; set; }

    public bool EmailConfirmed { get; set; }
    public string? EmailVerificationCode { get; set; }
    public DateTime? EmailVerificationSentAt { get; set; }
    public int EmailVerificationAttempts { get; set; }

    public string? PasswordResetToken { get; set; }
    public DateTime? PasswordResetExpiresAt { get; set; }

    public string PreferredLanguage { get; set; } = "ru";
    public string Theme { get; set; } = "dark";
    public string? DashboardLayoutJson { get; set; }
    public string? NotificationPreferencesJson { get; set; }

    public bool TwoFactorEnabled { get; set; }
    public string? TwoFactorSecret { get; set; }

    public bool IsActive { get; set; } = true;
    public DateTime? LastLoginAt { get; set; }

    public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
    public ICollection<UserDevice> Devices { get; set; } = new List<UserDevice>();
    public ICollection<Notification> Notifications { get; set; } = new List<Notification>();
    public ICollection<AuditLog> AuditLogs { get; set; } = new List<AuditLog>();
    public ICollection<AIChat> AIChats { get; set; } = new List<AIChat>();
}

public class RefreshToken : Entity
{
    public Guid UserId { get; set; }
    public User? User { get; set; }
    public string Token { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public DateTime? RevokedAt { get; set; }
    public string? DeviceFingerprint { get; set; }
    public string? Ip { get; set; }
    public string? UserAgent { get; set; }
}

public class UserDevice : Entity
{
    public Guid UserId { get; set; }
    public User? User { get; set; }
    public string Fingerprint { get; set; } = string.Empty;
    public string? Name { get; set; }
    public string? Os { get; set; }
    public string? Browser { get; set; }
    public string? Ip { get; set; }
    public string? Location { get; set; }
    public bool IsTrusted { get; set; }
    public DateTime LastSeenAt { get; set; } = DateTime.UtcNow;
}
