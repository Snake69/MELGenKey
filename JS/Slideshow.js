const fs = require("fs-extra");
const path = require("path");
const misc = require ("./misc.js");

function Slideshow (postdata) {
    var dir, resSS = '', swSS = 0;

    /* ensure there are images to show */
    if (JSON.stringify(postdata).indexOf(':"on"') == -1)
        return "ERRORS No Images specified. Select type of images to show and resubmit the form.";
    else {
        if (postdata.hasOwnProperty('Bio')) {
            dir = path.join(misc.ProcessDBSysInfo ("DBLocation"), "Images", "Biographies");
            if (isDir(dir)) {
                const files = fs.readdirSync(dir);
                if (files.length)
                    swSS = 1;
            } else
                misc.Logging("Slideshow: problem finding the Biographies directory/folder.");
        }
        if (postdata.hasOwnProperty('Maps')) {
            dir = path.join(misc.ProcessDBSysInfo ("DBLocation"), "Images", "Maps");
            if (isDir(dir)) {
                const files = fs.readdirSync(dir);
                if (files.length)
                    swSS = 1;
            } else
                misc.Logging("Slideshow: problem finding the Maps directory/folder.");
        }
        if (postdata.hasOwnProperty('Misc')) {
            dir = path.join(misc.ProcessDBSysInfo ("DBLocation"), "Images", "Misc");
            if (isDir(dir)) {
                const files = fs.readdirSync(dir);
                if (files.length)
                    swSS = 1;
            } else
                misc.Logging("Slideshow: problem finding the Misc directory/folder.");
        }
        if (postdata.hasOwnProperty('NewsDeaths')) {
            dir = path.join(misc.ProcessDBSysInfo ("DBLocation"), "Images", "Newspapers", "Deaths");
            if (isDir(dir)) {
                const files = fs.readdirSync(dir);
                if (files.length)
                    swSS = 1;
            } else
                misc.Logging("Slideshow: problem finding the Newspapers-Deaths directory/folder.");
        }
        if (postdata.hasOwnProperty('NewsBirths')) {
            if (isDir(dir)) {
                const files = fs.readdirSync(dir);
                if (files.length)
                    swSS = 1;
            } else
                misc.Logging("Slideshow: problem finding the Newspapers-Births directory/folder.");
        }
        if (postdata.hasOwnProperty('NewsMarrs')) {
            dir = path.join(misc.ProcessDBSysInfo ("DBLocation"), "Images", "Newspapers", "Marriages");
            if (isDir(dir)) {
                const files = fs.readdirSync(dir);
                if (files.length)
                    swSS = 1;
            } else
                misc.Logging("Slideshow: problem finding the Newspapers-Marriages directory/folder.");
        }
        if (postdata.hasOwnProperty('NewsOth')) {
            dir = path.join(misc.ProcessDBSysInfo ("DBLocation"), "Images", "Newspapers", "Misc");
            if (isDir(dir)) {
                const files = fs.readdirSync(dir);
                if (files.length)
                    swSS = 1;
            } else
                misc.Logging("Slideshow: problem finding the Newspapers-Misc directory/folder.");
        }
        if (postdata.hasOwnProperty('People')) {
            dir = path.join(misc.ProcessDBSysInfo ("DBLocation"), "Images", "People");
            if (isDir(dir)) {
                const files = fs.readdirSync(dir);
                if (files.length)
                    swSS = 1;
            } else
                misc.Logging("Slideshow: problem finding the People directory/folder.");
        }
        if (postdata.hasOwnProperty('RecsAF')) {
            dir = path.join(misc.ProcessDBSysInfo ("DBLocation"), "Images", "Records", "ArmedForces");
            if (isDir(dir)) {
                const files = fs.readdirSync(dir);
                if (files.length)
                    swSS = 1;
            } else
                misc.Logging("Slideshow: problem finding the Records-ArmedForces directory/folder.");
        }
        if (postdata.hasOwnProperty('RecsBap')) {
            dir = path.join(misc.ProcessDBSysInfo ("DBLocation"), "Images", "Records", "Baptisms");
            if (isDir(dir)) {
                const files = fs.readdirSync(dir);
                if (files.length)
                    swSS = 1;
            } else
                misc.Logging("Slideshow: problem finding the Records-Baptisms directory/folder.");
        }
        if (postdata.hasOwnProperty('RecsBible')) {
            dir = path.join(misc.ProcessDBSysInfo ("DBLocation"), "Images", "Records", "Bible");
            if (isDir(dir)) {
                const files = fs.readdirSync(dir);
                if (files.length)
                    swSS = 1;
            } else
                misc.Logging("Slideshow: problem finding the Records-Bible directory/folder.");
        }
        if (postdata.hasOwnProperty('RecsBirth')) {
            dir = path.join(misc.ProcessDBSysInfo ("DBLocation"), "Images", "Records", "Births");
            if (isDir(dir)) {
                const files = fs.readdirSync(dir);
                if (files.length)
                    swSS = 1;
            } else
                misc.Logging("Slideshow: problem finding the Records-Births directory/folder.");
        }
        if (postdata.hasOwnProperty('RecsCensus')) {
            dir = path.join(misc.ProcessDBSysInfo ("DBLocation"), "Images", "Records", "Census");
            if (isDir(dir)) {
                const files = fs.readdirSync(dir);
                if (files.length)
                    swSS = 1;
            } else
                misc.Logging("Slideshow: problem finding the Records-Census directory/folder.");
        }
        if (postdata.hasOwnProperty('RecsDeath')) {
            dir = path.join(misc.ProcessDBSysInfo ("DBLocation"), "Images", "Records", "Deaths");
            if (isDir(dir)) {
                const files = fs.readdirSync(dir);
                if (files.length)
                    swSS = 1;
            } else
                misc.Logging("Slideshow: problem finding the Records-Deaths directory/folder.");
        }
        if (postdata.hasOwnProperty('RecsDeed')) {
            dir = path.join(misc.ProcessDBSysInfo ("DBLocation"), "Images", "Records", "Deeds");
            if (isDir(dir)) {
                const files = fs.readdirSync(dir);
                if (files.length)
                    swSS = 1;
            } else
                misc.Logging("Slideshow: problem finding the Records-Deeds directory/folder.");
        }
        if (postdata.hasOwnProperty('RecsMarr')) {
            dir = path.join(misc.ProcessDBSysInfo ("DBLocation"), "Images", "Records", "Marriages");
            if (isDir(dir)) {
                const files = fs.readdirSync(dir);
                if (files.length)
                    swSS = 1;
            } else
                misc.Logging("Slideshow: problem finding the Records-Marriages directory/folder.");
        }
        if (postdata.hasOwnProperty('RecsWill')) {
            dir = path.join(misc.ProcessDBSysInfo ("DBLocation"), "Images", "Records", "Wills");
            if (isDir(dir)) {
                const files = fs.readdirSync(dir);
                if (files.length)
                    swSS = 1;
            } else
                misc.Logging("Slideshow: problem finding the Records-Wills directory/folder.");
        }
        if (postdata.hasOwnProperty('RecsOth')) {
            dir = path.join(misc.ProcessDBSysInfo ("DBLocation"), "Images", "Records", "Misc");
            if (isDir(dir)) {
                const files = fs.readdirSync(dir);
                if (files.length)
                    swSS = 1;
            } else
                misc.Logging("Slideshow: problem finding the Records-Misc directory/folder.");
        }
        if (postdata.hasOwnProperty('Headstones')) {
            dir = path.join(misc.ProcessDBSysInfo ("DBLocation"), "Images", "Misc", "Headstones");
            if (isDir(dir)) {
                const files = fs.readdirSync(dir);
                if (files.length)
                    swSS = 1;
            } else
                misc.Logging("Slideshow: problem finding the Misc-Headstones directory/folder.");
        }
    }

    /* if processing gets here, there are no files to show */
    if (swSS == 0)
        return "ERRORS No Images exist for the type(s) checked.";
    else
        return 'SlideshowOK';
}

/*
 * @param {string} path - The path.
 * @returns {boolean} Whether path is a directory, otherwise always false.
 */
function isDir(path) {
    try {
        const stat = fs.lstatSync(path);
        return stat.isDirectory();
    } catch (e) {
        // lstatSync throws an error if path doesn't exist
        return false;
    }
}

module.exports = { Slideshow };

