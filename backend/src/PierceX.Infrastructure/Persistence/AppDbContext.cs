using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using PierceX.Application.Abstractions;
using PierceX.Domain.Common;
using PierceX.Domain.Entities;
using AppEntity = PierceX.Domain.Entities.Application;

namespace PierceX.Infrastructure.Persistence;

public class AppDbContext : DbContext, IAppDb
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<UserDevice> UserDevices => Set<UserDevice>();
    public DbSet<Institution> Institutions => Set<Institution>();
    public DbSet<Department> Departments => Set<Department>();
    public DbSet<Student> Students => Set<Student>();
    public DbSet<Teacher> Teachers => Set<Teacher>();
    public DbSet<ParentLink> ParentLinks => Set<ParentLink>();
    public DbSet<Course> Courses => Set<Course>();
    public DbSet<Group> Groups => Set<Group>();
    public DbSet<Lesson> Lessons => Set<Lesson>();
    public DbSet<Attendance> Attendances => Set<Attendance>();
    public DbSet<Grade> Grades => Set<Grade>();
    public DbSet<Homework> Homeworks => Set<Homework>();
    public DbSet<Invoice> Invoices => Set<Invoice>();
    public DbSet<Payment> Payments => Set<Payment>();
    public DbSet<Company> Companies => Set<Company>();
    public DbSet<Vacancy> Vacancies => Set<Vacancy>();
    public DbSet<AppEntity> Applications => Set<AppEntity>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<Message> Messages => Set<Message>();
    public DbSet<SupportTicket> SupportTickets => Set<SupportTicket>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
    public DbSet<AIChat> AIChats => Set<AIChat>();
    public DbSet<AIChatMessage> AIChatMessages => Set<AIChatMessage>();
    public DbSet<MonitoredDomain> MonitoredDomains => Set<MonitoredDomain>();
    public DbSet<FraudCase> FraudCases => Set<FraudCase>();
    public DbSet<RiskScore> RiskScores => Set<RiskScore>();
    public DbSet<Alert> Alerts => Set<Alert>();
    public DbSet<Prediction> Predictions => Set<Prediction>();
    public DbSet<Document> Documents => Set<Document>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        b.Entity<User>().HasIndex(x => x.Email).IsUnique();
        b.Entity<RefreshToken>().HasIndex(x => x.Token).IsUnique();
        b.Entity<Student>().HasIndex(x => x.StudentNumber).IsUnique();
        b.Entity<Invoice>().HasIndex(x => x.Number).IsUnique();
        b.Entity<MonitoredDomain>().HasIndex(x => x.Url).IsUnique();
        b.Entity<FraudCase>().HasIndex(x => x.Code).IsUnique();

        b.Entity<User>()
            .HasOne(u => u.InstitutionEntity)
            .WithMany(i => i.Users)
            .HasForeignKey(u => u.InstitutionId)
            .OnDelete(DeleteBehavior.SetNull);

        b.Entity<Department>()
            .HasOne(d => d.HeadUser)
            .WithMany()
            .HasForeignKey(d => d.HeadUserId)
            .OnDelete(DeleteBehavior.SetNull);

        b.Entity<Student>()
            .HasOne(s => s.User).WithOne().HasForeignKey<Student>(s => s.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        b.Entity<Teacher>()
            .HasOne(t => t.User).WithOne().HasForeignKey<Teacher>(t => t.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        b.Entity<ParentLink>()
            .HasOne(p => p.ParentUser).WithMany().HasForeignKey(p => p.ParentUserId)
            .OnDelete(DeleteBehavior.Cascade);
        b.Entity<ParentLink>()
            .HasOne(p => p.Student).WithMany(s => s.Parents).HasForeignKey(p => p.StudentId)
            .OnDelete(DeleteBehavior.Cascade);

        b.Entity<Grade>()
            .Property(g => g.Score).HasPrecision(6, 2);
        b.Entity<Grade>()
            .Property(g => g.MaxScore).HasPrecision(6, 2);
        b.Entity<Student>()
            .Property(s => s.Gpa).HasPrecision(4, 2);
        b.Entity<Student>()
            .Property(s => s.AttendanceRate).HasPrecision(5, 2);
        b.Entity<Student>()
            .Property(s => s.ScholarshipAmount).HasPrecision(14, 2);
        b.Entity<Student>()
            .Property(s => s.DebtAmount).HasPrecision(14, 2);
        b.Entity<Invoice>()
            .Property(i => i.Amount).HasPrecision(14, 2);
        b.Entity<Invoice>()
            .Property(i => i.PaidAmount).HasPrecision(14, 2);
        b.Entity<Payment>()
            .Property(p => p.Amount).HasPrecision(14, 2);
        b.Entity<Vacancy>()
            .Property(v => v.SalaryMin).HasPrecision(14, 2);
        b.Entity<Vacancy>()
            .Property(v => v.SalaryMax).HasPrecision(14, 2);
        b.Entity<Company>()
            .Property(c => c.Rating).HasPrecision(3, 2);
        b.Entity<Teacher>()
            .Property(t => t.Rating).HasPrecision(3, 2);

        b.Entity<Message>()
            .HasOne(m => m.FromUser).WithMany().HasForeignKey(m => m.FromUserId)
            .OnDelete(DeleteBehavior.Restrict);
        b.Entity<Message>()
            .HasOne(m => m.ToUser).WithMany().HasForeignKey(m => m.ToUserId)
            .OnDelete(DeleteBehavior.Restrict);

        b.Entity<AIChatMessage>()
            .HasOne(m => m.Chat).WithMany(c => c.Messages).HasForeignKey(m => m.ChatId)
            .OnDelete(DeleteBehavior.Cascade);

        if (Database.IsSqlite())
        {
            var decimalToDouble = new ValueConverter<decimal, double>(v => (double)v, v => (decimal)v);
            var nullableDecimalToDouble = new ValueConverter<decimal?, double?>(
                v => v.HasValue ? (double?)(double)v.Value : null,
                v => v.HasValue ? (decimal?)(decimal)v.Value : null);

            foreach (var entity in b.Model.GetEntityTypes())
            {
                foreach (var prop in entity.GetProperties())
                {
                    if (prop.ClrType == typeof(decimal))
                        prop.SetValueConverter(decimalToDouble);
                    else if (prop.ClrType == typeof(decimal?))
                        prop.SetValueConverter(nullableDecimalToDouble);
                }
            }
        }

        base.OnModelCreating(b);
    }

    public override Task<int> SaveChangesAsync(CancellationToken ct = default)
    {
        var now = DateTime.UtcNow;
        foreach (var e in ChangeTracker.Entries<Entity>())
        {
            if (e.State == EntityState.Added) { e.Entity.CreatedAt = now; e.Entity.UpdatedAt = now; }
            else if (e.State == EntityState.Modified) { e.Entity.UpdatedAt = now; }
        }
        return base.SaveChangesAsync(ct);
    }
}
