using Itisovtsy.API.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Itisovtsy.API.Data.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.ToTable("Users", table =>
        {
            table.HasCheckConstraint("CK_Users_Level", "\"Level\" >= 1");
            table.HasCheckConstraint("CK_Users_ExperiencePoints", "\"ExperiencePoints\" >= 0");
        });

        builder.HasKey(user => user.Id);
        builder.Property(user => user.Name).HasMaxLength(80).IsRequired();
        builder.Property(user => user.Email).HasMaxLength(254).IsRequired();
        builder.Property(user => user.PasswordHash).HasMaxLength(512).IsRequired();
        builder.Property(user => user.Group).HasMaxLength(30);
        builder.Property(user => user.Bio).HasMaxLength(400);
        builder.Property(user => user.Interests).HasMaxLength(160);
        builder.Property(user => user.Level).HasDefaultValue(1);
        builder.Property(user => user.ExperiencePoints).HasDefaultValue(0);
        builder.Property(user => user.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");

        builder.HasIndex(user => user.Email).IsUnique();
    }
}
