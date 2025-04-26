const PDFDocument = require('pdfkit');
const { WorkPermit } = require('../index/models');
const cloudinary = require('cloudinary').v2;
require('dotenv').config(); // Load environment variables

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Function to generate Work Permit PDF and upload to Cloudinary
const generateWorkPermitPDF = async (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', layout: 'landscape' });

      // Fetch the work permit data by ID
      const workPermit = await WorkPermit.findById(id);
      if (!workPermit) {
        return reject(new Error('Work permit not found'));
      }

      const placeOfEmployment = workPermit?.formData?.employmentInformation?.place || 'N/A';
      const workPermitFileName = `workpermit_${id}.pdf`;

      // Create a buffer to store the PDF in memory
      let buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', async () => {
        try {
          const pdfBuffer = Buffer.concat(buffers);

          // Upload to Cloudinary
          cloudinary.uploader.upload_stream(
            {
              resource_type: 'raw',
              folder: 'work_permits',
              public_id: workPermitFileName
            },
            (error, result) => {
              if (error) {
                console.error('Cloudinary Upload Error:', error);
                return reject(error);
              }
              resolve(result.secure_url); // Return the Cloudinary URL
            }
          ).end(pdfBuffer);
        } catch (uploadError) {
          console.error('Error uploading PDF to Cloudinary:', uploadError);
          reject(uploadError);
        }
      });

      // Generate PDF content
      const leftColumnX = doc.page.margins.left + 20;
      let currentY = doc.page.margins.top + 20;

      const isRenewal = workPermit.transaction === 'Renew';

      if (isRenewal) {
        doc.fontSize(15).text('RENEWAL OF WORK PERMIT', leftColumnX, currentY);
        currentY += 30;
        doc.fontSize(12).text(`Previous Expiration Date: ${new Date(workPermit.permitExpiryDate).toLocaleDateString()}`, leftColumnX, currentY);
        currentY += 20;
        doc.text(`New Issuance Date: ${new Date(workPermit.permitDateIssued).toLocaleDateString()}`, leftColumnX, currentY);
        currentY += 20;
        doc.text(`New Expiration Date: ${new Date(workPermit.expiryDate).toLocaleDateString()}`, leftColumnX, currentY);
        currentY += 40;
        doc.text('Renewal Fee: ___________________', leftColumnX, currentY);
        currentY += 20;
        doc.text('Remarks: Renewal processed successfully.', leftColumnX, currentY);
      } else {
        doc.fontSize(15).text('EXPIRATION OF PERMIT', leftColumnX, currentY);
        currentY += 30;
        doc.fontSize(12).text(`Issuance date: ${new Date(workPermit.issueDate).toLocaleDateString()}`, leftColumnX, currentY);
        currentY += 20;
        doc.text(`Expiration date: ${new Date(workPermit.expirationDate).toLocaleDateString()}`, leftColumnX, currentY);
      }

      currentY += 20;
      doc.text(`Place of employment: ${placeOfEmployment}`, leftColumnX, currentY);
      currentY += 40;

      doc.text(
        'Note: The occupation or calling fee shall be payable annually on or before the thirty-first (31st) day of January every year.',
        leftColumnX, currentY, { width: 280 }
      );
      currentY += 80;

      doc.text('Received by:', leftColumnX, currentY);
      doc.text('BPLO Clerk: ________________________', leftColumnX, currentY + 20);
      currentY += 60;
      doc.text('Recommending Approval:', leftColumnX, currentY);
      doc.text('Edith T. Herrera BPLO, CGDH1: _______________________', leftColumnX, currentY + 20);
      currentY += 60;

      doc.text('Amount: _________________', leftColumnX, currentY);
      doc.text('O.R No: ___________________', leftColumnX, currentY + 20);
      doc.text('Date: _____________________', leftColumnX, currentY + 40);

      // Right Column Content
      const rightColumnX = doc.page.width / 2 + 20;
      currentY = doc.page.margins.top + 20;

      doc.fontSize(15).text('Province of Cavite', rightColumnX, currentY);
      currentY += 20;
      doc.text('City of Dasmariñas', rightColumnX, currentY);
      currentY += 20;
      doc.text('OFFICE OF THE MAYOR', rightColumnX, currentY);
      currentY += 20;
      doc.text('Business Permits and Licensing Office', rightColumnX, currentY);
      currentY += 40;

      doc.fontSize(20).text('OCCUPATION PERMIT', rightColumnX, currentY, { align: 'left' });
      currentY += 40;

      doc.fontSize(15).text(`_________________________`, rightColumnX, currentY);
      doc.text('(Holder/Permittee)', rightColumnX, currentY + 20);

      // Add a new page
      doc.addPage({ size: 'A4', layout: 'landscape' });

      // Page 2 Content
      currentY = doc.page.margins.top + 20;
      doc.fontSize(12).text(
        'This is to certify that the person whose name and identification appear herein is duly permitted by this OFFICE to work as',
        leftColumnX, currentY, { width: 280 }
      );
      currentY += 40;
      doc.text('_______________________________________', leftColumnX, currentY);
      currentY += 20;
      doc.text('up to date specified in this permit', leftColumnX, currentY);
      currentY += 40;
      doc.text('APPROVED:', leftColumnX, currentY);
      currentY += 20;
      doc.text('HON. JENNIFER AUSTRIA-BARZAGA', leftColumnX, currentY);
      doc.text('City Mayor', leftColumnX, currentY + 20);
      currentY += 60;
      doc.text('REMARKS:', leftColumnX, currentY);

      doc.text(`Permit ID: ${workPermit.id}`, leftColumnX, currentY);
      currentY += 20;
      doc.text(`Permit Type: ${workPermit.permittype}`, leftColumnX, currentY);
      currentY += 20;
      doc.text(`Status: ${workPermit.workpermitstatus}`, leftColumnX, currentY);
      currentY += 20;
      doc.text(`Classification: ${workPermit.classification}`, leftColumnX, currentY);
      currentY += 20;
      doc.text(`Transaction: ${workPermit.transaction}`, leftColumnX, currentY);
      currentY += 20;
      doc.text(`Amount to Pay: ${workPermit.amountToPay}`, leftColumnX, currentY);
      currentY += 20;
      doc.text(`Date Issued: ${new Date(workPermit.permitDateIssued).toLocaleDateString()}`, leftColumnX, currentY);
      currentY += 20;
      doc.text(`Expiry Date: ${new Date(workPermit.permitExpiryDate).toLocaleDateString()}`, leftColumnX, currentY);
      currentY += 40;

      currentY = doc.page.margins.top + 20;
      doc.text(`Name: ${workPermit.formData.personalInformation.lastName}, ${workPermit.formData.personalInformation.firstName}`, rightColumnX, currentY);
      currentY += 20;
      doc.text(`Nationality: ${workPermit.formData.personalInformation.citizenship} Age: ${workPermit.formData.personalInformation.age}`, rightColumnX, currentY);
      currentY += 20;
      doc.text(`Civil Status: ${workPermit.formData.personalInformation.civilStatus} Sex: ${workPermit.formData.personalInformation.gender}`, rightColumnX, currentY);
      currentY += 20;
      doc.text(`Date of Birth: ${new Date(workPermit.formData.personalInformation.dateOfBirth).toLocaleDateString()}`, rightColumnX, currentY);
      currentY += 20;
      doc.text(`Residence: ${workPermit.formData.personalInformation.permanentAddress}`, rightColumnX, currentY);
      currentY += 20;
      doc.text(`Tax Identification: ${workPermit.formData.personalInformation.tin || 'N/A'}`, rightColumnX, currentY);

      // Finalize the PDF
      doc.end();
    } catch (error) {
      console.error('Error generating work permit PDF:', error);
      reject(error);
    }
  });
};

module.exports = { generateWorkPermitPDF };
