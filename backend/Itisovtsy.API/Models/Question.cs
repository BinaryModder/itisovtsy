namespace Itisovtsy.API.Models;

public class Question
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public required string Title { get; set; }
    public required string Body { get; set; }
    public required string Subject { get; set; }
    public int Course { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public Guid AuthorId { get; set; }
    public User Author { get; set; } = null!;
}
