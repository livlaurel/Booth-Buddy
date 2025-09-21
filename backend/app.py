import os
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

def create_app():
    load_dotenv()
    app = Flask(__name__)
    CORS(app, resources={r"/api/*": {"origins": os.getenv("ALLOWED_ORIGINS","http://localhost:5173")}})
    app.config["MAX_CONTENT_LENGTH"] = 10 * 1024 * 1024

    @app.get("/api/health")
    def health():
        return jsonify(status="ok", version="0.1.0")

    try:
        from api.v1.strips import bp as strips_bp
        app.register_blueprint(strips_bp)
    except Exception:
        pass

    return app

app = create_app()

if __name__ == "__main__":
    app.run(debug=True)
