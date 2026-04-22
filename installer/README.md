# Installer (Windows)

Двухшаговая сборка `PierceX-Setup.exe` для раздачи и демо на хакатоне.

## Требования (один раз)

В CMD:
```cmd
winget install Microsoft.DotNet.SDK.8
winget install OpenJS.NodeJS.LTS
winget install JRSoftware.InnoSetup
```
Перезапустите CMD, чтобы `dotnet`, `npm`, `iscc` появились в PATH.

## Сборка

Из корня репозитория:
```cmd
build.bat
iscc installer\PierceX.iss
```

Результаты:
- `release\PierceX.Api.exe` — self-contained бэкенд (~70–90 MB)
- `release\wwwroot\` — собранный фронт
- `release\start.bat` — запуск одним кликом
- `installer\Output\PierceX-Setup.exe` — инсталлер для раздачи

## Что делает инсталлер

- Ставит всё в `%LOCALAPPDATA%\Programs\PierceX` (без прав админа)
- Создаёт ярлык в меню Пуск и (опционально) на рабочем столе
- Опционально добавляет автозапуск при входе в Windows
- Запускает приложение после установки — браузер открывается на `http://localhost:5080/`
- Деинсталлятор удаляет всё включая базу `piercex.db`

## Первый запуск

- Открывается браузер: http://localhost:5080/
- Swagger API: http://localhost:5080/swagger
- Demo login: `admin@piercex.kz` / `Admin123!`
- SQLite-база `piercex.db` создаётся рядом с EXE при первом старте, автоматически накатывается seed (60 студентов, вакансии, счета, домены, fraud-кейсы)

## Email-верификация в desktop-режиме

SMTP по умолчанию указывает на `localhost:1025` (MailHog). Для standalone-установки:
- либо запустите MailHog рядом (https://github.com/mailhog/MailHog/releases)
- либо задайте реальный SMTP через переменные окружения перед стартом:
  ```cmd
  set Smtp__Host=smtp.gmail.com
  set Smtp__Port=587
  set Smtp__UseSsl=true
  set Smtp__Username=...
  set Smtp__Password=...
  PierceX.Api.exe
  ```

## Groq AI key (опционально)

Без ключа AI работает на детерминированном fallback. Чтобы включить реальный Groq:
```cmd
set GROQ_API_KEY=gsk_...
PierceX.Api.exe
```
