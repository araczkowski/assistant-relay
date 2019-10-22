const express = require('express');
const ais_add_device = express.Router();
const fs = require('fs');
const path = require('path');
const secretsFolder = 'server/configurations/secrets/';
const OAuth2 = new (require('google-auth-library'))().OAuth2;

ais_add_device.get('/', function (req, res) {
  console.log(req);
  res.status(200).json({
      message: 'POST to add AIS device oAuth2'
  });
})

ais_add_device.post('/', function (req, res) {
  let gate_id = req.query.gate_id;
  let config = req.body;

  const key = config.installed || config.web;
  const oauthClient = new OAuth2(key.client_id, key.client_secret, "http://localhost");

  const url = oauthClient.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/assistant-sdk-prototype'],
  });

  console.log(url)

  fs.writeFile(secretsFolder + gate_id + ".json", JSON.stringify(config), function(err) {

    if(err) {
        return console.log(err);
    }

    console.log("The file was saved!");
  });

  res.status(200).json({
      message: 'Ais device added'
  });
})

module.exports = ais_add_device;
