# E-Commerce Platform — Hexagonal Microservices API

## Context
Building a mini e-commerce platform with three microservices (catalog, orders, notifications) each structured with hexagonal architecture internally. Services communicate via REST for queries and AMQP (RabbitMQ) for domain events. The goal is to demonstrate clean service boundaries without coupling.

Stack: Node.js + TypeScript, Express, ArkType (validation), Jest, SQLite, amqplib, Docker Compose (RabbitMQ).

---

## Monorepo Layout

```
e-commerce-plataform/
├── package.json                  # npm workspaces root
├── tsconfig.base.json
├── docker-compose.yml            # RabbitMQ + all 3 services
├── .env.example
├── shared/
│   └── src/events/domain-events.ts   # Shared event payload type contracts
└── services/
    ├── catalog/        (port 3001)
    ├── orders/         (port 3002)
    └── notifications/  (port 3003)
```

Each service follows the same internal layout:
```
service/src/
├── domain/
│   ├── entities/       # Pure domain classes, zero external deps
│   └── events/         # Domain event type definitions
├── application/
│   ├── ports/
│   │   ├── inbound/    # Use-case interfaces (driving ports)
│   │   └── outbound/   # Repository + EventBus interfaces (driven ports)
│   ├── use-cases/      # Application services implementing inbound ports
│   └── dtos/           # Application-layer DTOs (input/output for use cases)
└── infrastructure/
    ├── http/
    │   ├── schemas/    # ArkType schemas — request validation only
    │   ├── controllers/
    │   └── routes/
    ├── persistence/sqlite/
    └── messaging/amqp/
```

**Key DTO split:** HTTP schemas (ArkType, infrastructure layer) → map to → Application DTOs (plain TS interfaces, application layer) → map to → Domain entities. Controllers never touch domain entities directly.

---

## Service Definitions

### Catalog (port 3001)
**Domain entity:** `Product { id, name, description, price, stock, category, createdAt, updatedAt }`

Endpoints:
- `GET /products` — list (pagination via query params)
- `GET /products/:id`
- `POST /products`
- `PUT /products/:id`
- `DELETE /products/:id`
- `PATCH /products/:id/stock`

Events **published** (routing key → exchange `e-commerce.events`):
- `catalog.product.created`
- `catalog.product.updated`
- `catalog.stock.updated`

---

### Orders (port 3002)
**Domain entities:**
- `Order { id, customerId, items: OrderItem[], status, total, createdAt }`
- `OrderItem { productId, quantity, unitPrice }`
- `OrderStatus: 'pending' | 'confirmed' | 'cancelled' | 'shipped'`

Endpoints:
- `GET /orders`
- `GET /orders/:id`
- `POST /orders` — calls Catalog REST `GET /products/:id` to validate stock
- `PATCH /orders/:id/status`

Events **published**:
- `orders.order.created`
- `orders.order.confirmed`
- `orders.order.cancelled`

---

### Notifications (port 3003)
**Domain entity:** `Notification { id, type, recipient, payload (JSON), readAt, createdAt }`

Endpoints:
- `GET /notifications`
- `GET /notifications/:id`
- `PATCH /notifications/:id/read`

Events **consumed**:
- `orders.order.created` → creates notification
- `orders.order.confirmed` → creates notification
- `orders.order.cancelled` → creates notification

---

## AMQP Design (RabbitMQ via amqplib)

```
Exchange: e-commerce.events  (type: topic, durable: true)

Bindings:
  Queue: catalog.events        ← routing key: catalog.#
  Queue: orders.events         ← routing key: orders.#
  Queue: notifications.events  ← routing key: orders.#  (consumes order events)

Dead-letter exchange: e-commerce.dlx (failed messages land here)
```

**Event message envelope:**
```json
{
  "eventId": "uuid",
  "routingKey": "orders.order.created",
  "timestamp": "ISO8601",
  "payload": { ... }
}
```

**Key AMQP concepts demonstrated:**
1. **Topic exchange + wildcards** — `orders.#` binds notifications to all order events without knowing about catalog.
2. **Durable queues + persistent messages** — messages survive broker restart.
3. **Manual ack** — `channel.ack(msg)` only after handler succeeds; on error, `channel.nack(msg, false, false)` routes to DLX.
4. **EventBusPort interface** — `publish(routingKey, payload)` / `subscribe(pattern, handler)` — amqplib adapter implements it; mock in unit tests.
5. **Connection resilience** — reconnect-safe wrapper around amqplib channels.

---

## Implementation Steps

### 0. Plan folder
- Create `.claude/` at repo root (already in `.gitignore`) — done ✓

### 1. Root scaffolding
- `package.json` with `workspaces: ["shared", "services/*"]`
- `tsconfig.base.json` (strict, ES2022, module resolution node16)
- `docker-compose.yml`: RabbitMQ (management UI on 15672) + three service containers
- `.env.example`: `AMQP_URL`, `PORT`, `DB_PATH`, `CATALOG_BASE_URL`

### 2. Shared package (`shared/`)
- `src/events/domain-events.ts` — TypeScript interfaces for each event payload (shared contract)
- `package.json` name: `@ecommerce/shared`

### 3. Catalog service
- Domain: `Product` class with factory method `Product.create(dto)`
- Outbound ports: `IProductRepository`, `IEventBus`
- Use cases: `CreateProductUseCase`, `UpdateProductUseCase`, `GetProductUseCase`, `ListProductsUseCase`, `UpdateStockUseCase`
- ArkType schemas: `CreateProductSchema`, `UpdateProductSchema`, `UpdateStockSchema`
- SQLite repo using `better-sqlite3`
- AMQP publisher adapter: `AmqplibEventBus`
- `main.ts`: bootstraps Express + SQLite migrations + AMQP connection

### 4. Orders service
- Domain: `Order` aggregate with `Order.create()`, `order.confirm()`, `order.cancel()`
- Outbound ports: `IOrderRepository`, `IEventBus`, `ICatalogClient` (HTTP)
- `CatalogHttpClient` adapter: calls `GET /products/:id` on catalog
- Use cases: `CreateOrderUseCase`, `UpdateOrderStatusUseCase`, `GetOrderUseCase`, `ListOrdersUseCase`

### 5. Notifications service
- Domain: `Notification` entity
- Outbound ports: `INotificationRepository`
- Use cases: `CreateNotificationUseCase`, `GetNotificationUseCase`, `ListNotificationsUseCase`, `MarkReadUseCase`
- AMQP consumer adapter: subscribes to `orders.#`, maps event → `CreateNotificationUseCase`

### 6. Unit tests (per service)
Pattern — mock all ports, test use-case logic in isolation:
```typescript
const mockRepo = { save: jest.fn(), findById: jest.fn() }
const mockEventBus = { publish: jest.fn() }
const useCase = new CreateProductUseCase(mockRepo, mockEventBus)
await useCase.execute(validDto)
expect(mockRepo.save).toHaveBeenCalledWith(expect.objectContaining({ name: validDto.name }))
expect(mockEventBus.publish).toHaveBeenCalledWith('catalog.product.created', expect.any(Object))
```

---

## Verification
1. `docker-compose up` → RabbitMQ running at `localhost:15672`
2. `npm run dev -w services/catalog` → Catalog on :3001
3. `POST /products` → product created, event visible in RabbitMQ management UI
4. `npm run dev -w services/orders` → Orders on :3002
5. `POST /orders` (with valid productId) → order created, `orders.order.created` published
6. `npm run dev -w services/notifications` → Notifications on :3003, receives order event
7. `GET /notifications` → returns the created notification
8. `npm test -w services/catalog` → use-case unit tests green
