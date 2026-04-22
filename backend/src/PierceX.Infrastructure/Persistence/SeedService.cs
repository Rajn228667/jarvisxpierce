using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using PierceX.Domain.Entities;
using PierceX.Domain.Enums;
using AppEntity = PierceX.Domain.Entities.Application;

namespace PierceX.Infrastructure.Persistence;

public class SeedService
{
    private readonly AppDbContext _db;
    private readonly ILogger<SeedService> _log;
    private readonly Random _rand = new(42);

    public SeedService(AppDbContext db, ILogger<SeedService> log) { _db = db; _log = log; }

    public async Task SeedAsync()
    {
        await _db.Database.MigrateAsync();
        if (await _db.Users.AnyAsync())
        {
            _log.LogInformation("Seed skipped — database already has users.");
            return;
        }

        _log.LogInformation("Seeding demo data…");
        await SeedInstitutionsAndUsersAsync();
        await SeedAcademicsAsync();
        await SeedFinanceAsync();
        await SeedCompaniesAndVacanciesAsync();
        await SeedSecurityAsync();
        await SeedNotificationsAndAuditAsync();
        _log.LogInformation("Seed complete.");
    }

    private async Task SeedInstitutionsAndUsersAsync()
    {
        var institutions = new[]
        {
            new Institution { Name = "Nazarbayev University", ShortName = "NU", City = "Астана", EnrollmentCapacity = 6000, Phone = "+7 7172 70 66 66", Email = "info@nu.edu.kz", Website = "https://nu.edu.kz", Description = "Ведущий исследовательский университет Казахстана" },
            new Institution { Name = "КазНУ им. аль-Фараби", ShortName = "КазНУ", City = "Алматы", EnrollmentCapacity = 20000, Phone = "+7 727 377 3333", Website = "https://kaznu.kz", Description = "Крупнейший национальный университет" },
            new Institution { Name = "AITU — Astana IT University", ShortName = "AITU", City = "Астана", EnrollmentCapacity = 3500, Website = "https://astanait.edu.kz", Description = "Технологический университет нового поколения" }
        };
        _db.Institutions.AddRange(institutions);
        await _db.SaveChangesAsync();

        var departments = new[]
        {
            new Department { InstitutionId = institutions[0].Id, Name = "Школа инженерии и цифровых наук" },
            new Department { InstitutionId = institutions[0].Id, Name = "Школа бизнеса" },
            new Department { InstitutionId = institutions[1].Id, Name = "Механико-математический факультет" },
            new Department { InstitutionId = institutions[1].Id, Name = "Факультет информационных технологий" },
            new Department { InstitutionId = institutions[2].Id, Name = "Программная инженерия" },
            new Department { InstitutionId = institutions[2].Id, Name = "Кибербезопасность" }
        };
        _db.Departments.AddRange(departments);
        await _db.SaveChangesAsync();

        // Admin
        var admin = new User
        {
            Email = "admin@piercex.kz",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!"),
            Surname = "Админ",
            Name = "Платформы",
            Role = UserRole.SuperAdmin,
            EmailConfirmed = true,
            Institution = institutions[0].Name,
            InstitutionId = institutions[0].Id,
            AvatarUrl = "https://i.pinimg.com/736x/72/94/fc/7294fc15ae24bc012c69553bf7012108.jpg",
            PreferredLanguage = "ru",
            Theme = "dark",
            IsActive = true
        };

        var director = new User
        {
            Email = "director@piercex.kz",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Director123!"),
            Surname = "Оспанов", Name = "Бауыржан", Patronymic = "Ерланович",
            Role = UserRole.Director, EmailConfirmed = true,
            Institution = institutions[0].Name, InstitutionId = institutions[0].Id,
            PreferredLanguage = "ru", Theme = "dark"
        };

        var employer = new User
        {
            Email = "employer@piercex.kz",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Employer123!"),
            Surname = "Абдрахманова", Name = "Айгерим",
            Role = UserRole.Employer, EmailConfirmed = true,
            Institution = "Kaspi.kz", PreferredLanguage = "ru", Theme = "dark"
        };

        var analyst = new User
        {
            Email = "analyst@piercex.kz",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Analyst123!"),
            Surname = "Иванов", Name = "Дмитрий", Patronymic = "Сергеевич",
            Role = UserRole.SecurityAnalyst, EmailConfirmed = true,
            PreferredLanguage = "ru", Theme = "dark"
        };

        _db.Users.AddRange(admin, director, employer, analyst);

        // Teachers
        var teacherSeeds = new (string surname, string name, string patr, string title, string spec, int yrs, decimal rating, int deptIdx)[]
        {
            ("Ахметов", "Марат", "Канатович", "Профессор", "Машинное обучение", 14, 4.8m, 0),
            ("Смагулов", "Данияр", "Кайратович", "Доцент", "Базы данных", 11, 4.7m, 0),
            ("Нұрлыбекова", "Айжан", "Талғатқызы", "Доцент", "Алгоритмы", 9, 4.6m, 0),
            ("Петров", "Владимир", "Алексеевич", "Преподаватель", "Сетевые технологии", 7, 4.4m, 4),
            ("Жумагулова", "Диана", "Ерлановна", "Доцент", "Кибербезопасность", 12, 4.9m, 5),
            ("Токтаров", "Руслан", "Маратович", "Старший преподаватель", "Веб-разработка", 6, 4.5m, 4),
            ("Бейсембаев", "Аскар", "Нурланович", "Профессор", "Финансовая математика", 16, 4.9m, 1),
            ("Сагадиева", "Камила", "Алиевна", "Преподаватель", "UX дизайн", 5, 4.6m, 4)
        };
        var teachers = new List<Teacher>();
        foreach (var (surname, name, patr, title, spec, yrs, rating, deptIdx) in teacherSeeds)
        {
            var u = new User
            {
                Email = $"{Translit(surname).ToLower()}@piercex.kz",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Teacher123!"),
                Surname = surname, Name = name, Patronymic = patr,
                Role = UserRole.Teacher, EmailConfirmed = true,
                Institution = institutions[Math.Min(deptIdx / 2, 2)].Name,
                InstitutionId = institutions[Math.Min(deptIdx / 2, 2)].Id,
                PreferredLanguage = "ru", Theme = "dark"
            };
            _db.Users.Add(u);
            teachers.Add(new Teacher
            {
                UserId = u.Id, User = u,
                InstitutionId = u.InstitutionId!.Value,
                DepartmentId = departments[deptIdx].Id,
                Title = title, Specialization = spec, YearsOfExperience = yrs, Rating = rating
            });
        }
        _db.Teachers.AddRange(teachers);

        // Students
        var surnames = new[] { "Серикбай", "Муратов", "Жумабек", "Калиев", "Байжан", "Досанов", "Омаров", "Нұрсұлтан", "Шакиров", "Ерланова", "Алибекова", "Смаилова", "Кадырова", "Бекмуратова", "Жунусова", "Искакова", "Петрова", "Ким", "Иванова", "Соколов", "Ким", "Ли", "Chen", "Назарбаев" };
        var names = new[] { "Али", "Данияр", "Ерасыл", "Ернар", "Алмас", "Алихан", "Нұрлан", "Рустем", "Тимур", "Артур", "Айжан", "Диана", "Асель", "Жанар", "Мадина", "Камила", "Алия", "Айгерим", "Алена", "Виктория" };
        var majors = new[] { "Информатика", "Программная инженерия", "Кибербезопасность", "Финансы", "Data Science", "Бизнес-анализ", "Математика" };

        var students = new List<Student>();
        for (int i = 0; i < 60; i++)
        {
            var sur = surnames[_rand.Next(surnames.Length)];
            var nm = names[_rand.Next(names.Length)];
            var inst = institutions[_rand.Next(institutions.Length)];
            var year = 2021 + _rand.Next(5);
            var u = new User
            {
                Email = $"student{i + 1}@piercex.kz",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Student123!"),
                Surname = sur, Name = nm,
                Role = UserRole.Student, EmailConfirmed = true,
                Institution = inst.Name, InstitutionId = inst.Id,
                PreferredLanguage = "ru", Theme = "dark",
                BirthDate = new DateTime(2000 + _rand.Next(6), _rand.Next(1, 13), _rand.Next(1, 28))
            };
            _db.Users.Add(u);

            var gpa = Math.Round((decimal)(1.5 + _rand.NextDouble() * 2.5), 2);
            var att = Math.Round((decimal)(55 + _rand.NextDouble() * 45), 1);
            var debt = _rand.NextDouble() < 0.35 ? Math.Round((decimal)(_rand.NextDouble() * 600000), 0) : 0m;
            var sch = _rand.NextDouble() < 0.25 ? Math.Round((decimal)(_rand.NextDouble() * 250000), 0) : 0m;

            var gpaPart = Math.Max(0, (4.0 - (double)gpa)) / 4.0;
            var attPart = Math.Max(0, (100.0 - (double)att)) / 100.0;
            var debtPart = debt > 0 ? Math.Min(1.0, (double)debt / 500000.0) : 0;
            var risk = Math.Round(Math.Min(1.0, 0.45 * gpaPart + 0.35 * attPart + 0.2 * debtPart), 3);

            students.Add(new Student
            {
                UserId = u.Id, User = u,
                InstitutionId = inst.Id,
                StudentNumber = $"S-{2024}-{1000 + i}",
                EnrollmentYear = year,
                Major = majors[_rand.Next(majors.Length)],
                Gpa = gpa, AttendanceRate = att,
                DebtAmount = debt, ScholarshipAmount = sch,
                DropoutRiskScore = risk
            });
        }
        _db.Students.AddRange(students);
        await _db.SaveChangesAsync();
    }

