using System.ComponentModel.DataAnnotations;

namespace Itisovtsy.API.Dtos.Questions;

public sealed class CreateQuestionRequest
{
    [Required(ErrorMessage = "Укажи заголовок.")]
    [StringLength(140, MinimumLength = 10, ErrorMessage = "Заголовок должен содержать от 10 до 140 символов.")]
    public string Title { get; set; } = string.Empty;

    [Required(ErrorMessage = "Опиши вопрос.")]
    [StringLength(5000, MinimumLength = 20, ErrorMessage = "Описание должно содержать от 20 до 5000 символов.")]
    public string Body { get; set; } = string.Empty;

    [Required(ErrorMessage = "Укажи предмет.")]
    [StringLength(80, ErrorMessage = "Название предмета должно содержать не более 80 символов.")]
    public string Subject { get; set; } = string.Empty;

    [Range(1, 4, ErrorMessage = "Курс должен быть от 1 до 4.")]
    public int Course { get; set; }
}
