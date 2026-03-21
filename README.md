# 🚀 Runbook: Локальное развертывание SignalDesk

Инструкция по быстрому запуску инфраструктуры и приложений.

---

### 🛠 1. Требования (Prerequisites)

Перед началом убедитесь, что в системе установлены:

- **Node.js** (LTS версия)
- **pnpm** (`npm install -g pnpm`)
- **Docker** & **Docker Compose**

---

### 🐳 2. Инфраструктура (Базы данных)

Контейнеры с БД, кэшем и очередями запускаются через Docker.

- **Где:** infra/docker/docker-compose.yml
- **Команда:**
  ```bash
  docker compose -f infra/docker/docker-compose.yml up -d
  ```

---

### 💻 3. Запуск приложений

Все команды запускаются из **корня проекта** через `pnpm`.

- **Backend (API):**
  ```bash
  pnpm run dev:api
  ```
- **Frontend (Web):**
  ```bash
  pnpm run dev:web
  ```

---

### 🔗 4. Проверка доступности (URL)

Проверьте работоспособность сервисов после запуска:

| Сервис             | URL / Адрес                                                  | Доступ (User/Pass)          |
| :----------------- | :----------------------------------------------------------- | :-------------------------- |
| **Frontend**       | [http://localhost:3001](http://localhost:3001)               | —                           |
| **Backend Health** | [http://localhost:3000/health](http://localhost:3000/health) | —                           |
| **RabbitMQ UI**    | [http://localhost:15672](http://localhost:15672)             | `signaldesk` / `signaldesk` |

---

### 🔌 5. Используемые порты

Убедитесь, что эти порты не заняты другими приложениями:

- Web — `3001`
- API — `3000`
- Postgres — `5433`
- Redis — `6379`
- RabbitMQ — `5672`
- RabbitMQ UI — `15672`

---

### ❓ 6. Если что-то не поднялось (Troubleshooting)

- **Ошибка "Port 3000 is in use":**
  Порт уже занят другим процессом (например, ранее запущенным API или другим приложением).
  Проверь, какой процесс занимает порт, и останови его.
- **Compose-файл не найден:**
  Если `docker-compose.yml` лежит не в корне, укажите путь явно:
  ```bash
  docker compose -f infra/docker/docker-compose.yml up -d
  ```
- **Контейнеры не стартуют:**
  Проверьте статус и логи:
  ```bash
  docker compose -f infra/docker/docker-compose.yml ps
  docker compose -f infra/docker/docker-compose.yml logs -f [service_name]
  ```
