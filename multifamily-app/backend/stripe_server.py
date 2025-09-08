
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import uvicorn
from stripe_checkout import router as checkout_router
from stripe_webhook import router as webhook_router

# Load environment variables
load_dotenv()

app = FastAPI(title="Stripe Server", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(checkout_router, prefix="/api")
app.include_router(webhook_router, prefix="/api")

if __name__ == "__main__":
    uvicorn.run("stripe_server:app", host="127.0.0.1", port=8012, reload=True)