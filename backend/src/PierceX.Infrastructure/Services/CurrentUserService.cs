using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using PierceX.Application.Abstractions;

namespace PierceX.Infrastructure.Services;

public class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _http;
    public CurrentUserService(IHttpContextAccessor http) { _http = http; }

    public Guid? UserId
    {
        get
        {
            var v = _http.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier);
            return Guid.TryParse(v, out var g) ? g : null;
        }
    }

    public string? Email => _http.HttpContext?.User.FindFirstValue(ClaimTypes.Email);
    public string? Role => _http.HttpContext?.User.FindFirstValue(ClaimTypes.Role);
    public string? Ip => _http.HttpContext?.Connection.RemoteIpAddress?.ToString();
    public string? UserAgent => _http.HttpContext?.Request.Headers["User-Agent"].ToString();
    public bool IsAuthenticated => _http.HttpContext?.User.Identity?.IsAuthenticated == true;
}
