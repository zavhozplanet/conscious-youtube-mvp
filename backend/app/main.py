from fastapi import FastAPI
from app.api import routes
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Conscious YouTube API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For MVP, allow all. In prod, restrict to WebApp domain.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(routes.router)

@app.get("/")
async def root():
    return {"message": "Conscious YouTube Backend is running"}
