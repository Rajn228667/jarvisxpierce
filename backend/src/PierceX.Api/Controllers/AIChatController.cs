using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PierceX.Application.Services;

namespace PierceX.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/ai/chats")]
public class AIChatController : ControllerBase
{
    private readonly IAIChatService _svc;
    public AIChatController(IAIChatService svc) { _svc = svc; }

    private Guid UserId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub")!);

    [HttpGet] public async Task<IActionResult> List(CancellationToken ct) => Ok(await _svc.ListAsync(UserId(), ct));

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(Guid id, CancellationToken ct)
    {
        var r = await _svc.GetAsync(UserId(), id, ct);
        return r.Succeeded ? Ok(r.Value) : StatusCode(r.StatusCode, new { error = r.Error });
    }

    public record CreateChatDto(string? Title, string? Context);

    [HttpPost]
    public async Task<IActionResult> Create(CreateChatDto dto, CancellationToken ct)
    {
        var r = await _svc.CreateAsync(UserId(), dto.Title, dto.Context, ct);
        return r.Succeeded ? Ok(r.Value) : StatusCode(r.StatusCode, new { error = r.Error });
    }

    [HttpPost("{id}/messages")]
    public async Task<IActionResult> Send(Guid id, SendMessageDto dto, CancellationToken ct)
    {
        var r = await _svc.SendAsync(UserId(), id, dto, ct);
        return r.Succeeded ? Ok(r.Value) : StatusCode(r.StatusCode, new { error = r.Error });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        var r = await _svc.DeleteAsync(UserId(), id, ct);
        return r.Succeeded ? NoContent() : StatusCode(r.StatusCode, new { error = r.Error });
    }
}
