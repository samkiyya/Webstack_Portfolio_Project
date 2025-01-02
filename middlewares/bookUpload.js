const multer = require('multer');
const path = require('path');

// Set storage engine
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/books'); // Destination folder
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`); // Unique file name
    },
});

// File filter for handling different file types
const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        'application/pdf',              // PDF files
        'application/msword',           // DOC files
        'application/epub+zip',         // EPUB files
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX files
        'image/jpeg',                   // JPEG images
        'image/png',                    // PNG images
        'audio/mpeg',                   // MP3 files
        'audio/wav',                    // WAV files
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type! Only PDF, DOC, DOCX, EPUB, JPG, PNG, MP3, and WAV are allowed.'), false);
    }
};

// Initialize multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB file size limit
    },
});

module.exports = upload;
