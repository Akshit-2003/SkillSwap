from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import json
import re


HOST = "127.0.0.1"
PORT = 8000


FAQ_ANSWERS = [
    {
        "keywords": ("free", "cost", "price", "pay", "paid"),
        "answer": "Skillswap is free. You exchange knowledge with another learner instead of paying money.",
    },
    {
        "keywords": ("register", "signup", "sign up", "account", "join"),
        "answer": "To get started, click Get Started or Start Swapping, create your account, then add the skills you can teach and want to learn.",
    },
    {
        "keywords": ("login", "log in", "password"),
        "answer": "Use the Login button in the navigation. If you are new, register first so your dashboard can be created.",
    },
    {
        "keywords": ("skill", "learn", "teach", "swap"),
        "answer": "Add at least one skill you can teach and one skill you want to learn. Skillswap helps you find people with a matching exchange.",
    },
    {
        "keywords": ("message", "chat", "contact"),
        "answer": "After you find a match, use Messages in your dashboard to discuss the swap and agree on the session details.",
    },
    {
        "keywords": ("schedule", "session", "time", "meeting"),
        "answer": "Once you connect with a partner, message them and choose a time that works for both of you.",
    },
    {
        "keywords": ("verify", "verifier", "verified", "review"),
        "answer": "Verified reviews and verifier applications help the community find trusted teachers and reliable swap partners.",
    },
]


def build_reply(message):
    cleaned = re.sub(r"\s+", " ", message.strip().lower())
    if not cleaned:
        return "Ask me anything about Skillswap, finding skills, registering, or starting your first swap."

    for item in FAQ_ANSWERS:
        if any(keyword in cleaned for keyword in item["keywords"]):
            return item["answer"]

    return (
        "I can help with Skillswap basics: creating an account, finding skills, setting up a swap, "
        "messaging partners, and understanding verified reviews. What would you like to do first?"
    )


class ChatbotHandler(BaseHTTPRequestHandler):
    def _send_headers(self, status=200):
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_OPTIONS(self):
        self._send_headers(204)

    def do_GET(self):
        if self.path == "/api/health":
            self._send_headers()
            self.wfile.write(json.dumps({"status": "ok"}).encode("utf-8"))
            return

        self._send_headers(404)
        self.wfile.write(json.dumps({"error": "Route not found"}).encode("utf-8"))

    def do_POST(self):
        if self.path != "/api/chat":
            self._send_headers(404)
            self.wfile.write(json.dumps({"error": "Route not found"}).encode("utf-8"))
            return

        length = int(self.headers.get("Content-Length", 0))
        raw_body = self.rfile.read(length).decode("utf-8") if length else "{}"

        try:
            data = json.loads(raw_body)
        except json.JSONDecodeError:
            self._send_headers(400)
            self.wfile.write(json.dumps({"error": "Invalid JSON"}).encode("utf-8"))
            return

        message = str(data.get("message", ""))
        reply = build_reply(message)

        self._send_headers()
        self.wfile.write(json.dumps({"reply": reply}).encode("utf-8"))

    def log_message(self, format, *args):
        return


if __name__ == "__main__":
    server = ThreadingHTTPServer((HOST, PORT), ChatbotHandler)
    print(f"SkillSwap chatbot server running at http://{HOST}:{PORT}")
    print("Press Ctrl+C to stop.")
    server.serve_forever()
