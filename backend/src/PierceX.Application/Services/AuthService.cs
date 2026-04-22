using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using PierceX.Application.Abstractions;
using PierceX.Application.Common;
using PierceX.Application.DTOs;
using PierceX.Domain.Entities;
using PierceX.Domain.Enums;

namespace PierceX.Application.Services;

public interface IAuthService
{
    Task<Result<UserDto>> RegisterAsync(RegisterDto dto, CancellationToken ct);
    Task<Result<AuthResponseDto>> VerifyEmailAsync(VerifyEmailDto dto, string? ip, string? userAgent, string? fingerprint, CancellationToken ct);
    Task<Result> ResendVerificationAsync(string email, CancellationToken ct);
    Task<Result<AuthResponseDto>> LoginAsync(LoginDto dto, string? ip, string? userAgent, CancellationToken ct);
    Task<Result<AuthResponseDto>> RefreshAsync(string refreshToken, string? ip, string? userAgent, CancellationToken ct);
    Task<Result> LogoutAsync(string refreshToken, CancellationToken ct);
    Task<Result> ForgotPasswordAsync(string email, string resetLinkBase, CancellationToken ct);
    Task<Result> ResetPasswordAsync(ResetPasswordDto dto, CancellationToken ct);
}

public class AuthService : IAuthService
{
    private readonly IAppDb _db;
    private readonly IJwtService _jwt;
    private readonly IEmailService _email;
    private readonly ILogger<AuthService> _log;

    public AuthService(IAppDb db, IJwtService jwt, IEmailService email, ILogger<AuthService> log)
    { _db = db; _jwt = jwt; _email = email; _log = log; }

    public async Task<Result<UserDto>> RegisterAsync(RegisterDto dto, CancellationToken ct)
    {
        if (dto.Password != dto.ConfirmPassword) return Result<UserDto>.Fail("Пароли не совпадают");
        if (dto.Password.Length < 8) return Result<UserDto>.Fail("Пароль должен содержать минимум 8 символов");
        if (string.IsNullOrWhiteSpace(dto.Email) || !dto.Email.Contains('@'))
            return Result<UserDto>.Fail("Некорректный email");

        if (await _db.Users.AnyAsync(u => u.Email == dto.Email.ToLower(), ct))
            return Result<UserDto>.Fail("Пользователь с такой почтой уже существует", 409);

        var code = Random.Shared.Next(100000, 999999).ToString();
        var user = new User
        {
            Email = dto.Email.ToLower(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Surname = dto.Surname.Trim(),
            Name = dto.Name.Trim(),
            Patronymic = dto.Patronymic?.Trim(),
            BirthDate = dto.BirthDate,
            Institution = dto.Institution?.Trim(),
            Role = UserRole.Student,
            EmailConfirmed = false,
            EmailVerificationCode = code,
            EmailVerificationSentAt = DateTime.UtcNow,
            EmailVerificationAttempts = 0,
            PreferredLanguage = "ru",
            Theme = "dark"
        };
        _db.Users.Add(user);
        await _db.SaveChangesAsync(ct);

        try { await _email.SendVerificationEmailAsync(user.Email, $"{user.Surname} {user.Name}", code, ct); }
        catch (Exception ex) { _log.LogWarning(ex, "Verification email not sent, dev code={Code}", code); }
        _log.LogInformation("DEV: verification code for {Email} = {Code}", user.Email, code);

        return Result<UserDto>.Ok(ToDto(user));
    }

    public async Task<Result<AuthResponseDto>> VerifyEmailAsync(VerifyEmailDto dto, string? ip, string? userAgent, string? fingerprint, CancellationToken ct)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == dto.Email.ToLower(), ct);
        if (user == null) return Result<AuthResponseDto>.Fail("Пользователь не найден", 404);
        if (user.EmailConfirmed) return Result<AuthResponseDto>.Fail("Почта уже подтверждена", 409);
        if (user.EmailVerificationAttempts >= 5) return Result<AuthResponseDto>.Fail("Превышен лимит попыток. Запросите новый код.", 429);
        if (user.EmailVerificationSentAt.HasValue && DateTime.UtcNow - user.EmailVerificationSentAt.Value > TimeSpan.FromMinutes(15))
            return Result<AuthResponseDto>.Fail("Код просрочен. Запросите новый.", 410);

        user.EmailVerificationAttempts++;
        if (user.EmailVerificationCode != dto.Code)
        {
            await _db.SaveChangesAsync(ct);
            return Result<AuthResponseDto>.Fail("Неверный код", 400);
        }

