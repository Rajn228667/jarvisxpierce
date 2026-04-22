using Microsoft.EntityFrameworkCore;
using PierceX.Application.Abstractions;
using PierceX.Application.Common;
using PierceX.Domain.Enums;

namespace PierceX.Application.Services;

public record VacancyListItem(Guid Id, string Title, string Company, string? Location,
    decimal? SalaryMin, decimal? SalaryMax, string Status, bool IsInternship,
    int Applications, DateTime? PublishedAt);

public record VacancyDetails(VacancyListItem Summary, string? Description, string? Requirements, string? Benefits,
    object ApplicationsList);

public interface IVacancyService
{
    Task<PagedResult<VacancyListItem>> ListAsync(string? search, bool? internship, int page, int pageSize, CancellationToken ct);
    Task<Result<VacancyDetails>> GetAsync(Guid id, CancellationToken ct);
}

public class VacancyService : IVacancyService
{
    private readonly IAppDb _db;
    public VacancyService(IAppDb db) { _db = db; }

    public async Task<PagedResult<VacancyListItem>> ListAsync(string? search, bool? internship, int page, int pageSize, CancellationToken ct)
    {
        var q = _db.Vacancies.Include(v => v.Company).Include(v => v.Applications).AsQueryable();
        if (internship.HasValue) q = q.Where(v => v.IsInternship == internship.Value);
        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLower();
            q = q.Where(v => v.Title.ToLower().Contains(s) ||
                (v.Company != null && v.Company.Name.ToLower().Contains(s)) ||
                (v.Location != null && v.Location.ToLower().Contains(s)));
        }
        q = q.OrderByDescending(v => v.PublishedAt);

        var total = await q.CountAsync(ct);
        var items = await q.Skip((page - 1) * pageSize).Take(pageSize)
            .Select(v => new VacancyListItem(v.Id, v.Title, v.Company!.Name, v.Location,
                v.SalaryMin, v.SalaryMax, v.Status.ToString(), v.IsInternship, v.Applications.Count, v.PublishedAt))
            .ToListAsync(ct);
        return new PagedResult<VacancyListItem> { Items = items, Total = total, Page = page, PageSize = pageSize };
    }

    public async Task<Result<VacancyDetails>> GetAsync(Guid id, CancellationToken ct)
    {
        var v = await _db.Vacancies.Include(x => x.Company).Include(x => x.Applications).ThenInclude(a => a.ApplicantUser)
            .FirstOrDefaultAsync(x => x.Id == id, ct);
        if (v == null) return Result<VacancyDetails>.Fail("Вакансия не найдена", 404);
        var summary = new VacancyListItem(v.Id, v.Title, v.Company!.Name, v.Location, v.SalaryMin, v.SalaryMax,
            v.Status.ToString(), v.IsInternship, v.Applications.Count, v.PublishedAt);
        var apps = v.Applications.OrderByDescending(a => a.AiMatchScore).Select(a => new
        {
            a.Id,
            applicant = a.ApplicantUser != null ? $"{a.ApplicantUser.Surname} {a.ApplicantUser.Name}".Trim() : "",
            email = a.ApplicantUser?.Email,
            status = a.Status.ToString(),
            a.AiMatchScore,
            a.AiSummary,
            a.CreatedAt
        }).ToList();
        return Result<VacancyDetails>.Ok(new VacancyDetails(summary, v.Description, v.Requirements, v.Benefits, apps));
    }
}
