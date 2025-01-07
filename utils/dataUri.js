const DataUriParser = require('datauri/parser');
const path = require("path")


const dataUri = (file) => {
    const parser = new DataUriParser();
    // const extName = file.originalname.split('.').pop();
    const extName = path.extname(file.originalname).toString();
    return parser.format(extName, file.buffer);
    // return parser.format(file.originalname.split(' ').join('_'), file.buffer);
}

module.exports = dataUri;