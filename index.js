const calExpander = require('ical-expander');
const https = require('https');

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
    const end = new Date(now.getTime() + 1800 * 1000); // 30 Min Ahead
    const cal = ical.between(start, end);

    //console.log(`start ${start} to ${end}`);

    let foundEvents = []; // Blank list of events
    Object.values(cal).forEach(function(cal_type){
        cal_type.forEach(function(events){ // Process Single and Reoccurring Events
            let element = undefined
            if (events.item) {
                element = events.item
            } else {
                element = events
            }
            element.component.jCal[1].forEach(function (elements){ // Dig to the shit we actually want (fuck jcal)
                if (elements[0] === 'summary') { // Bruteforce our way to the fucking summary element sense its not predictable
                    if (elements[3].substring(0, 1) === 'P') { // Find Events that begin with "P", this is a internal naming if recordings events
                        foundEvents.push(elements[3].substring(3)) // Remove the trigger term "P1 Profound Sounds" => "Profound Sounds"
                    }
                }
            })
        })
    })

    // Prints Current Airing Event
    if (foundEvents.length > 0) {
        console.log(foundEvents[0])
        process.exit(0);
    } else {
        // No Events were found so get metadata from SXM (Handled externally)
        console.log('NOEVENT')
        process.exit(0);
    }
}

process.on('uncaughtException', function(err) {
    // Any error should always protect the output from anything that will mess up the bash scripts
    console.log('NOEVENT')
    process.exit(1)
});


parseCalender()
