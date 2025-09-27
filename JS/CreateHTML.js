const fs = require("fs-extra");
const path = require("path");
const os = require("os");
const misc = require ("./misc.js");

function CreateHTML () {
    var Herrs = '';

    /* user wants to create a HTML version of the active DataBase */
    if (misc.ProcessDBSysInfo("DBName") == -1)
        Herrs += "No Family DataBase is active.<br>Activate a Family DataBase and resubmit the form.<br> <br>";
    else {
        if (misc.ProcessDBSysInfo("DBStatus") != 1 && misc.ProcessDBSysInfo("DBStatus") != 3)
            Herrs += "The active Family DataBase is not verified.<br>The DataBase must be successfully verified before the HTML version " +
                     "can be created.<br> <br>";
        var loc = misc.ProcessDBSysInfo("DBLocation");
        var tob = path.join(loc, "HTML", "tableofcontents.html");
        if (fs.existsSync(tob))
            Herrs += "A HTML version of the active Family Data already exists.<br> <br>";
        var rDB = misc.ReadFamilyDB ();
        if (!rDB)
            Herrs += "There are no family files for the active DataBase.<br>There's nothing from which to create a HTML version.<br> <br>";
        if (rDB == -2)
            Herrs += "The DataBase is larger than 200MB and cannot be processed.<br> <br>";
    }
    return Herrs;
}

