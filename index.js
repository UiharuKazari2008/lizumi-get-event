const icalExpander = require('ical-expander');
const fs = require('fs');
const https = require('https');
const args = process.argv.slice(2)

const calenderUrl = 'webcal://p31-caldav.icloud.com/published/2/MTAwMDA1MTk0NjEwMDAwNZb0-_EO5Cnp-ZlXblyvC1oGM5r9u_D_jMdLrYgLr4LmMqEW2MlgTraFMH60AD6KRXaFQeQSa_4MXcwWyRykHl4'


function getCalendar(calUrl){
    https.get(calUrl.replace('webcal://', 'https://'), (resp) => {
        resp.setEncoding('utf8');
        let data = '';

        resp.on('data', (chunk) => {
            data += chunk;
        });

        resp.on('end', () => {
            //console.log(data)
            parseCalender(data);
        });

    }).on('error', (err) => {
        if (err) {
            console.log(`Failed to load calender: ${calenderUrl} with error ${err}`);
            process.exit(1);
        }
    });
}

function parseCalender(data) {
    const ical = new icalExpander({
        ics: data,
        maxIterations: 1000
    });
    const now = new Date();
    const start = new Date(now.getTime());
    const end = new Date(now.getTime() + 60 * 60 * 1000);
    const cal = ical.between(start, end);

    if (cal && cal.events.length > 0) {
        let foundEvents = [];
        cal.events.forEach(function (event){
            if (event.component.jCal[1][6][3].includes("P1 ") || event.component.jCal[1][6][3].includes("P2 ") ) {
                foundEvents.push(event.component.jCal[1][6][3].replace("P1 ", "").replace("P2 ", ""))
            }
        })

        // Prints Current Airing Event
        console.log(foundEvents[0])
        process.exit(0);
    } else {
        // No Events were found so get metadata from SXM
        console.log("No ongoing events")
        process.exit(1);
    }

}



getCalendar(calenderUrl)