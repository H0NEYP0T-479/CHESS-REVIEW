#!/bin/bash
# Start both frontend and backend in development mode

echo "🚀 Starting Chess Review in development mode..."
echo ""

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "❌ Frontend dependencies not installed. Run ./setup.sh first."
    exit 1
fi

if [ ! -d "backend/venv" ]; then
    echo "❌ Backend virtual environment not found. Run ./setup.sh first."
    exit 1
fi

# Start backend in background
echo "Starting backend server..."
cd backend
source venv/bin/activate 2>/dev/null || . venv/Scripts/activate 2>/dev/null
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
cd ..

# Wait a bit for backend to start
sleep 2

# Start frontend
echo "Starting frontend development server..."
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Chess Review is running!"
echo ""
echo "Frontend: http://localhost:5173"
echo "Backend API: http://localhost:8000"
echo "API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Wait for Ctrl+C and kill both processes
cleanup() {
    echo ""
    echo "Stopping servers..."
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
    fi
    exit 0
}

trap cleanup INT
wait
