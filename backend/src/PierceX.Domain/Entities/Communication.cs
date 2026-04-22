using System;
using PierceX.Domain.Common;
using PierceX.Domain.Enums;

namespace PierceX.Domain.Entities;

public class Notification : Entity
{
    public Guid UserId { get; set; }
    public User? User { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public NotificationSeverity Severity { get; set; } = NotificationSeverity.Info;
    public string? Link { get; set; }
    public bool IsRead { get; set; }
    public string? Category { get; set; }
}

public class Message : Entity
{
    public Guid FromUserId { get; set; }
    public User? FromUser { get; set; }
    public Guid ToUserId { get; set; }
    public User? ToUser { get; set; }
    public string Body { get; set; } = string.Empty;
    public bool IsRead { get; set; }
    public string? Thread { get; set; }
}

public class SupportTicket : Entity
{
    public Guid OpenedByUserId { get; set; }
    public User? OpenedByUser { get; set; }
    public string Subject { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public string Status { get; set; } = "open"; // open, pending, resolved, closed
    public string Priority { get; set; } = "normal";
    public Guid? AssignedAgentUserId { get; set; }
    public User? AssignedAgentUser { get; set; }
}
