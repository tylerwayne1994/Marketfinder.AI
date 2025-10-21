# usage_tracker.py - Track page usage for subscription limits
import os
from datetime import datetime
from typing import Optional
from supabase import create_client

def get_supabase_client():
    """Initialize Supabase client"""
    supabase_url = os.getenv("SUPABASE_URL")
    # Use service role key for backend operations (bypasses RLS)
    supabase_key = os.getenv("SUPABASE_SERVICE_KEY") or os.getenv("SUPABASE_ANON_KEY")
    
    if not supabase_url or not supabase_key:
        print("[WARNING] Supabase credentials not found, usage tracking disabled")
        return None
    
    return create_client(supabase_url, supabase_key)

async def increment_page_usage(user_id: str, pages_count: int, service: str = "upload") -> bool:
    """
    Increment page usage for a user in Supabase
    
    Args:
        user_id: The user's ID
        pages_count: Number of pages processed
        service: Which service processed the pages ('upload' or 'pfa')
    
    Returns:
        bool: True if successful, False otherwise
    """
    try:
        print(f"[Usage Tracker] Starting tracking for user {user_id}, pages: {pages_count}, service: {service}")
        
        supabase = get_supabase_client()
        if not supabase:
            print(f"[Usage Tracker] Supabase not configured, skipping tracking for user {user_id}")
            return False
        
        # Get current month/year
        now = datetime.now()
        month_year = now.strftime("%Y-%m")
        
        print(f"[Usage Tracker] Querying for user_id={user_id}, month_year={month_year}")
        
        # Try to get existing usage record
        response = supabase.table("user_usage").select("*").eq("user_id", user_id).eq("month_year", month_year).execute()
        
        print(f"[Usage Tracker] Query response: {response.data}")
        
        if response.data and len(response.data) > 0:
            # Update existing record
            existing_record = response.data[0]
            new_pages_processed = existing_record.get("pages_processed", 0) + pages_count
            
            # Increment appropriate counter based on service
            if service == "pfa":
                # PFA only increments pages_processed
                update_data = {
                    "pages_processed": new_pages_processed,
                    "updated_at": now.isoformat()
                }
            else:  # upload/underwriting
                new_om_count = existing_record.get("om_pdfs_parsed", 0) + 1
                new_sessions = existing_record.get("underwriting_sessions", 0) + 1
                update_data = {
                    "pages_processed": new_pages_processed,
                    "om_pdfs_parsed": new_om_count,
                    "underwriting_sessions": new_sessions,
                    "updated_at": now.isoformat()
                }
            
            print(f"[Usage Tracker] Updating existing record with data: {update_data}")
            result = supabase.table("user_usage").update(update_data).eq("user_id", user_id).eq("month_year", month_year).execute()
            print(f"[Usage Tracker] Update result: {result}")
            print(f"[Usage Tracker] Updated user {user_id}: +{pages_count} pages (service: {service}, total: {new_pages_processed})")
        else:
            # Create new record for this month
            if service == "pfa":
                new_record = {
                    "user_id": user_id,
                    "month_year": month_year,
                    "pages_processed": pages_count,
                    "om_pdfs_parsed": 0,
                    "underwriting_sessions": 0,
                    "updated_at": now.isoformat()
                }
            else:  # upload/underwriting
                new_record = {
                    "user_id": user_id,
                    "month_year": month_year,
                    "pages_processed": pages_count,
                    "om_pdfs_parsed": 1,
                    "underwriting_sessions": 1,
                    "updated_at": now.isoformat()
                }
            
            print(f"[Usage Tracker] Inserting new record: {new_record}")
            result = supabase.table("user_usage").insert(new_record).execute()
            print(f"[Usage Tracker] Insert result: {result}")
            print(f"[Usage Tracker] Created new usage record for user {user_id}: {pages_count} pages (service: {service})")
        
        return True
        
    except Exception as e:
        print(f"[Usage Tracker ERROR] Failed to track usage for user {user_id}: {str(e)}")
        return False

def count_pdf_pages(pdf_bytes: bytes) -> int:
    """Count pages in a PDF file"""
    try:
        from pypdf import PdfReader
        from io import BytesIO
        
        reader = PdfReader(BytesIO(pdf_bytes))
        return len(reader.pages)
    except Exception as e:
        print(f"[Usage Tracker] Error counting PDF pages: {str(e)}")
        return 1  # Default to 1 if can't count

def count_pages_from_file(file_bytes: bytes, content_type: str) -> int:
    """
    Count pages from uploaded file based on content type
    
    Args:
        file_bytes: The file content
        content_type: MIME type of the file
    
    Returns:
        int: Number of pages
    """
    if content_type == "application/pdf":
        return count_pdf_pages(file_bytes)
    elif content_type.startswith("image/"):
        return 1  # Images count as 1 page
    else:
        return 1  # Default to 1 page for unknown types
