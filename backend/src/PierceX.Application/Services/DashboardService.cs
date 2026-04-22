using Microsoft.EntityFrameworkCore;
using PierceX.Application.Abstractions;
using PierceX.Domain.Enums;

namespace PierceX.Application.Services;

public interface IDashboardService
{
    Task<object> GetOverviewAsync(CancellationToken ct);
    Task<object> GetTrendsAsync(CancellationToken ct);
    Task<object> GetActivityFeedAsync(int take, CancellationToken ct);
}

public class DashboardService : IDashboardService
{
    private readonly IAppDb _db;
    public DashboardService(IAppDb db) { _db = db; }

    public async Task<object> GetOverviewAsync(CancellationToken ct)
    {
        var students = await _db.Students.CountAsync(ct);
        var teachers = await _db.Teachers.CountAsync(ct);
        var institutions = await _db.Institutions.CountAsync(ct);
        var companies = await _db.Companies.CountAsync(ct);
        var openVacancies = await _db.Vacancies.CountAsync(v => v.Status == VacancyStatus.Published, ct);
        var fraudCases = await _db.FraudCases.CountAsync(ct);
        var openFraud = await _db.FraudCases.CountAsync(f => f.Status == FraudCaseStatus.Open || f.Status == FraudCaseStatus.Investigating, ct);
        var blockedDomains = await _db.MonitoredDomains.CountAsync(d => d.IsBlacklisted, ct);
        var avgGpa = await _db.Students.Where(s => s.Gpa > 0).AverageAsync(s => (double?)s.Gpa, ct) ?? 0;
        var avgAttendance = await _db.Students.Where(s => s.AttendanceRate > 0).AverageAsync(s => (double?)s.AttendanceRate, ct) ?? 0;
        var totalDebt = await _db.Students.SumAsync(s => (double?)s.DebtAmount, ct) ?? 0;
        var totalScholarships = await _db.Students.SumAsync(s => (double?)s.ScholarshipAmount, ct) ?? 0;
        var atRisk = await _db.Students.CountAsync(s => s.DropoutRiskScore >= 0.6, ct);
        var unreadNotifs = await _db.Notifications.CountAsync(n => !n.IsRead, ct);
        var totalRevenueThisMonth = await _db.Payments.Where(p => p.PaidAt >= DateTime.UtcNow.AddDays(-30)).SumAsync(p => (double?)p.Amount, ct) ?? 0;

        return new
        {
            kpis = new object[]
            {
                new { key = "students", label = "Студенты", value = (double)students, delta = 4.2, trend = "up", format = "integer" },
                new { key = "teachers", label = "Преподаватели", value = (double)teachers, delta = 1.1, trend = "up", format = "integer" },
                new { key = "vacancies", label = "Активные вакансии", value = (double)openVacancies, delta = 12.5, trend = "up", format = "integer" },
                new { key = "fraud", label = "Активные расследования", value = (double)openFraud, delta = -8.0, trend = "down", format = "integer" },
                new { key = "gpa", label = "Средний GPA", value = Math.Round(avgGpa, 2), delta = 0.3, trend = "up", format = "number" },
                new { key = "attendance", label = "Посещаемость, %", value = Math.Round(avgAttendance, 1), delta = 2.1, trend = "up", format = "percent" },
                new { key = "debt", label = "Задолженность, ₸", value = totalDebt, delta = -3.7, trend = "down", format = "currency" },
                new { key = "revenue", label = "Оплаты за 30 дней, ₸", value = totalRevenueThisMonth, delta = 9.4, trend = "up", format = "currency" }
            },
            risk = new
            {
                blockedDomains,
                fraudCases,
                studentsAtRisk = atRisk
            },
            counts = new { institutions, companies, unreadNotifs, totalScholarships }
        };
    }

    public async Task<object> GetTrendsAsync(CancellationToken ct)
    {
        var now = DateTime.UtcNow.Date;
        var payments = await _db.Payments
            .Where(p => p.PaidAt >= now.AddDays(-29))
            .GroupBy(p => p.PaidAt.Date)
            .Select(g => new { date = g.Key, total = g.Sum(x => x.Amount) })
            .ToListAsync(ct);

        var paymentsSeries = Enumerable.Range(0, 30)
            .Select(i => now.AddDays(-29 + i))
            .Select(d => new
            {
                date = d.ToString("yyyy-MM-dd"),
                total = (double)(payments.FirstOrDefault(p => p.date == d)?.total ?? 0m)
            })
            .ToArray();

        var enrollmentGroups = await _db.Students
            .GroupBy(s => s.EnrollmentYear)
            .Select(g => new { year = g.Key, count = g.Count() })
            .OrderBy(g => g.year)
            .ToListAsync(ct);

        var riskBuckets = new[]
        {
            new { label = "Низкий", value = await _db.Students.CountAsync(s => s.DropoutRiskScore < 0.3, ct) },
            new { label = "Средний", value = await _db.Students.CountAsync(s => s.DropoutRiskScore >= 0.3 && s.DropoutRiskScore < 0.6, ct) },
            new { label = "Высокий", value = await _db.Students.CountAsync(s => s.DropoutRiskScore >= 0.6 && s.DropoutRiskScore < 0.85, ct) },
            new { label = "Критич.", value = await _db.Students.CountAsync(s => s.DropoutRiskScore >= 0.85, ct) }
        };

        var domainCategories = await _db.MonitoredDomains
            .GroupBy(d => d.Category)
            .Select(g => new { category = g.Key.ToString(), value = g.Count() })
            .ToListAsync(ct);

        return new { paymentsSeries, enrollmentGroups, riskBuckets, domainCategories };
    }

    public async Task<object> GetActivityFeedAsync(int take, CancellationToken ct)
    {
        var audits = await _db.AuditLogs
            .OrderByDescending(a => a.CreatedAt)
            .Take(take)
            .Include(a => a.User)
            .Select(a => new
            {
                id = a.Id,
                at = a.CreatedAt,
                action = a.Action.ToString(),
                entity = a.EntityType,
                details = a.Details,
                actor = a.User != null ? $"{a.User.Surname} {a.User.Name}".Trim() : "Система"
            })
            .ToListAsync(ct);
        return audits;
    }
}
