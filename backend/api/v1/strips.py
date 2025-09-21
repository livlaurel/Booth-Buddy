import os, uuid
from pathlib import Path
from flask import Blueprint, request, jsonify, send_file
from PIL import Image
from services.compose import compose_vertical_strip

bp = Blueprint("strips", __name__, url_prefix="/api/v1/strips")

@bp.post("/compose")
def compose():
    data = request.get_json(silent=True) or {}
    frames = data.get("frames") or []
    frame_width = data.get("frameWidth")
    try:
        img: Image.Image = compose_vertical_strip(frames, frame_width=frame_width)
    except Exception as e:
        return jsonify(error={"code": "bad_request", "message": str(e)}), 400

    strip_id = str(uuid.uuid4())
    tmp_dir = Path(os.getenv("STRIP_TMP_DIR", "./tmp"))
    tmp_dir.mkdir(parents=True, exist_ok=True)
    out_path = tmp_dir / f"{strip_id}.png"
    img.save(out_path, "PNG")

    return jsonify(stripId=strip_id, previewUrl=f"/api/v1/strips/preview/{strip_id}")

@bp.get("/preview/<strip_id>")
def preview(strip_id: str):
    path = Path(os.getenv("STRIP_TMP_DIR", "./tmp")) / f"{strip_id}.png"
    if not path.exists():
        return jsonify(error={"code": "not_found", "message": "strip not found"}), 404
    return send_file(path, mimetype="image/png")
