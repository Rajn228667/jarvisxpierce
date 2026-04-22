using Microsoft.EntityFrameworkCore;
using PierceX.Application.Abstractions;
using PierceX.Application.Common;

namespace PierceX.Application.Services;

public record NotificationDto(Guid Id, string Title, string Body, string Severity, string? Link, bool IsRead, string? Category, DateTime CreatedAt);

public interface INotificationService
{
    Task<List<NotificationDto>> ListAsync(Guid userId, int take, CancellationToken ct);
    Task<Result> MarkReadAsync(Guid userId, Guid id, CancellationToken ct);
    Task<Result> MarkAllReadAsync(Guid userId, CancellationToken ct);
    Task<int> UnreadCountAsync(Guid userId, CancellationToken ct);
}

public class NotificationService : INotificationService
{
    private readonly IAppDb _db;
    public NotificationService(IAppDb db) { _db = db; }

    public async Task<List<NotificationDto>> ListAsync(Guid userId, int take, CancellationToken ct) =>
        await _db.Notifications.Where(n => n.UserId == userId)
            .OrderByDescending(n => n.CreatedAt).Take(take)
            .Select(n => new NotificationDto(n.Id, n.Title, n.Body, n.Severity.ToString(), n.Link, n.IsRead, n.Category, n.CreatedAt))
            .ToListAsync(ct);

    public async Task<Result> MarkReadAsync(Guid userId, Guid id, CancellationToken ct)
    {
        var n = await _db.Notifications.FirstOrDefaultAsync(x => x.Id == id && x.UserId == userId, ct);
        if (n == null) return Result.Fail("Не найдено", 404);
        n.IsRead = true;
        await _db.SaveChangesAsync(ct);
        return Result.Success();
    }

    public async Task<Result> MarkAllReadAsync(Guid userId, CancellationToken ct)
    {
        var list = await _db.Notifications.Where(n => n.UserId == userId && !n.IsRead).ToListAsync(ct);
        foreach (var n in list) n.IsRead = true;
        await _db.SaveChangesAsync(ct);
        return Result.Success();
    }

    public async Task<int> UnreadCountAsync(Guid userId, CancellationToken ct) =>
        await _db.Notifications.CountAsync(n => n.UserId == userId && !n.IsRead, ct);
}
