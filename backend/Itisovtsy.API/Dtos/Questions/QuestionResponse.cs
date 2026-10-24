namespace Itisovtsy.API.Dtos.Questions;

public sealed record QuestionResponse(
    Guid Id,
    string Title,
    string Body,
    string Subject,
    int Course,
    Guid AuthorId,
    string Author,
    DateTime CreatedAt);