    private async Task SeedAcademicsAsync()
    {
        var teachers = await _db.Teachers.ToListAsync();
        var students = await _db.Students.ToListAsync();
        var institutions = await _db.Institutions.ToListAsync();
        var departments = await _db.Departments.ToListAsync();
        if (students.Count == 0) return;

        var courseSeeds = new[]
        {
            ("CS101", "Введение в программирование", 6),
            ("CS201", "Структуры данных и алгоритмы", 6),
            ("CS301", "Операционные системы", 5),
            ("CS350", "Базы данных", 5),
            ("CS401", "Машинное обучение", 6),
            ("SEC201", "Основы кибербезопасности", 5),
            ("FIN101", "Корпоративные финансы", 4),
            ("MATH201", "Линейная алгебра", 5),
            ("DS300", "Data Science практикум", 6),
            ("WEB200", "Веб-разработка", 5)
        };
        var courses = courseSeeds.Select((t, i) => new Course
        {
            Code = t.Item1, Name = t.Item2, Credits = t.Item3,
            DepartmentId = departments[i % departments.Count].Id,
            PrimaryTeacherId = teachers[i % teachers.Count].Id
        }).ToList();
        _db.Courses.AddRange(courses);

        var groups = new List<Group>();
        foreach (var c in courses)
        {
            for (int g = 1; g <= 2; g++)
                groups.Add(new Group { Name = $"{c.Code}-Г{g}", CourseId = c.Id, Course = c, InstitutionId = institutions[_rand.Next(institutions.Count)].Id, Year = 2024 + _rand.Next(0, 2), Semester = g == 1 ? "Осень" : "Весна" });
        }
        _db.Groups.AddRange(groups);
        await _db.SaveChangesAsync();

        // assign some students to groups
        for (int i = 0; i < students.Count; i++)
        {
            students[i].GroupId = groups[i % groups.Count].Id;
        }
        await _db.SaveChangesAsync();

        // Lessons
        var lessons = new List<Lesson>();
        foreach (var c in courses)
        {
            var teacher = teachers.First(t => t.Id == c.PrimaryTeacherId);
            var grp = groups.First(g => g.CourseId == c.Id);
            for (int w = 0; w < 8; w++)
            {
                lessons.Add(new Lesson
                {
                    CourseId = c.Id, Course = c,
                    GroupId = grp.Id, Group = grp,
                    TeacherId = teacher.Id, Teacher = teacher,
                    Topic = $"{c.Name} — лекция {w + 1}",
                    Description = "Практические задания и обсуждение материала.",
                    StartsAt = DateTime.UtcNow.Date.AddDays(-30 + w * 3).AddHours(10),
                    EndsAt = DateTime.UtcNow.Date.AddDays(-30 + w * 3).AddHours(11.5),
                    Room = $"Ауд. {100 + w * 10}"
                });
            }
        }
        _db.Lessons.AddRange(lessons);
        await _db.SaveChangesAsync();

        // Grades & Attendance
        foreach (var s in students.Take(40))
        {
            var groupCourses = courses.Where(c => groups.Any(g => g.CourseId == c.Id && g.Id == s.GroupId)).Take(3).ToList();
            if (!groupCourses.Any()) groupCourses = courses.Take(3).ToList();
            foreach (var c in groupCourses)
            {
                for (int k = 0; k < 3; k++)
                {
                    _db.Grades.Add(new Grade
                    {
                        StudentId = s.Id, CourseId = c.Id,
                        TeacherId = c.PrimaryTeacherId,
                        Type = (GradeType)(k % Enum.GetValues<GradeType>().Length),
                        Score = Math.Round((decimal)(40 + _rand.NextDouble() * 60), 1),
                        MaxScore = 100m,
                        GivenAt = DateTime.UtcNow.AddDays(-_rand.Next(60))
                    });
                }
            }
            var myLessons = lessons.Where(l => l.GroupId == s.GroupId).Take(6);
            foreach (var l in myLessons)
            {
                var status = _rand.NextDouble() switch
                {
                    < 0.78 => AttendanceStatus.Present,
                    < 0.88 => AttendanceStatus.Late,
                    < 0.95 => AttendanceStatus.Excused,
                    _ => AttendanceStatus.Absent
                };
                _db.Attendances.Add(new Attendance { StudentId = s.Id, LessonId = l.Id, Status = status });
            }
        }
        await _db.SaveChangesAsync();
    }

