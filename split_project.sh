#!/usr/bin/env bash
# This script splits the project into backend and frontend folders.
# It copies the necessary files into the respective folders and cleans up the original directory.
# Usage: ./split_project.sh
echo "Creating backend and frontend folders..."
mkdir -p backend frontend

echo "Copying backend files..."
cp api.py assistant_core.py config.py rag_assistant.py vote_manager.py backend/
cp Dockerfile docker-compose.yml Procfile .env.template requirements.txt runtime.txt backend/
cp start_app.sh stop_servers.sh backend/
cp -r __pycache__ feedback_data logs backend/
cp HEROKU_NETLIFY_DEPLOYMENT.md PRODUCTION_DEPLOYMENT.md backend/ 2>/dev/null

echo "Copying frontend files..."
cp -r evalui frontend/
cp netlify.toml package.json package-lock.json frontend/
cp -r node_modules frontend/ 2>/dev/null

echo "✅ Split complete. Review backend/ and frontend/ folders before deleting originals."
