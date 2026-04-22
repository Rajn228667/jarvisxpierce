using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PierceX.Application.Services;

namespace PierceX.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/security")]
public class SecurityController : ControllerBase
{
    private readonly ISecurityService _svc;
    public SecurityController(ISecurityService svc) { _svc = svc; }

    private Guid? CurrentUserId()
    {
        var v = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        return Guid.TryParse(v, out var g) ? g : null;
    }

    [HttpGet("overview")]
    public async Task<IActionResult> Overview(CancellationToken ct) => Ok(await _svc.OverviewAsync(ct));

    [HttpGet("domains")]
    public async Task<IActionResult> Domains([FromQuery] string? search, [FromQuery] string? category,
        [FromQuery] int page = 1, [FromQuery] int pageSize = 25, CancellationToken ct = default)
        => Ok(await _svc.ListDomainsAsync(search, category, Math.Max(1, page), Math.Clamp(pageSize, 1, 500), ct));

    [HttpPost("domains/scan")]
    public async Task<IActionResult> Scan(DomainScanDto dto, CancellationToken ct)
    {
        var r = await _svc.ScanDomainAsync(dto, CurrentUserId(), ct);
        return r.Succeeded ? Ok(r.Value) : StatusCode(r.StatusCode, new { error = r.Error });
    }

    [HttpPost("domains/{id}/blacklist")]
    public async Task<IActionResult> Toggle(Guid id, CancellationToken ct)
    {
        var r = await _svc.ToggleBlacklistAsync(id, ct);
        return r.Succeeded ? Ok(new { ok = true }) : StatusCode(r.StatusCode, new { error = r.Error });
    }

    [HttpGet("cases")]
    public async Task<IActionResult> Cases([FromQuery] string? status,
        [FromQuery] int page = 1, [FromQuery] int pageSize = 25, CancellationToken ct = default)
        => Ok(await _svc.ListCasesAsync(status, Math.Max(1, page), Math.Clamp(pageSize, 1, 500), ct));

    [HttpPost("domains/{id}/case")]
    public async Task<IActionResult> CreateCase(Guid id, CancellationToken ct)
    {
        var r = await _svc.CreateCaseFromDomainAsync(id, CurrentUserId(), ct);
        return r.Succeeded ? Ok(r.Value) : StatusCode(r.StatusCode, new { error = r.Error });
    }
}
