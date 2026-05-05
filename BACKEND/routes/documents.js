import express from "express"
import multer from "multer"
import { parse_document } from "../controllers/documents_controller.js"

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype === "application/pdf") {
            cb(null, true)
        } else {
            cb(new Error("Only PDF files are allowed"))
        }
    }
})

const documents_router = express.Router()

documents_router.post("/parse", upload.single("file"), parse_document)

export default documents_router
