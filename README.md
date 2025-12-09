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

---

## ⚡ Quick Start

### Prerequisites

- **Python**: 3.12+
- **Node.js**: 18+
- **UV**: Python package manager (Recommended)

### Backend Setup

1.  **Install Dependencies**
    ```bash
    uv sync
    # Or: uv pip install -r requirements.txt
    ```

2.  **Database & Admin**
    ```bash
    uv run python manage.py migrate
    uv run python manage.py createsuperuser
    ```

3.  **Run Server**
    ```bash
    uv run python manage.py runserver 0.0.0.0:8000
    ```

### Frontend Setup

1.  **Install & Run**
    ```bash
    cd frontend
    npm install
    npm run dev
    ```

---

## 🏗️ Architecture & Project Structure

### Backend (Django)

- **`core/`**: Project settings and main URL routing (includes JWT endpoints).
- **`inventory/`**: Main app logic.
    - **`models.py`**: `Category`, `Supplier`, `Order`, `Product`.
    - **`views.py`**: API logic, including automatic stock deduction on order creation.
    - **`serializers.py`**: Data validation and transformation.

### Frontend (React)

- **`src/api/api.js`**: Centralized API client.
- **`src/pages/`**: `InventoryManager`, `OrderSystem`, `Login`.
- **`src/App.jsx`**: Main routing and layout.

---

## 🔌 API Overview

Base URL: `/api/`

### Authentication (JWT)
- **Login**: `POST /api/token/`
- **Refresh**: `POST /api/token/refresh/`

### Key Endpoints
- **Products**: `GET/POST /api/products/`
- **Orders**: `POST /api/orders/` (Triggers stock update)
- **Suppliers**: `GET/POST /api/suppliers/`

---


## 📄 License

This project is licensed under the MIT License.