using Microsoft.EntityFrameworkCore;
using PierceX.Domain.Entities;
using AppEntity = PierceX.Domain.Entities.Application;

namespace PierceX.Application.Abstractions;

public interface IAppDb
{
    DbSet<User> Users { get; }
    DbSet<RefreshToken> RefreshTokens { get; }
    DbSet<UserDevice> UserDevices { get; }
    DbSet<Institution> Institutions { get; }
    DbSet<Department> Departments { get; }
    DbSet<Student> Students { get; }
    DbSet<Teacher> Teachers { get; }
    DbSet<ParentLink> ParentLinks { get; }
    DbSet<Course> Courses { get; }
    DbSet<Group> Groups { get; }
    DbSet<Lesson> Lessons { get; }
    DbSet<Attendance> Attendances { get; }
    DbSet<Grade> Grades { get; }
    DbSet<Homework> Homeworks { get; }
    DbSet<Invoice> Invoices { get; }
    DbSet<Payment> Payments { get; }
    DbSet<Company> Companies { get; }
    DbSet<Vacancy> Vacancies { get; }
    DbSet<AppEntity> Applications { get; }
    DbSet<Notification> Notifications { get; }
    DbSet<Message> Messages { get; }
    DbSet<SupportTicket> SupportTickets { get; }
    DbSet<AuditLog> AuditLogs { get; }
    DbSet<AIChat> AIChats { get; }
    DbSet<AIChatMessage> AIChatMessages { get; }
    DbSet<MonitoredDomain> MonitoredDomains { get; }
    DbSet<FraudCase> FraudCases { get; }
    DbSet<RiskScore> RiskScores { get; }
    DbSet<Alert> Alerts { get; }
    DbSet<Prediction> Predictions { get; }
    DbSet<Document> Documents { get; }
    Task<int> SaveChangesAsync(CancellationToken ct = default);
}