    private async Task SeedFinanceAsync()
    {
        var students = await _db.Students.ToListAsync();
        var invoices = new List<Invoice>();
        int n = 0;
        foreach (var s in students)
        {
            int count = 1 + _rand.Next(3);
            for (int i = 0; i < count; i++)
            {
                var amount = Math.Round((decimal)(150000 + _rand.NextDouble() * 750000), 0);
                var paid = _rand.NextDouble() < 0.55 ? amount : Math.Round(amount * (decimal)_rand.NextDouble(), 0);
                var status = paid >= amount ? PaymentStatus.Paid
                    : paid > 0 ? PaymentStatus.Pending
                    : (_rand.NextDouble() < 0.35 ? PaymentStatus.Overdue : PaymentStatus.Pending);
                var due = DateTime.UtcNow.AddDays(-_rand.Next(-30, 60));
                invoices.Add(new Invoice
                {
                    Number = $"INV-2025-{10000 + n++}",
                    StudentId = s.Id,
                    Type = (InvoiceType)(_rand.Next(Enum.GetValues<InvoiceType>().Length)),
                    Amount = amount, PaidAmount = paid,
                    IssuedAt = due.AddDays(-30),
                    DueAt = due,
                    Status = status,
                    Description = "Оплата за обучение",
                    Currency = "KZT"
                });
            }
        }
        _db.Invoices.AddRange(invoices);
        await _db.SaveChangesAsync();

        foreach (var inv in invoices.Where(x => x.PaidAmount > 0))
        {
            _db.Payments.Add(new Payment
            {
                InvoiceId = inv.Id,
                Amount = inv.PaidAmount,
                Method = _rand.Next(2) == 0 ? "card" : "bank",
                Reference = $"PX-{inv.Number}",
                PaidAt = inv.IssuedAt.AddDays(_rand.Next(1, 29))
            });
        }
        await _db.SaveChangesAsync();
    }

