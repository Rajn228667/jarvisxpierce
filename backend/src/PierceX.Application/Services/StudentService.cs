using Microsoft.EntityFrameworkCore;
using PierceX.Application.Abstractions;
using PierceX.Application.Common;
using PierceX.Domain.Entities;

namespace PierceX.Application.Services;

public record StudentListItem(
    Guid Id, string StudentNumber, string FullName, string Email, string? Major,
    decimal Gpa, decimal AttendanceRate, decimal DebtAmount, decimal ScholarshipAmount,
    double DropoutRiskScore, string? Group, string? Institution, int EnrollmentYear);

public record StudentDetails(StudentListItem Summary, object Grades, object Attendance, object Invoices);

public record StudentUpdateDto(string? Major, decimal? Gpa, decimal? AttendanceRate,
    decimal? DebtAmount, decimal? ScholarshipAmount, string? Notes);

public interface IStudentService
{
    Task<PagedResult<StudentListItem>> ListAsync(string? search, string? sortBy, string? sortDir, int page, int pageSize, CancellationToken ct);
    Task<Result<StudentDetails>> GetAsync(Guid id, CancellationToken ct);
    Task<Result<StudentListItem>> UpdateAsync(Guid id, StudentUpdateDto dto, CancellationToken ct);
    Task<Result> DeleteAsync(Guid id, CancellationToken ct);
    Task<byte[]> ExportCsvAsync(string? search, CancellationToken ct);
}

public class StudentService : IStudentService
{
    private readonly IAppDb _db;
    public StudentService(IAppDb db) { _db = db; }

    private IQueryable<Student> Base() =>
        _db.Students.Include(s => s.User).Include(s => s.Group).Include(s => s.Institution);

    public async Task<PagedResult<StudentListItem>> ListAsync(string? search, string? sortBy, string? sortDir, int page, int pageSize, CancellationToken ct)
    {
        var q = Base();
        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLower();
            q = q.Where(x =>
                x.StudentNumber.ToLower().Contains(s) ||
                (x.User != null && (x.User.Surname.ToLower().Contains(s) || x.User.Name.ToLower().Contains(s) || x.User.Email.ToLower().Contains(s))) ||
                (x.Major != null && x.Major.ToLower().Contains(s)));
        }

        sortBy = (sortBy ?? "gpa").ToLower();
        var asc = (sortDir ?? "desc").ToLower() == "asc";
        q = (sortBy, asc) switch
        {
            ("gpa", true) => q.OrderBy(x => x.Gpa),
            ("gpa", false) => q.OrderByDescending(x => x.Gpa),
            ("name", true) => q.OrderBy(x => x.User!.Surname),
            ("name", false) => q.OrderByDescending(x => x.User!.Surname),
            ("attendance", true) => q.OrderBy(x => x.AttendanceRate),
            ("attendance", false) => q.OrderByDescending(x => x.AttendanceRate),
            ("risk", true) => q.OrderBy(x => x.DropoutRiskScore),
            ("risk", false) => q.OrderByDescending(x => x.DropoutRiskScore),
            ("debt", true) => q.OrderBy(x => x.DebtAmount),
            ("debt", false) => q.OrderByDescending(x => x.DebtAmount),
            _ => q.OrderByDescending(x => x.Gpa),
        };

        var total = await q.CountAsync(ct);
        var items = await q.Skip((page - 1) * pageSize).Take(pageSize)
            .Select(x => new StudentListItem(
                x.Id, x.StudentNumber,
                x.User == null ? "" : $"{x.User.Surname} {x.User.Name}".Trim(),
                x.User == null ? "" : x.User.Email,
                x.Major, x.Gpa, x.AttendanceRate, x.DebtAmount, x.ScholarshipAmount, x.DropoutRiskScore,
                x.Group == null ? null : x.Group.Name,
                x.Institution == null ? null : x.Institution.Name,
                x.EnrollmentYear))
            .ToListAsync(ct);

