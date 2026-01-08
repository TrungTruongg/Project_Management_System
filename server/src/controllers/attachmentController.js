import client from "../config/database.js";
import { ObjectId } from "mongodb";
import multer from "multer";
import path from "path";
import fs from "fs";

// Cấu hình multer để lưu file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = './uploads';
    // Tạo thư mục nếu chưa tồn tại
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Tạo tên file unique: timestamp-random-filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

// Filter chỉ cho phép các loại file nhất định
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|mp4|pdf|doc|docx|xls|xlsx|txt|zip|rar/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname || mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Allowed Files: image, PDF, Word, Excel, text, zip'));
  }
};

export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // Giới hạn 10MB
  },
  fileFilter: fileFilter
});

// Upload file endpoint
export const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file have been uploaded' });
    }

    // Trả về URL của file (có thể là relative path hoặc full URL)
    const fileUrl = `/uploads/${req.file.filename}`;
    
    res.json({
      success: true,
      url: fileUrl,
      filename: req.file.originalname,
      size: req.file.size
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all attachments
export const getAttachments = async (req, res) => {
  try {
    await client.connect();
    const db = client.db("db_pms");
    const collection = db.collection("attachments");
    const results = await collection.find({}).toArray();
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create attachment
export const createAttachment = async (req, res) => {
  try {
    await client.connect();
    const db = client.db("db_pms");
    const collection = db.collection("attachments");

    const { taskId, url, name, type } = req.body;
    const newAttachment = {
      url: url,
      name: name,
      type: type, // 'file' hoặc 'link'
      taskId: taskId,
      uploadedAt: new Date()
    };
    const result = await collection.insertOne(newAttachment);
    res.json({ ...newAttachment, _id: result.insertedId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete attachment
export const deleteAttachment = async (req, res) => {
  try {
    await client.connect();
    const db = client.db("db_pms");
    const collection = db.collection("attachments");
    const attachmentId = req.params.id;

    // Lấy thông tin attachment trước khi xóa
    const attachment = await collection.findOne({
      _id: new ObjectId(attachmentId),
    });

    if (!attachment) {
      return res.status(404).json({ error: "Attachment không tồn tại" });
    }

    // Nếu là file (không phải link), xóa file khỏi server
    if (attachment.type === 'file' && attachment.url) {
      const filePath = `.${attachment.url}`; // Assuming URL is /uploads/filename
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Xóa record trong database
    const result = await collection.deleteOne({
      _id: new ObjectId(attachmentId),
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Không thể xóa attachment" });
    }

    res.json({ success: true, message: "Attachment đã được xóa" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get attachments by task ID
export const getAttachmentsByTaskId = async (req, res) => {
  try {
    await client.connect();
    const db = client.db("db_pms");
    const collection = db.collection("attachments");
    const taskId = req.params.taskId;

    const results = await collection.find({ taskId: taskId }).toArray();
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};