using Microsoft.EntityFrameworkCore;
using PierceX.Application.Abstractions;
using PierceX.Application.Common;
using PierceX.Domain.Entities;

namespace PierceX.Application.Services;

public record AIChatListItem(Guid Id, string Title, string Model, string? ContextTag, DateTime UpdatedAt, int MessageCount);
public record AIMessageDto(Guid Id, string Role, string Content, DateTime CreatedAt);
public record AIChatDetail(AIChatListItem Summary, List<AIMessageDto> Messages);
public record SendMessageDto(string Content, string? ContextTag);

public interface IAIChatService
{
    Task<List<AIChatListItem>> ListAsync(Guid userId, CancellationToken ct);
    Task<Result<AIChatDetail>> GetAsync(Guid userId, Guid chatId, CancellationToken ct);
    Task<Result<AIChatDetail>> CreateAsync(Guid userId, string? title, string? context, CancellationToken ct);
    Task<Result<AIMessageDto>> SendAsync(Guid userId, Guid chatId, SendMessageDto dto, CancellationToken ct);
    Task<Result> DeleteAsync(Guid userId, Guid chatId, CancellationToken ct);
}

public class AIChatService : IAIChatService
{
    private readonly IAppDb _db;
    private readonly IGroqService _groq;
    public AIChatService(IAppDb db, IGroqService groq) { _db = db; _groq = groq; }

    private const string SystemPromptRu = @"Ты — AI-ассистент платформы Pierce X Hail Mery для Казахстана.
Отвечай кратко, по делу, на русском языке (если пользователь пишет по-английски — по-английски, на казахском — по-казахски).
Темы: образование, студенческая CRM, аналитика, финансы, безопасность, обнаружение мошенничества, HR, карьера.
Отвечай структурированно, используя маркированные списки там, где это уместно. Не выдумывай данные.";

    public async Task<List<AIChatListItem>> ListAsync(Guid userId, CancellationToken ct) =>
        await _db.AIChats.Where(c => c.UserId == userId)
            .OrderByDescending(c => c.UpdatedAt)
            .Select(c => new AIChatListItem(c.Id, c.Title, c.Model, c.ContextTag, c.UpdatedAt, c.Messages.Count))
            .ToListAsync(ct);

    public async Task<Result<AIChatDetail>> GetAsync(Guid userId, Guid chatId, CancellationToken ct)
    {
        var chat = await _db.AIChats.Include(c => c.Messages)
            .FirstOrDefaultAsync(c => c.Id == chatId && c.UserId == userId, ct);
        if (chat == null) return Result<AIChatDetail>.Fail("Чат не найден", 404);
        var summary = new AIChatListItem(chat.Id, chat.Title, chat.Model, chat.ContextTag, chat.UpdatedAt, chat.Messages.Count);
        var msgs = chat.Messages.OrderBy(m => m.CreatedAt)
            .Select(m => new AIMessageDto(m.Id, m.Role, m.Content, m.CreatedAt)).ToList();
        return Result<AIChatDetail>.Ok(new AIChatDetail(summary, msgs));
    }

    public async Task<Result<AIChatDetail>> CreateAsync(Guid userId, string? title, string? context, CancellationToken ct)
    {
        var chat = new AIChat { UserId = userId, Title = title ?? "Новый чат", ContextTag = context };
        _db.AIChats.Add(chat);
        await _db.SaveChangesAsync(ct);
        var summary = new AIChatListItem(chat.Id, chat.Title, chat.Model, chat.ContextTag, chat.UpdatedAt, 0);
        return Result<AIChatDetail>.Ok(new AIChatDetail(summary, new List<AIMessageDto>()));
    }

    public async Task<Result<AIMessageDto>> SendAsync(Guid userId, Guid chatId, SendMessageDto dto, CancellationToken ct)
    {
        var chat = await _db.AIChats.Include(c => c.Messages).FirstOrDefaultAsync(c => c.Id == chatId && c.UserId == userId, ct);
        if (chat == null) return Result<AIMessageDto>.Fail("Чат не найден", 404);
        if (string.IsNullOrWhiteSpace(dto.Content)) return Result<AIMessageDto>.Fail("Пустой запрос");

        var userMsg = new AIChatMessage { ChatId = chat.Id, Role = "user", Content = dto.Content.Trim() };
        _db.AIChatMessages.Add(userMsg);

        if (chat.Messages.Count == 0) chat.Title = Truncate(dto.Content, 50);

        var history = chat.Messages
            .OrderBy(m => m.CreatedAt)
            .TakeLast(10)
            .Select(m => new GroqMessage(m.Role == "assistant" ? "assistant" : "user", m.Content))
            .ToList();
        history.Add(new GroqMessage("user", dto.Content));

        string reply;
        try { reply = await _groq.ChatAsync(SystemPromptRu, history, ct); }
        catch (Exception ex) { reply = "Ошибка ИИ: " + ex.Message; }

        var aiMsg = new AIChatMessage { ChatId = chat.Id, Role = "assistant", Content = reply, Model = "groq" };
        _db.AIChatMessages.Add(aiMsg);
        chat.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);

        return Result<AIMessageDto>.Ok(new AIMessageDto(aiMsg.Id, aiMsg.Role, aiMsg.Content, aiMsg.CreatedAt));
    }

    public async Task<Result> DeleteAsync(Guid userId, Guid chatId, CancellationToken ct)
    {
        var chat = await _db.AIChats.FirstOrDefaultAsync(c => c.Id == chatId && c.UserId == userId, ct);
        if (chat == null) return Result.Fail("Чат не найден", 404);
        _db.AIChats.Remove(chat);
        await _db.SaveChangesAsync(ct);
        return Result.Success();
    }

    private static string Truncate(string s, int n) => s.Length <= n ? s : s.Substring(0, n).TrimEnd() + "…";
}
