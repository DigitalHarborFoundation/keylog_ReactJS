from fastapi import FastAPI
from routers import key
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# CORS will allow cross-origin requests from the frontend domain and port which will run at localhost:5173.
origins = [
    "http://localhost:5173",
    "localhost:5173"
]


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(key.router)
