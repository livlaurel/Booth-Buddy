import os
from supabase import create_client, Client
from datetime import datetime

def init_supabase() -> Client:
    url = os.getenv("SUPABASE_URL", "https://vjzibnfklccsaclrxegu.supabase.co")
    key = os.getenv("SUPABASE_KEY", "your-actual-key-here")
    if not url or not key:
        raise ValueError("Supabase credentials missing")
    return create_client(url, key)

supabase = init_supabase()

def get_public_url(storage_path: str) -> str:
    return supabase.storage.from_("strips").get_public_url(storage_path)

def upload_strip(filepath: str, user_id: str) -> dict:
    filename = os.path.basename(filepath)
    storage_path = f"{user_id}/{filename}"
    
    with open(filepath, "rb") as f:
        res = supabase.storage.from_("strips").upload(storage_path, f)
    
    public_url = get_public_url(storage_path)
    
    # Log to database table
    try:
        supabase.table("strips").insert({
            "user_id": user_id,
            "filename": filename,
            "storage_path": storage_path,
            "public_url": public_url,
            "created_at": datetime.now().isoformat()
        }).execute()
        print(f"✅ Logged strip to database: {filename}")
    except Exception as e:
        print(f"⚠️ Could not log to database: {e}")
    
    return {"path": storage_path, "url": public_url}

def delete_strip(storage_path: str) -> bool:
    try:
        supabase.storage.from_("strips").remove([storage_path])
        # Also delete from database
        supabase.table("strips").delete().eq("storage_path", storage_path).execute()
        return True
    except Exception as e:
        print(f"Delete failed: {e}")
        return False

def list_user_strips(user_id: str) -> list:
    """List all strips for a user from the database table"""
    try:
        response = supabase.table("strips").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
        return response.data if response.data else []
    except Exception as e:
        print(f"Database query error: {e}")
        return []
