using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Itisovtsy.API.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    Email = table.Column<string>(type: "character varying(254)", maxLength: 254, nullable: false),
                    PasswordHash = table.Column<string>(type: "character varying(512)", maxLength: 512, nullable: false),
                    Group = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: true),
                    Bio = table.Column<string>(type: "character varying(400)", maxLength: 400, nullable: true),
                    Interests = table.Column<string>(type: "character varying(160)", maxLength: 160, nullable: true),
                    Level = table.Column<int>(type: "integer", nullable: false, defaultValue: 1),
                    ExperiencePoints = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                    table.CheckConstraint("CK_Users_ExperiencePoints", "\"ExperiencePoints\" >= 0");
                    table.CheckConstraint("CK_Users_Level", "\"Level\" >= 1");
                });

            migrationBuilder.CreateTable(
                name: "LibraryMaterials",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "character varying(140)", maxLength: 140, nullable: false),
                    Subject = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    Course = table.Column<int>(type: "integer", nullable: false),
                    Semester = table.Column<int>(type: "integer", nullable: false),
                    Kind = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    Description = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    FilePath = table.Column<string>(type: "character varying(1024)", maxLength: 1024, nullable: false),
                    FileName = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    FileSizeBytes = table.Column<long>(type: "bigint", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    UploadedById = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LibraryMaterials", x => x.Id);
                    table.CheckConstraint("CK_LibraryMaterials_Course", "\"Course\" BETWEEN 1 AND 4");
                    table.CheckConstraint("CK_LibraryMaterials_FileSizeBytes", "\"FileSizeBytes\" > 0");
                    table.CheckConstraint("CK_LibraryMaterials_Semester", "\"Semester\" BETWEEN 1 AND 2");
                    table.ForeignKey(
                        name: "FK_LibraryMaterials_Users_UploadedById",
                        column: x => x.UploadedById,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_LibraryMaterials_Course_Semester_Subject",
                table: "LibraryMaterials",
                columns: new[] { "Course", "Semester", "Subject" });

            migrationBuilder.CreateIndex(
                name: "IX_LibraryMaterials_UploadedById",
                table: "LibraryMaterials",
                column: "UploadedById");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "LibraryMaterials");

            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}
