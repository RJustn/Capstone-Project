const { changepassword } = require('../../controllers/datacontroller/changepassword');
const { businesspermitdetails } = require('../../controllers/datacontroller/businesspermitdetails');
const { getassessedperson } = require('../../controllers/datacontroller/getassessedperson');
const { savingassessment } = require('../../controllers/datacontroller/savingassessment');
const {
    newWorkingpermits, 
    renewalWorkingpermits, 
    newBusinesspermits, 
    renewalBusinesspermits, 
    workingpermitsChart, 
    businesspermitsChart, 
    workpermitdatastats, 
    dashboardData, 
    businesspermitmonthlyappication} = require('../../controllers/datacontroller/dashboardgraph');
const { updatebusinessnature } = require('../../controllers/datacontroller/updatebusinessnature');
const { updatebusinessattachment } = require('../../controllers/datacontroller/updatebusinessattachment');
const { updatebusinessinfopermit } = require('../../controllers/datacontroller/updatebusinessinfopermit');
const { getbusinesspermitforassessment } = require('../../controllers/datacontroller/getbusinesspermitforassessment');
const { updatebusinessownerpermit } = require('../../controllers/datacontroller/updatebusinessownerpermit');
const { rejectbusinesspermit } = require('../../controllers/datacontroller/rejectbusinesspermit');
const { getworkpermitforassessment } = require('../../controllers/datacontroller/getworkpermitforassessment');
const { updateworkpermit } = require('../../controllers/datacontroller/updateworkpermit');
const { updateworkpermitattachment } = require('../../controllers/datacontroller/updateworkpermitattachment');
const { getbusinesspermitforpayment } = require('../../controllers/datacontroller/getbusinesspermitforpayment');
const { getworkpermitforpayment } = require('../../controllers/datacontroller/getworkpermitforpayment');
const { getbusinesspermitrelease } = require('../../controllers/datacontroller/getbusinesspermitrelease');
const { getworkpermitrelease } = require('../../controllers/datacontroller/getworkpermitrelease');
const { graphbusinesspermitlocation } = require('../../controllers/datacontroller/graphbusinesspermitlocation');
const { graphmonthlypaymentstatus } = require('../../controllers/datacontroller/graphmonthlypaymentstatus');
const { graphpermitapplicationcategory } = require('../../controllers/datacontroller/graphpermitapplicationcategory');
const { getbusinesspermitforretire } = require('../../controllers/datacontroller/getbusinesspermitforretire');
const { retirebusinesspermit } = require('../../controllers/datacontroller/retirebusinesspermit');
const { workpermithandleupdate } = require('../../controllers/datacontroller/workpermithandleupdate');
const { workpermitdetails } = require('../../controllers/datacontroller/workpermitdetails');
const { workpermitreject } = require('../../controllers/datacontroller/workpermitreject');
const { graphmonthlybusinesspermit } = require('../../controllers/datacontroller/graphmonthlybusinesspermit');
const {getWorkPermitStatus} = require('../../controllers/datacontroller/getworkpermitstatus');
const {getBusinessPermitStatus} = require('../../controllers/datacontroller/getbusinesspermitstatus');
const { releaseworkpermitrenewal } = require('../../controllers/datacontroller/releaseworkpermitrenewal');
const { businesspermitrelease } = require('../../controllers/datacontroller/businesspermitrelease');
const { lockBusinessPermit, unlockBusinessPermit } = require('../../controllers/datacontroller/locked');
const { lockWorkPermit, unlockWorkPermit } = require('../../controllers/datacontroller/locked');

module.exports = {
    changepassword,
    businesspermitdetails,

    getassessedperson,
    getbusinesspermitforassessment,
    getworkpermitforassessment,
    getbusinesspermitforpayment,
    getworkpermitforpayment,
    getbusinesspermitrelease,
    getworkpermitrelease,
    getbusinesspermitforretire,


    savingassessment,
    updatebusinessnature,
    updatebusinessattachment,
    updatebusinessinfopermit,
    updatebusinessownerpermit,
    businesspermitrelease,

    updateworkpermit,
    updateworkpermitattachment,

    rejectbusinesspermit,
    retirebusinesspermit,

    workpermithandleupdate,
    workpermitdetails,
    workpermitreject,
    releaseworkpermitrenewal,
    
    lockBusinessPermit,
     unlockBusinessPermit,
     lockWorkPermit,
     unlockWorkPermit,
    


//Graphs
    newWorkingpermits, 
    renewalWorkingpermits, 
    newBusinesspermits, 
    renewalBusinesspermits, 
    workingpermitsChart, 
    businesspermitsChart, 
    workpermitdatastats, 
    dashboardData, 
    getWorkPermitStatus,
    getBusinessPermitStatus,

    graphbusinesspermitlocation,
    graphmonthlypaymentstatus,
    graphpermitapplicationcategory,
    graphmonthlybusinesspermit,

    businesspermitmonthlyappication

};