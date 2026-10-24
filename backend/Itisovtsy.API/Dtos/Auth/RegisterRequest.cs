using System.ComponentModel.DataAnnotations;

namespace Itisovtsy.API.Dtos.Auth;

public sealed class RegisterRequest
{
    [Required(ErrorMessage = "Укажи имя.")]
    [StringLength(80, MinimumLength = 2, ErrorMessage = "Имя должно содержать от 2 до 80 символов.")]
    public string Name { get; set; } = string.Empty;

    [Required(ErrorMessage = "Укажи электронную почту.")]
    [EmailAddress(ErrorMessage = "Укажи корректный адрес электронной почты.")]
    [StringLength(254, ErrorMessage = "Адрес электронной почты должен содержать не более 254 символов.")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Укажи пароль.")]
    [StringLength(128, MinimumLength = 8, ErrorMessage = "Пароль должен содержать от 8 до 128 символов.")]
    public string Password { get; set; } = string.Empty;

    [Required(ErrorMessage = "Повтори пароль.")]
    [StringLength(128, ErrorMessage = "Подтверждение пароля должно содержать не более 128 символов.")]
    [Compare(nameof(Password), ErrorMessage = "Пароли не совпадают.")]
    public string Confirmation { get; set; } = string.Empty;
}
