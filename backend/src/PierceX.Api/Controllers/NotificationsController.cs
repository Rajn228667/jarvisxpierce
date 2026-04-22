using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PierceX.Application.Services;

namespace PierceX.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/notifications")]
public class NotificationsController : ControllerBase
{
    private readonly INotificationService _svc;
    public NotificationsController(INotificationService svc) { _svc = svc; }

    private Guid UserId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub")!);

    [HttpGet]
    public async Task<IActionResult> List([FromQuery] int take = 30, CancellationToken ct = default) =>
        Ok(await _svc.ListAsync(UserId(), Math.Clamp(take, 1, 200), ct));

    [HttpGet("unread-count")]
    public async Task<IActionResult> Unread(CancellationToken ct) =>
        Ok(new { count = await _svc.UnreadCountAsync(UserId(), ct) });

    [HttpPost("{id}/read")]
    public async Task<IActionResult> Read(Guid id, CancellationToken ct)
    {
        var r = await _svc.MarkReadAsync(UserId(), id, ct);
        return r.Succeeded ? Ok(new { ok = true }) : StatusCode(r.StatusCode, new { error = r.Error });
    }

    [HttpPost("read-all")]
    public async Task<IActionResult> ReadAll(CancellationToken ct)
    {
        await _svc.MarkAllReadAsync(UserId(), ct);
        return Ok(new { ok = true });
    }
}
