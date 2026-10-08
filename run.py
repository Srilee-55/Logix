"""
LOGIX Launch Orchestrator
Single-command script to start LOGIX AI Application.
Usage: python run.py
"""

import os
import sys
import subprocess
import time

def main():
    print("==========================================================")
    print("      LOGIX — AI Delivery Success Intelligence           ")
    print("  'Don't just optimize the route. Predict delivery success.'")
    print("==========================================================")

    root_dir = os.path.dirname(os.path.abspath(__file__))
    venv_python = os.path.join(root_dir, ".venv", "Scripts", "python.exe")
    if not os.path.exists(venv_python):
        venv_python = sys.executable

    npm_cmd = "npm.cmd" if os.name == "nt" else "npm"

    # 1. Build frontend distribution bundle
    print("\n[1/2] Building frontend application bundle...")
    subprocess.run([npm_cmd, "--prefix", "frontend", "run", "build"], cwd=root_dir, check=True)

    # 2. Launch LOGIX Single Application Server
    print("\n[2/2] Launching LOGIX Application on http://localhost:8000 ...")
    server_proc = subprocess.Popen(
        [venv_python, "-m", "uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"],
        cwd=root_dir
    )

    time.sleep(2)

    print("\n==========================================================")
    print(" LOGIX is running successfully!")
    print(" LOGIX APPLICATION URL : http://localhost:8000")
    print("==========================================================")
    print(" Press Ctrl+C to stop application server.")

    try:
        server_proc.wait()
    except KeyboardInterrupt:
        print("\nStopping LOGIX application server...")
        server_proc.terminate()

if __name__ == "__main__":
    main()
