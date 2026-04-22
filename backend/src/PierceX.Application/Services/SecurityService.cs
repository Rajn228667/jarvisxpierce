using Microsoft.EntityFrameworkCore;
using PierceX.Application.Abstractions;
using PierceX.Application.Common;
using PierceX.Domain.Entities;
using PierceX.Domain.Enums;

namespace PierceX.Application.Services;

public record DomainScanDto(string Url, string? AddedBy);
public record DomainListItem(Guid Id, string Url, string? Host, string Category, string Risk,
    double RiskScore, string? Country, string? Reasons, DateTime? LastCheckedAt, bool IsBlacklisted);

public record FraudCaseListItem(Guid Id, string Code, string Title, string Category, string Status, string Risk,
    string? AiSummary, DateTime CreatedAt);

public record SecurityOverview(int TotalDomains, int Blacklisted, int Critical, int High, int Medium, int Low,
    int OpenCases, int ResolvedCases, object ByCategory, object TopRisky);

public interface ISecurityService
{
    Task<Result<DomainListItem>> ScanDomainAsync(DomainScanDto dto, Guid? userId, CancellationToken ct);
    Task<PagedResult<DomainListItem>> ListDomainsAsync(string? search, string? category, int page, int pageSize, CancellationToken ct);
    Task<Result> ToggleBlacklistAsync(Guid id, CancellationToken ct);
    Task<SecurityOverview> OverviewAsync(CancellationToken ct);
    Task<PagedResult<FraudCaseListItem>> ListCasesAsync(string? status, int page, int pageSize, CancellationToken ct);
    Task<Result<FraudCaseListItem>> CreateCaseFromDomainAsync(Guid domainId, Guid? userId, CancellationToken ct);
}

public class SecurityService : ISecurityService
{
    private readonly IAppDb _db;
    private readonly IGroqService _groq;
    public SecurityService(IAppDb db, IGroqService groq) { _db = db; _groq = groq; }

    public async Task<Result<DomainListItem>> ScanDomainAsync(DomainScanDto dto, Guid? userId, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(dto.Url)) return Result<DomainListItem>.Fail("Укажите URL");
        var url = dto.Url.Trim().ToLower();
        string host = url;
        try { host = new Uri(url.Contains("://") ? url : "http://" + url).Host; } catch { }

        var existing = await _db.MonitoredDomains.FirstOrDefaultAsync(d => d.Url == url, ct);
        var analysis = await _groq.AnalyzeDomainAsync(url, ct);

        if (!Enum.TryParse<DomainCategory>(analysis.Category, true, out var cat)) cat = DomainCategory.Unknown;
        if (!Enum.TryParse<RiskLevel>(analysis.RiskLevel, true, out var risk)) risk = RiskLevel.None;

        if (existing == null)
        {
            existing = new MonitoredDomain
            {
                Url = url,
                Host = host,
                Category = cat,
                Risk = risk,
                RiskScore = analysis.RiskScore,
                Reasons = string.Join("; ", analysis.Reasons),
                AiAnalysisJson = System.Text.Json.JsonSerializer.Serialize(analysis),
                LastCheckedAt = DateTime.UtcNow,
                IsBlacklisted = analysis.RiskScore >= 80 || cat == DomainCategory.Phishing,
                AddedByUserId = userId?.ToString()
            };
            _db.MonitoredDomains.Add(existing);
        }
        else
        {
            existing.Category = cat;
            existing.Risk = risk;
            existing.RiskScore = analysis.RiskScore;
            existing.Reasons = string.Join("; ", analysis.Reasons);
            existing.AiAnalysisJson = System.Text.Json.JsonSerializer.Serialize(analysis);
            existing.LastCheckedAt = DateTime.UtcNow;
            if (analysis.RiskScore >= 80 || cat == DomainCategory.Phishing) existing.IsBlacklisted = true;
        }

