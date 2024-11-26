const mongoose = require('mongoose');

// Define User schema and model
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  userId: { type: String, required: true, unique: true },
  userrole: { type: String, required: true },
  password: { type: String, required: true },
  isVerified: { type: Boolean },
  firstName: String,
  middleName: String,
  lastName: String,
  contactNumber: String,
  address: String,
  lastLoginDate: { type: Date },
  lastLogoutDate: { type: Date },
  isOnline: { type: Boolean, default: false },
  region: String,
  district: String,
  otpcontent: {
    otp: { type: String },
    otpExpires: { type: Date },
    otpAttempts: { type: Number, default: 0 },
    lastOtpSentAt: { type: Date, default: null }
  },
  workPermits: [{ type: mongoose.Schema.Types.ObjectId, ref: 'WorkPermit' }]
});

const User = mongoose.model('User', userSchema);

// Define Business Permit schema and model
const businessPermitSchema = new mongoose.Schema({
  owner: {
    lastName: String,
    firstName: String,
    middleInitial: String,
    civilStatus: String,
    gender: String,
    citizenship: String,
    tinNumber: String,
    isRepresentative: Boolean,
    representative: {
      fullName: String,
      designation: String,
      mobileNumber: String
    }
  },
  businessReference: {
    businessName: String,
    businessScale: String,
    paymentMethod: String,
    houseBuildingNo: String,
    buildingStreetName: String,
    subdivisionCompoundName: String,
    region: String,
    province: String,
    cityMunicipality: String,
    barangay: String,
    businessStreet: String,
    zone: String,
    zip: String,
    contactNumber: String
  },
  bui: { type: String, required: true, default: 'Pending' },
  transaction: { type: String, required: true, default: 'Processing' },
  dateIssued: { type: Date, default: Date.now },
  expiryDate: { type: Date, default: () => Date.now() + 31536000000 }
}, { timestamps: true });

const BusinessPermit = mongoose.model('BusinessPermit', businessPermitSchema);

// Define Work Permit schema and model
const workPermitSchema = new mongoose.Schema({
  id: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  permittype: { type: String, required: true, default: 'WP' },
  workpermitstatus: { type: String, required: true },
  classification: { type: String, required: true },
  transaction: { type: String },
  amountToPay: { type: String },
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
      document1: String,
      document2: String,
      document3: String,
      document4: String
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
  }
}, { timestamps: true });

const WorkPermit = mongoose.model('WorkPermit', workPermitSchema);

const PersonSchema = new mongoose.Schema({
  name: String,
  email: String,
  applicationForm: {
    age: Number,
    address: String,
    phoneNumber: String,
    isActive: Boolean,
  },
  files: {
    document1: String,
    document2: String,
    document3: String,
  },
});

const Person = mongoose.model('Person', PersonSchema);


module.exports = {
  User,
  BusinessPermit,
  WorkPermit,
  Person
};