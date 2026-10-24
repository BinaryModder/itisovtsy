namespace Itisovtsy.API.Dtos.Auth;

public sealed record RegisterResponse(
    Guid Id,
    string Name,
    string Email,
    int Level,
    int ExperiencePoints,
    DateTime CreatedAt);
