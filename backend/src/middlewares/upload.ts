import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

const imageStorage = new CloudinaryStorage({
  cloudinary,
  params: async (_req, file) => ({
    folder: 'localgo/images',
    format: file.mimetype === 'image/png' ? 'png' : 'webp',
    transformation: [{ width: 1200, quality: 'auto', fetch_format: 'auto' }],
    public_id: `${Date.now()}-${file.originalname.split('.')[0]}`,
  }),
});

const videoStorage = new CloudinaryStorage({
  cloudinary,
  params: async (_req, _file) => ({
    folder: 'localgo/videos',
    resource_type: 'video',
    format: 'mp4',
  }),
});

const localStorage = multer.memoryStorage();

export const uploadImage = multer({
  storage: imageStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

export const uploadVideo = multer({
  storage: videoStorage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed'));
    }
  },
});

export const uploadMemory = multer({
  storage: localStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
});
