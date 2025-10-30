import os
from flask import Blueprint, request, jsonify
from services.supabase_storage import upload_strip, delete_strip, list_user_strips

bp = Blueprint("storage", __name__, url_prefix="/api/v1/storage")

@bp.post("/upload")
def upload_to_supabase():
    data = request.get_json(force=True)
    user_id = data.get("user_id", "guest")
    strip_id = data.get("strip_id")

    if not strip_id:
        return jsonify(error="strip_id is required"), 400

    tmp_dir = os.path.join(os.path.dirname(__file__), "..", "..", "tmp")
    file_path = os.path.join(tmp_dir, f"{strip_id}.png")

    if not os.path.exists(file_path):
        return jsonify(error="Local strip not found"), 404

    try:
        result = upload_strip(file_path, user_id)
        os.remove(file_path)
        return jsonify(success=True, data=result)
    except Exception as e:
        return jsonify(success=False, error=str(e)), 500

@bp.get("/user/<user_id>/strips")
def list_user_files(user_id):
    try:
        files = list_user_strips(user_id)
        return jsonify(count=len(files), items=files)
    except Exception as e:
        return jsonify(error=str(e)), 500

@bp.delete("/<path:storage_path>")
def delete_from_supabase(storage_path):
    try:
        success = delete_strip(storage_path)
        return jsonify(success=success)
    except Exception as e:
        return jsonify(success=False, error=str(e)), 500
