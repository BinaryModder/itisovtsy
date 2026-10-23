namespace Itisovtsy.API.Models;

public class LibraryMaterial
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public required string Title { get; set; }
    public required string Subject { get; set; }
    public int Course { get; set; } = 1;
    public int Semester { get; set; } = 1;
    public LibraryMaterialKind Kind { get; set; } = LibraryMaterialKind.Textbook;
    public string? Description { get; set; }
    public required string FilePath { get; set; }
    public required string FileName { get; set; }
    public long FileSizeBytes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Guid UploadedById { get; set; }
    public User UploadedBy { get; set; } = null!;
}