        await _db.SaveChangesAsync(ct);
        return Result<DomainListItem>.Ok(ToListItem(existing));
    }

    public async Task<PagedResult<DomainListItem>> ListDomainsAsync(string? search, string? category, int page, int pageSize, CancellationToken ct)
    {
        var q = _db.MonitoredDomains.AsQueryable();
        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLower();
            q = q.Where(d => d.Url.ToLower().Contains(s) || (d.Host != null && d.Host.ToLower().Contains(s)));
        }
        if (!string.IsNullOrWhiteSpace(category) && Enum.TryParse<DomainCategory>(category, true, out var c))
            q = q.Where(d => d.Category == c);
        q = q.OrderByDescending(d => d.RiskScore);
        var total = await q.CountAsync(ct);
        var items = await q.Skip((page - 1) * pageSize).Take(pageSize)
            .Select(d => ToListItem(d)).ToListAsync(ct);
        return new PagedResult<DomainListItem> { Items = items, Total = total, Page = page, PageSize = pageSize };
    }

    public async Task<Result> ToggleBlacklistAsync(Guid id, CancellationToken ct)
    {
        var d = await _db.MonitoredDomains.FindAsync(new object?[] { id }, ct);
        if (d == null) return Result.Fail("Домен не найден", 404);
        d.IsBlacklisted = !d.IsBlacklisted;
        await _db.SaveChangesAsync(ct);
        return Result.Success();
    }

    public async Task<SecurityOverview> OverviewAsync(CancellationToken ct)
    {
        var total = await _db.MonitoredDomains.CountAsync(ct);
        var blk = await _db.MonitoredDomains.CountAsync(d => d.IsBlacklisted, ct);
        var crit = await _db.MonitoredDomains.CountAsync(d => d.Risk == RiskLevel.Critical, ct);
        var high = await _db.MonitoredDomains.CountAsync(d => d.Risk == RiskLevel.High, ct);
        var med = await _db.MonitoredDomains.CountAsync(d => d.Risk == RiskLevel.Medium, ct);
        var low = await _db.MonitoredDomains.CountAsync(d => d.Risk == RiskLevel.Low, ct);
        var open = await _db.FraudCases.CountAsync(c => c.Status == FraudCaseStatus.Open || c.Status == FraudCaseStatus.Investigating, ct);
        var resolved = await _db.FraudCases.CountAsync(c => c.Status == FraudCaseStatus.Resolved, ct);

        var byCategory = await _db.MonitoredDomains
            .GroupBy(d => d.Category)
            .Select(g => new { category = g.Key.ToString(), count = g.Count(), avgRisk = g.Average(x => x.RiskScore) })
            .ToListAsync(ct);

        var topRisky = await _db.MonitoredDomains
            .OrderByDescending(d => d.RiskScore)
            .Take(10)
            .Select(d => new { d.Url, d.Host, category = d.Category.ToString(), d.RiskScore, risk = d.Risk.ToString(), d.IsBlacklisted })
            .ToListAsync(ct);

        return new SecurityOverview(total, blk, crit, high, med, low, open, resolved, byCategory, topRisky);
    }

    public async Task<PagedResult<FraudCaseListItem>> ListCasesAsync(string? status, int page, int pageSize, CancellationToken ct)
    {
        var q = _db.FraudCases.AsQueryable();
        if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<FraudCaseStatus>(status, true, out var s))
            q = q.Where(c => c.Status == s);
        q = q.OrderByDescending(c => c.CreatedAt);
        var total = await q.CountAsync(ct);
        var items = await q.Skip((page - 1) * pageSize).Take(pageSize)
            .Select(c => new FraudCaseListItem(c.Id, c.Code, c.Title, c.Category, c.Status.ToString(),
                c.Risk.ToString(), c.AiSummary, c.CreatedAt))
            .ToListAsync(ct);
        return new PagedResult<FraudCaseListItem> { Items = items, Total = total, Page = page, PageSize = pageSize };
    }

    public async Task<Result<FraudCaseListItem>> CreateCaseFromDomainAsync(Guid domainId, Guid? userId, CancellationToken ct)
    {
        var d = await _db.MonitoredDomains.FindAsync(new object?[] { domainId }, ct);
        if (d == null) return Result<FraudCaseListItem>.Fail("Домен не найден", 404);

        var code = "FRC-" + DateTime.UtcNow.ToString("yyMMdd") + "-" + Random.Shared.Next(1000, 9999);
        var c = new FraudCase
        {
            Code = code,
            Title = $"Проверка домена {d.Host ?? d.Url}",
            Description = d.Reasons,
            Category = d.Category.ToString(),
            Risk = d.Risk == RiskLevel.None ? RiskLevel.Low : d.Risk,
            Status = FraudCaseStatus.Open,
            AssignedAnalystUserId = userId,
            AiSummary = d.AiAnalysisJson,
            AiConfidence = d.RiskScore / 100.0,
            EvidenceJson = System.Text.Json.JsonSerializer.Serialize(new { domainId = d.Id, url = d.Url })
        };
        _db.FraudCases.Add(c);
        await _db.SaveChangesAsync(ct);

        return Result<FraudCaseListItem>.Ok(new FraudCaseListItem(c.Id, c.Code, c.Title, c.Category, c.Status.ToString(), c.Risk.ToString(), c.AiSummary, c.CreatedAt));
    }

    private static DomainListItem ToListItem(MonitoredDomain d) =>
        new(d.Id, d.Url, d.Host, d.Category.ToString(), d.Risk.ToString(), d.RiskScore, d.Country, d.Reasons, d.LastCheckedAt, d.IsBlacklisted);
}
