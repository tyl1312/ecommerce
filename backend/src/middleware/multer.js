import multer from "multer";
import path from "path";
import { Forbidden } from "../core/error.response.js";

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        const error = new Forbidden({ message: `Invalid file type. Only JPEG, PNG are allowed. Attempted to upload: ${file.originalname}`, req });
        cb(error);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 1024 * 1024 * 3 }, // 3MB
});

export default upload;