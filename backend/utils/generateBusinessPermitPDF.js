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
      const businessPermit = await BusinessPermit.findById(id);
      if (!businessPermit) {
        return reject(new Error('Business permit not found'));
      }

      const permitFileName = `businessPermit_${id}.pdf`;
      let buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', async () => {
        try {
          const pdfBuffer = Buffer.concat(buffers);
          const uploadResponse = await cloudinary.uploader.upload_stream(
            {
              resource_type: 'raw',
              folder: 'business_permits',
              public_id: permitFileName
            },
            (error, result) => {
              if (error) return reject(error);
              resolve(result.secure_url);
            }
          );
          uploadResponse.end(pdfBuffer);
        } catch (uploadError) {
          reject(uploadError);
        }
      });

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
      doc.text(`Business Name: ${businessPermit.business.businessname || 'N/A'}`);
      doc.text(`Location: ${businessPermit.business.businessbuildingblocklot || 'N/A'}, ${businessPermit.business.businessbarangay || 'N/A'}, ${businessPermit.business.businessmunicipality || 'N/A'}`);
      doc.text(`Taxpayer Name: ${businessPermit.owner.firstname || 'N/A'} ${businessPermit.owner.lastname || 'N/A'}`);
      doc.text(`Business Class: ${businessPermit.classification || 'N/A'}`);
      doc.text(`Total Gross Sales: ${businessPermit.totalgrosssales || 'N/A'}`);
      doc.text(`Total Tax: ${businessPermit.totaltax || 'N/A'}`);
      doc.text(`Permit Number: ${businessPermit.permitnumber || 'Not Assigned'}`);
      doc.text(`Permit Date Issued: ${businessPermit.permitDateIssued ? new Date(businessPermit.permitDateIssued).toLocaleDateString() : 'Not Issued'}`);
      doc.text(`Expiration Date: ${businessPermit.permitExpiryDate ? new Date(businessPermit.permitExpiryDate).toLocaleDateString() : 'Not Set'}`);
      doc.moveDown(2);

      // Additional Details
      doc.text(`Owner's Address: ${businessPermit.owner.houseandlot || 'N/A'}, ${businessPermit.owner.buildingstreetname || 'N/A'}, ${businessPermit.owner.barangay || 'N/A'}, ${businessPermit.owner.municipality || 'N/A'}`);
      doc.text(`Contact Number: ${businessPermit.owner.mobilenumber || 'N/A'}`);
      doc.text(`Email: ${businessPermit.owner.email || 'N/A'}`);
      doc.moveDown(2);

      // Footer (City Mayor Signature)
      doc.text('___________________________________', { align: 'left' });
      doc.text('Jennifer Austria - Barzaga', { align: 'left' });
      doc.text('City Mayor', { align: 'left' });
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = { generateBusinessPermitPDF };



