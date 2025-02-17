const fs = require('fs');
const path = require('path');
const multer = require('multer');


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '../documents/receipts'); // Use absolute path
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const receipt = multer({ storage });

const uploadworkpermitreceipt = receipt.fields([
  { name: 'document1', maxCount: 1 }
]);

module.exports = uploadworkpermitreceipt;
