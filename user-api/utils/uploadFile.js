const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');

const mongoURI =
  process.env.MONGO_URI || 'mongodb://mongodb:27017/callbooking';

const storage = new GridFsStorage({
  url: mongoURI,
  options: { useNewUrlParser: true, useUnifiedTopology: true },
  file: (req, file) => {
    if (
      file.mimetype === 'image/jpeg' ||
      file.mimetype === 'image/png'
    ) {
      const filename = `file_${Date.now()}`;
      req.body.image = filename;

      return {
        bucketName: 'images',
        filename: filename,
      };
    }
    return null;
  },
});

const upload = multer({ storage });

module.exports = { upload };
