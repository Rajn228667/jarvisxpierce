using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MimeKit;
using PierceX.Application.Abstractions;

namespace PierceX.Infrastructure.Services;

public class SmtpOptions
{
    public string Host { get; set; } = "localhost";
    public int Port { get; set; } = 1025; // MailHog default
    public bool UseSsl { get; set; } = false;
    public string? Username { get; set; }
    public string? Password { get; set; }
    public string FromEmail { get; set; } = "no-reply@piercex.local";
    public string FromName { get; set; } = "Pierce X Hail Mery";
}

public class EmailService : IEmailService
{
    private readonly SmtpOptions _opt;
    private readonly ILogger<EmailService> _log;
    public EmailService(IOptions<SmtpOptions> opt, ILogger<EmailService> log) { _opt = opt.Value; _log = log; }

    public Task SendVerificationEmailAsync(string toEmail, string toName, string code, CancellationToken ct = default)
    {
        var subject = "Подтверждение электронной почты · Pierce X Hail Mery";
        var html = $@"
<div style='font-family:Inter,Arial,sans-serif;background:#0a0a0b;color:#e6e6e8;padding:40px'>
  <div style='max-width:520px;margin:0 auto;background:linear-gradient(180deg,#111113,#0b0b0d);border:1px solid #1f1f23;border-radius:20px;padding:36px'>
    <h1 style='font-size:22px;margin:0 0 12px;font-weight:600;letter-spacing:-0.02em'>Добро пожаловать, {toName}</h1>
    <p style='color:#9a9aa0;font-size:14px;line-height:1.6;margin:0 0 24px'>Используйте этот код для подтверждения адреса. Код действителен 10 минут.</p>
    <div style='font-size:36px;letter-spacing:12px;font-weight:600;text-align:center;padding:18px;background:#0f0f11;border:1px solid #26262c;border-radius:14px;color:#fff'>{code}</div>
    <p style='color:#6b6b72;font-size:12px;margin-top:24px'>Если это были не вы — просто проигнорируйте это письмо.</p>
  </div>
</div>";
        return SendGenericEmailAsync(toEmail, subject, html, ct);
    }

    public Task SendPasswordResetEmailAsync(string toEmail, string toName, string link, CancellationToken ct = default)
    {
        var subject = "Сброс пароля · Pierce X Hail Mery";
        var html = $@"
<div style='font-family:Inter,Arial,sans-serif;background:#0a0a0b;color:#e6e6e8;padding:40px'>
  <div style='max-width:520px;margin:0 auto;background:#111113;border:1px solid #1f1f23;border-radius:20px;padding:36px'>
    <h1 style='font-size:22px;margin:0 0 12px;font-weight:600'>Здравствуйте, {toName}</h1>
    <p style='color:#9a9aa0;font-size:14px;line-height:1.6'>Мы получили запрос на сброс пароля. Ссылка действует 30 минут:</p>
    <a href='{link}' style='display:inline-block;margin-top:16px;padding:12px 20px;background:#e6e6e8;color:#0a0a0b;border-radius:10px;text-decoration:none;font-weight:500'>Сбросить пароль</a>
  </div>
</div>";
        return SendGenericEmailAsync(toEmail, subject, html, ct);
    }

    public async Task SendGenericEmailAsync(string toEmail, string subject, string htmlBody, CancellationToken ct = default)
    {
        try
        {
            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(_opt.FromName, _opt.FromEmail));
            message.To.Add(MailboxAddress.Parse(toEmail));
            message.Subject = subject;
            message.Body = new BodyBuilder { HtmlBody = htmlBody }.ToMessageBody();

            using var smtp = new SmtpClient();
            var secure = _opt.UseSsl ? SecureSocketOptions.StartTls : SecureSocketOptions.None;
            await smtp.ConnectAsync(_opt.Host, _opt.Port, secure, ct);
            if (!string.IsNullOrEmpty(_opt.Username))
                await smtp.AuthenticateAsync(_opt.Username, _opt.Password, ct);
            await smtp.SendAsync(message, ct);
            await smtp.DisconnectAsync(true, ct);
            _log.LogInformation("Sent email to {Email}: {Subject}", toEmail, subject);
        }
        catch (Exception ex)
        {
            _log.LogWarning(ex, "Email delivery failed to {Email}. In dev mode, verification codes are also logged.", toEmail);
        }
    }
}
