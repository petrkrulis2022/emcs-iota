#!/bin/bash

# Start both frontend and backend in development mode

echo "======================================"
echo "Starting EMCS Development Environment"
echo "======================================"
echo ""

# Check if node_modules exist
if [ ! -d "backend/node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    cd backend
    npm install
    cd ..
    echo ""
fi

if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
    echo ""
fi

echo "✅ Dependencies installed"
echo ""
echo "======================================"
echo "Starting Services"
echo "======================================"
echo ""
echo "🚀 Backend will run on: http://localhost:3000"
echo "🚀 Frontend will run on: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop both services"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "Stopping services..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM

# Start backend in background
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Start frontend in background
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ Services started!"
echo ""
echo "📝 Backend logs:"
echo "   - API running on http://localhost:3000"
echo "   - Health check: http://localhost:3000/health"
echo ""
echo "📝 Frontend logs:"
echo "   - App running on http://localhost:5173"
echo ""
echo "⚠️  Note: Contracts not deployed yet, so blockchain features won't work"
echo "   Deploy contracts first with: cd contracts && ./deploy.sh"
echo ""

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID

