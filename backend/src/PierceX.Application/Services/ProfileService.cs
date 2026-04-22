using Microsoft.EntityFrameworkCore;
using PierceX.Application.Abstractions;
using PierceX.Application.Common;
using PierceX.Application.DTOs;

namespace PierceX.Application.Services;

public record ProfileUpdateDto(string? Surname, string? Name, string? Patronymic, string? Phone,
    string? AvatarUrl, string? PreferredLanguage, string? Theme, string? Institution);
public record ChangePasswordDto(string OldPassword, string NewPassword);
public record LayoutDto(string DashboardLayoutJson);
public record DeviceDto(Guid Id, string? Name, string? Os, string? Browser, string? Ip, DateTime LastSeenAt, bool IsTrusted);

public interface IProfileService
{
    Task<Result<UserDto>> GetAsync(Guid userId, CancellationToken ct);
    Task<Result<UserDto>> UpdateAsync(Guid userId, ProfileUpdateDto dto, CancellationToken ct);
    Task<Result> ChangePasswordAsync(Guid userId, ChangePasswordDto dto, CancellationToken ct);
    Task<Result> SaveLayoutAsync(Guid userId, string json, CancellationToken ct);
    Task<string?> GetLayoutAsync(Guid userId, CancellationToken ct);
    Task<List<DeviceDto>> GetDevicesAsync(Guid userId, CancellationToken ct);
    Task<Result> RevokeDeviceAsync(Guid userId, Guid deviceId, CancellationToken ct);
}

public class ProfileService : IProfileService
{
    private readonly IAppDb _db;
    public ProfileService(IAppDb db) { _db = db; }

    public async Task<Result<UserDto>> GetAsync(Guid userId, CancellationToken ct)
    {
        var u = await _db.Users.FirstOrDefaultAsync(x => x.Id == userId, ct);
        if (u == null) return Result<UserDto>.Fail("Не найдено", 404);
        return Result<UserDto>.Ok(AuthService.ToDto(u));
    }

    public async Task<Result<UserDto>> UpdateAsync(Guid userId, ProfileUpdateDto dto, CancellationToken ct)
    {
        var u = await _db.Users.FirstOrDefaultAsync(x => x.Id == userId, ct);
        if (u == null) return Result<UserDto>.Fail("Не найдено", 404);
        if (!string.IsNullOrWhiteSpace(dto.Surname)) u.Surname = dto.Surname.Trim();
        if (!string.IsNullOrWhiteSpace(dto.Name)) u.Name = dto.Name.Trim();
        if (dto.Patronymic != null) u.Patronymic = dto.Patronymic.Trim();
        if (dto.Phone != null) u.Phone = dto.Phone.Trim();
        if (dto.AvatarUrl != null) u.AvatarUrl = dto.AvatarUrl.Trim();
        if (!string.IsNullOrWhiteSpace(dto.PreferredLanguage)) u.PreferredLanguage = dto.PreferredLanguage.Trim();
        if (!string.IsNullOrWhiteSpace(dto.Theme)) u.Theme = dto.Theme.Trim();
        if (dto.Institution != null) u.Institution = dto.Institution.Trim();
        await _db.SaveChangesAsync(ct);
        return Result<UserDto>.Ok(AuthService.ToDto(u));
    }

    public async Task<Result> ChangePasswordAsync(Guid userId, ChangePasswordDto dto, CancellationToken ct)
    {
        var u = await _db.Users.FirstOrDefaultAsync(x => x.Id == userId, ct);
        if (u == null) return Result.Fail("Не найдено", 404);
        if (!BCrypt.Net.BCrypt.Verify(dto.OldPassword, u.PasswordHash)) return Result.Fail("Неверный текущий пароль");
        if (dto.NewPassword.Length < 8) return Result.Fail("Пароль должен содержать минимум 8 символов");
        u.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
        await _db.SaveChangesAsync(ct);
        return Result.Success();
    }

    public async Task<Result> SaveLayoutAsync(Guid userId, string json, CancellationToken ct)
    {
        var u = await _db.Users.FirstOrDefaultAsync(x => x.Id == userId, ct);
        if (u == null) return Result.Fail("Не найдено", 404);
        u.DashboardLayoutJson = json;
        await _db.SaveChangesAsync(ct);
        return Result.Success();
    }

    public async Task<string?> GetLayoutAsync(Guid userId, CancellationToken ct) =>
        (await _db.Users.FirstOrDefaultAsync(x => x.Id == userId, ct))?.DashboardLayoutJson;

    public async Task<List<DeviceDto>> GetDevicesAsync(Guid userId, CancellationToken ct) =>
        await _db.UserDevices.Where(d => d.UserId == userId)
            .OrderByDescending(d => d.LastSeenAt)
            .Select(d => new DeviceDto(d.Id, d.Name, d.Os, d.Browser, d.Ip, d.LastSeenAt, d.IsTrusted))
            .ToListAsync(ct);

    public async Task<Result> RevokeDeviceAsync(Guid userId, Guid deviceId, CancellationToken ct)
    {
        var d = await _db.UserDevices.FirstOrDefaultAsync(x => x.Id == deviceId && x.UserId == userId, ct);
        if (d == null) return Result.Fail("Не найдено", 404);
        _db.UserDevices.Remove(d);
        // also revoke refresh tokens of this fingerprint
        var tokens = await _db.RefreshTokens.Where(r => r.UserId == userId && r.DeviceFingerprint == d.Fingerprint && r.RevokedAt == null).ToListAsync(ct);
        foreach (var t in tokens) t.RevokedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);
        return Result.Success();
    }
}
