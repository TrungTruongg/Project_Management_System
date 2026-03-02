import client from '../config/database.js';
import { ObjectId } from 'mongodb';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';
import 'dotenv/config';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();

// Filter chỉ cho phép các loại file nhất định
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|mp4|pdf|doc|docx|xls|xlsx|txt|webp|zip|rar/;
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
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: fileFilter,
});

// Upload file
export const uploadFile = async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No file have been uploaded' });
    }

    const dataUrl = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
    const fileName = file.originalname.split('.')[0];

    const fileExt = path.extname(file.originalname).toLowerCase();
    const isRawFile = /txt|doc|docx|xls|xlsx|zip|rar/.test(fileExt.replace('.', ''));
    const isPdfFile = fileExt === '.pdf';

    cloudinary.uploader.upload(
      dataUrl,
      {
        public_id: isRawFile ? fileName + fileExt : fileName,
        resource_type: isRawFile ? 'raw' : isPdfFile ? 'image' : 'auto',
        access_mode: 'public',      
      },
      (err, result) => {
        if (err) {
          return res.status(500).json({ error: 'Cloudinary upload failed.', detail: err });
        }
        res.json({ message: 'File uploaded successfully.', url: result.secure_url });
      }
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all attachments
export const getAttachments = async (req, res) => {
  try {
    await client.connect();
    const db = client.db('db_pms');
    const collection = db.collection('attachments');
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
    const db = client.db('db_pms');
    const collection = db.collection('attachments');

    const { taskId, url, name, type, createdBy } = req.body;
    const newAttachment = {
      url: url,
      name: name,
      type: type,
      taskId: taskId,
      createdBy: createdBy,
      uploadedAt: new Date(),
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
    const db = client.db('db_pms');
    const collection = db.collection('attachments');
    const attachmentId = req.params.id;

    // Lấy thông tin attachment trước khi xóa
    const attachment = await collection.findOne({
      _id: new ObjectId(attachmentId),
    });

    if (!attachment) {
      return res.status(404).json({ error: 'Attachment không tồn tại' });
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
      return res.status(404).json({ error: 'Không thể xóa attachment' });
    }

    res.json({ success: true, message: 'Attachment đã được xóa' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get attachments by task ID
export const getAttachmentsByTaskId = async (req, res) => {
  try {
    await client.connect();
    const db = client.db('db_pms');
    const collection = db.collection('attachments');
    const taskId = req.params.taskId;

    const results = await collection.find({ taskId: taskId }).toArray();
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
