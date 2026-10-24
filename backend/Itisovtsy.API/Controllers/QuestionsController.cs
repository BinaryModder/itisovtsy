using System.ComponentModel.DataAnnotations;
using System.Linq.Expressions;
using System.Security.Claims;
using Itisovtsy.API.Dtos.Questions;
using Itisovtsy.API.Data;
using Itisovtsy.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Itisovtsy.API.Controllers;

[ApiController]
[Route("questions")]
public class QuestionsController : ControllerBase
{
    private readonly ApplicationDbContext _dbContext;

    public QuestionsController(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    private static readonly Expression<Func<Question, QuestionResponse>> ToResponse = question =>
        new QuestionResponse(question.Id, question.Title, question.Body, question.Subject,
            question.Course, question.AuthorId, question.Author.Name, question.CreatedAt);

    [Authorize]
    [HttpPost]
    [Consumes("application/json")]
    [EndpointSummary("Добавить вопрос от текущего пользователя")]
    [ProducesResponseType(typeof(QuestionResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status415UnsupportedMediaType)]
    public async Task<ActionResult<QuestionResponse>> Create(
        [FromBody] CreateQuestionRequest request,
        CancellationToken cancellationToken)
    {
        if (!Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var authorId))
            return Unauthorized();

        var title = request.Title.Trim();
        var body = request.Body.Trim();
        var subject = request.Subject.Trim();

        if (title.Length < 10)
            ModelState.AddModelError(nameof(request.Title), "Заголовок должен содержать минимум 10 символов без пробелов по краям.");
        if (body.Length < 20)
            ModelState.AddModelError(nameof(request.Body), "Описание должно содержать минимум 20 символов без пробелов по краям.");
        if (subject.Length == 0)
            ModelState.AddModelError(nameof(request.Subject), "Укажи предмет.");
        if (!ModelState.IsValid)
            return ValidationProblem(ModelState);

        var author = await _dbContext.Users.SingleOrDefaultAsync(user => user.Id == authorId, cancellationToken);
        if (author is null)
            return Unauthorized();

        var question = new Question
        {
            Title = title,
            Body = body,
            Subject = subject,
            Course = request.Course,
            AuthorId = author.Id,
            Author = author
        };
        _dbContext.Questions.Add(question);
        await _dbContext.SaveChangesAsync(cancellationToken);

        var response = new QuestionResponse(question.Id, question.Title, question.Body,
            question.Subject, question.Course, author.Id, author.Name, question.CreatedAt);
        return CreatedAtAction(nameof(GetById), new { id = question.Id }, response);
    }

    [AllowAnonymous]
    [HttpGet("{id:guid}")]
    [EndpointSummary("Получить вопрос по идентификатору")]
    [ProducesResponseType(typeof(QuestionResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<QuestionResponse>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var question = await _dbContext.Questions.AsNoTracking()
            .Where(question => question.Id == id)
            .Select(ToResponse)
            .SingleOrDefaultAsync(cancellationToken);
        if (question is null)
            return NotFound();
        return Ok(question);
    }

    [AllowAnonymous]
    [HttpGet]
    [EndpointSummary("Список вопросов: сначала новые")]
    [ProducesResponseType(typeof(QuestionResponse[]), StatusCodes.Status200OK)]
    public async Task<ActionResult<QuestionResponse[]>> GetAll(
        CancellationToken cancellationToken,
        [FromQuery, Range(0, int.MaxValue)] int skip = 0,
        [FromQuery, Range(1, 100)] int take = 20)
    {
        return await _dbContext.Questions.AsNoTracking()
            .OrderByDescending(question => question.CreatedAt)
            .ThenByDescending(question => question.Id)
            .Skip(skip).Take(take).Select(ToResponse)
            .ToArrayAsync(cancellationToken);
    }
}
