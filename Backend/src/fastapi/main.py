from fastapi import FastAPI, HTTPException, Header
from pydantic import BaseModel
import requests
from PIL import Image
from io import BytesIO
import numpy as np
import joblib
from fastapi.middleware.cors import CORSMiddleware

# Load your trained .pkl model
model = joblib.load("model.pkl")  # Must exist inside fastapi/ or provide full path

# FastAPI app setup
app = FastAPI()

# CORS (for dev/testing)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Input schema
class ImageInput(BaseModel):
    image_url: str

# Prediction route
@app.post("/predict")
def predict_fish(input: ImageInput, Authorization: str = Header(...)):
    try:
        # Download the image
        response = requests.get(input.image_url)
        image = Image.open(BytesIO(response.content)).convert("RGB")

        # Preprocess image (resize and flatten)
        image = image.resize((224, 224))
        features = np.array(image).flatten().reshape(1, -1)

        # Prediction
        species = model.predict(features)[0]
        confidence = model.predict_proba(features).max() * 100

        return {
            "species": species,
            "confidence": round(confidence, 2)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")
