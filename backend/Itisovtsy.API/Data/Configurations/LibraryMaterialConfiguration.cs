using Itisovtsy.API.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Itisovtsy.API.Data.Configurations;

public class LibraryMaterialConfiguration : IEntityTypeConfiguration<LibraryMaterial>
{
    public void Configure(EntityTypeBuilder<LibraryMaterial> builder)
    {
        builder.ToTable("LibraryMaterials", table =>
        {
            table.HasCheckConstraint("CK_LibraryMaterials_Course", "\"Course\" BETWEEN 1 AND 4");
            table.HasCheckConstraint("CK_LibraryMaterials_Semester", "\"Semester\" BETWEEN 1 AND 2");
            table.HasCheckConstraint("CK_LibraryMaterials_FileSizeBytes", "\"FileSizeBytes\" > 0");
        });

        builder.HasKey(material => material.Id);
        builder.Property(material => material.Title).HasMaxLength(140).IsRequired();
        builder.Property(material => material.Subject).HasMaxLength(80).IsRequired();
        builder.Property(material => material.Kind).HasConversion<string>().HasMaxLength(32).IsRequired();
        builder.Property(material => material.Description).HasMaxLength(2000);
        builder.Property(material => material.FilePath).HasMaxLength(1024).IsRequired();
        builder.Property(material => material.FileName).HasMaxLength(255).IsRequired();
        builder.Property(material => material.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");

        builder.HasIndex(material => new { material.Course, material.Semester, material.Subject });
        builder.HasOne(material => material.UploadedBy)
            .WithMany(user => user.LibraryMaterials)
            .HasForeignKey(material => material.UploadedById)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
