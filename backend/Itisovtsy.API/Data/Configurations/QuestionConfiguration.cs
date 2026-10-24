using Itisovtsy.API.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Itisovtsy.API.Data.Configurations;

public class QuestionConfiguration : IEntityTypeConfiguration<Question>
{
    public void Configure(EntityTypeBuilder<Question> builder)
    {
        builder.ToTable("Questions", table =>
            table.HasCheckConstraint("CK_Questions_Course", "\"Course\" BETWEEN 1 AND 4"));
        builder.HasKey(question => question.Id);
        builder.Property(question => question.Title).HasMaxLength(140).IsRequired();
        builder.Property(question => question.Body).HasMaxLength(5000).IsRequired();
        builder.Property(question => question.Subject).HasMaxLength(80).IsRequired();
        builder.Property(question => question.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
        builder.HasIndex(question => new { question.CreatedAt, question.Id });
        builder.HasOne(question => question.Author)
            .WithMany()
            .HasForeignKey(question => question.AuthorId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
