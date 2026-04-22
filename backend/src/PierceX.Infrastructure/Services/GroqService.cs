using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using PierceX.Application.Abstractions;

namespace PierceX.Infrastructure.Services;

public class GroqOptions
{
    public string? ApiKey { get; set; }
    public string Model { get; set; } = "llama-3.3-70b-versatile";
    public string BaseUrl { get; set; } = "https://api.groq.com/openai/v1";
    public int TimeoutSeconds { get; set; } = 30;
}

public class GroqService : IGroqService
{
    private readonly GroqOptions _opt;
    private readonly HttpClient _http;
    private readonly ILogger<GroqService> _log;

    public GroqService(IOptions<GroqOptions> opt, HttpClient http, ILogger<GroqService> log)
    {
        _opt = opt.Value;
        _http = http;
        _log = log;
        _http.Timeout = TimeSpan.FromSeconds(_opt.TimeoutSeconds);
    }

    public bool IsConfigured => !string.IsNullOrWhiteSpace(_opt.ApiKey);

    public async Task<string> ChatAsync(string systemPrompt, IEnumerable<GroqMessage> messages, CancellationToken ct = default)
    {
        if (!IsConfigured)
            return MockReply(messages);

        var payload = new
        {
            model = _opt.Model,
            temperature = 0.3,
            messages = new List<object> { new { role = "system", content = systemPrompt } }
                .Concat(messages.Select(m => (object)new { role = m.Role, content = m.Content }))
                .ToArray()
        };

        using var req = new HttpRequestMessage(HttpMethod.Post, $"{_opt.BaseUrl}/chat/completions");
        req.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", _opt.ApiKey);
        req.Content = JsonContent.Create(payload);

        try
        {
            using var res = await _http.SendAsync(req, ct);
            if (!res.IsSuccessStatusCode)
            {
                var err = await res.Content.ReadAsStringAsync(ct);
                _log.LogWarning("Groq error {Status}: {Err}", res.StatusCode, err);
                return MockReply(messages);
            }
            var doc = await res.Content.ReadFromJsonAsync<GroqChatResponse>(cancellationToken: ct);
            return doc?.Choices?.FirstOrDefault()?.Message?.Content?.Trim() ?? MockReply(messages);
        }
        catch (Exception ex)
        {
            _log.LogWarning(ex, "Groq call failed, falling back to mock.");
            return MockReply(messages);
        }
    }

