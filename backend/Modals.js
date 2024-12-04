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
  workPermits: [{ type: mongoose.Schema.Types.ObjectId, ref: 'WorkPermit' }],
  businessPermits: [{ type: mongoose.Schema.Types.ObjectId, ref: 'BusinessPermit' }]
});

const User = mongoose.model('User', userSchema);

// Define Business Permit schema and model
const businessPermitSchema = new mongoose.Schema({
  id: { type: String, required: true,},
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  permittype: { type: String, required: true, default: 'BP' },
  businesspermitstatus: { type: String, required: true, },
  businessstatus: {type: String},
  classification: { type: String },
  transaction: { type: String },
  amountToPay: {type: String },
  permitFile: {type: String},
  permitDateIssued: {type: String},
  permitExpiryDate: {type:String},
  expiryDate: {type: String},
  applicationdateIssued: { type: Date, default: Date.now },
  applicationComments: {type: String},
  owner: {
corporation: Boolean,
lastname: String,
firstname: String,
middleinitial: String,
civilstatus: String,
companyname: String,
gender: String,
citizenship: String,
tinnumber: String,
representative: Boolean,
houseandlot: String,
buildingstreetname: String,
subdivision: String,
region: String,
province: String,
municipality: String,
barangay: String,
telephonenumber: String,
mobilenumber: String,
email: String,
    representativedetails: {
      repfullname: String,
      repdesignation: String,
      repmobilenumber: String,
    }
  },
  business: {
businessname: String,
businessscale: String,
paymentmethod: String,
businessbuildingblocklot: String,
businessbuildingname: String,
businesssubcompname: String,
businessregion: String,
businessprovince: String,
businessmunicipality: String,
businessbarangay: String,
businesszip: String,
businesscontactnumber: String,
ownershiptype: String,
agencyregistered: String,
dtiregistrationnum: String,
dtiregistrationdate: String,
dtiregistrationexpdate: String,
secregistrationnum: String,
birregistrationnum: String,
industrysector: String,
businessoperation: String,
typeofbusiness: String,
  },
  otherbusinessinfo:{
    dateestablished: String,
    startdate: String,
    occupancy: String,
    otherbusinesstype: String,
    businessemail: String,
    businessarea: String,
    businesslotarea: String,
    numofworkermale: String,
    numofworkerfemale: String,
    numofworkertotal: String,
    numofworkerlgu: String,
    lessorfullname: String,
    lessormobilenumber: String,
    monthlyrent: String,
    lessorfulladdress: String,
    lessoremailaddress: String,
    
  },
  mapview:{
    lat: String,
    lng: String,
  },
  businesses: [
    {
      businessNature: { type: String,},
      businessType: { type: String,},
      capitalInvestment: { type: Number,},
      lastYearGross: { type: Number,}
    },
  ],
  files: {
    document1: String,
    document2: String,
    document3: String,
    document4: String,
    document5: String,
    document6: String,
    remarksdoc1: String,
    remarksdoc2: String,
    remarksdoc3: String,
    remarksdoc4: String,
    remarksdoc5: String,
    remarksdoc6: String,
    
  },
  department:{
    Zoning: String,
    OffBldOfcl: String,
    CtyHlthOff: String,
    BreuFrPrt: String,
  },
  receipt: {
    receiptId: String, //Generated
    modeOfPayment: String, //online, onsite
    paymentType: String, // gcash, bank payment, onsite
    paymentNumber: String, // gcashnumber, card number
    receiptName: String, //user's name
    receiptAddress: String, // user's address
    receiptDate: String, //date
    amountPaid: String, // amount
    receiptFile: String,
  },
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
      document4: String,
      document5: String,
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