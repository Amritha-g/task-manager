# FastAPI Task Manager Web Application

**Live Deployment:** []

A sleek, robust, and full-featured simple Task Manager. 

## Stack Overview
* **Backend:** Python 3.11, FastAPI
* **Database:** SQLite with SQLAlchemy ORM
* **Authentication:** JWT (JSON Web Tokens) with `python-jose` and `passlib[bcrypt]`
* **Data Validation:** Pydantic
* **Frontend:** Plain HTML, CSS with modern Dark Theme, Vanilla JavaScript (Fetch API) — completely served by FastAPI.

## Key Features
* Full CRUD (Create, Read, Update, Delete) on tasks.
* Secure User Registration and Login via JWT.
* Data isolated per user.
* Server-side Pagination (`?page=1&limit=10`) and Filtering (`completed`, `priority`).
* **Overdue Auto-Flag:** The backend dynamically computed property marking tasks as overdue automatically based on their due date.
* No separate frontend build steps needed!

## Environment Variables
Before running the application, you must provide your own secret keys.
1. Rename `.env.example` to `.env`
2. Update the `SECRET_KEY` inside `.env` to a secure string.
**Note:** The `.env` file should never be committed to version control.

## Local Setup Instructions

1. **Clone the repository** (or download files)
2. **Setup virtual environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```
4. **Environment Variables**:
   Copy `.env.example` to `.env`. Ensure your `SECRET_KEY` is present.
   ```bash
   cp .env.example .env
   ```
5. **Run the server**:
   ```bash
   uvicorn app.main:app --reload
   ```
6. **Access Application**:
   - Web Application UI: [http://127.0.0.1:8000/](http://127.0.0.1:8000/)
   - Interactive Swagger API Docs: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

## Running Tests
Run basic integration tests via Pytest to confirm the API endpoints correctly integrate.
```bash
pytest
```
