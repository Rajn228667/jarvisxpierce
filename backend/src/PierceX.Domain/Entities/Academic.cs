using System;
using System.Collections.Generic;
using PierceX.Domain.Common;
using PierceX.Domain.Enums;

namespace PierceX.Domain.Entities;

public class Student : Entity
{
    public Guid UserId { get; set; }
    public User? User { get; set; }
    public Guid InstitutionId { get; set; }
    public Institution? Institution { get; set; }
    public Guid? GroupId { get; set; }
    public Group? Group { get; set; }

    public string StudentNumber { get; set; } = string.Empty;
    public int EnrollmentYear { get; set; }
    public string? Major { get; set; }
    public decimal Gpa { get; set; }
    public decimal AttendanceRate { get; set; }
    public decimal ScholarshipAmount { get; set; }
    public decimal DebtAmount { get; set; }
    public string? Notes { get; set; }
    public double DropoutRiskScore { get; set; }

    public ICollection<Attendance> Attendances { get; set; } = new List<Attendance>();
    public ICollection<Grade> Grades { get; set; } = new List<Grade>();
    public ICollection<Invoice> Invoices { get; set; } = new List<Invoice>();
    public ICollection<ParentLink> Parents { get; set; } = new List<ParentLink>();
}

public class Teacher : Entity
{
    public Guid UserId { get; set; }
    public User? User { get; set; }
    public Guid InstitutionId { get; set; }
    public Institution? Institution { get; set; }
    public Guid? DepartmentId { get; set; }
    public Department? Department { get; set; }

    public string? Title { get; set; }
    public string? Specialization { get; set; }
    public int YearsOfExperience { get; set; }
    public decimal Rating { get; set; }

    public ICollection<Course> Courses { get; set; } = new List<Course>();
    public ICollection<Lesson> Lessons { get; set; } = new List<Lesson>();
}

public class ParentLink : Entity
{
    public Guid ParentUserId { get; set; }
    public User? ParentUser { get; set; }
    public Guid StudentId { get; set; }
    public Student? Student { get; set; }
    public string Relationship { get; set; } = "parent";
}

public class Course : Entity
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int Credits { get; set; }
    public Guid? DepartmentId { get; set; }
    public Department? Department { get; set; }
    public Guid? PrimaryTeacherId { get; set; }
    public Teacher? PrimaryTeacher { get; set; }

    public ICollection<Group> Groups { get; set; } = new List<Group>();
    public ICollection<Lesson> Lessons { get; set; } = new List<Lesson>();
}

public class Group : Entity
{
    public string Name { get; set; } = string.Empty;
    public Guid? CourseId { get; set; }
    public Course? Course { get; set; }
    public Guid InstitutionId { get; set; }
    public Institution? Institution { get; set; }
    public int Year { get; set; }
    public string? Semester { get; set; }

    public ICollection<Student> Students { get; set; } = new List<Student>();
    public ICollection<Lesson> Lessons { get; set; } = new List<Lesson>();
}

public class Lesson : Entity
{
    public Guid CourseId { get; set; }
    public Course? Course { get; set; }
    public Guid? GroupId { get; set; }
    public Group? Group { get; set; }
    public Guid? TeacherId { get; set; }
    public Teacher? Teacher { get; set; }

    public string Topic { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime StartsAt { get; set; }
    public DateTime EndsAt { get; set; }
    public string? Room { get; set; }

    public ICollection<Attendance> Attendances { get; set; } = new List<Attendance>();
    public ICollection<Grade> Grades { get; set; } = new List<Grade>();
}

public class Attendance : Entity
{
    public Guid LessonId { get; set; }
    public Lesson? Lesson { get; set; }
    public Guid StudentId { get; set; }
    public Student? Student { get; set; }
    public AttendanceStatus Status { get; set; }
    public string? Comment { get; set; }
}

public class Grade : Entity
{
    public Guid StudentId { get; set; }
    public Student? Student { get; set; }
    public Guid CourseId { get; set; }
    public Course? Course { get; set; }
    public Guid? LessonId { get; set; }
    public Lesson? Lesson { get; set; }
    public Guid? TeacherId { get; set; }
    public Teacher? Teacher { get; set; }

    public GradeType Type { get; set; }
    public decimal Score { get; set; }
    public decimal MaxScore { get; set; } = 100m;
    public string? Comment { get; set; }
    public DateTime GivenAt { get; set; } = DateTime.UtcNow;
}

public class Homework : Entity
{
    public Guid CourseId { get; set; }
    public Course? Course { get; set; }
    public Guid? TeacherId { get; set; }
    public Teacher? Teacher { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime DueDate { get; set; }
    public decimal MaxScore { get; set; } = 100m;
}
