using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PierceX.Application.DTOs;
using PierceX.Application.Services;

namespace PierceX.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _auth;
    public AuthController(IAuthService auth) { _auth = auth; }

    private string? Ip() => HttpContext.Connection.RemoteIpAddress?.ToString();
    private string? Ua() => Request.Headers["User-Agent"].ToString();
    private string? Fp() => Request.Headers["X-Device-Fingerprint"].ToString();

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterDto dto, CancellationToken ct)
    {
        var r = await _auth.RegisterAsync(dto, ct);
        return r.Succeeded ? Ok(r.Value) : StatusCode(r.StatusCode, new { error = r.Error });
    }

    [HttpPost("verify-email")]
    public async Task<IActionResult> Verify(VerifyEmailDto dto, CancellationToken ct)
    {
        var r = await _auth.VerifyEmailAsync(dto, Ip(), Ua(), Fp(), ct);
        return r.Succeeded ? Ok(r.Value) : StatusCode(r.StatusCode, new { error = r.Error });
    }

    [HttpPost("resend-verification")]
    public async Task<IActionResult> Resend(ResendVerificationDto dto, CancellationToken ct)
    {
        var r = await _auth.ResendVerificationAsync(dto.Email, ct);
        return r.Succeeded ? Ok(new { ok = true }) : StatusCode(r.StatusCode, new { error = r.Error });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto dto, CancellationToken ct)
    {
        var r = await _auth.LoginAsync(dto with { DeviceFingerprint = dto.DeviceFingerprint ?? Fp() }, Ip(), Ua(), ct);
        return r.Succeeded ? Ok(r.Value) : StatusCode(r.StatusCode, new { error = r.Error });
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh(RefreshDto dto, CancellationToken ct)
    {
        var r = await _auth.RefreshAsync(dto.RefreshToken, Ip(), Ua(), ct);
        return r.Succeeded ? Ok(r.Value) : StatusCode(r.StatusCode, new { error = r.Error });
    }

    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout(RefreshDto dto, CancellationToken ct)
    {
        await _auth.LogoutAsync(dto.RefreshToken, ct);
        return Ok(new { ok = true });
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> Forgot(ForgotPasswordDto dto, CancellationToken ct)
    {
        var baseUrl = Request.Headers["X-App-Url"].FirstOrDefault() ?? "http://localhost:5173";
        await _auth.ForgotPasswordAsync(dto.Email, baseUrl, ct);
        return Ok(new { ok = true });
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> Reset(ResetPasswordDto dto, CancellationToken ct)
    {
        var r = await _auth.ResetPasswordAsync(dto, ct);
        return r.Succeeded ? Ok(new { ok = true }) : StatusCode(r.StatusCode, new { error = r.Error });
    }
}
