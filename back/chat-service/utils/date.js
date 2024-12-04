const moment = require("moment-timezone");

exports.getReadableTimestampParis = () => {
  return moment().tz("Europe/Paris").format("YYYY-MM-DD_HH-mm-ss");
};
