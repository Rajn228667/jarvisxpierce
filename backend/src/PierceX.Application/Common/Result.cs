namespace PierceX.Application.Common;

public class Result
{
    public bool Succeeded { get; init; }
    public string? Error { get; init; }
    public int StatusCode { get; init; } = 200;

    public static Result Success() => new() { Succeeded = true };
    public static Result Fail(string error, int status = 400) => new() { Succeeded = false, Error = error, StatusCode = status };
}

public class Result<T> : Result
{
    public T? Value { get; init; }

    public static Result<T> Ok(T value) => new() { Succeeded = true, Value = value };
    public static new Result<T> Fail(string error, int status = 400) => new() { Succeeded = false, Error = error, StatusCode = status };
}

public class PagedResult<T>
{
    public IReadOnlyList<T> Items { get; init; } = Array.Empty<T>();
    public int Total { get; init; }
    public int Page { get; init; }
    public int PageSize { get; init; }
    public int TotalPages => PageSize > 0 ? (int)Math.Ceiling((double)Total / PageSize) : 0;
}
