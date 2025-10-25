import os, uuid, io, base64
from flask import Blueprint, request, jsonify
from PIL import Image
from services.filters import apply_filter

bp = Blueprint("filters", __name__, url_prefix="/api/v1/filters")

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
TMP_DIR = os.path.abspath(os.environ.get("TMP_DIR", os.path.join(BASE_DIR, "tmp")))
os.makedirs(TMP_DIR, exist_ok=True)

def _decode_data_url(data_url: str) -> Image.Image:
    """Decode base64 data URL to PIL Image"""
    if "," not in data_url:
        raise ValueError("Invalid data URL")
    _, b64 = data_url.split(",", 1)
    raw = base64.b64decode(b64)
    return Image.open(io.BytesIO(raw)).convert("RGBA")

def _encode_to_data_url(image: Image.Image) -> str:
    """Encode PIL Image to base64 data URL"""
    buffer = io.BytesIO()
    image.save(buffer, format="PNG")
    b64 = base64.b64encode(buffer.getvalue()).decode()
    return f"data:image/png;base64,{b64}"

@bp.post("/apply")
def apply():
    """
    Apply filter to images
    
    Request body:
    {
        "images": ["data:image/png;base64,...", ...],  # Array of base64 data URLs
        "filterType": "grayscale" | "sepia" | "brightness" | "contrast" | "blur" | "sharpen",
        "intensity": 1.0  # Optional, default 1.0 (0.0 to 2.0)
    }
    
    Response:
    {
        "filteredImages": ["data:image/png;base64,...", ...]
    }
    """
    data = request.get_json(force=True) or {}
    images_data = data.get("images", [])
    filter_type = data.get("filterType")
    intensity = float(data.get("intensity", 1.0))
    
    # Validation
    if not isinstance(images_data, list) or len(images_data) == 0:
        return jsonify(error={"code": "bad_request", "message": "images array is required"}), 400
    
    if filter_type not in ["grayscale", "sepia", "brightness", "contrast", "blur", "sharpen"]:
        return jsonify(error={"code": "bad_request", "message": "Invalid filterType"}), 400
    
    if not (0.0 <= intensity <= 2.0):
        return jsonify(error={"code": "bad_request", "message": "intensity must be between 0.0 and 2.0"}), 400
    
    try:
        # Decode images
        images = [_decode_data_url(img_data) for img_data in images_data]
        
        # Apply filter to each image
        filtered_images = [apply_filter(img, filter_type, intensity) for img in images]
        
        # Encode back to data URLs
        filtered_data = [_encode_to_data_url(img) for img in filtered_images]
        
        return jsonify(filteredImages=filtered_data)
    
    except Exception as e:
        return jsonify(error={"code": "processing_error", "message": str(e)}), 500

@bp.get("/types")
def get_filter_types():
    """Get available filter types"""
    return jsonify(filters=[
        {
            "id": "grayscale",
            "name": "Black & White",
            "description": "Convert to grayscale",
            "defaultIntensity": 1.0,
            "minIntensity": 0.0,
            "maxIntensity": 1.0
        },
        {
            "id": "sepia",
            "name": "Sepia",
            "description": "Vintage brown tone",
            "defaultIntensity": 1.0,
            "minIntensity": 0.0,
            "maxIntensity": 1.0
        },
        {
            "id": "brightness",
            "name": "Brightness",
            "description": "Adjust brightness",
            "defaultIntensity": 1.0,
            "minIntensity": 0.5,
            "maxIntensity": 1.5
        },
        {
            "id": "contrast",
            "name": "Contrast",
            "description": "Adjust contrast",
            "defaultIntensity": 1.0,
            "minIntensity": 0.5,
            "maxIntensity": 1.5
        },
        {
            "id": "blur",
            "name": "Blur",
            "description": "Apply blur effect",
            "defaultIntensity": 1.0,
            "minIntensity": 0.0,
            "maxIntensity": 3.0
        },
        {
            "id": "sharpen",
            "name": "Sharpen",
            "description": "Sharpen image",
            "defaultIntensity": 1.0,
            "minIntensity": 0.0,
            "maxIntensity": 1.0
        }
    ])
