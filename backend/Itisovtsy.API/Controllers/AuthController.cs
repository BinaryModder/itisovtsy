using System.Text.RegularExpressions;
using Itisovtsy.API.Contracts.Auth;
using Itisovtsy.API.Data;
using Itisovtsy.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace Itisovtsy.API.Controllers;

[ApiController]
[Route("auth")]
public class AuthController : ControllerBase
{
    private readonly ApplicationDbContext _dbContext;
    private readonly IPasswordHasher<User> _passwordHasher;

    public AuthController(ApplicationDbContext dbContext, IPasswordHasher<User> passwordHasher)
    {
        _dbContext = dbContext;
        _passwordHasher = passwordHasher;
    }

    [AllowAnonymous]
    [HttpPost("register", Name = "RegisterUser")]
    [Consumes("application/json")]
    [EndpointSummary("Регистрация пользователя")]
    [EndpointDescription("Создаёт пользователя с уровнем 1 и 0 XP. Имя и email очищаются от пробелов по краям, email сохраняется в нижнем регистре.")]
    [ProducesResponseType(typeof(RegisterResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status415UnsupportedMediaType)]
    public async Task<ActionResult<RegisterResponse>> Register(
        [FromBody] RegisterRequest request,
        CancellationToken cancellationToken)
    {
        var name = request.Name.Trim();
        var email = request.Email.Trim().ToLowerInvariant();

        if (name.Length < 2)
        {
            ModelState.AddModelError(nameof(RegisterRequest.Name), "Имя должно содержать минимум 2 символа без пробелов по краям.");
        }

        if (!Regex.IsMatch(email, @"^[^\s@]+@[^\s@]+\.[^\s@]+$"))
        {
            ModelState.AddModelError(nameof(RegisterRequest.Email), "Укажи корректный адрес электронной почты.");
        }

        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        if (await _dbContext.Users.AnyAsync(user => user.Email.ToLower() == email, cancellationToken))
        {
            return EmailAlreadyRegistered();
        }

        var user = new User
        {
            Name = name,
            Email = email,
            PasswordHash = string.Empty
        };
        user.PasswordHash = _passwordHasher.HashPassword(user, request.Password);

        _dbContext.Users.Add(user);

        try
        {
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateException exception) when (exception.InnerException is PostgresException
            { SqlState: PostgresErrorCodes.UniqueViolation, ConstraintName: "IX_Users_Email" })
        {
            return EmailAlreadyRegistered();
        }

        return StatusCode(StatusCodes.Status201Created, new RegisterResponse(
            user.Id,
            user.Name,
            user.Email,
            user.Level,
            user.ExperiencePoints,
            user.CreatedAt));
    }

    private ObjectResult EmailAlreadyRegistered()
    {
        return Problem(
            statusCode: StatusCodes.Status409Conflict,
            title: "Пользователь с таким email уже зарегистрирован.",
            detail: "Используй другой адрес электронной почты.");
    }
}
