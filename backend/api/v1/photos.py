import os
import uuid
from flask import Blueprint, request, jsonify
from services.supabase_client import supabase
from datetime import datetime

bp = Blueprint("photos", __name__, url_prefix="/api/v1/photos")

@bp.post("/save")
def save_photos():
    """
    Save photo strip for a user
    
    Request body:
    {
        "userId": "firebase_user_id",
        "photos": ["data:image/png;base64,..."],
        "filterType": "grayscale" (optional)
    }
    """
    data = request.get_json(force=True) or {}
    user_id = data.get("userId")
    photos = data.get("photos", [])
    filter_type = data.get("filterType", "none")
    
    if not user_id:
        return jsonify(error={"code": "bad_request", "message": "userId is required"}), 400
    
    if not isinstance(photos, list) or len(photos) == 0:
        return jsonify(error={"code": "bad_request", "message": "photos array is required"}), 400
    
    try:
        # Save to Supabase
        photo_strip_id = str(uuid.uuid4())
        
        result = supabase.table("photo_strips").insert({
            "id": photo_strip_id,
            "user_id": user_id,
            "photos": photos,
            "filter_type": filter_type,
            "created_at": datetime.utcnow().isoformat()
        }).execute()
        
        return jsonify({
            "success": True,
            "photoStripId": photo_strip_id,
            "message": "Photos saved successfully"
        })
    
    except Exception as e:
        return jsonify(error={"code": "save_error", "message": str(e)}), 500

@bp.get("/user/<user_id>")
def get_user_photos(user_id):
    """
    Get all photo strips for a user
    """
    try:
        result = supabase.table("photo_strips")\
            .select("*")\
            .eq("user_id", user_id)\
            .order("created_at", desc=True)\
            .execute()
        
        return jsonify({
            "success": True,
            "photoStrips": result.data
        })
    
    except Exception as e:
        return jsonify(error={"code": "fetch_error", "message": str(e)}), 500

@bp.delete("/<photo_strip_id>")
def delete_photo_strip(photo_strip_id):
    """
    Delete a photo strip
    """
    try:
        result = supabase.table("photo_strips")\
            .delete()\
            .eq("id", photo_strip_id)\
            .execute()
        
        return jsonify({
            "success": True,
            "message": "Photo strip deleted successfully"
        })
    
    except Exception as e:
        return jsonify(error={"code": "delete_error", "message": str(e)}), 500
