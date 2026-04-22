using System;
using System.Collections.Generic;
using PierceX.Domain.Common;

namespace PierceX.Domain.Entities;

public class Institution : Entity
{
    public string Name { get; set; } = string.Empty;
    public string? ShortName { get; set; }
    public string? LogoUrl { get; set; }
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? Website { get; set; }
    public string? Description { get; set; }
    public int EnrollmentCapacity { get; set; }

    public ICollection<Department> Departments { get; set; } = new List<Department>();
    public ICollection<User> Users { get; set; } = new List<User>();
}

public class Department : Entity
{
    public Guid InstitutionId { get; set; }
    public Institution? Institution { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid? HeadUserId { get; set; }
    public User? HeadUser { get; set; }

    public ICollection<Course> Courses { get; set; } = new List<Course>();
}
