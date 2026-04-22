using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PierceX.Application.Services;

namespace PierceX.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/finance")]
public class FinanceController : ControllerBase
{
    private readonly IFinanceService _svc;
    public FinanceController(IFinanceService svc) { _svc = svc; }

    [HttpGet("overview")]
    public async Task<IActionResult> Overview(CancellationToken ct) => Ok(await _svc.OverviewAsync(ct));

    [HttpGet("invoices")]
    public async Task<IActionResult> List([FromQuery] string? search, [FromQuery] string? status,
        [FromQuery] int page = 1, [FromQuery] int pageSize = 25, CancellationToken ct = default)
        => Ok(await _svc.ListAsync(search, status, Math.Max(1, page), Math.Clamp(pageSize, 1, 500), ct));

    public record PayDto(decimal Amount, string Method);

    [HttpPost("invoices/{id}/pay")]
    public async Task<IActionResult> Pay(Guid id, PayDto dto, CancellationToken ct)
    {
        var r = await _svc.PayAsync(id, dto.Amount, dto.Method, ct);
        return r.Succeeded ? Ok(new { ok = true }) : StatusCode(r.StatusCode, new { error = r.Error });
    }

    [HttpGet("invoices/export.csv")]
    public async Task<IActionResult> Export([FromQuery] string? status, CancellationToken ct)
    {
        var bytes = await _svc.ExportCsvAsync(status, ct);
        return File(bytes, "text/csv", $"invoices-{DateTime.UtcNow:yyyyMMdd}.csv");
    }
}
