.PHONY: dev build deploy install clean

install:
	@echo "Installing backend dependencies..."
	cd backend && python -m venv .venv && .venv/Scripts/activate && pip install -r requirements.txt
	@echo "Installing frontend dependencies..."
	cd frontend && npm install

dev-backend:
	@echo "Starting backend..."
	cd backend && .venv/Scripts/activate && uvicorn main:app --reload

dev-frontend:
	@echo "Starting frontend..."
	cd frontend && npm run dev

build:
	@echo "Building docker images..."
	docker compose build

deploy: build
	@echo "Deploying AI Recruiter..."
	docker compose up -d

clean:
	@echo "Cleaning up..."
	docker compose down
