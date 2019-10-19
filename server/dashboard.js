const express = require('express');
const ip = require('ip');

const dashboard = express.Router();

dashboard.get('/', function (req, res) {
  res.render('index', {
    ip: ip.address(),
    port: global.db.get('port').value(),
    customAddress: global.db.get('customAddress').value(),
    baseurl: global.db.get('baseUrl').value(),
    muteStartup: global.db.get('muteStartup').value(),
    enableQuietHours: global.db.get('enableQuietHours').value(),
    quietStart: global.db.get('quietHours.start').value(),
    quietEnd: global.db.get('quietHours.end').value(),
  })
})

module.exports = dashboard;
