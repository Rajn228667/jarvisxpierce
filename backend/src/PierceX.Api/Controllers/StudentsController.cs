using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PierceX.Application.Services;

namespace PierceX.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/students")]
public class StudentsController : ControllerBase
{
    private readonly IStudentService _svc;
    public StudentsController(IStudentService svc) { _svc = svc; }

    [HttpGet]
    public async Task<IActionResult> List([FromQuery] string? search, [FromQuery] string? sortBy, [FromQuery] string? sortDir,
        [FromQuery] int page = 1, [FromQuery] int pageSize = 25, CancellationToken ct = default)
        => Ok(await _svc.ListAsync(search, sortBy, sortDir, Math.Max(1, page), Math.Clamp(pageSize, 1, 500), ct));

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(Guid id, CancellationToken ct)
    {
        var r = await _svc.GetAsync(id, ct);
        return r.Succeeded ? Ok(r.Value) : StatusCode(r.StatusCode, new { error = r.Error });
    }

    [HttpPatch("{id}")]
    public async Task<IActionResult> Update(Guid id, StudentUpdateDto dto, CancellationToken ct)
    {
        var r = await _svc.UpdateAsync(id, dto, ct);
        return r.Succeeded ? Ok(r.Value) : StatusCode(r.StatusCode, new { error = r.Error });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        var r = await _svc.DeleteAsync(id, ct);
        return r.Succeeded ? NoContent() : StatusCode(r.StatusCode, new { error = r.Error });
    }

    [HttpGet("export.csv")]
    public async Task<IActionResult> Export([FromQuery] string? search, CancellationToken ct)
    {
        var bytes = await _svc.ExportCsvAsync(search, ct);
        return File(bytes, "text/csv", $"students-{DateTime.UtcNow:yyyyMMdd}.csv");
    }
}
