import socket
import threading
import json
from datetime import datetime
from urllib.parse import parse_qs, urlparse


class CrudeServer:
    """
    A simple HTTP server implementation from scratch using Python sockets.
    Supports basic GET and POST requests with JSON responses.
    """

    def __init__(self, host="localhost", port=8080):
        self.host = host
        self.port = port
        self.data_store = {}  # Simple in-memory data storage

    def start(self):
        """Start the server and listen for connections"""
        server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        server_socket.bind((self.host, self.port))
        server_socket.listen(5)

        print(f"Server running on http://{self.host}:{self.port}")
        print("Press Ctrl+C to stop")

        try:
            while True:
                client_socket, address = server_socket.accept()
                client_thread = threading.Thread(
                    target=self.handle_client, args=(client_socket,)
                )
                client_thread.start()
        except KeyboardInterrupt:
            print("\nShutting down server...")
            server_socket.close()

    def handle_client(self, client_socket):
        """Handle individual client connections"""
        try:
            request = client_socket.recv(4096).decode("utf-8")

            if not request:
                return

            response = self.process_request(request)
            client_socket.sendall(response.encode("utf-8"))

        except Exception as e:
            error_response = self.build_response(
                500, {"error": str(e)}, "Internal Server Error"
            )
            client_socket.sendall(error_response.encode("utf-8"))
        finally:
            client_socket.close()

    def process_request(self, request):
        """Parse HTTP request and route to appropriate handler"""
        lines = request.split("\r\n")
        request_line = lines[0].split()

        if len(request_line) < 3:
            return self.build_response(400, {"error": "Bad Request"}, "Bad Request")

        method = request_line[0]
        path = request_line[1]

        # Parse body for POST requests
        body = None
        if method == "POST":
            try:
                body_start = request.index("\r\n\r\n") + 4
                body = request[body_start:]
            except ValueError:
                pass

        # Route handling
        if path == "/" and method == "GET":
            return self.handle_root()
        elif path == "/health" and method == "GET":
            return self.handle_health()
        elif path.startswith("/api/data") and method == "GET":
            return self.handle_get_data(path)
        elif path == "/api/data" and method == "POST":
            return self.handle_post_data(body)
        else:
            return self.build_response(404, {"error": "Not Found"}, "Not Found")

    def handle_root(self):
        """Root endpoint - server info"""
        data = {
            "message": "Crude Server is running",
            "version": "1.0",
            "timestamp": datetime.now().isoformat(),
            "endpoints": {
                "GET /": "Server information",
                "GET /health": "Health check",
                "GET /api/data": "Get all stored data",
                "GET /api/data?key=<key>": "Get specific data by key",
                "POST /api/data": "Store data (JSON body with key and value)",
            },
        }
        return self.build_response(200, data, "OK")

    def handle_health(self):
        """Health check endpoint"""
        data = {"status": "healthy", "timestamp": datetime.now().isoformat()}
        return self.build_response(200, data, "OK")

    def handle_get_data(self, path):
        """GET endpoint to retrieve stored data"""
        parsed_url = urlparse(path)
        query_params = parse_qs(parsed_url.query)

        if "key" in query_params:
            key = query_params["key"][0]
            if key in self.data_store:
                data = {"key": key, "value": self.data_store[key]}
                return self.build_response(200, data, "OK")
            else:
                return self.build_response(
                    404, {"error": f'Key "{key}" not found'}, "Not Found"
                )
        else:
            data = {"data": self.data_store, "count": len(self.data_store)}
            return self.build_response(200, data, "OK")

    def handle_post_data(self, body):
        """POST endpoint to store data"""
        if not body:
            return self.build_response(
                400, {"error": "No body provided"}, "Bad Request"
            )

        try:
            data = json.loads(body)
            if "key" not in data or "value" not in data:
                return self.build_response(
                    400,
                    {"error": 'Body must contain "key" and "value" fields'},
                    "Bad Request",
                )

            self.data_store[data["key"]] = data["value"]
            response_data = {
                "message": "Data stored successfully",
                "key": data["key"],
                "value": data["value"],
            }
            return self.build_response(201, response_data, "Created")

        except json.JSONDecodeError:
            return self.build_response(400, {"error": "Invalid JSON"}, "Bad Request")

    def build_response(self, status_code, data, status_text):
        """Build HTTP response with proper headers"""
        body = json.dumps(data, indent=2)

        response = f"HTTP/1.1 {status_code} {status_text}\r\n"
        response += "Content-Type: application/json\r\n"
        response += f"Content-Length: {len(body)}\r\n"
        response += "Connection: close\r\n"
        response += "\r\n"
        response += body

        return response


if __name__ == "__main__":
    server = CrudeServer(host="localhost", port=8080)
    server.start()
