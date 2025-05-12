const PDFDocument = require('pdfkit');
const { v4: uuidv4 } = require('uuid');
const cloudinary = require('cloudinary').v2;
require('dotenv').config(); // Load environment variables

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Function to generate Statement of Account PDF and upload to Cloudinary
const generateWorkPermitStatementofAccount= async (ContentData, receiptId) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument();
      const receiptFileName = `workpermitreceipt_${Date.now()}.pdf`;

      // Create a buffer to store the PDF in memory
      let buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', async () => {
        try {
          const pdfBuffer = Buffer.concat(buffers);

          // Upload to Cloudinary
          const uploadResponse = await cloudinary.uploader.upload_stream(
            {
              resource_type: 'raw',
              folder: 'workpermitreceipts',
              public_id: receiptFileName
            },
            (error, result) => {
              if (error) {
                console.error('Cloudinary Upload Error:', error);
                return reject(error);
              }
              resolve(result.secure_url); // Return the Cloudinary URL
            }
          );

          uploadResponse.end(pdfBuffer);
        } catch (uploadError) {
          console.error('Error uploading PDF to Cloudinary:', uploadError);
          reject(uploadError);
        }
      });

      // Generate PDF content
      doc.fontSize(25).text('Statement of Account Work Pemrmit Application', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Date: ${new Date().toLocaleDateString()}`);
      doc.text(`Receipt ID: ${receiptId}`);
      doc.text(`Name: ${ContentData.formData.personalInformation.lastName} ${ContentData.formData.personalInformation.firstName}`);
      doc.text(`Work Permit Application ID: ${ContentData.id}`);
      doc.text(`Transaction Type: ${ContentData.transaction}`);
      doc.moveDown();

      // Add detailed statement information
      doc.text('Statement Details:', { underline: true });
      doc.text(`Work Permit Renewal: 200`);
      doc.moveDown();

      doc.text(`Total Amount: PHP 200`, { bold: true });
      doc.moveDown();
      doc.end();
    } catch (error) {
      console.error('Error generating statement of account PDF:', error);
      reject(error);
    }
  });
};

module.exports = { generateWorkPermitStatementofAccount };
