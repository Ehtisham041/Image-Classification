import { asyncHandler } from "../utils/asynchandler.js";
import { Fish } from "../models/fish.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import axios from "axios";

export const uploadFishAndPredict = asyncHandler(async (req, res) => {
  const image = req.file?.path;
  if (!image) throw new ApiError(400, "Fish image is required");

  const uploadedImage = await uploadOnCloudinary({ path: image });
  if (!uploadedImage) throw new ApiError(500, "Failed to upload fish image");

  // 🔁 Call FastAPI Microservice
  const { data } = await axios.post("http://localhost:8000/predict", {
    image_url: uploadedImage.url
  });

  const savedFish = await Fish.create({
    species: data.species,
    confidence: data.confidence,
    imageUrl: uploadedImage.url,
    uploadedBy: req.user._id
  });

  res.status(201).json(new ApiResponse(200, savedFish, "Prediction complete and saved"));
});

export const getUserFishPredictions = asyncHandler(async (req, res) => {
  const fishList = await Fish.find({ uploadedBy: req.user._id }).sort({ createdAt: -1 });
  res.status(200).json(new ApiResponse(200, fishList));
});
