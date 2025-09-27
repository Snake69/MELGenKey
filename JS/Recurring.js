const schedule = require('node-schedule');
var nodemailer = require('nodemailer');
const misc = require ("./misc.js");
const otd = require ("./OnThisDay.js");
const os = require("os");

function sendEmail (setup) {
    var transporter = nodemailer.createTransport({
        host: setup.host,
        port: setup.port,
        auth: {
            user: setup.login,
            pass: setup.passwd
        }
    })

    var mailOptions = {
        from: setup.from,
        to: setup.to,
        subject: null,
        text: null
    }

    var nonfamdbinfo = '';
    var warnings = '';
    var look = setup.look;
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    if (setup.subject == '')
        mailOptions.subject = "On This Day Report for " + new Date().getDate() + " " + months[new Date().getMonth()];
    else
        mailOptions.subject = setup.subject;
    var incl = '{"ORIGIN":"OnThisDay","Month":"' + (new Date().getMonth() + 1) + '","Day":"' + new Date().getDate() + '"';
    if (look.indexOf("DateRepeat") != -1)
        incl += ',"DateRepeat":"DateRepeat"';
    if (look.indexOf("YrOnly") != -1)
        incl += ',"YrOnly":"YrOnly"';
    if (setup.include.indexOf("FamDB") != -1)
        incl += ',"FamDB":"FamDB"';
    incl += addOmits(setup.omits);

    const [resinc, reswarn, resnfi] = otd.processInclusions(setup.include);
    if (resinc != '')
        incl += ',';
    incl += resinc + '}';
    warnings += reswarn;
    nonfamdbinfo += resnfi;
    mailOptions.text = otd.DoOnThisDay(JSON.parse(incl), nonfamdbinfo, warnings, "RECUR", setup.FamDBName);
    transporter.sendMail(mailOptions, function(error, info) {
        if (error)
            misc.Logging(error + ", Problem trying to send recurring On This Day Report to &lt;" + setup.to + "&gt;.");
        else
            misc.Logging("Sent recurring On This Day Report to &lt;" + setup.to + "&gt;.");
    })
}

/* establish cron job */
function setCron(params) {
    misc.Logging('Recurring Report \(' + params.name + '\) cron job installed.');
    const job = schedule.scheduleJob(params.minute + " " + params.hour + ' * * *', function() {
        sendEmail(params);
    })
}

/* kill all cron jobs */
function killAllCronJobs () {
    for (const job in schedule.scheduledJobs) schedule.cancelJob(job);
}

function addOmits (omits) {
    ret = '';

    if (omits.indexOf("OBirths") != -1)
        ret += ',"OBirths":"OBirths"';
    if (omits.indexOf("OBaptisms") != -1)
        ret += ',"OBaptisms":"OBaptisms"';
    if (omits.indexOf("ODeaths") != -1)
        ret += ',"ODeaths":"ODeaths"';
    if (omits.indexOf("OMarriages") != -1)
        ret += ',"OMarriages":"OMarriages"';
    if (omits.indexOf("OBurials") != -1)
        ret += ',"OBurials":"OBurials"';
    if (omits.indexOf("ODeeds") != -1)
        ret += ',"ODeeds":"ODeeds"';
    if (omits.indexOf("OResidences") != -1)
        ret += ',"OResidences":"OResidences"';
    if (omits.indexOf("OOccupations") != -1)
        ret += ',"OOccupations":"OOccupations"';
    if (omits.indexOf("IPeople") != -1)
        ret += ',"IPeople":"IPeople"';
    return ret;
}

module.exports = { setCron, killAllCronJobs };
