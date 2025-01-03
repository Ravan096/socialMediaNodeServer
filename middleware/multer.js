const multer = require('multer');

const storage = multer.memoryStorage();

export const singleUpload = multer().single("file");
export const multiUpload = multer().array("file", 12);