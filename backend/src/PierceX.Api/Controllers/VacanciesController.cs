using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PierceX.Application.Services;

namespace PierceX.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/vacancies")]
public class VacanciesController : ControllerBase
{
    private readonly IVacancyService _svc;
    public VacanciesController(IVacancyService svc) { _svc = svc; }

    [HttpGet]
    public async Task<IActionResult> List([FromQuery] string? search, [FromQuery] bool? internship,
        [FromQuery] int page = 1, [FromQuery] int pageSize = 25, CancellationToken ct = default)
        => Ok(await _svc.ListAsync(search, internship, Math.Max(1, page), Math.Clamp(pageSize, 1, 500), ct));

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(Guid id, CancellationToken ct)
    {
        var r = await _svc.GetAsync(id, ct);
        return r.Succeeded ? Ok(r.Value) : StatusCode(r.StatusCode, new { error = r.Error });
    }
}
