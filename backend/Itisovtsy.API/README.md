# Itisovtsy.API

ASP.NET Core 9 API с Entity Framework Core 9 и PostgreSQL.

Команды ниже выполняются из `backend/Itisovtsy.API/`. Версия `dotnet-ef` закреплена в локальном манифесте `.config/dotnet-tools.json` в корне репозитория.

## Docker

Из корня репозитория выполни:

```sh
docker compose -f DockerCompose.yaml up --build --detach --wait
```

PostgreSQL, API и фронтенд запускаются вместе. Строка подключения передаётся через Compose, а `Database__MigrateOnStartup=true` включает применение миграций при старте API. Для локального запуска этот параметр по умолчанию выключен.

API: `http://localhost:5209`, проверка API и подключения к PostgreSQL: `http://localhost:5209/health`.

## Подготовка

```sh
dotnet tool restore
dotnet restore
```

Строка подключения находится в `appsettings.json`, в `ConnectionStrings:DefaultConnection`. Для своего сервера и пароля переопредели её переменной окружения:

```sh
export ConnectionStrings__DefaultConnection='Host=localhost;Port=5432;Database=itisovtsy;Username=postgres;Password=your_password'
```

## База данных и запуск

Применить начальную миграцию и запустить API:

```sh
dotnet ef database update
dotnet run --launch-profile http
```

API доступен по адресу `http://localhost:5209`.

## Регистрация пользователя

- Прямой запрос к API: `POST http://localhost:5209/auth/register`.
- Через Nginx: `POST http://localhost:8080/api/auth/register`.
- `Content-Type: application/json`.

Тело запроса (`Contracts/Auth/RegisterRequest.cs`):

```json
{
  "name": "Алексей Смирнов",
  "email": "student@example.com",
  "password": "ExamplePass123!",
  "confirmation": "ExamplePass123!"
}
```

Ограничения:

- Имя: 2–80 символов; пробелы по краям удаляются.
- Email: до 254 символов, корректный формат; пробелы по краям удаляются, адрес сохраняется в нижнем регистре. Существующий адрес проверяется без учёта регистра.
- Пароль: 8–128 символов; сохраняется хеш, созданный `PasswordHasher<User>` из ASP.NET Core Identity.
- `confirmation`: обязательно и должно совпадать с паролем.

Ответ `201 Created` (`Contracts/Auth/RegisterResponse.cs`):

```json
{
  "id": "f96e8cb1-032d-4e9b-a2f9-feb1b67b7639",
  "name": "Алексей Смирнов",
  "email": "student@example.com",
  "level": 1,
  "experiencePoints": 0,
  "createdAt": "2026-10-24T12:00:00Z"
}
```

Ошибки возвращаются в формате Problem Details:

| Статус | Причина |
| --- | --- |
| `400 Bad Request` | Ошибки валидации или некорректный JSON; ошибки полей находятся в `errors` |
| `409 Conflict` | Email уже зарегистрирован, в том числе при одновременных запросах |
| `415 Unsupported Media Type` | Тело запроса передано не в формате JSON |

OpenAPI доступен по адресу `http://localhost:5209/openapi/v1.json` в окружении `Development`. Примеры запросов находятся в `Itisovtsy.API.http`.

## Модели

- `Models/User.cs` — имя, email, хеш пароля, группа, описание, интересы, уровень, XP и дата регистрации. Email имеет уникальный индекс.
- `Models/LibraryMaterial.cs` — название, предмет, курс, семестр, тип материала, описание, путь к PDF, имя файла, размер в байтах, дата добавления и загрузивший пользователь.
- `Models/LibraryMaterialKind.cs` — типы материалов: `Textbook` (учебник), `Notes` (конспект), `Workbook` (практикум), `StudyGuide` (методичка). В базе сохраняются строками.
- `Data/ApplicationDbContext.cs` — таблицы `Users` и `LibraryMaterials`. Ограничения и связь один-ко-многим настроены в `Data/Configurations/`.

Для дат используется UTC. Материал обязательно связан с пользователем; удаление пользователя с материалами ограничено внешним ключом.

## Миграции

```sh
dotnet ef migrations add MigrationName
dotnet ef migrations has-pending-model-changes
dotnet ef migrations script
```

## Вход и сессия

Swagger UI: http://localhost:5209/swagger (Development).

- `POST /auth/login`: JSON `{ "email": "student@example.com", "password": "your-password" }`.
- `GET /auth/me`: текущий пользователь, либо `401`, если сессии нет.
- `POST /auth/logout`: JSON `{}`, удаляет cookie, возвращает `204`.

Все POST-запросы `/auth/*` требуют `Content-Type: application/json`. В Swagger
для выхода передай `{}`. Вход возвращает профиль и устанавливает HttpOnly-cookie
на 7 дней с продлением при активности; пароль и cookie не хранятся в localStorage.
В Production cookie передаётся только по HTTPS. Docker сохраняет ключи защиты
cookie в томе `api-keys`. Не включайте CORS с credentials для недоверенных сайтов.
После 10 попыток входа за минуту с одного IP сервер возвращает `429`. За Nginx
лимит применяется к адресу прокси; для индивидуальных лимитов в production
нужно настроить доверенные прокси и обработку forwarded headers.

Фронтенд использует `/api/auth/*`: Nginx и dev-сервер Vite направляют их в API.
Регистрация создаёт аккаунт; затем пользователь входит с почтой и паролем.
