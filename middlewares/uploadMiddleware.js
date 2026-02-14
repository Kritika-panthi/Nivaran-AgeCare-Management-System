import multer from "multer";
import path from "path";
import fs from "fs";

// Create uploads folder if not exists
const uploadPath = "uploads/";

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath);
}

// Storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueName =
      Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + path.extname(file.originalname));
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  if (file.fieldname === "profilePhoto") {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Profile photo must be an image"));
    }
  }

  if (file.fieldname === "idProof") {
    if (
      !file.mimetype.startsWith("image/") &&
      file.mimetype !== "application/pdf"
    ) {
      return cb(new Error("ID proof must be image or PDF"));
    }
  }

  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

export default upload;
