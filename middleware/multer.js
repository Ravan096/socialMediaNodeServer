const multer = require('multer');

const storage = multer.memoryStorage();

exports.singleUpload = multer({ storage }).single("file");
exports.multiUpload = multer().array("files", 5);