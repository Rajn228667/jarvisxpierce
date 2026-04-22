using System;
using System.Collections.Generic;
using PierceX.Domain.Common;
using PierceX.Domain.Enums;

namespace PierceX.Domain.Entities;

public class Company : Entity
{
    public string Name { get; set; } = string.Empty;
    public string? Industry { get; set; }
    public string? Description { get; set; }
    public string? Website { get; set; }
    public string? LogoUrl { get; set; }
    public string? City { get; set; }
    public int Employees { get; set; }
    public decimal Rating { get; set; }
    public Guid? OwnerUserId { get; set; }
    public User? OwnerUser { get; set; }

    public ICollection<Vacancy> Vacancies { get; set; } = new List<Vacancy>();
}

public class Vacancy : Entity
{
    public Guid CompanyId { get; set; }
    public Company? Company { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Requirements { get; set; }
    public string? Benefits { get; set; }
    public string? Location { get; set; }
    public decimal? SalaryMin { get; set; }
    public decimal? SalaryMax { get; set; }
    public string? SalaryCurrency { get; set; } = "KZT";
    public string? EmploymentType { get; set; }
    public VacancyStatus Status { get; set; } = VacancyStatus.Published;
    public bool IsInternship { get; set; }
    public DateTime? PublishedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ExpiresAt { get; set; }

    public ICollection<Application> Applications { get; set; } = new List<Application>();
}

public class Application : Entity
{
    public Guid VacancyId { get; set; }
    public Vacancy? Vacancy { get; set; }
    public Guid ApplicantUserId { get; set; }
    public User? ApplicantUser { get; set; }
    public ApplicationStatus Status { get; set; } = ApplicationStatus.Submitted;
    public string? CoverLetter { get; set; }
    public string? CvUrl { get; set; }
    public double AiMatchScore { get; set; }
    public string? AiSummary { get; set; }
    public string? Notes { get; set; }
}
