namespace PierceX.Application.DTOs;

public record RegisterDto(
    string Email,
    string Password,
    string ConfirmPassword,
    string Surname,
    string Name,
    string? Patronymic,
    DateTime? BirthDate,
    string? Institution
);

public record LoginDto(string Email, string Password, bool RememberMe, string? DeviceFingerprint, string? DeviceName);
public record VerifyEmailDto(string Email, string Code);
public record ResendVerificationDto(string Email);
public record RefreshDto(string RefreshToken);
public record ForgotPasswordDto(string Email);
public record ResetPasswordDto(string Token, string Email, string NewPassword);
public record AuthResponseDto(string AccessToken, string RefreshToken, DateTime ExpiresAt, UserDto User);

public record UserDto(
    Guid Id,
    string Email,
    string Surname,
    string Name,
    string? Patronymic,
    string Role,
    string? AvatarUrl,
    string? Institution,
    string PreferredLanguage,
    string Theme,
    bool EmailConfirmed
);
