using Microsoft.EntityFrameworkCore;
using PierceX.Application.Abstractions;
using PierceX.Application.Common;
using PierceX.Domain.Enums;

namespace PierceX.Application.Services;

public record InvoiceListItem(Guid Id, string Number, string StudentName, string StudentNumber,
    string Type, decimal Amount, decimal PaidAmount, string Status, DateTime IssuedAt, DateTime DueAt);

public record FinanceOverview(decimal TotalInvoiced, decimal TotalPaid, decimal TotalDebt,
    int OverdueCount, int PendingCount, object ByType, object MonthlyFlow);

public interface IFinanceService
{
    Task<PagedResult<InvoiceListItem>> ListAsync(string? search, string? status, int page, int pageSize, CancellationToken ct);
    Task<FinanceOverview> OverviewAsync(CancellationToken ct);
    Task<Result> PayAsync(Guid invoiceId, decimal amount, string method, CancellationToken ct);
    Task<byte[]> ExportCsvAsync(string? status, CancellationToken ct);
}

public class FinanceService : IFinanceService
{
    private readonly IAppDb _db;
    public FinanceService(IAppDb db) { _db = db; }

    public async Task<PagedResult<InvoiceListItem>> ListAsync(string? search, string? status, int page, int pageSize, CancellationToken ct)
    {
        var q = _db.Invoices
            .Include(i => i.Student!).ThenInclude(s => s.User)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<PaymentStatus>(status, true, out var st))
            q = q.Where(i => i.Status == st);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLower();
            q = q.Where(i => i.Number.ToLower().Contains(s) ||
                (i.Student != null && i.Student.User != null && (i.Student.User.Surname.ToLower().Contains(s) || i.Student.User.Name.ToLower().Contains(s))));
        }

        q = q.OrderByDescending(i => i.IssuedAt);
        var total = await q.CountAsync(ct);
        var items = await q.Skip((page - 1) * pageSize).Take(pageSize)
            .Select(i => new InvoiceListItem(
                i.Id, i.Number,
                i.Student != null && i.Student.User != null ? $"{i.Student.User.Surname} {i.Student.User.Name}".Trim() : "",
                i.Student != null ? i.Student.StudentNumber : "",
                i.Type.ToString(), i.Amount, i.PaidAmount, i.Status.ToString(), i.IssuedAt, i.DueAt))
            .ToListAsync(ct);

        return new PagedResult<InvoiceListItem> { Items = items, Total = total, Page = page, PageSize = pageSize };
    }

    public async Task<FinanceOverview> OverviewAsync(CancellationToken ct)
    {
        var invoiced = await _db.Invoices.SumAsync(i => (decimal?)i.Amount, ct) ?? 0m;
        var paid = await _db.Invoices.SumAsync(i => (decimal?)i.PaidAmount, ct) ?? 0m;
        var debt = invoiced - paid;
        var overdue = await _db.Invoices.CountAsync(i => i.Status == PaymentStatus.Overdue, ct);
        var pending = await _db.Invoices.CountAsync(i => i.Status == PaymentStatus.Pending, ct);

        var byType = await _db.Invoices
            .GroupBy(i => i.Type)
            .Select(g => new { type = g.Key.ToString(), total = g.Sum(x => x.Amount), paid = g.Sum(x => x.PaidAmount) })
            .ToListAsync(ct);

        var now = DateTime.UtcNow.Date;
        var monthlyRaw = await _db.Payments
            .Where(p => p.PaidAt >= now.AddMonths(-5))
            .ToListAsync(ct);
        var monthly = Enumerable.Range(0, 6)
            .Select(i => now.AddMonths(-5 + i))
            .Select(d => new
            {
                month = d.ToString("yyyy-MM"),
                total = monthlyRaw.Where(p => p.PaidAt.Year == d.Year && p.PaidAt.Month == d.Month).Sum(p => (double)p.Amount)
            }).ToArray();

        return new FinanceOverview(invoiced, paid, debt, overdue, pending, byType, monthly);
    }

    public async Task<Result> PayAsync(Guid invoiceId, decimal amount, string method, CancellationToken ct)
    {
        var inv = await _db.Invoices.FindAsync(new object?[] { invoiceId }, ct);
        if (inv == null) return Result.Fail("Счёт не найден", 404);
        if (amount <= 0) return Result.Fail("Сумма должна быть положительной");

        inv.PaidAmount += amount;
        if (inv.PaidAmount >= inv.Amount) inv.Status = PaymentStatus.Paid;

        _db.Payments.Add(new Domain.Entities.Payment
        {
            InvoiceId = invoiceId,
            Amount = amount,
            Method = string.IsNullOrWhiteSpace(method) ? "card" : method,
            Reference = $"PX-{DateTime.UtcNow.Ticks}"
        });

        if (inv.StudentId != Guid.Empty)
        {
            var s = await _db.Students.FindAsync(new object?[] { inv.StudentId }, ct);
            if (s != null) s.DebtAmount = Math.Max(0m, s.DebtAmount - amount);
        }

        await _db.SaveChangesAsync(ct);
        return Result.Success();
    }

    public async Task<byte[]> ExportCsvAsync(string? status, CancellationToken ct)
    {
        var list = await ListAsync(null, status, 1, 100000, ct);
        var sb = new System.Text.StringBuilder();
        sb.AppendLine("Number;Student;StudentNumber;Type;Amount;Paid;Status;IssuedAt;DueAt");
        foreach (var x in list.Items)
        {
            string Esc(string? s) => "\"" + (s ?? "").Replace("\"", "\"\"") + "\"";
            sb.AppendLine($"{Esc(x.Number)};{Esc(x.StudentName)};{Esc(x.StudentNumber)};{Esc(x.Type)};{x.Amount};{x.PaidAmount};{Esc(x.Status)};{x.IssuedAt:yyyy-MM-dd};{x.DueAt:yyyy-MM-dd}");
        }
        return System.Text.Encoding.UTF8.GetPreamble().Concat(System.Text.Encoding.UTF8.GetBytes(sb.ToString())).ToArray();
    }
}