        user.EmailConfirmed = true;
        user.EmailVerificationCode = null;
        user.LastLoginAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);

        return await IssueTokensAsync(user, ip, userAgent, fingerprint, persistent: true, ct);
    }

    public async Task<Result> ResendVerificationAsync(string email, CancellationToken ct)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == email.ToLower(), ct);
        if (user == null) return Result.Fail("Пользователь не найден", 404);
        if (user.EmailConfirmed) return Result.Fail("Почта уже подтверждена", 409);
        if (user.EmailVerificationSentAt.HasValue && DateTime.UtcNow - user.EmailVerificationSentAt.Value < TimeSpan.FromSeconds(30))
            return Result.Fail("Подождите перед повторной отправкой", 429);

        var code = Random.Shared.Next(100000, 999999).ToString();
        user.EmailVerificationCode = code;
        user.EmailVerificationSentAt = DateTime.UtcNow;
        user.EmailVerificationAttempts = 0;
        await _db.SaveChangesAsync(ct);

        try { await _email.SendVerificationEmailAsync(user.Email, $"{user.Surname} {user.Name}", code, ct); }
        catch (Exception ex) { _log.LogWarning(ex, "Resend email failed"); }
        _log.LogInformation("DEV: RE-SENT verification code for {Email} = {Code}", user.Email, code);
        return Result.Success();
    }

    public async Task<Result<AuthResponseDto>> LoginAsync(LoginDto dto, string? ip, string? userAgent, CancellationToken ct)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == dto.Email.ToLower(), ct);
        if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            return Result<AuthResponseDto>.Fail("Неверная почта или пароль", 401);
        if (!user.IsActive)
            return Result<AuthResponseDto>.Fail("Учётная запись заблокирована", 403);
        if (!user.EmailConfirmed)
            return Result<AuthResponseDto>.Fail("Подтвердите email, код отправлен на почту", 403);

        user.LastLoginAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);

        return await IssueTokensAsync(user, ip, userAgent, dto.DeviceFingerprint, dto.RememberMe, ct);
    }

    public async Task<Result<AuthResponseDto>> RefreshAsync(string refreshToken, string? ip, string? userAgent, CancellationToken ct)
    {
        var rt = await _db.RefreshTokens.Include(r => r.User)
            .FirstOrDefaultAsync(r => r.Token == refreshToken && r.RevokedAt == null, ct);
        if (rt == null || rt.ExpiresAt < DateTime.UtcNow || rt.User == null)
            return Result<AuthResponseDto>.Fail("Недействительный refresh token", 401);

        rt.RevokedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);
        return await IssueTokensAsync(rt.User, ip, userAgent, rt.DeviceFingerprint, persistent: true, ct);
    }

    public async Task<Result> LogoutAsync(string refreshToken, CancellationToken ct)
    {
        var rt = await _db.RefreshTokens.FirstOrDefaultAsync(r => r.Token == refreshToken, ct);
        if (rt != null) { rt.RevokedAt = DateTime.UtcNow; await _db.SaveChangesAsync(ct); }
        return Result.Success();
    }

    public async Task<Result> ForgotPasswordAsync(string email, string resetLinkBase, CancellationToken ct)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == email.ToLower(), ct);
        if (user == null) return Result.Success();

        var token = _jwt.GenerateRefreshToken();
        user.PasswordResetToken = token;
        user.PasswordResetExpiresAt = DateTime.UtcNow.AddMinutes(30);
        await _db.SaveChangesAsync(ct);

        var link = $"{resetLinkBase.TrimEnd('/')}/reset-password?email={Uri.EscapeDataString(user.Email)}&token={token}";
        try { await _email.SendPasswordResetEmailAsync(user.Email, $"{user.Surname} {user.Name}", link, ct); }
        catch (Exception ex) { _log.LogWarning(ex, "Password reset email failed"); }
        _log.LogInformation("DEV: password reset link for {Email} = {Link}", user.Email, link);
        return Result.Success();
    }

    public async Task<Result> ResetPasswordAsync(ResetPasswordDto dto, CancellationToken ct)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == dto.Email.ToLower(), ct);
        if (user == null || user.PasswordResetToken != dto.Token || user.PasswordResetExpiresAt < DateTime.UtcNow)
            return Result.Fail("Ссылка недействительна или просрочена", 400);
        if (dto.NewPassword.Length < 8) return Result.Fail("Пароль должен содержать минимум 8 символов");

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
        user.PasswordResetToken = null;
        user.PasswordResetExpiresAt = null;
        await _db.SaveChangesAsync(ct);
        return Result.Success();
    }

    private async Task<Result<AuthResponseDto>> IssueTokensAsync(User user, string? ip, string? userAgent, string? fingerprint, bool persistent, CancellationToken ct)
    {
        var (access, expires) = _jwt.GenerateAccessToken(user);
        var refresh = _jwt.GenerateRefreshToken();
        _db.RefreshTokens.Add(new RefreshToken
        {
            UserId = user.Id,
            Token = refresh,
            ExpiresAt = persistent ? DateTime.UtcNow.AddDays(30) : DateTime.UtcNow.AddHours(12),
            DeviceFingerprint = fingerprint,
            Ip = ip,
            UserAgent = userAgent
        });

        if (!string.IsNullOrEmpty(fingerprint))
        {
            var dev = await _db.UserDevices.FirstOrDefaultAsync(d => d.UserId == user.Id && d.Fingerprint == fingerprint, ct);
            if (dev == null)
            {
                _db.UserDevices.Add(new UserDevice
                {
                    UserId = user.Id,
                    Fingerprint = fingerprint,
                    Name = "Браузер",
                    Ip = ip,
                    LastSeenAt = DateTime.UtcNow,
                    IsTrusted = persistent
                });
            }
            else
            {
                dev.LastSeenAt = DateTime.UtcNow;
                dev.Ip = ip;
                if (persistent) dev.IsTrusted = true;
            }
        }

        await _db.SaveChangesAsync(ct);
        return Result<AuthResponseDto>.Ok(new AuthResponseDto(access, refresh, expires, ToDto(user)));
    }

    public static UserDto ToDto(User u) => new(
        u.Id, u.Email, u.Surname, u.Name, u.Patronymic, u.Role.ToString(),
        u.AvatarUrl, u.Institution, u.PreferredLanguage, u.Theme, u.EmailConfirmed);
}