    private async Task SeedCompaniesAndVacanciesAsync()
    {
        var employerUser = await _db.Users.FirstOrDefaultAsync(u => u.Role == UserRole.Employer);
        var companies = new[]
        {
            new Company { Name = "Kaspi.kz", Industry = "Финтех", City = "Алматы", Employees = 15000, Rating = 4.7m, Website = "https://kaspi.kz", Description = "Крупнейшая финтех-платформа Казахстана", OwnerUserId = employerUser?.Id },
            new Company { Name = "Halyk Bank", Industry = "Банкинг", City = "Алматы", Employees = 18000, Rating = 4.4m, Website = "https://halykbank.kz", Description = "Крупнейший банк РК" },
            new Company { Name = "Beeline KZ", Industry = "Телекоммуникации", City = "Алматы", Employees = 5000, Rating = 4.3m, Website = "https://beeline.kz" },
            new Company { Name = "Tabys", Industry = "IT", City = "Астана", Employees = 120, Rating = 4.5m, Website = "https://tabys.kz" },
            new Company { Name = "Choco", Industry = "IT / Ритейл", City = "Алматы", Employees = 700, Rating = 4.6m, Website = "https://choco.kz" },
            new Company { Name = "1Fit", Industry = "Healthtech", City = "Алматы", Employees = 200, Rating = 4.5m }
        };
        _db.Companies.AddRange(companies);
        await _db.SaveChangesAsync();

        var vacSeeds = new (string title, bool intern, decimal min, decimal max, string desc, string req, string benefits, string location)[]
        {
            ("Junior .NET разработчик", false, 450000, 700000, "Разработка backend-сервисов на ASP.NET Core, интеграции с платежными шлюзами.", "C# • ASP.NET Core • SQL • Git", "Гибкий график • ДМС • Обучение", "Алматы"),
            ("Data Scientist", false, 800000, 1300000, "Работа с big data, ML-модели для скоринга и антифрод.", "Python • ML • SQL • Statistics", "Полис • Спорт • Языковые курсы", "Алматы"),
            ("Стажёр — Cybersecurity Analyst", true, 120000, 180000, "Мониторинг инцидентов ИБ, участие в расследованиях.", "Базы сетей • Linux • Желание учиться", "Менторство • Перспектива найма", "Астана"),
            ("Frontend React Dev", false, 600000, 950000, "React + TypeScript, дизайн-система, перф-оптимизация.", "React • TS • CSS • Figma", "Удалёнка • Техника • Равити", "Удалённо"),
            ("Product Manager", false, 1000000, 1600000, "Запуск продуктов с нуля, работа с аналитикой и командой.", "Product thinking • Analytics • Roadmaps", "Опцион • Обучение • Конференции", "Астана"),
            ("Стажёр — Financial Analyst", true, 100000, 150000, "Поддержка казначейства, Excel-модели, отчёты.", "Excel • Финансы • Внимательность", "Менторство • Гибкий график", "Алматы"),
            ("DevOps Engineer", false, 900000, 1500000, "CI/CD, Kubernetes, облака, observability.", "K8s • Docker • AWS/GCP • Terraform", "Удалёнка • Сертификации • Техника", "Удалённо"),
            ("Mobile iOS Developer", false, 700000, 1200000, "Swift-приложения банка, CI/CD Fastlane.", "Swift • UIKit • SwiftUI", "ДМС • Обучение • Спорт", "Алматы")
        };

        var vacancies = new List<Vacancy>();
        int vi = 0;
        foreach (var (title, intern, min, max, desc, req, benefits, loc) in vacSeeds)
        {
            vacancies.Add(new Vacancy
            {
                CompanyId = companies[vi % companies.Length].Id,
                Title = title, Description = desc, Requirements = req, Benefits = benefits,
                Location = loc,
                SalaryMin = min, SalaryMax = max, SalaryCurrency = "KZT",
                EmploymentType = intern ? "Стажировка" : "Полная занятость",
                IsInternship = intern,
                Status = VacancyStatus.Published,
                PublishedAt = DateTime.UtcNow.AddDays(-_rand.Next(30))
            });
            vi++;
        }
        _db.Vacancies.AddRange(vacancies);
        await _db.SaveChangesAsync();

        // Applications with AI match scores
        var students = await _db.Students.Include(s => s.User).ToListAsync();
        foreach (var v in vacancies)
        {
            var candidates = students.OrderBy(_ => _rand.Next()).Take(6 + _rand.Next(10));
            foreach (var s in candidates)
            {
                if (s.User == null) continue;
                var score = Math.Round(_rand.NextDouble() * 0.5 + (s.Gpa > 3 ? 0.35 : 0.1), 3);
                _db.Applications.Add(new AppEntity
                {
                    VacancyId = v.Id,
                    ApplicantUserId = s.User.Id,
                    Status = (ApplicationStatus)(_rand.Next(Enum.GetValues<ApplicationStatus>().Length)),
                    AiMatchScore = score,
                    AiSummary = $"GPA {s.Gpa}, посещаемость {s.AttendanceRate}%. Сильные стороны: {s.Major}."
                });
            }
        }
        await _db.SaveChangesAsync();
    }

