import os, uuid
from flask import Blueprint, request, jsonify, send_file, abort
from services.compose import compose_vertical_strip

bp = Blueprint("strips", __name__, url_prefix="/api/v1/strips")

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
TMP_DIR = os.path.abspath(os.environ.get("TMP_DIR", os.path.join(BASE_DIR, "backend", "tmp")))
os.makedirs(TMP_DIR, exist_ok=True)

@bp.post("/compose")
def compose():
    data = request.get_json(force=True) or {}
    frames = data.get("frames")
    frame_width = data.get("frameWidth")
    padding = data.get("padding", 16)
    if not isinstance(frames, list) or len(frames) != 4:
        return jsonify(error={"code": "bad_request", "message": "Exactly 4 frames are required"}), 400
    img = compose_vertical_strip(frames, frame_width=frame_width, padding=padding)
    sid = str(uuid.uuid4())
    out_path = os.path.join(TMP_DIR, f"{sid}.png")
    img.save(out_path, format="PNG", optimize=True)
    return jsonify(stripId=sid, previewUrl=f"/api/v1/strips/preview/{sid}")

@bp.get("/preview/<strip_id>")
def preview(strip_id):
    fn = os.path.join(TMP_DIR, f"{strip_id}.png")
    if not os.path.isfile(fn):
        abort(404)
    return send_file(fn, mimetype="image/png", as_attachment=False, max_age=0)
