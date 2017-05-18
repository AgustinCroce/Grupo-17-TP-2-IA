'use strict';

const csv      = require('fast-csv');
const fs       = require('fs');
const jsonfile = require('jsonfile');

let index    = 0;
const object = {};

const stream = fs.createReadStream('tp.csv');

function getHours(timeString) {
    let timeArray;

    if (timeString[4] === ':' || timeString[4] === undefined) {
        timeArray = timeString.slice(0, 4).split(':');
    } else {
        timeArray = timeString.slice(0, 5).split(':');
    }

    const hours   = parseInt(timeArray[0]);
    const minutes = parseInt(timeArray[1]);
    return minutes ? hours + minutes / 60 : hours;

}

const csvStream = csv()
    .on('data', function(data) {
        if (data[0] === '0') {
            index++;
            object[index] = {};
        }

        object[index][data[0]] = {
            cost:        parseInt(data[2]),
            flightHours: getHours(data[5]),
            stopHours:   getHours(data[4])
        }
    })
    .on('end', function() {
        jsonfile.writeFileSync('./flights.json', object, {
            spaces: 2
        });
        console.log('done');
    });

stream.pipe(csvStream);