        return new PagedResult<StudentListItem> { Items = items, Total = total, Page = page, PageSize = pageSize };
    }

    public async Task<Result<StudentDetails>> GetAsync(Guid id, CancellationToken ct)
    {
        var s = await Base().FirstOrDefaultAsync(x => x.Id == id, ct);
        if (s == null) return Result<StudentDetails>.Fail("Студент не найден", 404);

        var summary = new StudentListItem(
            s.Id, s.StudentNumber,
            s.User == null ? "" : $"{s.User.Surname} {s.User.Name}".Trim(),
            s.User == null ? "" : s.User.Email,
            s.Major, s.Gpa, s.AttendanceRate, s.DebtAmount, s.ScholarshipAmount, s.DropoutRiskScore,
            s.Group?.Name, s.Institution?.Name, s.EnrollmentYear);

        var grades = await _db.Grades.Where(g => g.StudentId == id)
            .Include(g => g.Course)
            .OrderByDescending(g => g.GivenAt).Take(50)
            .Select(g => new { g.Id, course = g.Course!.Name, g.Score, g.MaxScore, type = g.Type.ToString(), g.GivenAt, g.Comment })
            .ToListAsync(ct);

        var att = await _db.Attendances.Where(a => a.StudentId == id)
            .Include(a => a.Lesson)
            .OrderByDescending(a => a.Lesson!.StartsAt)
            .Take(50)
            .Select(a => new { a.Id, lesson = a.Lesson!.Topic, a.Lesson.StartsAt, status = a.Status.ToString(), a.Comment })
            .ToListAsync(ct);

        var inv = await _db.Invoices.Where(i => i.StudentId == id)
            .OrderByDescending(i => i.IssuedAt)
            .Select(i => new { i.Id, i.Number, type = i.Type.ToString(), status = i.Status.ToString(), i.Amount, i.PaidAmount, i.DueAt, i.IssuedAt })
            .ToListAsync(ct);

        return Result<StudentDetails>.Ok(new StudentDetails(summary, grades, att, inv));
    }

    public async Task<Result<StudentListItem>> UpdateAsync(Guid id, StudentUpdateDto dto, CancellationToken ct)
    {
        var s = await Base().FirstOrDefaultAsync(x => x.Id == id, ct);
        if (s == null) return Result<StudentListItem>.Fail("Студент не найден", 404);

        if (dto.Major != null) s.Major = dto.Major;
        if (dto.Gpa.HasValue) s.Gpa = dto.Gpa.Value;
        if (dto.AttendanceRate.HasValue) s.AttendanceRate = dto.AttendanceRate.Value;
        if (dto.DebtAmount.HasValue) s.DebtAmount = dto.DebtAmount.Value;
        if (dto.ScholarshipAmount.HasValue) s.ScholarshipAmount = dto.ScholarshipAmount.Value;
        if (dto.Notes != null) s.Notes = dto.Notes;

        // Recompute dropout risk with simple heuristic
        var gpaPart = Math.Max(0, (4.0 - (double)s.Gpa)) / 4.0;
        var attPart = Math.Max(0, (100.0 - (double)s.AttendanceRate)) / 100.0;
        var debtPart = s.DebtAmount > 0 ? Math.Min(1.0, (double)s.DebtAmount / 500000.0) : 0;
        s.DropoutRiskScore = Math.Round(Math.Min(1.0, 0.45 * gpaPart + 0.35 * attPart + 0.2 * debtPart), 3);

        await _db.SaveChangesAsync(ct);

        return Result<StudentListItem>.Ok(new StudentListItem(
            s.Id, s.StudentNumber,
            s.User == null ? "" : $"{s.User.Surname} {s.User.Name}".Trim(),
            s.User == null ? "" : s.User.Email,
            s.Major, s.Gpa, s.AttendanceRate, s.DebtAmount, s.ScholarshipAmount, s.DropoutRiskScore,
            s.Group?.Name, s.Institution?.Name, s.EnrollmentYear));
    }

    public async Task<Result> DeleteAsync(Guid id, CancellationToken ct)
    {
        var s = await _db.Students.FindAsync(new object?[] { id }, ct);
        if (s == null) return Result.Fail("Студент не найден", 404);
        _db.Students.Remove(s);
        await _db.SaveChangesAsync(ct);
        return Result.Success();
    }

    public async Task<byte[]> ExportCsvAsync(string? search, CancellationToken ct)
    {
        var list = await ListAsync(search, "name", "asc", 1, 100000, ct);
        var sb = new System.Text.StringBuilder();
        sb.AppendLine("StudentNumber;FullName;Email;Major;Gpa;AttendanceRate;DebtAmount;Scholarship;RiskScore;Group;Institution;EnrollmentYear");
        foreach (var x in list.Items)
        {
            string Esc(string? s) => "\"" + (s ?? "").Replace("\"", "\"\"") + "\"";
            sb.Append($"{Esc(x.StudentNumber)};{Esc(x.FullName)};{Esc(x.Email)};{Esc(x.Major)};{x.Gpa};{x.AttendanceRate};{x.DebtAmount};{x.ScholarshipAmount};{x.DropoutRiskScore};{Esc(x.Group)};{Esc(x.Institution)};{x.EnrollmentYear}");
            sb.AppendLine();
        }
        return System.Text.Encoding.UTF8.GetPreamble().Concat(System.Text.Encoding.UTF8.GetBytes(sb.ToString())).ToArray();
    }
}