function DoCreateHTML () {
    var dbname = misc.ProcessDBSysInfo("DBName"), fdpos, linecnt = 0, createerr = 0, famgroup, fgcnt = 0, prevgen = -1, prevseq = -1, tcont,
        fgpos, Tfgpos, ToCont, gen, seq, ID, splitID = [""], wfamgroup, parts=[], x, y, z, b, EndCont, EndCont1, EndCont2, EndCont3, target,
        midHOF = 0, opencnt = 0, nowrap = 0, cntperiods, cntnumbers1, cntnumbers2, firstGen, firstSeq, mapfiles = [], projfilesize, fnameadded,
        Hdata;

    Hdata = '<!doctype html> <html lang="en"><head> <meta charset="utf-8"/> <link rel="shortcut icon" href="Include/favicon.ico"> <title> ' +
            dbname + ' </title>' + '</head><body style="margin-left:10%;margin-right:10%;line-height:1.4;font-size: 100%" ' +
            'bgcolor="#ffffff"><pre>' + '<center> <p> <h1>' + dbname + ' </h1> <p> </center><hr> <p>' + os.EOL;

    linecnt += (familydata.split("\n").length - 1);
    /* point to first character in familydata; it will be an HOF ID */
    for (fdpos = 0; fdpos < familydata.length; fdpos++)
        if (familydata[fdpos] >= '0' && familydata[fdpos] <= '9')
            break;

    if (fdpos >= familydata.length) {
        Hdata += "There doesn't seem to be any Family Data.<br>";
        createerr = 1;
    }

    /* make a pass through familydata building mapfiles[] based upon projected file size */
    var TTfdpos = fdpos;
    fnameadded = 1;
    projfilesize = Hdata.length;    // initialize projected file size to length of HTML header data
    while (1) {
        if (TTfdpos >= familydata.length)
            break;
        famgroup = "";
        fgpos = 0;
        famgroup = familydata.substring(TTfdpos, familydata.indexOf ("\n\n\n", TTfdpos) + 1);
        if (famgroup.indexOf("  OPEN") != -1) {
            TTfdpos += (famgroup.length + 3);
            opencnt++;
            continue;
        }
        while (1) {
            ID = famgroup.substring(fgpos, famgroup.indexOf(" ", fgpos));
            splitID = ID.split('.');
            gen = splitID[0];
            seq = splitID[1];
            if (prevseq == -1) {
                prevseq = seq;
                firstSeq = prevseq;
            } else
                if (seq != prevseq && (gen == prevgen || midHOF))
                    prevseq = seq;
            if (prevgen == -1) {
                prevgen = gen;
                firstGen = prevgen;
            } else
                if (projfilesize > 200000 && !midHOF) {
                    mapfiles.push(fnameadded, firstGen + "." + firstSeq, gen + "." + seq);
                    prevgen = gen;
                    firstGen = prevgen;
                    prevseq = seq;
                    firstSeq = prevseq;
                    fnameadded++;
                    projfilesize = Hdata.length;    // initialize projected file size to length of HTML header data
                }
            fgpos = famgroup.indexOf("\n\n", fgpos) + 2;
            if (famgroup[fgpos] >= '0' && famgroup[fgpos] <= '9') {
                midHOF = 1;
                projfilesize += 104;         // add to projected file size for each HOF
                continue;
            } else {
                midHOF = 0;
                break;
            }
        }
        TTfdpos += (famgroup.length + 3);
        /* accumulate projected file size */
        projfilesize += famgroup.length;           // data size
        /* size of HTML to be added to Family Group */
        for (x = 0; x < famgroup.length; x++) {
            if (famgroup[x - 1] == "\n" && misc.DetermineSection (x) == "Citations") {
                if (famgroup[x] >= "0" && famgroup[x] <= "9") {
                    y = famgroup.indexOf("  ", x);
                    if (y == -1)
                        continue;
                    b = famgroup.substring(x, y);
                    if (b.length < 2)
                        /* a Citation identifier (number) must be at least 1 number and a period */
                        continue;
                    for (z = 0; z < b.length; z++)
                        if (z == (b.length - 1)) {
                            if (b[z] != '.') {     /* last position of identifier must be a period */
                                z = 0;
                                break;
                            }
                        } else
                            if (b[z] < '0' || b[z] > '9') {     /* all positions except last must be a number */
                                z = 0;
                                break;
                            }
                    if (!z)
                        continue;
                    projfilesize += 18;         // add to projected file size for a numbered Citation entry
                    x = y - 1;
                }
                continue;
            }

            if (famgroup[x] >= '0' && famgroup[x] <= '9') {
                for (y = x; y < famgroup.length; y++)
                    if (famgroup[y] == " " || famgroup[y] == "," || famgroup[y] == ")" || famgroup[y] == ";")
                        break;
                if (y >= famgroup.length)
                    continue;
                var TTTid = famgroup.substring(x, y);
                for (cntperiods = cntnumbers1 = cntnumbers2 = z = 0; z < TTTid.length; z++)
                    /* IDs must contain 1 period and numbers on either side of the period */
                    if (TTTid[z] >= "0" && TTTid[z] <= "9")
                        if (!cntperiods)
                            cntnumbers1 = 1;
                        else
                            cntnumbers2 = 1;
                    else
                        if (TTTid[z] == ".")
                            if (cntperiods)
                                /* this is the second period found; it could still be an ID but we're not going to deal with it */
                                break;
                            else
                                cntperiods = 1;
                        else
                            break;
                if (z < TTTid.length || !cntnumbers1 || !cntnumbers2 || !cntperiods)
                    /* not an ID */
                    continue;
                else {
                    projfilesize += 29;         // add to projected file size for an ID
                    continue;
                }
            }

            if (famgroup[x] == '<') {
                y = famgroup.indexOf(">", x);
                if (y == -1)
                    continue;
                var TTtcont = famgroup.substring(x + 1, y);
                z = TTtcont.search("@");
                if (z == -1)
                    /* a Web address */
                    projfilesize += 75;         // add to projected file size for a Web address
                else
                    /* an email address */
                    projfilesize += 91;         // add to projected file size for an email address
                x = y;
                continue;
            }

            if (famgroup[x] == '[') {
                y = famgroup.indexOf("]", x);
                if (y == -1)
                    continue;
                /* every character between [ and ] must be a number */
                var TTTtcont = famgroup.substring(x + 1, y);
                for (z = 0; z < TTTtcont.length; z++)
                    if (isNaN(TTTtcont[z])) {
                        z = 0;
                        break;
                    }
                if (!z)
                    continue;
                /* a Citation reference */
                projfilesize += 31;         // add to projected file size for a Citation reference
                x = y;
                continue;
            }

            if (famgroup.substring(x, x + 11) == "Reference->" || famgroup.substring(x, x + 8) == "People->" ||
                    famgroup.substring(x, x + 13) == "Biographies->" || famgroup.substring(x, x + 6) == "Maps->" ||
                    famgroup.substring(x, x + 6) == "Misc->" || famgroup.substring(x, x + 12) == "Newspapers->" ||
                    famgroup.substring(x, x + 9) == "Records->" || famgroup.substring(x, x + 17) == "UnsureIfRelated->") {
                var TTBegpnt = x;
                y = famgroup.substring(TTBegpnt).search(/\s|,|\)|"\n"/) + TTBegpnt; //look for first whitespace, comma, right paren or newline
                if (famgroup.substring(TTBegpnt, TTBegpnt + 9) == "Reference")
                    projfilesize += 59;         // add to projected file size for a Reference link
                else
                    projfilesize += 66;         // add to projected file size for an Images link

                x = y - 1;
                continue;
            }
        }
    }
    mapfiles.push(fnameadded, firstGen + "." + firstSeq, gen + "." + seq);

    /* need to add 1 to the sequence number in the final mapfiles[] slot in order to get the last Family Group */
    var splitTT = mapfiles[mapfiles.length - 1].split('.');
    splitTT[1]++;
    mapfiles[mapfiles.length - 1] = splitTT[0] + "." + splitTT[1];

    midHOF = 0;
    prevgen = prevseq = -1;
    /* go through familydata again wrapping it with HTML */
    var mapiter = 0;
    while (mapiter < mapfiles.length) {
        if (fdpos >= familydata.length)
            /* end of data */
            break;
        wfamgroup = "";
        famgroup = "";
        fgpos = 0;
        var splitMapID = mapfiles[mapiter + 1].split('.');
        var genMapb = splitMapID[0];
        var seqMapb = splitMapID[1];
        splitMapID = mapfiles[mapiter + 2].split('.');
        var genMape = splitMapID[0];
        var seqMape = splitMapID[1];

        /* extract Family Group */
        famgroup = familydata.substring(fdpos, familydata.indexOf ("\n\n\n", fdpos) + 1);
        if (famgroup.indexOf("  OPEN") != -1) {
            fdpos += (famgroup.length + 3);
            continue;
        }

        /* process HOF section */
        while (1) {
            ID = famgroup.substring(fgpos, famgroup.indexOf(" ", fgpos));
            splitID = ID.split('.');
            gen = splitID[0];
            seq = splitID[1];

            if (prevgen == -1)
                prevgen = gen;
            else
                if (Number(gen) > Number(genMape) || (Number(gen) == Number(genMape) && Number(seq) >= Number(seqMape)) && !midHOF) {
                    Hdata += "</pre> </body> </html>";

                    var loc = misc.ProcessDBSysInfo("DBLocation");
                    misc.dirExist(path.join(loc, "HTML"));                   /* create HTML directory/folder if it doesn't already exist */
                    target = path.join(loc, "HTML", "body" + mapfiles[mapiter] + ".html");
                    try {
                        fs.writeFileSync(target, Hdata);
                        misc.Logging("Created '" + target + "'.");
                    }
                    catch (err) {
                        misc.Logging(err + "; problem writing '" + target + "'.");
                    }

                    wfamgroup = "";
                    Hdata = '<!doctype html> <html lang="en"><head> <meta charset="utf-8"/> <link rel="shortcut icon"' +
                            '"href="Include/favicon.ico"> <title> ' + dbname + ' </title>' +
                            '</head><body style="margin-left:10%;margin-right:10%;line-height:1.4;font-size: 100%" ' +
                            'bgcolor="#ffffff"><pre>' + '<center> <p> <h1>' + dbname + ' </h1> <p> </center><hr> <p>' + os.EOL;
                    mapiter += 3;
                    splitMapID = mapfiles[mapiter + 1].split('.');
                    genMapb = splitMapID[0];
                    seqMapb = splitMapID[1];
                    splitMapID = mapfiles[mapiter + 2].split('.');
                    genMape = splitMapID[0];
                    seqMape = splitMapID[1];
                }

            /* wrap HOF */
            Tfgpos = fgpos;
            fgpos = famgroup.indexOf("\n", Tfgpos);
            wfamgroup += '<a id="item' + ID + '"><b><font size="+2">' + famgroup.substring(Tfgpos, fgpos) + "</font></b></a>" + os.EOL;

            /* wrap Father if needed */
            fgpos = famgroup.indexOf("Father -", Tfgpos);
            if (famgroup[fgpos + 9] >= '0' && famgroup[fgpos + 9] <= '9') {
                var fID = famgroup.substring(fgpos + 9, famgroup.indexOf(" ", fgpos + 9));
                var afterName = famgroup.indexOf("\n", fgpos + 9);

                /* wrap Father ID */
                var fidGen = fID.substring(0, fID.indexOf("."));
                var fidSeq = fID.substring(fID.indexOf(".") + 1);
                var fidBody = -1;
                if (Number(fidGen) >= Number(mapfiles[1].substring(0, mapfiles[1].indexOf(".")))) {
                    /* if the generation is less than the lowest generation then don't wrap it */
                    for (y = 0; y < mapfiles.length; y += 3)
                        if ((Number(fidGen) > Number(mapfiles[y + 1].substring(0, mapfiles[y + 1].indexOf("."))) &&
                                    Number(fidGen) < Number(mapfiles[y + 2].substring(0, mapfiles[y + 2].indexOf(".")))) ||
                                    (Number(fidGen) > Number(mapfiles[y + 1].substring(0, mapfiles[y + 1].indexOf("."))) &&
                                    Number(fidGen) == Number(mapfiles[y + 2].substring(0, mapfiles[y + 2].indexOf("."))) &&
                                    Number(fidSeq) < Number(mapfiles[y + 2].substring(mapfiles[y + 2].indexOf(".") + 1))) ||
                                    (Number(fidGen) >= Number(mapfiles[y + 1].substring(0, mapfiles[y + 1].indexOf("."))) &&
                                    Number(fidSeq) >= Number(mapfiles[y + 1].substring(mapfiles[y + 1].indexOf(".") + 1)) &&
                                    Number(fidGen) < Number(mapfiles[y + 2].substring(0, mapfiles[y + 2].indexOf(".")))) ||
                                    (Number(fidGen) >= Number(mapfiles[y + 1].substring(0, mapfiles[y + 1].indexOf("."))) &&
                                    Number(fidSeq) >= Number(mapfiles[y + 1].substring(mapfiles[y + 1].indexOf(".") + 1)) &&
                                    Number(fidGen) == Number(mapfiles[y + 2].substring(0, mapfiles[y + 2].indexOf("."))) &&
                                    Number(fidSeq) < Number(mapfiles[y + 2].substring(mapfiles[y + 2].indexOf(".") + 1)))) {
                            fidBody = mapfiles[y];
                            break;
                        }
                    if (fidBody == -1) {
                        misc.Logging("Could not wrap Father ID '" + fID + "' on Father line in Head of Family Section in Family Group '" + ID +
                                     "'. " + "No such ID in Family DataBase.");
                        wfamgroup += famgroup.substring(fgpos, afterName + 1);
                    } else
                        wfamgroup += famgroup.substring(fgpos, fgpos + 9) + '<a href="body' + fidBody + '.html#item' +
                                     fID + '">' + famgroup.substring(fgpos + 9, afterName) + "</a>" + os.EOL;
                }
                fgpos = afterName + 1;
            } else {
                wfamgroup += famgroup.substring(fgpos, famgroup.indexOf("\n", fgpos) + 1);
                fgpos = famgroup.indexOf("\n", fgpos) + 1;
            }
            /* wrap Mother if needed */
            Tfgpos = fgpos;
            fgpos = famgroup.indexOf("Mother -", Tfgpos);
            if (famgroup[fgpos + 9] >= '0' && famgroup[fgpos + 9] <= '9') {
                var mID = famgroup.substring(fgpos + 9, famgroup.indexOf(" ", fgpos + 9));
                var afterName = famgroup.indexOf("\n", fgpos + 9);

                /* wrap Mother ID */
                var midGen = mID.substring(0, mID.indexOf("."));
                var midSeq = mID.substring(mID.indexOf(".") + 1);
                var midBody = -1;
                for (y = 0; y < mapfiles.length; y += 3)
                    if ((Number(midGen) > Number(mapfiles[y + 1].substring(0, mapfiles[y + 1].indexOf("."))) &&
                            Number(midGen) < Number(mapfiles[y + 2].substring(0, mapfiles[y + 2].indexOf(".")))) ||
                            (Number(midGen) > Number(mapfiles[y + 1].substring(0, mapfiles[y + 1].indexOf("."))) &&
                            Number(midGen) == Number(mapfiles[y + 2].substring(0, mapfiles[y + 2].indexOf("."))) &&
                            Number(midSeq) < Number(mapfiles[y + 2].substring(mapfiles[y + 2].indexOf(".") + 1))) ||
                            (Number(midGen) >= Number(mapfiles[y + 1].substring(0, mapfiles[y + 1].indexOf("."))) &&
                            Number(midSeq) >= Number(mapfiles[y + 1].substring(mapfiles[y + 1].indexOf(".") + 1)) &&
                            Number(midGen) < Number(mapfiles[y + 2].substring(0, mapfiles[y + 2].indexOf(".")))) ||
                            (Number(midGen) >= Number(mapfiles[y + 1].substring(0, mapfiles[y + 1].indexOf("."))) &&
                            Number(midSeq) >= Number(mapfiles[y + 1].substring(mapfiles[y + 1].indexOf(".") + 1)) &&
                            Number(midGen) == Number(mapfiles[y + 2].substring(0, mapfiles[y + 2].indexOf("."))) &&
                            Number(midSeq) < Number(mapfiles[y + 2].substring(mapfiles[y + 2].indexOf(".") + 1)))) {
                        midBody = mapfiles[y];
                        break;
                    }
                if (midBody == -1) {
                    misc.Logging("Could not wrap Mother ID '" + mID + "' on Mother line in Head of Family Section in Family Group '" + ID +
                                 "'. " + "No such ID in Family DataBase.");
                    wfamgroup += famgroup.substring(fgpos, afterName + 1);
                } else
                    wfamgroup += famgroup.substring(fgpos, fgpos + 9) + '<a href="body' + midBody + '.html#item' +
                                 mID + '">' + famgroup.substring(fgpos + 9, afterName) + "</a>" + os.EOL + os.EOL;
                fgpos = afterName + 2;
            } else {
                wfamgroup += famgroup.substring(fgpos, famgroup.indexOf("\n", fgpos) + 2);
                fgpos = famgroup.indexOf("\n", fgpos) + 2;
            }
            /* check for another HOF line */
            if (famgroup[fgpos] >= '0' && famgroup[fgpos] <= '9') {
                midHOF = 1;
                continue;
            } else {
                midHOF = 0;
                break;
            }
        }

        /* HOF section of the Family Group is done; fgpos is pointing to position 0 of the 2nd line after the last "Mother -" line (there can
           be multiple "Mother -" lines in one HOF section; the first line after the last "Mother -" line is a null line); go through rest of
           Family Group and wrap pointers to files (->), email & Web addresses (<>), pointers to Citations ([]) and IDs (n.n) */
        for (ToCont = fgpos; ToCont < famgroup.length; ToCont++) {
            parts.length = 0;

            if (famgroup[ToCont - 1] == "\n" && misc.DetermineSection (fdpos + ToCont) == "Citations") {
                if (famgroup[ToCont] >= "0" && famgroup[ToCont] <= "9") {
                    EndCont = famgroup.indexOf("  ", ToCont);
                    if (EndCont == -1) {
                        wfamgroup += famgroup[ToCont];
                        continue;
                    }
                    var tcont = famgroup.substring(ToCont, EndCont);
                    if (tcont.length < 2) {
                        /* a Citation identifier (number) must be at least 1 number and a period */
                        wfamgroup += famgroup[ToCont];
                        continue;
                    }
                    for (x = 0; x < tcont.length; x++)
                        if (x == (tcont.length - 1)) {
                            if (tcont[x] != '.') {     /* last position of identifier must be a period */
                                x = 0;
                                break;
                            }
                        } else
                            if (tcont[x] < '0' || tcont[x] > '9') {     /* all positions except last must be a number */
                                x = 0;
                                break;
                            }
                    if (!x) {
                        wfamgroup += famgroup[ToCont];
                        continue;
                    }

                    wfamgroup += '<a id="item' + ID + "." + tcont.substring(0, tcont.length - 1) + '">' + tcont + "</a>";
                    ToCont = EndCont - 1;
                    continue;
                }
            }

            if (famgroup[ToCont] >= '0' && famgroup[ToCont] <= '9') {
                for (EndCont = ToCont; EndCont < famgroup.length; EndCont++) {
                    if (famgroup[EndCont] == " " || famgroup[EndCont] == "," || famgroup[EndCont] == ")" || famgroup[EndCont] == ";")
                        break;
                }
                if (EndCont >= famgroup.length) {
                    wfamgroup += famgroup[ToCont];
                    continue;
                }
                var Tid = famgroup.substring(ToCont, EndCont);
                for (cntperiods = cntnumbers1 = cntnumbers2 = x = 0; x < Tid.length; x++)
                    /* IDs must contain 1 period and numbers on either side of the period */
                    if (Tid[x] >= "0" && Tid[x] <= "9")
                        if (!cntperiods)
                            cntnumbers1 = 1;
                        else
                            cntnumbers2 = 1;
                    else
                        if (Tid[x] == ".")
                            if (cntperiods)
                                /* this is the second period found; it could still be a valid ID but we're not going to deal with it */
                                break;
                            else
                                cntperiods = 1;
                        else
                            break;
                if (x < Tid.length || !cntnumbers1 || !cntnumbers2 || !cntperiods) {
                    /* not an ID */
                    wfamgroup += famgroup[ToCont];
                    continue;
                } else {
                    /* got what appears to be an ID, check that the Family Group exists before wrapping it */
                    x = familydata.indexOf("\n\n" + Tid);
                    if (x == -1) {
                        /* a Family Group with this ID doesn't exist; don't wrap ID */
                        wfamgroup += famgroup[ToCont];
                        continue;
                    }
                    var TidGen = Tid.substring(0, Tid.indexOf("."));
                    var TidSeq = Tid.substring(Tid.indexOf(".") + 1);
                    var TidBody = -1;
                    for (y = 0; y < mapfiles.length; y += 3)
                        if ((Number(TidGen) > Number(mapfiles[y + 1].substring(0, mapfiles[y + 1].indexOf("."))) &&
                                Number(TidGen) < Number(mapfiles[y + 2].substring(0, mapfiles[y + 2].indexOf(".")))) ||
                                (Number(TidGen) > Number(mapfiles[y + 1].substring(0, mapfiles[y + 1].indexOf("."))) &&
                                Number(TidGen) == Number(mapfiles[y + 2].substring(0, mapfiles[y + 2].indexOf("."))) &&
                                Number(TidSeq) < Number(mapfiles[y + 2].substring(mapfiles[y + 2].indexOf(".") + 1))) ||
                                (Number(TidGen) >= Number(mapfiles[y + 1].substring(0, mapfiles[y + 1].indexOf("."))) &&
                                Number(TidSeq) >= Number(mapfiles[y + 1].substring(mapfiles[y + 1].indexOf(".") + 1)) &&
                                Number(TidGen) < Number(mapfiles[y + 2].substring(0, mapfiles[y + 2].indexOf(".")))) ||
                                (Number(TidGen) >= Number(mapfiles[y + 1].substring(0, mapfiles[y + 1].indexOf("."))) &&
                                Number(TidSeq) >= Number(mapfiles[y + 1].substring(mapfiles[y + 1].indexOf(".") + 1)) &&
                                Number(TidGen) == Number(mapfiles[y + 2].substring(0, mapfiles[y + 2].indexOf("."))) &&
                                Number(TidSeq) < Number(mapfiles[y + 2].substring(mapfiles[y + 2].indexOf(".") + 1)))) {
                            TidBody = mapfiles[y];
                            break;
                        }
                    if (TidBody == -1) {
                        misc.Logging("Could not wrap ID '" + Tid + "' in Family Group '" + ID + "'. No such ID in Family DataBase.");
                        wfamgroup += famgroup.substring(ToCont, famgroup.indexOf(".", ToCont) + 1);
                        ToCont = famgroup.indexOf(".", ToCont);
                        nowrap = 1;
                    } else {
                        wfamgroup += '<a href="body' + TidBody + '.html#item' + Tid + '">' + Tid + '</a>';
                        ToCont = EndCont - 1;
                    }
                    continue;
                }
            }

            if (famgroup[ToCont] == '<') {
                EndCont = famgroup.indexOf(">", ToCont);
                if (EndCont == -1) {
                    wfamgroup += famgroup[ToCont];
                    continue;
                }

                var tcont = famgroup.substring(ToCont + 1, EndCont);
                x = tcont.search("@");
                if (x == -1) {
                    /* wrap a Web address */
                    if (tcont.substring(0, 7) != "http://" && tcont.substring(0, 8) != "https://")
                        tcont = "http://" + tcont;
                    wfamgroup += '<a href="' + tcont + '" target="_blank" rel="noopener noreferrer">&lt;' +
                                 famgroup.substring(ToCont + 1, EndCont) + "&gt;</a>";
                } else
                    /* wrap an email address */
                    wfamgroup += '<a href="mailto:' + tcont + '?subject=' + dbname + '" target="_blank" rel="noopener noreferrer">&lt;' +
                                 famgroup.substring(ToCont + 1, EndCont) + "&gt;</a>";
                ToCont = EndCont;
                continue;
            }

            if (famgroup[ToCont] == '[') {
                EndCont = famgroup.indexOf("]", ToCont);
                if (EndCont == -1) {
                    wfamgroup += famgroup[ToCont];
                    continue;
                }
                /* every character between [ and ] must be a number */
                var tcont = famgroup.substring(ToCont + 1, EndCont);
                for (x = 0; x < tcont.length; x++)
                    if (isNaN(tcont[x])) {
                        x = 0;
                        break;
                    }
                if (!x) {
                    wfamgroup += famgroup[ToCont];
                    continue;
                }
                /* wrap a Citation reference */
                wfamgroup += '<a href="#item' + ID + '.' + tcont + '">' + famgroup.substring(ToCont, EndCont + 1) + "</a>";

                ToCont = EndCont;
                continue;
            }

            if (famgroup.substring(ToCont, ToCont + 11) == "Reference->" || famgroup.substring(ToCont, ToCont + 8) == "People->" ||
                    famgroup.substring(ToCont, ToCont + 13) == "Biographies->" || famgroup.substring(ToCont, ToCont + 6) == "Maps->" ||
                    famgroup.substring(ToCont, ToCont + 6) == "Misc->" || famgroup.substring(ToCont, ToCont + 12) == "Newspapers->" ||
                    famgroup.substring(ToCont, ToCont + 9) == "Records->" || famgroup.substring(ToCont, ToCont + 17) == "UnsureIfRelated->") {
                var Begpnt = ToCont;
                EndCont = famgroup.substring(Begpnt).search(/\s|,|\)|"\n"/) + Begpnt; //look for first whitespace, comma, rt paren or newline
                var tcont = famgroup.substring(Begpnt, famgroup.indexOf("\n", Begpnt)) + os.EOL;
                var Refend = tcont.search(/\s|,|\)|"\n"/);   // look for the first whitespace, comma, right parenthesis or newline
                for (b = 0, x = 0, y = 0; x < Refend; x++)
                    if ((tcont[x] == '-' && tcont[x + 1] == '>') || x == (Refend - 1)) {
                        if (x == (Refend - 1))
                            x++;
                        parts[y] = tcont.substring(b, x);
                        y++;
                        b = x + 2;
                    }

                if (famgroup.substring(Begpnt, Begpnt + 9) == "Reference" || famgroup.substring(Begpnt, Begpnt + 15) == "UnsureIfRelated")
                    wfamgroup += '<a href="..';
                else
                    wfamgroup += '<a href="../Images';

                for (x = 0; x < parts.length; x++)
                    wfamgroup += ('/' + parts[x]);
                wfamgroup += '" target="_blank" rel="noopener noreferrer">' + tcont.substring(0, Refend) + "</a>";

                ToCont = EndCont - 1;
                continue;
            }

            /* this check (for "Citations") needs to be the last of all the checks */
            if (famgroup[ToCont - 1] == "\n" && misc.DetermineSection (fdpos + ToCont) == "Citations") {
                if (famgroup[ToCont] < "0" || famgroup[ToCont] > "9") {
                    wfamgroup += famgroup[ToCont];
                    continue;
                }
            }

            wfamgroup += famgroup[ToCont];
        }
        Hdata += wfamgroup + os.EOL + "<hr>" + os.EOL;
        fdpos += (famgroup.length + 3);
        fgcnt++;    /* running count of Family Groups */
    }

    Hdata += "</pre> </body> </html>";

    /* write final batch of Family data */
    var loc = misc.ProcessDBSysInfo("DBLocation");
    misc.dirExist(path.join(loc, "HTML"));                   /* create HTML directory/folder if it doesn't already exist */
    target = path.join(loc, "HTML", "body" + mapfiles[mapiter] + ".html");
    try {
        fs.writeFileSync(target, Hdata);
        misc.Logging("Created '" + target + "'.");
    }
    catch (err) {
        misc.Logging(err + "; problem writing '" + target + "'.");
    }

    /* if an index exists in PlainText directory, read it, wrap it in HTML, write it in the HTML directory */
    var famindexloc = path.join(loc, "PlainText", "index"), fipos = 0;
    if (fs.existsSync(famindexloc)) {
        var famindex = fs.readFileSync(famindexloc, 'utf8'), wfamindex = '', poscomma, posEOL, posend, iID, firstletter, curletter;
        famindex = famindex.replace(/\r\n/g, '\n');
        linecnt += (famindex.split("\n").length - 1);

        /* go through index wrapping the IDs */
        while (fipos < famindex.length) {
            if (wfamindex == '') {
                wfamindex = '<!doctype html> <html lang="en"><head> <meta charset="utf-8"/> <link rel="shortcut icon" ' +
                            'href="Include/favicon.ico"> ' + '<title> ' + dbname + ' </title>' +
                            '</head><body style="margin-left:10%;margin-right:10%;line-height:1.4;font-size: 100%" bgcolor="#ffffff"><pre>' +
                            '<center> <p> <h1> Name Index to ' + dbname + '</h1> <p> </center><hr> <p>' + os.EOL;
                curletter = famindex[fipos];
                firstletter = famindex[fipos];
            }
            if (famindex[fipos] >= "0" && famindex[fipos] <= "9") {
                poscomma = famindex.indexOf(",", fipos);
                posEOL = famindex.indexOf("\n", fipos);
                if (poscomma == -1 && posEOL == -1) {
                    wfamindex += famindex[fipos];
                    fipos++;
                } else {
                    if (poscomma == -1)
                        posend = posEOL;
                    else
                        if (posEOL == -1)
                            posend = poscomma;
                        else
                            posend = Math.min(poscomma, posEOL);
                    iID = famindex.substring(fipos, posend);
                    for (cntperiods = cntnumbers1 = cntnumbers2 = x = 0; x < iID.length; x++)
                        /* IDs must contain 1 period and numbers on either side of the period */
                        if (iID[x] >= "0" && iID[x] <= "9")
                            if (!cntperiods)
                                cntnumbers1 = 1;
                            else
                                cntnumbers2 = 1;
                        else
                            if (iID[x] == ".")
                                if (cntperiods)
                                    break;
                                else
                                    cntperiods = 1;
                            else
                                break;
                    if (x < iID.length || !cntnumbers1 || !cntnumbers2 || !cntperiods) {
                        wfamindex += famindex[fipos];
                        fipos++;
                    } else {
                        /* got an ID, wrap it */
                        var iIDGen = iID.substring(0, iID.indexOf("."));
                        var iIDSeq = iID.substring(iID.indexOf(".") + 1);
                        var iIDBody;
                        if (Number(iIDGen) >= Number(mapfiles[1].substring(0, mapfiles[1].indexOf(".")))) {
                            /* if the generation is less than the lowest generation then don't wrap it */
                            for (y = 0; y < mapfiles.length; y += 3)
                                if ((Number(iIDGen) > Number(mapfiles[y + 1].substring(0, mapfiles[y + 1].indexOf("."))) &&
                                         Number(iIDGen) < Number(mapfiles[y + 2].substring(0, mapfiles[y + 2].indexOf(".")))) ||
                                         (Number(iIDGen) > Number(mapfiles[y + 1].substring(0, mapfiles[y + 1].indexOf("."))) &&
                                         Number(iIDGen) == Number(mapfiles[y + 2].substring(0, mapfiles[y + 2].indexOf("."))) &&
                                         Number(iIDSeq) < Number(mapfiles[y + 2].substring(mapfiles[y + 2].indexOf(".") + 1))) ||
                                         (Number(iIDGen) >= Number(mapfiles[y + 1].substring(0, mapfiles[y + 1].indexOf("."))) &&
                                         Number(iIDSeq) >= Number(mapfiles[y + 1].substring(mapfiles[y + 1].indexOf(".") + 1)) &&
                                         Number(iIDGen) < Number(mapfiles[y + 2].substring(0, mapfiles[y + 2].indexOf(".")))) ||
                                         (Number(iIDGen) >= Number(mapfiles[y + 1].substring(0, mapfiles[y + 1].indexOf("."))) &&
                                         Number(iIDSeq) >= Number(mapfiles[y + 1].substring(mapfiles[y + 1].indexOf(".") + 1)) &&
                                         Number(iIDGen) == Number(mapfiles[y + 2].substring(0, mapfiles[y + 2].indexOf("."))) &&
                                         Number(iIDSeq) < Number(mapfiles[y + 2].substring(mapfiles[y + 2].indexOf(".") + 1)))) {
                                    iIDBody = mapfiles[y];
                                    break;
                                }
                            wfamindex += '<a href="body' + iIDBody + '.html#item' + iID + '">' + iID + '</a>';
                        } else
                            wfamindex += iID;
                        fipos = posend;
                    }
                }
            } else {
                wfamindex += famindex[fipos];
                fipos++;
                if (fipos < famindex.length && famindex[fipos - 1] == '\n' && famindex[fipos].toLowerCase() != curletter.toLowerCase() &&
                                                                                                                wfamindex.length > 175000) {
                    /* write segment of index */
                    wfamindex += "</pre> </body> </html>";
                    var target2 = path.join(loc, "HTML", "index");
                    target2 += firstletter + ".html";
                    try {
                        fs.writeFileSync(target2, wfamindex);
                        misc.Logging("Created " + target2 + " in HTML directory.");
                    }
                    catch (err) {
                        misc.Logging(err + "; problem writing '" + target2 + "'.");
                    }
                    wfamindex = '';
                }
                if (famindex[fipos - 1] == '\n')
                    curletter = famindex[fipos];
            }
        }
        if (wfamindex != '') {
            /* write final segment of index */
            wfamindex += "</pre> </body> </html>";
            var target2 = path.join(loc, "HTML", "index");
            target2 += firstletter + ".html";
            try {
                fs.writeFileSync(target2, wfamindex);
                misc.Logging("Created " + target2 + " in HTML directory.");
            }
            catch (err) {
                misc.Logging(err + "; problem writing '" + target2 + "'.");
            }
        }
    } else
        misc.Logging("Cannot create index.html in HTML directory; an index does not exist in PlainText directory.");

    if (fgcnt == 1)
        var FGroup = "Group";
    else
        var FGroup = "Groups";
    if (opencnt == 1)
        var OID = "ID line";
    else
        var OID = "ID lines";
    misc.Logging("Processed " + linecnt + " lines, " + (fdpos + fipos) + " characters, " + fgcnt + " Family " + FGroup + ", " + opencnt +
                 " OPEN " + OID + ".");
    /* create tableofcontents.html */
    misc.TOC("HTML");
    if (nowrap)
        return -1;
    else
        return 0;
}

module.exports = { CreateHTML, DoCreateHTML };

