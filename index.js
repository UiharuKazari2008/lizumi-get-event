const calExpander = require('ical-expander');
//const fs = require('fs');
const https = require('https');
//const args = process.argv.slice(2)

const calenderUrl = 'webcal://p31-caldav.icloud.com/published/2/MTAwMDA1MTk0NjEwMDAwNZb0-_EO5Cnp-ZlXblyvC1qDRNXRRgiFqev0agb0RgqtE0kd9GenzfLNx8AAH5xbgfDXYxGT8WZ0KGr7a4Ld5S0'

function parseCalender() {
    https.get(calenderUrl.replace('webcal://', 'https://'), (resp) => {
        resp.setEncoding('utf8');
        let data = '';

        resp.on('data', (chunk) => {
            data += chunk;
        });

        resp.on('end', () => {
            printResult(data)
        });

    }).on('error', (err) => {
        if (err) {
            console.log('NOEVENT')
            process.exit(0);
        }
    });

}

function printResult(data){
    const ical = new calExpander({
        ics: data,
        maxIterations: 1000
    });
    const now = new Date();
    const start = new Date(now.getTime());
    const end = new Date(now.getTime() + 60 * 60 * 1000);
    const cal = ical.between(start, end);

    //console.log(`start ${start} to ${end}`);
    //console.log(cal.occurrences[0].item.component.jCal[1][3][3])
    //console.log(cal)

    let foundEvents = [];
    if (cal && cal.events.length > 0) {
        cal.events.forEach(function (event){
            if (event.component.jCal[1][3][3].includes("P1 ") || event.component.jCal[1][3][3].includes("P2 ") ) {
                foundEvents.push(event.component.jCal[1][3][3].replace("P1 ", "").replace("P2 ", "")) }
        })
    } else if (cal && cal.occurrences.length > 0) {
        cal.occurrences.forEach(function (event){
            if (event.item.component.jCal[1][3][3].includes("P1 ") || event.item.component.jCal[1][3][3].includes("P2 ") ) {
                foundEvents.push(event.item.component.jCal[1][3][3].replace("P1 ", "").replace("P2 ", "")) }
        })
    }

    // Prints Current Airing Event
    if (foundEvents.length > 0) {
        console.log(foundEvents[0])
        process.exit(0);
    } else {
        // No Events were found so get metadata from SXM
        console.log('NOEVENT')
        process.exit(0);
    }
}

process.on('uncaughtException', function(err) {
    //console.log(err)
    console.log('NOEVENT')
    process.exit(1)
});


parseCalender()
