using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PierceX.Application.Services;

namespace PierceX.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/profile")]
public class ProfileController : ControllerBase
{
    private readonly IProfileService _svc;
    public ProfileController(IProfileService svc) { _svc = svc; }
    private Guid UserId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub")!);

    [HttpGet("me")]
    public async Task<IActionResult> Me(CancellationToken ct)
    {
        var r = await _svc.GetAsync(UserId(), ct);
        return r.Succeeded ? Ok(r.Value) : StatusCode(r.StatusCode, new { error = r.Error });
    }

    [HttpPatch("me")]
    public async Task<IActionResult> Update(ProfileUpdateDto dto, CancellationToken ct)
    {
        var r = await _svc.UpdateAsync(UserId(), dto, ct);
        return r.Succeeded ? Ok(r.Value) : StatusCode(r.StatusCode, new { error = r.Error });
    }

    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword(ChangePasswordDto dto, CancellationToken ct)
    {
        var r = await _svc.ChangePasswordAsync(UserId(), dto, ct);
        return r.Succeeded ? Ok(new { ok = true }) : StatusCode(r.StatusCode, new { error = r.Error });
    }

    public record LayoutReq(string Json);
    [HttpPost("layout")]
    public async Task<IActionResult> SaveLayout(LayoutReq req, CancellationToken ct)
    {
        var r = await _svc.SaveLayoutAsync(UserId(), req.Json, ct);
        return r.Succeeded ? Ok(new { ok = true }) : StatusCode(r.StatusCode, new { error = r.Error });
    }

    [HttpGet("layout")]
    public async Task<IActionResult> GetLayout(CancellationToken ct) =>
        Ok(new { json = await _svc.GetLayoutAsync(UserId(), ct) });

    [HttpGet("devices")]
    public async Task<IActionResult> Devices(CancellationToken ct) =>
        Ok(await _svc.GetDevicesAsync(UserId(), ct));

    [HttpDelete("devices/{id}")]
    public async Task<IActionResult> Revoke(Guid id, CancellationToken ct)
    {
        var r = await _svc.RevokeDeviceAsync(UserId(), id, ct);
        return r.Succeeded ? Ok(new { ok = true }) : StatusCode(r.StatusCode, new { error = r.Error });
    }
}
