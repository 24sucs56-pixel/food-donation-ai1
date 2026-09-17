import subprocess
import time
import urllib.request
import json
import socket
import struct

def create_websocket(ws_url):
    url_parts = ws_url.replace("ws://", "").split("/", 1)
    host_port = url_parts[0].split(":")
    host = host_port[0]
    port = int(host_port[1])
    path = "/" + url_parts[1]

    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.connect((host, port))

    sec_key = "dGhlIHNhbXBsZSBub25jZQ=="
    handshake = (
        f"GET {path} HTTP/1.1\r\n"
        f"Host: {host}:{port}\r\n"
        f"Upgrade: websocket\r\n"
        f"Connection: Upgrade\r\n"
        f"Sec-WebSocket-Key: {sec_key}\r\n"
        f"Sec-WebSocket-Version: 13\r\n\r\n"
    )
    s.sendall(handshake.encode('utf-8'))
    resp = s.recv(4096)
    return s

def send_ws_json(s, data_dict):
    msg = json.dumps(data_dict).encode('utf-8')
    length = len(msg)
    mask = b'\x12\x34\x56\x78'
    header = bytearray()
    header.append(0x81)
    if length <= 125:
        header.append(0x80 | length)
    elif length <= 65535:
        header.append(0x80 | 126)
        header.extend(struct.pack("!H", length))
    else:
        header.append(0x80 | 127)
        header.extend(struct.pack("!Q", length))
    header.extend(mask)
    masked_msg = bytearray(length)
    for i in range(length):
        masked_msg[i] = msg[i] ^ mask[i % 4]
    s.sendall(header + masked_msg)

def recv_ws_json(s):
    data = s.recv(65536)
    if not data:
        return None
    payload_len = data[1] & 0x7f
    idx = 2
    if payload_len == 126:
        payload_len = struct.unpack("!H", data[2:4])[0]
        idx = 4
    elif payload_len == 127:
        payload_len = struct.unpack("!Q", data[2:10])[0]
        idx = 10
    payload = data[idx:idx+payload_len]
    try:
        return json.loads(payload.decode('utf-8', errors='ignore'))
    except Exception as e:
        return {"raw": payload.decode('utf-8', errors='ignore')}

http_proc = subprocess.Popen(["python", "-m", "http.server", "8092", "--directory", "frontend"])
time.sleep(1.5)

edge_path = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
user_data_dir = r"C:\Users\ELCOT\Documents\food donation ai\scratch\edge_profile"

edge_proc = subprocess.Popen([
    edge_path,
    "--headless=new",
    "--remote-debugging-port=9222",
    "--remote-allow-origins=*",
    "--disable-web-security",
    f"--user-data-dir={user_data_dir}",
    "--no-first-run",
    "--no-default-browser-check",
    "http://127.0.0.1:8092/login.html"
])

time.sleep(2)

try:
    res = urllib.request.urlopen("http://127.0.0.1:9222/json")
    pages = json.loads(res.read())
    ws_url = pages[0].get("webSocketDebuggerUrl")

    if ws_url:
        ws = create_websocket(ws_url)
        
        def eval_js(expr, req_id):
            send_ws_json(ws, {
                "id": req_id,
                "method": "Runtime.evaluate",
                "params": {"expression": expr, "returnByValue": True}
            })
            time.sleep(0.3)
            res = recv_ws_json(ws)
            if res and "result" in res and "result" in res["result"]:
                return res["result"]["result"].get("value")
            return res

        # Set session as donor
        eval_js("localStorage.setItem('role', 'donor'); localStorage.setItem('email', 'donor@test.com'); localStorage.setItem('name', 'Donor Test'); location.href = 'http://127.0.0.1:8092/dashboard.html';", 1)
        time.sleep(2.0)

        res = urllib.request.urlopen("http://127.0.0.1:9222/json")
        pages = json.loads(res.read())
        ws_url = pages[0].get("webSocketDebuggerUrl")
        ws = create_websocket(ws_url)

        print("Current URL:", eval_js("window.location.href", 2))
        print("switchTab exists:", eval_js("typeof window.switchTab", 3))
        print("Calling window.switchTab('sidebarSettings'):")
        eval_js("window.switchTab('sidebarSettings');", 4)
        print("settingsSection display:", eval_js("document.getElementById('settingsSection')?.style.display", 5))
        print("dashboardHomeSection display:", eval_js("document.getElementById('dashboardHomeSection')?.style.display", 6))

finally:
    edge_proc.terminate()
    http_proc.terminate()
