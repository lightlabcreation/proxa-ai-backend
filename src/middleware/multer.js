const multer = require("multer");
const path = require("path");
const fs = require("fs");

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = ""; // Define the upload path
    console.log(file.fieldname);

    switch (file.fieldname) {
      case "contractDocument":
        uploadPath = path.join(__dirname, "../../public/contractDocument");
        break;
      case "intakeAttachment":
        uploadPath = path.join(__dirname, "../../public/intakeAttachment");
        break;

      case "renewalAttachmentFile":
        uploadPath = path.join(__dirname, "../../public/renewalAttachmentFile");
        break;

      case "contractAttachmentFile":
        uploadPath = path.join(__dirname, "../../public/contractAttachmentFile");
        break;
      case "customAgreementFile":
        uploadPath = path.join(__dirname, "../../public/customAgreementFile");
        break;
      // case "exercise_image":
      //   uploadPath = path.join(__dirname, "../../public/exercise_image");
      //   break;
      default:
        console.log(`multer problem ${file.fieldname}`);
        return cb(new Error("Invalid fieldname"));
    }

    // Use fs module to create the folder
    fs.mkdir(uploadPath, { recursive: true }, (err) => {
      if (err) {
        console.error("Error creating folder:", err);
        return cb(err);
      }
      cb(null, uploadPath);
    });
  },
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
  },
});

const allowedImageTypes = /\.(png|jpg|jpeg|doc|docx|pdf|txt|xls|xlsx|ppt|pptx)$/;
const allowedVideoTypes = /video\/(mp4|mpeg-4|mkv)/;

const uploads = multer({
  storage: fileStorage,
  limits: {
    fileSize: 5000000, // 5 MB
  },
  fileFilter: (req, file, cb) => {
    if (!file.originalname.match(allowedImageTypes)) {
      return cb(new Error("Please upload an image or document with valid formats."));
    }
    cb(null, true);
  },
});


module.exports = {
  uploads
};