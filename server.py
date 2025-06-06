from http.server import HTTPServer, SimpleHTTPRequestHandler
import json
import os
from urllib.parse import parse_qs, urlparse

class MovieFinderHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path.startswith('/api/profile/'):
            self.handle_get_profile()
        else:
            # Serve static files
            return SimpleHTTPRequestHandler.do_GET(self)

    def do_POST(self):
        if self.path.startswith('/api/profile/'):
            self.handle_post_profile()
        else:
            self.send_error(404)

    def handle_get_profile(self):
        try:
            # Extract user ID from path
            user_id = self.path.split('/')[-1]
            
            # Read database
            if os.path.exists('database.json'):
                with open('database.json', 'r') as f:
                    db = json.load(f)
                    user = next((u for u in db['users'] if u['id'] == user_id), None)
                    
                    if user:
                        self.send_response(200)
                        self.send_header('Content-type', 'application/json')
                        self.send_header('Access-Control-Allow-Origin', '*')
                        self.end_headers()
                        self.wfile.write(json.dumps(user).encode())
                    else:
                        self.send_error(404, 'Profile not found')
            else:
                self.send_error(404, 'Database not found')
        except Exception as e:
            self.send_error(500, str(e))

    def handle_post_profile(self):
        try:
            # Extract user ID from path
            user_id = self.path.split('/')[-1]
            
            # Read request body
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            profile_data = json.loads(post_data.decode('utf-8'))
            
            # Read database
            if os.path.exists('database.json'):
                with open('database.json', 'r') as f:
                    db = json.load(f)
            else:
                db = {'users': []}
            
            # Update or create user
            user_index = next((i for i, u in enumerate(db['users']) if u['id'] == user_id), -1)
            if user_index == -1:
                profile_data['id'] = user_id
                db['users'].append(profile_data)
            else:
                db['users'][user_index].update(profile_data)
            
            # Save database
            with open('database.json', 'w') as f:
                json.dump(db, f, indent=2)
            
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({'message': 'Profile saved successfully'}).encode())
        except Exception as e:
            self.send_error(500, str(e))

def run(server_class=HTTPServer, handler_class=MovieFinderHandler, port=8000):
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
    print(f'Starting server on port {port}...')
    httpd.serve_forever()

if __name__ == '__main__':
    run() 