    public async Task<GroqDomainAnalysis> AnalyzeDomainAsync(string url, CancellationToken ct = default)
    {
        var host = url;
        try { host = new Uri(url.Contains("://") ? url : "http://" + url).Host; } catch { }

        if (!IsConfigured)
            return HeuristicAnalysis(host);

        var system = @"Ты — аналитик кибербезопасности Казахстана. По переданному домену оцени риск, определи категорию и верни СТРОГО валидный JSON без префикса/послесловия:
{ ""category"": ""Casino|Scam|Phishing|Pyramid|GamblingAd|TelegramSeller|CleanVerified|Unknown"", ""risk_score"": 0-100, ""risk_level"": ""None|Low|Medium|High|Critical"", ""reasons"": [""...""], ""summary"": ""...""}
Категории: Casino — казино и беттинг, Scam — мошенничество, Phishing — фишинг, Pyramid — пирамиды и HYIP, GamblingAd — реклама азартных игр, TelegramSeller — торговля в Telegram криптой/аккаунтами, CleanVerified — чистый сайт. Ответ на русском.";
        var userMsg = $"Оцени домен: {host}";
        var raw = await ChatAsync(system, new[] { new GroqMessage("user", userMsg) }, ct);

        try
        {
            var json = ExtractJson(raw);
            var parsed = JsonSerializer.Deserialize<DomainAnalysisRaw>(json, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            if (parsed != null)
            {
                return new GroqDomainAnalysis(
                    Category: string.IsNullOrWhiteSpace(parsed.Category) ? "Unknown" : parsed.Category!,
                    RiskScore: Math.Clamp(parsed.Risk_Score, 0, 100),
                    RiskLevel: string.IsNullOrWhiteSpace(parsed.Risk_Level) ? DeriveLevel(parsed.Risk_Score) : parsed.Risk_Level!,
                    Reasons: parsed.Reasons ?? Array.Empty<string>(),
                    Summary: parsed.Summary ?? raw
                );
            }
        }
        catch (Exception ex) { _log.LogWarning(ex, "Failed to parse Groq domain analysis: {Raw}", raw); }

        return HeuristicAnalysis(host);
    }

    private static string DeriveLevel(double score) => score switch
    {
        < 10 => "None",
        < 30 => "Low",
        < 60 => "Medium",
        < 85 => "High",
        _ => "Critical"
    };

    private static string ExtractJson(string s)
    {
        var start = s.IndexOf('{');
        var end = s.LastIndexOf('}');
        return (start >= 0 && end > start) ? s.Substring(start, end - start + 1) : s;
    }

    private static GroqDomainAnalysis HeuristicAnalysis(string host)
    {
        host = (host ?? string.Empty).ToLowerInvariant();
        var reasons = new List<string>();
        var score = 5.0;
        var category = "Unknown";

        var casinoKeywords = new[] { "casino", "bet", "slot", "vulkan", "poker", "kazino", "1xbet", "1win", "melbet", "pinup", "pin-up" };
        var scamKeywords = new[] { "invest", "hyip", "money", "earn", "forex", "crypto-doubler", "millionair" };
        var phishKeywords = new[] { "verify", "secure-login", "wallet-restore", "egov-kz", "login-bank", "kaspi-update", "halyk-secure" };
        var tgKeywords = new[] { "t.me/", "telegra.ph", "cash4tg", "tgshop" };

        if (casinoKeywords.Any(k => host.Contains(k))) { score += 65; category = "Casino"; reasons.Add("Домен содержит маркеры азартных игр"); }
        if (scamKeywords.Any(k => host.Contains(k))) { score += 45; category = category == "Unknown" ? "Pyramid" : category; reasons.Add("Паттерны HYIP/инвестиционного мошенничества"); }
        if (phishKeywords.Any(k => host.Contains(k))) { score += 75; category = "Phishing"; reasons.Add("Признаки имитации легитимных госуслуг/банка"); }
        if (tgKeywords.Any(k => host.Contains(k))) { score = Math.Max(score, 40); category = category == "Unknown" ? "TelegramSeller" : category; reasons.Add("Telegram-ресурс продаж"); }
        if (host.Contains("-") && host.Count(c => c == '-') >= 3) { score += 10; reasons.Add("Множество дефисов — характерно для одноразовых scam-доменов"); }
        if (host.EndsWith(".xyz") || host.EndsWith(".top") || host.EndsWith(".click")) { score += 15; reasons.Add("TLD часто используется для одноразовых сайтов"); }

        if (reasons.Count == 0)
        {
            reasons.Add("Явные индикаторы риска не обнаружены в эвристическом анализе");
            category = "Unknown";
        }

        score = Math.Clamp(score, 0, 100);
        return new GroqDomainAnalysis(category, score, DeriveLevel(score), reasons.ToArray(),
            $"Эвристический анализ домена {host}. Для полной точности включите интеграцию Groq (GROQ_API_KEY).");
    }

    private static string MockReply(IEnumerable<GroqMessage> messages)
    {
        var last = messages.LastOrDefault()?.Content ?? "";
        return $"AI-ответ (режим без API-ключа). Запрос: \"{Truncate(last, 140)}\". Пожалуйста, настройте GROQ_API_KEY для полноценной работы ИИ-агента.";
    }

    private static string Truncate(string s, int n) => s.Length <= n ? s : s.Substring(0, n) + "…";

    private record DomainAnalysisRaw
    {
        public string? Category { get; init; }
        public double Risk_Score { get; init; }
        public string? Risk_Level { get; init; }
        public string[]? Reasons { get; init; }
        public string? Summary { get; init; }
    }

    private class GroqChatResponse
    {
        [JsonPropertyName("choices")]
        public List<GroqChoice>? Choices { get; set; }
    }

    private class GroqChoice
    {
        [JsonPropertyName("message")]
        public GroqMessageDto? Message { get; set; }
    }

    private class GroqMessageDto
    {
        [JsonPropertyName("role")]
        public string? Role { get; set; }
        [JsonPropertyName("content")]
        public string? Content { get; set; }
    }
}
