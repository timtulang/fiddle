import base64
import cv2 as cv
import numpy as np
from fastapi import FastAPI
from pydantic import BaseModel
from starlette.responses import JSONResponse

# Import our helper functions and models
from cv_helpers import (
    load_labels,
    load_models,
    calc_landmark_list,
    pre_process_landmark
)

app = FastAPI()

# Load models and labels once at startup
hands_model, keypoint_classifier_model = load_models()
labels = load_labels()
print("Models and labels loaded.")

# This Pydantic model defines the expected JSON data
class ImageRequest(BaseModel):
    base64_image: str

@app.get("/")
def read_root():
    return {"status": "Gesture recognition server is running"}

@app.post("/process-image")
async def process_image(request: ImageRequest):
    try:
        # --- 1. Decode Base64 to CV2 Image ---
        data = request.base64_image
        
        # Remove header "data:image/jpeg;base64," if it exists
        if "," in data:
            data = data.split(',')[1]

        img_data = base64.b64decode(data)
        nparr = np.frombuffer(img_data, np.uint8)
        image = cv.imdecode(nparr, cv.IMREAD_COLOR)

        if image is None:
            return JSONResponse(status_code=400, content={"error": "Failed to decode image"})

        # --- 2. Run your CV Logic ---
        # Flip image to match front-facing camera
        image = cv.flip(image, 1) 
        image_rgb = cv.cvtColor(image, cv.COLOR_BGR2RGB)
        image_rgb.flags.writeable = False
        results = hands_model.process(image_rgb)
        image_rgb.flags.writeable = True

        gesture_label = "No hand"

        if results.multi_hand_landmarks:
            # Process the first hand found
            hand_landmarks = results.multi_hand_landmarks[0]

            # Run your helper functions
            landmark_list = calc_landmark_list(image, hand_landmarks)
            pre_processed_list = pre_process_landmark(landmark_list)
            
            # Classify
            hand_sign_id = keypoint_classifier_model(pre_processed_list)
            if hand_sign_id < len(labels):
                gesture_label = labels[hand_sign_id]
            else:
                gesture_label = "Unknown"

        # --- 3. Send Result Back to React Native ---
        return {"gesture": gesture_label}

    except Exception as e:
        print(f"An error occurred: {e}")
        return JSONResponse(status_code=500, content={"error": str(e)})

if __name__ == "__main__":
    import uvicorn
    # Run on 0.0.0.0 to make it accessible on your local network
    uvicorn.run(app, host="0.0.0.0", port=8000)