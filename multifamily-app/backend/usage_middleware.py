from supabase import create_client
import os
from datetime import datetime
from dotenv import load_dotenv
from flask import request, jsonify
from functools import wraps

# Load environment variables from .env file
load_dotenv()

supabase = create_client(
    os.getenv('SUPABASE_URL'), 
    os.getenv('SUPABASE_SERVICE_KEY')
)

def get_current_month():
    return datetime.now().strftime('%Y-%m')

def get_user_limits(user_id):
    """Get user's subscription limits"""
    try:
        result = supabase.table('profiles').select('subscription_plan, subscription_status').eq('id', user_id).single().execute()
        if not result.data:
            return None
        plan = result.data['subscription_plan']
        status = result.data['subscription_status']
        limits_result = supabase.table('subscription_limits').select('*').eq('plan_name', plan).single().execute()
        limits_data = limits_result.data if limits_result and hasattr(limits_result, 'data') else None
        limits = limits_data if limits_data else {}
        return {
            **limits,
            'user_plan': plan,
            'status': status
        }
    except Exception as e:
        print(f"Error getting user limits: {e}")
        return None

def get_user_usage(user_id):
    """Get current month's usage for user"""
    try:
        current_month = get_current_month()
        # Try to fetch usage record for this user and month
        result = supabase.table('user_usage').select('*').eq('user_id', user_id).eq('month_year', current_month).execute()
        data = result.data if hasattr(result, 'data') else None
        if data and len(data) > 0:
            # Return the first (should be only) record
            return data[0]
        # If no record exists, insert a new one
        initial_usage = {
            'user_id': user_id,
            'month_year': current_month,
            'om_pdfs_parsed': 0,
            'pages_processed': 0,
            'underwriting_sessions': 0
        }
        supabase.table('user_usage').insert(initial_usage).execute()
        return initial_usage
    except Exception as e:
        print(f"Error getting user usage: {e}")
        return {'om_pdfs_parsed': 0, 'pages_processed': 0, 'underwriting_sessions': 0}

def increment_usage(user_id, usage_type, amount=1):
    """Increment usage counter for specific type"""
    try:
        current_month = get_current_month()
        current_usage = get_user_usage(user_id)
        
        # Build update data with proper field names
        update_data = {
            'user_id': user_id,
            'month_year': current_month,
            'om_pdfs_parsed': current_usage.get('om_pdfs_parsed', 0),
            'pages_processed': current_usage.get('pages_processed', 0),
            'underwriting_sessions': current_usage.get('underwriting_sessions', 0)
        }
        
        # Increment the specific usage type
        if usage_type in update_data:
            update_data[usage_type] += amount
        else:
            print(f"Invalid usage type: {usage_type}")
            return False
        
        supabase.table('user_usage').upsert(update_data, on_conflict='user_id,month_year').execute()
        return True
    except Exception as e:
        print(f"Error incrementing usage: {e}")
        return False

def check_user_access(user_id, feature_type='upload'):
    """
    Check if user has access to feature and hasn't exceeded limits
    
    Args:
        user_id: User's ID
        feature_type: 'upload', 'manual', 'pfa'
    
    Returns:
        tuple: (allowed: bool, error_message: str, remaining: int, plan: str)
    """
    try:
        # Get user limits
        limits = get_user_limits(user_id)
        if not limits:
            return False, "No active subscription found. Please check your subscription status.", 0, 'none'
        
        plan = limits.get('user_plan', 'starter')
        
        # Check plan access
        if plan == 'starter':
            if feature_type == 'upload':
                return False, "AI Document Analysis requires Pro or Power plan. Please upgrade to access this feature.", 0, plan
            elif feature_type == 'pfa':
                return False, "Property Financial Analysis requires Pro or Power plan. Please upgrade to access this feature.", 0, plan
            # Manual underwriting is allowed for all plans
        
        # For Pro users, check PDF parsing limits
        if plan == 'pro' and feature_type == 'upload':
            usage = get_user_usage(user_id)
            current_pdfs = usage.get('om_pdfs_parsed', 0)
            max_pdfs = limits.get('max_pdfs_per_month', 15)
            
            if current_pdfs >= max_pdfs:
                return False, f"Monthly PDF limit reached ({current_pdfs}/{max_pdfs}). Upgrade to Power for unlimited processing.", 0, plan
            
            remaining = max_pdfs - current_pdfs
            return True, "", remaining, plan
        
        # Power users have unlimited access
        if plan == 'power':
            return True, "", -1, plan  # -1 means unlimited
        
        # Pro users for manual and PFA have access
        if plan == 'pro' and feature_type in ['manual', 'pfa']:
            return True, "", -1, plan
        
        return True, "", -1, plan
        
    except Exception as e:
        print(f"Error checking user access: {e}")
        return False, "Error checking subscription status. Please try again.", 0, 'error'

