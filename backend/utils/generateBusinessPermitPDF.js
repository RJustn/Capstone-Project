const PDFDocument = require('pdfkit');
const { BusinessPermit } = require('../index/models');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const generateBusinessPermitPDF = async (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument();
      let buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', async () => {
        try {
          const pdfBuffer = Buffer.concat(buffers);
          console.log('PDF buffer created successfully'); // Log buffer creation

          const uploadStream = cloudinary.uploader.upload_stream(
            {
              resource_type: 'raw',
              folder: 'business_permits',
              public_id: permitFileName
            },
            (error, result) => {
              if (error) {
                console.error('Cloudinary upload error:', error); // Log Cloudinary error
                return reject(error);
              }
              console.log('Cloudinary upload successful:', result); // Log successful upload
              resolve(result.secure_url);
            }
          );

          if (!uploadStream) {
            console.error('Failed to initialize Cloudinary upload stream'); // Log stream initialization failure
            return reject(new Error('Cloudinary upload stream initialization failed'));
          }

          uploadStream.end(pdfBuffer); // Ensure the stream ends properly
        } catch (uploadError) {
          console.error('Error during Cloudinary upload:', uploadError); // Log upload error
          reject(uploadError);
        }
      });

      const businessPermit = await BusinessPermit.findById(id);
      if (!businessPermit) {
        console.error(`Business permit with ID ${id} not found`); // Log missing permit
        return reject(new Error('Business permit not found'));
      }
      console.log('Business permit fetched successfully:', businessPermit); // Log fetched permit

      const permitFileName = `businessPermit_${id}.pdf`;

      // Header Content
      doc.fontSize(14).text('Republic of the Philippines', { align: 'center' });
      doc.text('Province of Cavite', { align: 'center' });
      doc.text('CITY OF DASMARIÑAS', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text('Business Permit and Licensing Office', { align: 'center', underline: true });
      doc.fontSize(18).text('BUSINESS PERMIT', { align: 'center' });

      doc.moveDown(2);

      // Body Content
      doc.fontSize(10).text(
        `In accordance with the provision of the City Ordinance No. 1 Series of 2024 as amended 
under the provisions of RA 7160 of the City of Dasmariñas, Cavite and after having 
satisfied the requirements provided therein, Business Permit to operate is hereby granted 
to the name listed below, in the City of Dasmariñas, Cavite, subject to the Rules and 
Regulation prescribed in said Ordinance and in all existing laws applicable thereto.`
      );

      doc.moveDown(2);

      // Business Details
      doc.text(`Business Name: ${businessPermit.business?.businessname || 'N/A'}`);
      doc.text(`Location: ${businessPermit.business?.businessbarangay || 'N/A'}`);
      doc.text(`Taxpayer Name: ${businessPermit.owner?.firstname || ''} ${businessPermit.owner?.lastname || 'N/A'}`);
      doc.text(`Business Class: ${businessPermit.classification || 'N/A'}`);
      doc.text(`Business Nature: ${businessPermit.businesses?.[0]?.businessNature || 'N/A'}`);
      doc.text(`Permit Number: ${businessPermit.permitnumber || 'N/A'}`);
      doc.text(`Total Tax: ${businessPermit.totaltax || 'N/A'}`);
      doc.text(`Date Issued: ${businessPermit.permitDateIssued || 'N/A'}`);
      doc.text(`Expiry Date: ${businessPermit.permitExpiryDate || 'N/A'}`);
      doc.moveDown(2);

      // Table Headers

      // Render Table Headers
      tableHeaders.forEach((header, index) => {
        doc.text(header, 50 + index * columnWidth, doc.y, { width: columnWidth, align: 'center' });
      });

      doc.moveDown(1);

      // Render Table Data
      rowData.forEach((data, index) => {
        doc.text(data, 50 + index * columnWidth, doc.y, { width: columnWidth, align: 'center' });
      });

      doc.moveDown(3);

      // Statement of Account Section
      doc.moveDown(2);
      doc.fontSize(12).text('Statement of Account', { align: 'center', underline: true });
      doc.moveDown();

      const statement = businessPermit.statementofaccount || {};
      const leftMargin = 50;
      doc.fontSize(10).text(`Date Assessed: ${statement.dateassessed || 'N/A'}`);
      doc.text(`Mayor's Permit: ${statement.mayorspermit || 'N/A'}`);
      doc.text(`Sanitary Fee: ${statement.sanitary || 'N/A'}`);
      doc.text(`Health Fee: ${statement.health || 'N/A'}`);
      doc.text(`Business Plate Fee: ${statement.businessplate || 'N/A'}`);
      doc.text(`Zoning Clearance Fee: ${statement.zoningclearance || 'N/A'}`);
      doc.text(`Annual Inspection Fee: ${statement.annualInspection || 'N/A'}`);
      doc.text(`Environmental Fee: ${statement.environmental || 'N/A'}`);
      doc.text(`Miscellaneous Fee: ${statement.miscfee || 'N/A'}`);
      doc.text(`Liquor/Tobacco Fee: ${statement.liquortobaco || 'N/A'}`);
      doc.text(`Liquor Plate Fee: ${statement.liquorplate || 'N/A'}`);
      doc.moveDown();

      doc.moveDown(2);

      // Footer (City Mayor Signature)
      doc.text('___________________________________', { align: 'left' });
      doc.text('Jennifer Austria - Barzaga', { align: 'left' });
      doc.text('City Mayor', { align: 'left' });
      doc.end();
    } catch (error) {
      console.error('Error generating business permit PDF:', error); // Log general error
      reject(error);
    }
  });
};

module.exports = { generateBusinessPermitPDF };


