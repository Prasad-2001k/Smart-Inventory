# Smart Inventory

Lightweight inventory management backend (Django + DRF) with a React + Vite frontend.  
Provides product/category/supplier management, order processing, stock updates and a small admin UI.

---

## Quick Links

- Backend entry: [manage.py](manage.py)  
- Django project settings: [`core.settings`](core/settings.py) — [core/settings.py](core/settings.py)  
- URL config (JWT endpoints + API include): [core/urls.py](core/urls.py) — see JWT routes (`TokenObtainPairView`, `TokenRefreshView`)  
- Inventory app: [inventory/models.py](inventory/models.py) — models: [`inventory.models.Category`](inventory/models.py), [`inventory.models.Supplier`](inventory/models.py), [`inventory.models.Order`](inventory/models.py)  
- Admin customizations: [`inventory.admin.OrderAdmin`](inventory/admin.py), [`inventory.admin.OrderItemAdmin`](inventory/admin.py) — [inventory/admin.py](inventory/admin.py)  
- API client used by frontend: [`frontend/src/api/api.js`](frontend/src/api/api.js) — functions: [`fetchProducts`](frontend/src/api/api.js), [`createOrder`](frontend/src/api/api.js)  
- Frontend readme: [frontend/README.md](frontend/README.md)  
- Project dependencies: [pyproject.toml](pyproject.toml)

---

## Features

- CRUD for Categories, Suppliers, Products
- Stock updates (patch endpoint used by frontend) — see [`updateProductStock`](frontend/src/api/api.js)
- Order creation with automatic stock decrement — backend models and views live in [inventory](inventory/)  
- JWT-based auth endpoints registered in [core/urls.py](core/urls.py)
- Admin views with useful helpers (counts, totals, colored status) — [inventory/admin.py](inventory/admin.py)

---

## Architecture / Files of Interest

- Django project root:
  - [manage.py](manage.py)
  - [`core.settings`](core/settings.py) — CORS, DB (SQLite default), email settings, secret key
  - [core/urls.py](core/urls.py) — includes API and JWT endpoints

- Inventory app:
  - Models: [inventory/models.py](inventory/models.py) — [`inventory.models.Category`](inventory/models.py), [`inventory.models.Supplier`](inventory/models.py), [`inventory.models.Order`](inventory/models.py)
  - Admin: [inventory/admin.py](inventory/admin.py)
  - Serializers / Views / URLs: [inventory/serializers.py](inventory/serializers.py), [inventory/views.py](inventory/views.py), [inventory/urls.py](inventory/urls.py)
  - App config registers signals: [inventory/apps.py](inventory/apps.py)

- Frontend (React + Vite + Tailwind):
  - App shell & routing: [frontend/src/App.jsx](frontend/src/App.jsx)
  - Pages: [frontend/src/pages/InventoryManager.jsx](frontend/src/pages/InventoryManager.jsx), [frontend/src/pages/OrderSystem.jsx](frontend/src/pages/OrderSystem.jsx), [frontend/src/pages/Login.jsx](frontend/src/pages/Login.jsx)
  - API client: [frontend/src/api/api.js](frontend/src/api/api.js)
  - Entrypoint: [frontend/src/main.jsx](frontend/src/main.jsx)
  - Package info: [frontend/package.json](frontend/package.json)

---

## Local Setup (Development)

1. Python / env
   - Recommended: Python 3.12 (see [.python-version](.python-version))
   - Install deps (using UV as project uses pyproject.toml):  
     uv sync  
     (alternatively use requirements with uv pip install -r requirements.txt)

2. Database & migrations
   - Run migrations:
     uv run python manage.py migrate
   - Create superuser:
     uv run python manage.py createsuperuser

3. Run servers
   - Backend:
     uv run python manage.py runserver 0.0.0.0:8000
   - Frontend (in `frontend/`):
     cd frontend
     npm install
     npm run dev

Notes:
- CORS is configured in [`core.settings`](core/settings.py) and allows common dev origins (see `CORS_ALLOWED_ORIGINS`).
- JWT endpoints are available at `/api/token/` and `/api/token/refresh/` (registered in [core/urls.py](core/urls.py)).

---

## API Overview

- Public (authenticated) endpoints are under `/api/` (see [inventory/urls.py](inventory/urls.py))  
- Example client calls are implemented in [frontend/src/api/api.js](frontend/src/api/api.js):
  - fetch products: `fetchProducts()` → `api.get('products/')`
  - create order: `createOrder(orderData)` → `api.post('orders/', orderData)`
  - create order item: `createOrderItem(itemData)` → `api.post('order-items/', itemData)`

Auth:
- Obtain tokens: POST `/api/token/` (uses `rest_framework_simplejwt.views.TokenObtainPairView`)
- Refresh token: POST `/api/token/refresh/`

---

## Development Notes & Recommendations

- The project currently uses SQLite for dev (see [`core.settings`](core/settings.py)). For production, move to PostgreSQL and update `DATABASES`.
- Secrets & email/backends: `SECRET_KEY` and email settings are in settings — move to env vars (`python-decouple`) for production.
- Add API docs with `drf-spectacular` (package already listed in [pyproject.toml](pyproject.toml) and suggested in PACKAGES_GUIDE.md).
- Project provides guides:
  - [PACKAGES_GUIDE.md](PACKAGES_GUIDE.md)
  - [UV_COMMANDS.md](UV_COMMANDS.md)
  - [UV_SYNC_GUIDE.md](UV_SYNC_GUIDE.md)

---

## Testing

- Recommended tooling: pytest + pytest-django (see `PACKAGES_GUIDE.md` / `UV_COMMANDS.md` for uv commands)
- Run tests:
  uv run pytest

---

## Useful Commands (summary)

- Migrate: uv run python manage.py migrate
- Run backend: uv run python manage.py runserver
- Run frontend: cd frontend && npm run dev
- Create superuser: uv run python manage.py createsuperuser

---

## Contributing

- Follow code style and tooling recommendations in [PACKAGES_GUIDE.md](PACKAGES_GUIDE.md) (black, flake8, isort).
- Update API client functions in [frontend/src/api/api.js](frontend/src/api/api.js) when backend endpoints change.

---

## Where to look for specifics

- JWT endpoints and API include: [core/urls.py](core/urls.py)  
- Model definitions and business logic: [inventory/models.py](inventory/models.py) — see [`inventory.models.Order`](inventory/models.py)  
- Admin helpers & optimizations: [inventory/admin.py](inventory/admin.py) — see [`inventory.admin.OrderAdmin`](inventory/admin.py)  
- Frontend API usage: [frontend/src/api/api.js](frontend/src/api/api.js) — functions like `fetchProducts`, `createOrder`