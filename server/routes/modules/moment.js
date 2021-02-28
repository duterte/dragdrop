const moment = require('moment');
const momentTimeZone = require('moment-timezone');
const NY = momentTimeZone.tz('America/New_York');
const sub = NY.subtract(1, 'days');
module.exports = moment(sub).format('YYMMDD-HHmm');
