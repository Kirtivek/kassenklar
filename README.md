
# KassenKlar – Personal Expense Tracker

A full-stack personal expense tracking application built with Python, FastAPI, React, and TypeScript.

KassenKlar helps users manage daily expenses, organize transactions into categories, and understand their spending habits through an interactive dashboard and visual analytics.

## Features

- **Expense Management:** Add, view, update, and delete expense records.
- **Category-Based Tracking:** Organize expenses into Food & Drinks, Home & Bills, Transport, and Other.
- **Interactive Dashboard:** View expense summaries and recent transactions.
- **Spending Analytics:** Visualize monthly spending and compare expenses across categories.
- **Transaction Management:** Search, filter, and sort expense records.
- **REST API:** Backend endpoints built with FastAPI.
- **Database Integration:** Store and retrieve expense records using SQLite and SQLAlchemy.

## Technology Stack

| Area | Technologies |
|---|---|
| Backend | Python, FastAPI |
| Database | SQLite, SQLAlchemy |
| Frontend | React, TypeScript |
| Build Tool | Vite |
| HTTP Client | Axios |
| Data Visualization | Recharts |
| API Documentation | FastAPI / Swagger UI |

## Project Structure

```text
kassenklar/
│
├── app/
│   ├── main.py
│   ├── database.py
│   ├── models.py
│   ├── schemas.py
│   ├── calculations.py
│   └── migrate_db.py
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── AddExpense.tsx
│   │   ├── App.tsx
│   │   ├── App.css
│   │   ├── DashboardSummary.tsx
│   │   └── SpendingChart.tsx
│   ├── package.json
│   └── vite.config.ts
│
├── test_calculation.py
├── __init__db.py
└── .gitignore
```

## Getting Started

### Prerequisites

- Python 3.12 or later
- Node.js and npm
- Git

### 1. Clone the repository

```bash
git clone https://github.com/Kirtivek/kassenklar.git
cd kassenklar
```

### 2. Set up the backend

Create and activate a virtual environment:

```bash
python -m venv .venv
```

macOS / Linux:

```bash
source .venv/bin/activate
```

Install the backend dependencies:

```bash
pip install fastapi uvicorn sqlalchemy pydantic
```

Start the backend server:

```bash
python -m uvicorn app.main:app --reload
```

Backend API:

http://127.0.0.1:8000

Interactive API documentation:

http://127.0.0.1:8000/docs

### 3. Set up the frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the frontend in your browser:

http://localhost:5173

## Architecture

KassenKlar follows a client-server architecture:

- **React + TypeScript:** Provides the user interface and manages frontend interactions.
- **FastAPI:** Handles HTTP requests and application logic.
- **SQLAlchemy:** Manages communication between the backend and database.
- **SQLite:** Stores expense records.
- **Axios:** Connects the frontend to the backend REST API.

## Project Goals

This project was developed to strengthen practical skills in:

- Python backend development
- REST API design
- Database modelling and integration
- Full-stack application development
- Frontend and backend integration
- Data visualization
- Git and GitHub version control

## Future Improvements

- Mobile application using React Native and Expo
- User authentication and account management
- Advanced spending insights and reports
- Additional analytics and financial summaries

## Author

**Kirti Vivek Tarsariya**

GitHub: https://github.com/Kirtivek

---

*Developed as a personal full-stack software development project.*
