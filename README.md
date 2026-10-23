# itisovtsy

Сообщество студентов ИТИС/КФУ: Vue 3 + TypeScript, ASP.NET Core 9 и PostgreSQL.

## Запуск в Docker

Из корня репозитория:

```sh
docker compose -f DockerCompose.yaml up --build --detach --wait
```

Compose запускает три сервиса:

| Сервис | Адрес |
| --- | --- |
| Фронтенд (Nginx) | http://localhost:8080 |
| API | http://localhost:5209 |
| PostgreSQL | localhost:5432 |

API ожидает готовности PostgreSQL, применяет EF Core миграции и открывает `/health`, проверяющий подключение к базе. Фронтенд запускается после готовности API. Nginx перенаправляет `/api/` в API, убирая этот префикс: например, `http://localhost:8080/api/health`.

По умолчанию создаётся база `itisovtsy` с пользователем `itisovtsy` и локальным паролем `itisovtsy_dev`. Параметры и порты можно переопределить через `.env` в корне; пример — `.env.example`.

### Проверка и управление

```sh
docker compose -f DockerCompose.yaml ps
docker compose -f DockerCompose.yaml logs --follow api
curl http://localhost:5209/health
curl http://localhost:8080/api/health
docker compose -f DockerCompose.yaml exec postgres psql -U itisovtsy -d itisovtsy -c '\dt'
```

Остановить контейнеры:

```sh
docker compose -f DockerCompose.yaml down
```

Данные PostgreSQL сохраняются в именованном томе `postgres-data` при остановке и повторном запуске контейнеров.

## Регистрация пользователя

`POST http://localhost:5209/auth/register` или через Nginx `POST http://localhost:8080/api/auth/register`:

```sh
curl http://localhost:8080/api/auth/register \
  --header 'Content-Type: application/json' \
  --data '{"name":"Алексей Смирнов","email":"student@example.com","password":"ExamplePass123!","confirmation":"ExamplePass123!"}'
```

Успешный запрос возвращает `201 Created` и данные созданного пользователя. Ошибки данных — `400 Bad Request`, повторный email — `409 Conflict`. Контракт и ограничения описаны в [документации бэкенда](backend/Itisovtsy.API/README.md#регистрация-пользователя).

OpenAPI: `http://localhost:5209/openapi/v1.json` в окружении `Development`.

## Локальная разработка

- Фронтенд: `bun install`, затем `bun dev` в `frontend/itisovtsy/`.
- Бэкенд и миграции: [backend/Itisovtsy.API/README.md](backend/Itisovtsy.API/README.md).
