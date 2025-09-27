const fs = require ("fs-extra");
const path = require("path");
const schedule = require('node-schedule');
const misc = require ("./misc.js");

/* look for a change in a Web page */
async function checkWebPage (params, clients) {
    // get hash for Web page contents; compare to saved hash;
    // if different, save new hash, write MonitorURLs.json file & send user notification
    var newHash;

    try {
        const response = await fetch(params.URL, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        })

        if (!response.ok)
            throw new Error(`Network response was not ok: ${response.status}`); // Throw error on bad response

        const responseData = await response.text();
        newHash = calculateHash(responseData);

        if (newHash !== params.hash) {
            const message = `The contents for ${params.URL} have changed!`;
            misc.Logging(message);

            // Send update to ALL connected clients
            clients.forEach(client => {
                client.res.write(`event: monitorweb-update\n`);
                client.res.write(`data: ${JSON.stringify({ message: message })}\n\n`);
            })

            // Update the hash in the global MonURLs array
            for (var x = 0; x < Object.keys(MonURLs).length; x++)
                if (params.URL === MonURLs[x].URL) {
                    MonURLs[x].hash = newHash;
                    break;
                }

            misc.dirExist("UserFiles");
            try {
                fs.writeFileSync(path.join("UserFiles", "MonitorURLs.json"), JSON.stringify(MonURLs, null, 2));
                misc.Logging('File saved for URLs being monitored.');
            } catch (err) {
                misc.Logging('Could not save file for URLs being monitored. ' + '\(' + err + '\)');
            }
        } else {
            const msg = 'No change to contents of &lt' + params.URL + '&gt.';
            misc.Logging(msg);
        }
    } catch (error) {
        const message = `Monitor for ${params.URL} failed! Error: ${error.message}`;
        misc.Logging(message);

        // Send error update to ALL connected clients
        clients.forEach(client => {
            client.res.write(`event: monitorweb-update\n`);
            client.res.write(`data: ${JSON.stringify({ message: message })}\n\n`);
        })
    }
}

function setCronMon(params) {
    misc.Logging(`Monitor Web page (${params.URL}) cron job installed.`);
    var interval;

    if (params.Interval == 0)
        interval = "0 14 * * *";
    if (params.Interval == 1)
        interval = "0 14 * * 0";
    if (params.Interval == 2)
        interval = "0 14 1 * *";

    const job = schedule.scheduleJob(interval, function() {
        checkWebPage(params, sseClients);
    })
}

/* calculate a hash */
function calculateHash(text) {
    let hash = 0;
    if (text.length === 0)
        return hash;
    for (let i = 0; i < text.length; i++) {
        let char = text.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;          // Convert to 32bit integer
    }
    return hash;
}

module.exports = { setCronMon, calculateHash };
