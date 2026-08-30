import uvicorn
import socket
import subprocess
import os
import signal
import sys
import time

def check_port_in_use(port: int) -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('localhost', port)) == 0

def get_pids_using_port(port: int):
    try:
        output = subprocess.check_output(['lsof', '-t', '-i', f':{port}']).decode('utf-8')
        pids = [int(p) for p in output.strip().split('\n') if p]
        return pids
    except subprocess.CalledProcessError:
        return []

if __name__ == "__main__":
    port = 8000
    
    if check_port_in_use(port):
        print(f"⚠️  Port {port} is already in use (the server might already be running).")
        try:
            choice = input("Do you want to kill the existing process and restart? (y/N): ")
        except (KeyboardInterrupt, EOFError):
            print("\nExiting...")
            sys.exit(0)
            
        if choice.lower() == 'y':
            pids = get_pids_using_port(port)
            for pid in pids:
                try:
                    os.kill(pid, signal.SIGKILL)
                    print(f"Killed process {pid}")
                except ProcessLookupError:
                    pass
            time.sleep(1) # Wait a moment for the OS to release the port
        else:
            print("Exiting...")
            sys.exit(0)
    
    print("\n✅ Server is working!")
    print(f"🔗 Visit: http://localhost:{port}/ui\n")
    
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=True)
