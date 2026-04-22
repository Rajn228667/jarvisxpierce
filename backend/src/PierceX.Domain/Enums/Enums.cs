namespace PierceX.Domain.Enums;

public enum UserRole
{
    SuperAdmin = 1,
    PlatformOwner,
    InstitutionOwner,
    Director,
    Manager,
    Accountant,
    HR,
    Teacher,
    Curator,
    Student,
    Parent,
    Employer,
    Recruiter,
    SecurityAnalyst,
    SupportAgent
}

public enum AttendanceStatus { Present, Absent, Late, Excused }
public enum GradeType { Exam, Quiz, Homework, Project, Participation, Final }
public enum PaymentStatus { Pending, Paid, Overdue, Cancelled, Refunded }
public enum InvoiceType { Tuition, Dormitory, Fine, Service, Other }
public enum ApplicationStatus { Submitted, Reviewing, Interview, Offered, Accepted, Rejected, Withdrawn }
public enum RiskLevel { None, Low, Medium, High, Critical }
public enum FraudCaseStatus { Open, Investigating, Resolved, Dismissed }
public enum DomainCategory { Unknown, Casino, Scam, Phishing, Pyramid, GamblingAd, TelegramSeller, CleanVerified }
public enum NotificationSeverity { Info, Success, Warning, Error, Critical }
public enum DocumentType { Certificate, Contract, Report, Reference, Receipt, Transcript }
public enum VacancyStatus { Draft, Published, Paused, Closed }
public enum AuditAction { Create, Read, Update, Delete, Login, Logout, Export, Approve, Reject, Investigate }
