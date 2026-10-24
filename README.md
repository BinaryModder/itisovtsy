Сообщество студентов ИТИС/КФУ: Vue 3 + TypeScript, ASP.NET Core 9 и PostgreSQL.

## Запуск в Docker

Из корня репозитория:

```sh
docker-compose up -d --build 
```

Compose запускает три сервиса:

| Сервис | Адрес |
| --- | --- |
| Фронтенд (Nginx) | http://localhost:8080 |
| API | http://localhost:5209 |
| PostgreSQL | localhost:5432 |

API ожидает готовности PostgreSQL, применяет EF Core миграции и открывает `/health`, проверяющий подключение к базе. Фронтенд запускается после готовности API. Nginx перенаправляет `/api/` в API, убирая этот префикс: например, `http://localhost:8080/api/health`.

По умолчанию создаётся база `itisovtsy` с пользователем `itisovtsy` и локальным паролем `itisovtsy_dev`. Параметры и порты можно переопределить через `.env` в корне; пример — `.env.example`.


## Локальная разработка

- Фронтенд: `bun install`, затем `bun dev` в `frontend/itisovtsy/`.
- Бэкенд и миграции: [backend/Itisovtsy.API/README.md](backend/Itisovtsy.API/README.md).
