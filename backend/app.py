import os, glob, time
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from werkzeug.exceptions import HTTPException

def create_app():
    load_dotenv()
    app = Flask(__name__)
    CORS(app, resources={r"/api/*": {"origins": os.getenv("ALLOWED_ORIGINS", "http://localhost:5173")}})
    app.config["MAX_CONTENT_LENGTH"] = 10 * 1024 * 1024

    @app.get("/api/health")
    def health():
        return jsonify(status="ok", version="0.1.0")

    from api.v1.strips import bp as strips_bp
    from api.v1.filters import bp as filters_bp
    app.register_blueprint(strips_bp)
    app.register_blueprint(filters_bp)

    @app.errorhandler(HTTPException)
    def http_err(e):
        return jsonify(error={"code": e.name, "message": e.description}), e.code

    @app.errorhandler(Exception)
    def any_err(e):
        app.logger.exception("Unhandled error")
        return jsonify(error={"code": "internal_error", "message": "Something went wrong"}), 500

    @app.cli.command("cleanup")
    def cleanup():
        tmp_dir = os.environ.get("TMP_DIR", os.path.join(os.path.dirname(__file__), "tmp"))
        now = time.time()
        removed = 0
        for p in glob.glob(os.path.join(tmp_dir, "*.png")):
            if now - os.path.getmtime(p) > 24 * 3600:
                os.remove(p); removed += 1
        print(f"Removed {removed} files")

    return app

app = create_app()

if __name__ == "__main__":
    app.run(debug=True)
from api.v1.storage import bp as storage_bp
app.register_blueprint(storage_bp)
