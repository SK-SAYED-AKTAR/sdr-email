# FastAPI + Next.js Boilerplate

## Backend

```
cd backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

## Frontend

```
cd frontend
npm install
npm run dev
```

Visit http://localhost:3000 — it fetches `GET /api/hello` from the backend and renders the message.
