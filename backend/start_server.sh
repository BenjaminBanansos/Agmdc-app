#!/bin/bash
export PATH="$PWD/node_bin/bin:$PATH"

# 1. Kill ONLY the process on Port 5001 (Safe Kill)
PID=$(lsof -ti :5001)
if [ ! -z "$PID" ]; then
  echo "⚠️  Stopping existing server on Port 5001 (PID: $PID)..."
  kill -9 $PID
fi

# 2. Clear Session Locks
rm -rf .wwebjs_auth/session/SingletonLock

# 3. Validation
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js binary not found."
    exit 1
fi

echo "✅ Node.js found: $(node -v)"
echo "🚀 Starting AGMDC Backend on Port 5001..."
echo "--------------------------------------------------------"

# 4. Start
node server.js