    private async Task SeedSecurityAsync()
    {
        var domainSeeds = new (string url, DomainCategory cat, RiskLevel risk, double score, string reasons, bool black)[]
        {
            ("1xbet-kz-bonus.top", DomainCategory.Casino, RiskLevel.Critical, 94, "Домен-клон букмекера; маркеры азартных игр; TLD .top", true),
            ("vulkan-casino-kz.xyz", DomainCategory.Casino, RiskLevel.Critical, 96, "Бренд казино; домен в .xyz; массовые жалобы", true),
            ("halyk-secure-login.online", DomainCategory.Phishing, RiskLevel.Critical, 98, "Имитация банка Halyk; домен зарегистрирован 4 дня назад", true),
            ("kaspi-update-kz.click", DomainCategory.Phishing, RiskLevel.High, 88, "Имитация Kaspi.kz; подозрительный TLD .click", true),
            ("egov-kz-auth.site", DomainCategory.Phishing, RiskLevel.Critical, 95, "Имитация egov.kz; сертификат Let's Encrypt на 90 дней", true),
            ("invest-pyramid-kz.pro", DomainCategory.Pyramid, RiskLevel.High, 81, "Признаки HYIP; обещание 35% в месяц", true),
            ("crypto-doubler-kz.net", DomainCategory.Scam, RiskLevel.High, 79, "Паттерн scam; схема удвоения криптовалют", true),
            ("t.me/tgshop-astana", DomainCategory.TelegramSeller, RiskLevel.Medium, 55, "Telegram-продажа крипты P2P без KYC", false),
            ("forex-profit-kz.biz", DomainCategory.Scam, RiskLevel.Medium, 62, "Форекс-приманка; обещание гарантированной прибыли", false),
            ("bet-slots-night.top", DomainCategory.GamblingAd, RiskLevel.High, 72, "Реклама азартных игр; промо-коды", true),
            ("nu.edu.kz", DomainCategory.CleanVerified, RiskLevel.None, 2, "Официальный домен Nazarbayev University", false),
            ("kaspi.kz", DomainCategory.CleanVerified, RiskLevel.None, 3, "Официальный домен Kaspi Bank", false),
            ("halykbank.kz", DomainCategory.CleanVerified, RiskLevel.None, 3, "Официальный домен Halyk Bank", false)
        };
        foreach (var d in domainSeeds)
        {
            string host = d.url;
            try { host = new Uri(d.url.Contains("://") ? d.url : "http://" + d.url).Host; } catch { }
            _db.MonitoredDomains.Add(new MonitoredDomain
            {
                Url = d.url.ToLower(),
                Host = host,
                Category = d.cat,
                Risk = d.risk,
                RiskScore = d.score,
                Reasons = d.reasons,
                LastCheckedAt = DateTime.UtcNow.AddDays(-_rand.Next(7)),
                IsBlacklisted = d.black,
                Country = "KZ"
            });
        }

        var analyst = await _db.Users.FirstOrDefaultAsync(u => u.Role == UserRole.SecurityAnalyst);
        var fraudSeeds = new (string title, string cat, RiskLevel risk, string summary, FraudCaseStatus st)[]
        {
            ("Сеть фишинговых клонов Halyk Bank", "Phishing", RiskLevel.Critical, "Обнаружена сеть из 12 доменов, имитирующих Halyk Bank. Распространение через SMS.", FraudCaseStatus.Investigating),
            ("Нелегальное казино 1xbet-kz-bonus", "Casino", RiskLevel.High, "Реклама во ВКонтакте и Telegram. Депозиты через криптокошельки.", FraudCaseStatus.Open),
            ("Подозрение на manipulation в тендере №GP-2025-001", "Procurement", RiskLevel.High, "Технические характеристики точно совпадают с каталогом одного поставщика.", FraudCaseStatus.Investigating),
            ("Telegram-канал ‘Быстрые деньги KZ’", "TelegramSeller", RiskLevel.Medium, "Продажа донорских карт и криптообмен без KYC. 8400 подписчиков.", FraudCaseStatus.Open),
            ("Отмывание через микро-платежи от студентов", "Laundering", RiskLevel.High, "Подозрительная схема множественных мелких переводов между 27 аккаунтами.", FraudCaseStatus.Investigating)
        };
        foreach (var f in fraudSeeds)
        {
            _db.FraudCases.Add(new FraudCase
            {
                Code = "FRC-" + DateTime.UtcNow.ToString("yyMMdd") + "-" + Random.Shared.Next(1000, 9999),
                Title = f.title, Category = f.cat, Risk = f.risk, Status = f.st,
                AssignedAnalystUserId = analyst?.Id,
                AiSummary = f.summary,
                AiConfidence = 0.6 + _rand.NextDouble() * 0.4,
                Description = f.summary
            });
        }
        await _db.SaveChangesAsync();
    }