def require_subscription(feature_type='upload'):
    """
    Decorator to enforce subscription limits on routes
    
    Usage:
        @require_subscription('upload')
        def my_route():
            ...
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # Get user_id from request
            user_id = None
            if request.method == 'POST':
                user_id = request.form.get('user_id') or request.json.get('user_id') if request.is_json else None
            elif request.method == 'GET':
                user_id = request.args.get('user_id')
            
            if not user_id:
                return jsonify({
                    'error': 'Authentication required',
                    'code': 'USER_ID_REQUIRED'
                }), 401
            
            # Check access
            allowed, error_msg, remaining, plan = check_user_access(user_id, feature_type)
            if not allowed:
                return jsonify({
                    'error': error_msg,
                    'code': 'SUBSCRIPTION_REQUIRED',
                    'current_plan': plan,
                    'required_feature': feature_type
                }), 403
            
            # Add user info to request for use in route
            request.subscription_info = {
                'user_id': user_id,
                'plan': plan,
                'remaining': remaining,
                'feature_type': feature_type
            }
            
            return f(*args, **kwargs)
        return decorated_function
    return decorator

def track_usage_after_success(user_id, feature_type, additional_data=None):
    """
    Track usage after successful operation
    
    Args:
        user_id: User's ID
        feature_type: 'upload', 'manual', 'pfa'
        additional_data: Dict with additional tracking info like pages_count
    """
    try:
        if feature_type == 'upload':
            # Track PDF parsing
            increment_usage(user_id, 'om_pdfs_parsed', 1)
            
            # Track pages processed if provided
            if additional_data and 'pages_count' in additional_data:
                increment_usage(user_id, 'pages_processed', additional_data['pages_count'])
        
        elif feature_type in ['manual', 'pfa']:
            # Track underwriting sessions
            increment_usage(user_id, 'underwriting_sessions', 1)
        
        return True
    except Exception as e:
        print(f"Error tracking usage: {e}")
        return False

def get_usage_summary(user_id):
    """Get usage summary for user dashboard"""
    try:
        limits = get_user_limits(user_id)
        usage = get_user_usage(user_id)
        
        if not limits:
            return None
        
        plan = limits.get('user_plan', 'starter')
        
        summary = {
            'plan': plan,
            'status': limits.get('status'),
            'current_month': get_current_month(),
            'usage': {
                'om_pdfs_parsed': usage.get('om_pdfs_parsed', 0),
                'pages_processed': usage.get('pages_processed', 0),
                'underwriting_sessions': usage.get('underwriting_sessions', 0)
            }
        }
        
        # Add limits for Pro users
        if plan == 'pro':
            summary['limits'] = {
                'max_pdfs_per_month': limits.get('max_pdfs_per_month', 15),
                'max_pages_per_pdf': limits.get('max_pages_per_pdf', 25)
            }
            
            summary['remaining'] = {
                'pdfs': max(0, summary['limits']['max_pdfs_per_month'] - summary['usage']['om_pdfs_parsed'])
            }
        
        return summary
    except Exception as e:
        print(f"Error getting usage summary: {e}")
        return None

# Example route implementations

def create_protected_routes(app):
    """
    Example of how to implement protected routes
    """
    
    @app.route('/api/ocr/underwrite', methods=['POST'])
    @require_subscription('upload')
    def ocr_underwrite():
        try:
            user_id = request.subscription_info['user_id']
            plan = request.subscription_info['plan']
            remaining = request.subscription_info['remaining']
            
            # Get file and pages
            file = request.files.get('file')
            pages = request.form.get('pages', '')
            
            if not file:
                return jsonify({'error': 'No file uploaded'}), 400
            
            # Process the PDF (your existing logic here)
            # result = process_pdf_underwriting(file, pages)
            result = {'message': 'PDF processed successfully'}  # Placeholder
            
            # Count pages for tracking
            pages_count = len(pages.split(',')) if pages else 1
            
            # Track usage AFTER successful processing
            track_usage_after_success(user_id, 'upload', {'pages_count': pages_count})
            
            response_data = {
                'success': True,
                'parsed': result
            }
            
            # Add remaining count for Pro users
            if plan == 'pro' and remaining > 0:
                response_data['remaining_pdfs'] = remaining - 1  # Subtract the one just used
            
            return jsonify(response_data)
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    @app.route('/api/manual/underwrite', methods=['POST'])
    @require_subscription('manual')
    def manual_underwrite():
        try:
            user_id = request.subscription_info['user_id']
            
            # Your manual underwriting logic here
            # result = process_manual_underwriting(request.json)
            result = {'message': 'Manual underwriting completed'}  # Placeholder
            
            # Track usage
            track_usage_after_success(user_id, 'manual')
            
            return jsonify({
                'success': True,
                'result': result
            })
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    @app.route('/api/health-check/verify', methods=['POST'])
    @require_subscription('pfa')
    def pfa_verify():
        try:
            user_id = request.subscription_info['user_id']
            
            # Your PFA verification logic here
            # result = process_pfa_verification(request.files, request.form)
            result = {'message': 'PFA verification completed'}  # Placeholder
            
            return jsonify({
                'success': True,
                'verification': result
            })
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    @app.route('/api/health-check/analyze', methods=['POST'])
    @require_subscription('pfa')
    def pfa_analyze():
        try:
            user_id = request.subscription_info['user_id']
            
            # Your PFA analysis logic here
            # result = process_pfa_analysis(request.json)
            result = {'message': 'PFA analysis completed'}  # Placeholder
            
            # Track usage
            track_usage_after_success(user_id, 'pfa')
            
            return jsonify({
                'success': True,
                'health_check': result
            })
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    @app.route('/api/user/usage', methods=['GET'])
    def get_user_usage_summary():
        """Get usage summary for user dashboard"""
        try:
            user_id = request.args.get('user_id')
            if not user_id:
                return jsonify({'error': 'User ID required'}), 401
            
            summary = get_usage_summary(user_id)
            if not summary:
                return jsonify({'error': 'Unable to get usage summary'}), 500
            
            return jsonify(summary)
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500

# Utility function to test subscription system
def test_subscription_system():
    """Test function to verify subscription system is working"""
    print("Testing subscription system...")
    
    # Test with dummy user ID
    test_user_id = "test-user-123"
    
    # Test getting limits
    limits = get_user_limits(test_user_id)
    print(f"Limits: {limits}")
    
    # Test getting usage
    usage = get_user_usage(test_user_id)
    print(f"Usage: {usage}")
    
    # Test access check
    allowed, error, remaining, plan = check_user_access(test_user_id, 'upload')
    print(f"Access check: allowed={allowed}, error='{error}', remaining={remaining}, plan={plan}")
    
    print("Subscription system test completed.")

if __name__ == "__main__":
    test_subscription_system()