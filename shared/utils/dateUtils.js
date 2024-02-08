const moment = require('moment');
// 'use strict';
/**
 * gets Unix Timestamp
 * @return {String} unix timestamp
 */
function getEpocTime() {
    const dateTime = new Date().getTime();
    const timestamp = Math.floor(dateTime / 1000);

    return timestamp;
}

exports.getEpocTime = getEpocTime;

