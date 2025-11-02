# Marketfinder.AI Copilot Instructions

## Architecture Overview
This is a multi-service real estate underwriting platform with:
- **Frontend**: React app (create-react-app) in `multifamily-app/` with extensive market analysis features
- **API Layer**: Vercel serverless functions in `multifamily-app/api/` that proxy requests to deployed backends
- **Backend Services**: Two separate FastAPI applications:
  - Main underwriting service (`backend/app.py`) - handles document OCR and financial analysis on port 8010
  - Health check service (`backend/health_check_app.py`) - property health analysis on port 8011
- **Data**: Supabase for user/auth, Stripe for payments, extensive CSV datasets in `build/` for market analytics
- **AI Stack**: Mistral AI for OCR, Anthropic Claude for structured data extraction

## Service Boundaries & Data Flow
- Frontend communicates with Vercel functions via `/api/*` routes
- Vercel functions proxy to deployed backends on Render (marketfinder-ai.onrender.com)
- Local development requires running both FastAPI services simultaneously
- Document uploads → Mistral OCR → Claude parsing → structured underwriting data
- User subscriptions (starter/pro/power) enforced via Supabase with page/PDF limits

## Critical Developer Workflows

### Local Development Setup
```bash
# Backend (requires Python 3.10+, virtual environment)
cd multifamily-app/backend
python -m venv .venv311
.venv311\Scripts\Activate.ps1  # Windows PowerShell
pip install -r requirements.txt

# Run both services (separate terminals)
uvicorn app:app --host 127.0.0.1 --port 8010 --reload              # Main underwriting
uvicorn health_check_app:app --host 127.0.0.1 --port 8011 --reload # Health check

# Frontend (separate terminal)
cd multifamily-app
npm install
npm start  # Runs on localhost:3000
```

### Environment Variables
Required in `.env` file:
- `MISTRAL_API_KEY` - for document OCR
- `CLAUDE_API_KEY` - for data parsing
- `SUPABASE_URL` & `SUPABASE_ANON_KEY` - for auth/database
- `STRIPE_SECRET_KEY` - for payments

## Project-Specific Patterns

### AI Integration Pattern
```python
# backend/app.py:1017-1100
@app.post("/ocr/underwrite")
async def ocr_underwrite(
    file: UploadFile = File(...),
    financing_params: Optional[str] = Form(None)
):
    # 1. Validate file type/size
    # 2. Call Mistral OCR
    ocr_result = _call_mistral_ocr(file_bytes, file.content_type)
    ocr_text = ocr_result["pages"][0]["markdown"]  # Extract markdown
    
    # 3. Parse with Claude using structured schema
    parsed_data = _call_claude_parse_from_markdown(ocr_text, financing_params)
    
    return parsed_data
```

### CORS Configuration
Both FastAPI apps use identical CORS setup allowing localhost:3000 and production domains:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://terra-investai.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### File Upload Handling
- Supports PDF/images up to 50MB
- MIME validation against allowed types
- PDF page slicing for large documents
- Data URL encoding for AI API calls

### Subscription Enforcement
Frontend checks user plans via Supabase before allowing features:
```javascript
// src/hooks/useDocumentAccess.js
const { allowed, plan, remaining } = await checkAccess(userId, 'upload');
if (!allowed) showLimitModal();
```

## Key Files & Directories
- `backend/app.py` - Main underwriting API with OCR/Claude integration (port 8010)
- `backend/health_check_app.py` - Property health analysis service (port 8011)
- `backend/protected_routes.py` - User management and subscription endpoints
- `backend/parser_v4.py` - Underwriting document parser (OMs)
- `backend/health_check_parser.py` - Health check document parser
- `api/` - Vercel proxy functions for production deployment
- `src/UnderwritePage.js` - Main underwriting UI with file upload (uses port 8010)
- `src/PFA.js` - Property Financial Analysis UI (uses port 8011)
- `build/` - Static data files (CSVs) for market analysis and maps
- `src/components/` - Reusable React components for maps, charts, modals

## Common Gotchas
- Always run both FastAPI services locally (ports 8010 and 8011)
- Vercel functions proxy to production backends, not local services
- AI parsing uses specific JSON schemas defined in prompts
- Subscription limits are checked client-side but enforced server-side
- Environment variables must be set before starting any service
- UploadPage connects to port 8010, PFA connects to port 8011</content>
<parameter name="filePath">.github/copilot-instructions.md