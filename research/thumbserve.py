"""Static server for the library folder that also accepts thumbnail uploads from the page.
POST /upload/<name>  (name: [a-z0-9_.-]+, .webp or .json) -> writes thumbs/<name>.  Localhost only.
Usage: python research/thumbserve.py [port]"""
import http.server, os, re, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "thumbs")

class H(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **k): super().__init__(*a, directory=ROOT, **k)
    def do_POST(self):
        m = re.fullmatch(r"/upload/([a-z0-9_.-]+\.(?:webp|json))", self.path)
        if not m: self.send_error(404); return
        n = int(self.headers.get("Content-Length", 0)); data = self.rfile.read(n)
        os.makedirs(OUT, exist_ok=True)
        with open(os.path.join(OUT, m.group(1)), "wb") as f: f.write(data)
        self.send_response(200); self.end_headers(); self.wfile.write(b"ok")
    def log_message(self, *a): pass

port = int(sys.argv[1]) if len(sys.argv) > 1 else 8767
http.server.ThreadingHTTPServer(("127.0.0.1", port), H).serve_forever()