    private async Task SeedNotificationsAndAuditAsync()
    {
        var users = await _db.Users.Where(u => u.Role == UserRole.SuperAdmin || u.Role == UserRole.Director || u.Role == UserRole.SecurityAnalyst).ToListAsync();
        var notifs = new (string title, string body, NotificationSeverity sev, string cat)[]
        {
            ("Обнаружен критический фишинг-домен", "halyk-secure-login.online добавлен в blacklist. Требуется проверка.", NotificationSeverity.Critical, "security"),
            ("Рост просроченной задолженности", "За неделю +12 студентов перешли в статус Overdue.", NotificationSeverity.Warning, "finance"),
            ("AI: 7 студентов в зоне риска отчисления", "Запущен автоматический отчёт для кураторов.", NotificationSeverity.Warning, "academic"),
            ("Новые заявки на вакансии", "За сутки поступило 34 новые заявки.", NotificationSeverity.Info, "recruitment"),
            ("Тендер №GP-2025-001: возможная манипуляция", "Анализ AI показал 82% совпадение с каталогом поставщика.", NotificationSeverity.Error, "procurement")
        };
        foreach (var u in users)
        {
            foreach (var n in notifs)
            {
                _db.Notifications.Add(new Notification
                {
                    UserId = u.Id,
                    Title = n.title,
                    Body = n.body,
                    Severity = n.sev,
                    Category = n.cat,
                    IsRead = _rand.NextDouble() < 0.2,
                    CreatedAt = DateTime.UtcNow.AddMinutes(-_rand.Next(60 * 48))
                });
            }
        }
        var admin = users.FirstOrDefault();
        if (admin != null)
        {
            var actions = new[] { (AuditAction.Login, "User", "Вход администратора"),
                (AuditAction.Create, "FraudCase", "Создано расследование FRC-..."),
                (AuditAction.Update, "Student", "Обновлён студент S-2024-1000"),
                (AuditAction.Export, "Invoice", "Экспорт CSV по финансам"),
                (AuditAction.Investigate, "MonitoredDomain", "Запущен AI-анализ домена halyk-secure-login.online")};
            foreach (var a in actions)
            {
                _db.AuditLogs.Add(new AuditLog
                {
                    UserId = admin.Id,
                    Action = a.Item1,
                    EntityType = a.Item2,
                    Details = a.Item3,
                    CreatedAt = DateTime.UtcNow.AddMinutes(-_rand.Next(60 * 24))
                });
            }
        }
        await _db.SaveChangesAsync();
    }

    private static string Translit(string s)
    {
        var map = new Dictionary<char, string>
        {
            {'а',"a"},{'б',"b"},{'в',"v"},{'г',"g"},{'д',"d"},{'е',"e"},{'ё',"yo"},{'ж',"zh"},{'з',"z"},{'и',"i"},{'й',"y"},{'к',"k"},{'л',"l"},{'м',"m"},{'н',"n"},{'о',"o"},{'п',"p"},{'р',"r"},{'с',"s"},{'т',"t"},{'у',"u"},{'ф',"f"},{'х',"h"},{'ц',"ts"},{'ч',"ch"},{'ш',"sh"},{'щ',"sch"},{'ъ',""},{'ы',"y"},{'ь',""},{'э',"e"},{'ю',"yu"},{'я',"ya"},{'қ',"q"},{'ғ',"g"},{'ә',"a"},{'ө',"o"},{'ұ',"u"},{'ү',"u"},{'һ',"h"},{'і',"i"},{'ң',"n"}
        };
        var sb = new System.Text.StringBuilder();
        foreach (var c in s.ToLower()) sb.Append(map.TryGetValue(c, out var r) ? r : (char.IsLetter(c) ? c.ToString() : ""));
        return sb.ToString();
    }
}
