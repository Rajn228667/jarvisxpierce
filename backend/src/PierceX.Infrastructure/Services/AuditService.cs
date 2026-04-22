using PierceX.Application.Abstractions;
using PierceX.Domain.Entities;
using PierceX.Domain.Enums;
using PierceX.Infrastructure.Persistence;

namespace PierceX.Infrastructure.Services;

public class AuditService : IAuditService
{
    private readonly AppDbContext _db;
    private readonly ICurrentUserService _current;
    public AuditService(AppDbContext db, ICurrentUserService current) { _db = db; _current = current; }

    public async Task LogAsync(string action, string entityType, string? entityId = null, string? details = null, CancellationToken ct = default)
    {
        if (!Enum.TryParse<AuditAction>(action, true, out var act)) act = AuditAction.Update;
        _db.AuditLogs.Add(new AuditLog
        {
            UserId = _current.UserId,
            Action = act,
            EntityType = entityType,
            EntityId = entityId,
            Details = details,
            Ip = _current.Ip,
            UserAgent = _current.UserAgent
        });
        await _db.SaveChangesAsync(ct);
    }
}
