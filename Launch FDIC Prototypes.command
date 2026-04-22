#!/bin/bash
# One-click launcher for the FDIC Insight Suite prototypes.
# Double-click this file in Finder to start the local server and open the apps.

set -e

# Resolve the directory this script lives in (works even if double-clicked)
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
APP_DIR="$SCRIPT_DIR/prototypes"
PORT=8765
URL="http://localhost:$PORT/"

cd "$APP_DIR"

# If something is already running on this port, stop it
EXISTING_PID=$(lsof -ti tcp:$PORT 2>/dev/null || true)
if [ -n "$EXISTING_PID" ]; then
  echo "Stopping existing server on port $PORT (pid $EXISTING_PID)..."
  kill "$EXISTING_PID" 2>/dev/null || true
  sleep 1
fi

# Decide which python to use
if command -v python3 >/dev/null 2>&1; then
  PY=python3
elif command -v python >/dev/null 2>&1; then
  PY=python
else
  echo "ERROR: Python is not installed."
  echo "Install it from https://www.python.org/downloads/ and try again."
  read -n 1 -s -r -p "Press any key to close this window..."
  exit 1
fi

echo ""
echo "============================================================"
echo "  FDIC Insight Suite — local prototypes"
echo "============================================================"
echo "  Folder : $APP_DIR"
echo "  Server : $URL"
echo "  Stop   : close this window or press Ctrl+C"
echo "============================================================"
echo ""

# Open the launcher page in the default browser
( sleep 1 && open "$URL" ) &

# Run the server in the foreground so closing this window stops the server
exec $PY -m http.server $PORT
