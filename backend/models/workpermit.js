const mongoose = require('mongoose');

// Define Work Permit schema and model
const workPermitSchema = new mongoose.Schema({
  id: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  permittype: { type: String, required: true, default: 'WP' },
  workpermitstatus: { type: String, required: true },
  classification: { type: String, required: true },
  transaction: { type: String },
  amountToPay: { type: String },
  paymentStatus: {type: String},
  permitFile: { type: String },
  permitDateIssued: { type: String },
  permitExpiryDate: { type: String },
  expiryDate: { type: String },
  applicationdateIssued: { type: Date, default: Date.now },
  applicationComments: { type: String },
  formData: {
    personalInformation: {
      lastName: String,
      firstName: String,
      middleInitial: String,
      permanentAddress: String,
      currentlyResiding: Boolean,
      temporaryAddress: String,
      dateOfBirth: Date,
      age: Number,
      placeOfBirth: String,
      citizenship: String,
      civilStatus: String,
      gender: String,
      height: String,
      weight: String,
      mobileTel: String,
      email: String,
      educationalAttainment: String,
      natureOfWork: String,
      placeOfWork: String,
      companyName: String,
      workpermitclassification: String
    },
    emergencyContact: {
      name2: String,
      mobileTel2: String,
      address: String
    },
    files: {
      document1: { type: String, required: false },
      document2: { type: String, required: false },
      document3: { type: String, required: false },
      document4: { type: String, required: false },
      document5: { type: String, required: false },
    

      remarksdoc1: String,
      remarksdoc2: String,
      remarksdoc3: String,
      remarksdoc4: String
    }
  },
  receipt: {
    receiptId: String,
    modeOfPayment: String,
    paymentType: String,
    paymentNumber: String,
    receiptName: String,
    receiptAddress: String,
    receiptDate: String,
    amountPaid: String,
    receiptFile: String
  },
  lastEdited: { type: Date, default: Date.now } // Add this field
}, { timestamps: true });

// Middleware to update lastEdited on save
workPermitSchema.pre('save', function (next) {
  this.lastEdited = new Date();
  next();
});


const WorkPermit = mongoose.model('WorkPermit', workPermitSchema);

module.exports = { WorkPermit };