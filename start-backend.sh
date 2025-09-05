#!/bin/bash
echo "🔧 Starting Whitepaper AI Backend on port 8002..."
cd backend
/Library/Frameworks/Python.framework/Versions/3.11/bin/python3 -m uvicorn main:app --reload --host 0.0.0.0 --port 8002