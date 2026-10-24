using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.RateLimiting;
using System.Text.RegularExpressions;
using Itisovtsy.API.Dtos.Auth;
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

    [AllowAnonymous]
    [EnableRateLimiting("login")]
    [HttpPost("login")]
    [Consumes("application/json")]
    [EndpointSummary("Вход в аккаунт")]
    [ProducesResponseType(typeof(RegisterResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status429TooManyRequests)]
    public async Task<ActionResult<RegisterResponse>> Login(LoginRequest request, CancellationToken cancellationToken)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var user = await _dbContext.Users.SingleOrDefaultAsync(u => u.Email.ToLower() == email, cancellationToken);
        // Verify a real hash even for an unknown email to reduce timing differences.
        var candidate = user ?? DummyUser;
        var result = _passwordHasher.VerifyHashedPassword(candidate, candidate.PasswordHash, request.Password);
        if (user is null || result == PasswordVerificationResult.Failed)
            return Problem(statusCode: 401, title: "Неверная почта или пароль.");

        if (result == PasswordVerificationResult.SuccessRehashNeeded)
        {
            user.PasswordHash = _passwordHasher.HashPassword(user, request.Password);
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
        var identity = new ClaimsIdentity(new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.Name)
        }, CookieAuthenticationDefaults.AuthenticationScheme);
        await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme,
            new ClaimsPrincipal(identity), new AuthenticationProperties { IsPersistent = true });
        return ToResponse(user);
    }

    [Authorize]
    [HttpGet("me")]
    [EndpointSummary("Текущий пользователь")]
    public async Task<ActionResult<RegisterResponse>> Me(CancellationToken cancellationToken)
    {
        if (!Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var id))
            return Unauthorized();
        var user = await _dbContext.Users.AsNoTracking().SingleOrDefaultAsync(u => u.Id == id, cancellationToken);
        if (user is null)
        {
            await HttpContext.SignOutAsync();
            return Unauthorized();
        }
        return ToResponse(user);
    }

    [HttpPost("logout")]
    [Consumes("application/json")]
    [EndpointSummary("Выход из аккаунта")]
    public async Task<IActionResult> Logout([FromBody] System.Text.Json.JsonElement request)
    {
        await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
        return NoContent();
    }

    private static RegisterResponse ToResponse(User user) =>
        new(user.Id, user.Name, user.Email, user.Level, user.ExperiencePoints, user.CreatedAt);

    private static readonly Itisovtsy.API.Models.User DummyUser = CreateDummyUser();
    private static Itisovtsy.API.Models.User CreateDummyUser()
    {
        var user = new Itisovtsy.API.Models.User { Name = "", Email = "", PasswordHash = "" };
        user.PasswordHash = new PasswordHasher<Itisovtsy.API.Models.User>().HashPassword(user, Guid.NewGuid().ToString());
        return user;
    }

    private ObjectResult EmailAlreadyRegistered()
    {
        return Problem(
            statusCode: StatusCodes.Status409Conflict,
            title: "Пользователь с таким email уже зарегистрирован.",
            detail: "Используй другой адрес электронной почты.");
    }
}
