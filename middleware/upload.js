const multer = require("multer");
const path = require("path");

const updatePath = path.join(process.cwd(), "tmp");

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, updatePath);
	},
	filename: (req, file, cb) => {
		cb(null, file.originalname);
	},
	limits: {
		fileSize: 1048576,
	},
});

const upload = multer({
	storage: storage,
});

module.exports = {
	upload,
};
