import http.server
import socketserver
import threading
import urllib.request
import json
import sys

# Test server setup
PORT = 8089
DIRECTORY = "c:/Users/ELCOT/Documents/food donation ai/frontend"

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

def start_server():
    server = socketserver.TCPServer(("", PORT), Handler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    return server

def verify_files_exist():
    required = [
        "admin.html", "dashboard.html", "index.html",
        "css/mobile.css", "css/dashboard.css", "css/admin.css", "css/layout-fix.css",
        "js/admin.js", "js/dashboard.js", "js/auth.js"
    ]
    for rel in required:
        url = f"http://127.0.0.1:{PORT}/{rel}"
        try:
            req = urllib.request.urlopen(url)
            if req.status == 200:
                print(f"[HTTP 200 OK] {rel}")
            else:
                print(f"[FAIL {req.status}] {rel}")
                return False
        except Exception as e:
            print(f"[ERROR] Could not fetch {rel}: {e}")
            return False
    return True

if __name__ == "__main__":
    srv = start_server()
    print(f"Started local test server on port {PORT}")
    ok = verify_files_exist()
    srv.shutdown()
    if ok:
        print("\n[ALL HTTP VERIFICATION CHECKS PASSED]")
        sys.exit(0)
    else:
        print("\n[VERIFICATION FAILED]")
        sys.exit(1)
