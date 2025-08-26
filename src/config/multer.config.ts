import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { cloudinaryUpload } from "./cloudinary.config";

const storage = new CloudinaryStorage({
  cloudinary: cloudinaryUpload,
  params: {
    public_id: (req, file) => {
      // Extract extension
      const extension = file.originalname.split(".").pop();

      // Get filename without extension
      const nameWithoutExt = file.originalname
        .replace(/\.[^/.]+$/, "")
        .toLowerCase()
        .replace(/\s+/g, "-") // replace spaces with dash
        .replace(/[^a-z0-9\-]/g, ""); // remove special chars

      // Generate unique name
      const uniqueFileName = `${Math.random()
        .toString(36)
        .substring(2)}-${Date.now()}-${nameWithoutExt}`;

      return uniqueFileName; // Cloudinary will handle extension automatically
    },
  },
});

export const multerUpload = multer({ storage });
