using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PierceX.Application.Services;

namespace PierceX.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/dashboard")]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _svc;
    public DashboardController(IDashboardService svc) { _svc = svc; }

    [HttpGet("overview")]
    public async Task<IActionResult> Overview(CancellationToken ct) => Ok(await _svc.GetOverviewAsync(ct));

    [HttpGet("trends")]
    public async Task<IActionResult> Trends(CancellationToken ct) => Ok(await _svc.GetTrendsAsync(ct));

    [HttpGet("activity")]
    public async Task<IActionResult> Activity([FromQuery] int take = 15, CancellationToken ct = default) =>
        Ok(await _svc.GetActivityFeedAsync(take, ct));
}
