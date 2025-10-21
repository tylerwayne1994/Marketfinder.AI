# backend/delete_user.py
from fastapi import APIRouter, Request, HTTPException
import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

supabase = create_client(
    os.getenv('SUPABASE_URL'),
    os.getenv('SUPABASE_SERVICE_KEY')
)

@router.post('/delete-user')
async def delete_user(request: Request):
    body = await request.json()
    user_id = body.get('user_id')
    if not user_id:
        raise HTTPException(status_code=400, detail='Missing user_id')
    try:
        # Delete from profiles table
        supabase.table('profiles').delete().eq('id', user_id).execute()
        # Delete from auth (requires service key)
        resp = supabase.auth.admin.delete_user(user_id)
        if hasattr(resp, 'error') and resp.error:
            raise Exception(resp.error)
        return {'success': True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
