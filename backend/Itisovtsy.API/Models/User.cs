namespace Itisovtsy.API.Models;

public class User
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public required string Name { get; set; }
    public required string Email { get; set; }
    public required string PasswordHash { get; set; }
    public string? Group { get; set; }
    public string? Bio { get; set; }
    public string? Interests { get; set; }
    public int Level { get; set; } = 1;
    public int ExperiencePoints { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<LibraryMaterial> LibraryMaterials { get; set; } = new List<LibraryMaterial>();
}
