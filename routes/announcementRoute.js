const express = require("express");
const router = express.Router();
const { verifyAdmin,verifyUserOrAdmin, verifyUser } = require("../middlewares/auth");
const {
  createAnnouncement,
  getAllAnnouncements,
  getMyAnnouncements,
  getApprovedAnnouncements,
  toggleLike,
  
  addComment,
  getComments,
  getLikesCount,
  updateAnnouncement,
  deleteAnnouncement,
  deleteComment,
} = require("../controllers/announcementController");

const multer = require("multer");
const path = require("path");

// Storage configuration for uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, "public/announcement/images");
    } else if (file.mimetype.startsWith("video/")) {
      cb(null, "public/announcement/videos");
    } else {
      cb(new Error("Invalid file type"), false);
    }
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${file.fieldname}${ext}`);
  },
});

// Multer instance
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    console.log("File being processed:", file);
    if (
      file.mimetype.startsWith("image/") ||
      file.mimetype.startsWith("video/")
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only images and videos are allowed!"), false);
    }
  },
  
});

// Routes
router.post(
  "/create",
  upload.fields([
    { name: "image", maxCount: 1 }, // For single image file
    { name: "video", maxCount: 1 }, // For single video file
  ]),
  verifyUserOrAdmin,
  createAnnouncement
);

router.put(
  "/update/:id",
  verifyUserOrAdmin,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "video", maxCount: 1 },
  ]),
  updateAnnouncement
);

router.get("/", getAllAnnouncements);
router.get("/my", verifyUserOrAdmin, getMyAnnouncements);
router.get("/approved", getApprovedAnnouncements);
router.post("/like", toggleLike);

router.post("/comment",verifyUser, addComment);
router.delete("/delete/:id", verifyAdmin, deleteAnnouncement);
router.delete("/delete-comment/:commentId", verifyAdmin, deleteComment);
router.get("/comments/:announcementId", getComments);
router.get("/likes/:announcementId", getLikesCount);

module.exports = router;
