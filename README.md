# Smart Inventory

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.12-blue.svg)
![Django](https://img.shields.io/badge/django-5.0-green.svg)
![React](https://img.shields.io/badge/react-18.0-blue.svg)

**Smart Inventory** is a lightweight, modern inventory management system designed for efficiency. It features a robust Django backend and a responsive React frontend, providing seamless management of products, suppliers, and orders.

---

## 🚀 Key Features

- **Inventory Management**: Full CRUD support for Products, Categories, and Suppliers.
- **Order Processing**: Streamlined order creation with automatic stock adjustments.
- **Real-time Updates**: Instant stock level reflection across the UI.
- **Secure Authentication**: JWT-based secure login and session management.
- **Admin Dashboard**: Powerful Django admin interface for data oversight.

## 🛠️ Tech Stack

- **Backend**: Django, Django Rest Framework (DRF)
- **Frontend**: React, Vite, Tailwind CSS
- **Database**: SQLite (Dev), PostgreSQL (Prod ready)
- **Tooling**: UV (Python package manager), Pytest

## 📚 Documentation

Detailed documentation is available in the `docs/` directory:

- [**Setup & Installation**](docs/setup.md): Step-by-step guide to get running locally.
- [**Architecture**](docs/architecture.md): Overview of the project structure and key files.
- [**API Reference**](docs/api.md): Details on API endpoints and usage.
- [**Contributing**](docs/contributing.md): Guidelines for developers.

## ⚡ Quick Start

1.  **Backend**:
    ```bash
    uv sync
    uv run python manage.py migrate
    uv run python manage.py runserver
    ```

2.  **Frontend**:
    ```bash
    cd frontend
    npm install
    npm run dev
    ```

For full details, see the [Setup Guide](docs/setup.md).

---

## 🤝 Contributing

Contributions are welcome! Please check out our [Contributing Guide](docs/contributing.md) to get started.

## 📄 License

This project is licensed under the MIT License.