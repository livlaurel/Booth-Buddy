import os
from supabase import create_client, Client

def init_supabase() -> Client:
    url = os.getenv("SUPABASE_URL", "https://vjzibnfklccsaclrxegu.supabase.co")
    key = os.getenv("SUPABASE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqemlibmZrbGNjc2FjbHJ4ZWd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0NDMxMjIsImV4cCI6MjA3NzAxOTEyMn0.BM0eiy4809idiIcxZlYOQW4cM7XI7QVu75FbZRMVlrY")
    
    if not url or not key:
        raise ValueError("Supabase credentials missing")
    return create_client(url, key)

supabase = init_supabase()

def upload_strip(file_path: str, user_id: str) -> dict:
    file_name = os.path.basename(file_path)
    storage_path = f"{user_id}/{file_name}"
    
    with open(file_path, "rb") as f:
        res = supabase.storage.from_("strips").upload(storage_path, f)
    
    public_url = get_public_url(storage_path)
    return {"path": storage_path, "url": public_url}

def delete_strip(storage_path: str) -> bool:
    try:
        supabase.storage.from_("strips").remove([storage_path])
        return True
    except Exception as e:
        print(f"Delete failed: {e}")
        return False

def list_user_strips(user_id: str) -> list:
    try:
        files = supabase.storage.from_("strips").list(path=user_id)
        return [{"name": f["name"], "id": f["id"]} for f in files]
    except:
        return []

def get_public_url(storage_path: str) -> str:
    return supabase.storage.from_("strips").get_public_url(storage_path)
