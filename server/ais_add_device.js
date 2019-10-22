const express = require('express');
const ais_add_device = express.Router();
const fs = require('fs');
const path = require('path');
const secretsFolder = 'server/configurations/secrets/';
const OAuth2 = new (require('google-auth-library'))().OAuth2;

ais_add_device.post('/', function (req, res) {
  let gate_id = req.body.user;
  let config = req.body.oauthJson;

  const key = config.installed || config.web;
  const oauthClient = new OAuth2(key.client_id, key.client_secret, key.redirect_uris[0]);

  const url = oauthClient.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/assistant-sdk-prototype'],
  });

  fs.writeFile(secretsFolder + gate_id + ".json", JSON.stringify(config), function(err) {
    if(err) {
      res.status(400).json({"error": err});
    } else {
      res.status(200).json({message: url});
    }
    console.log("The file was saved!");
  });
})

module.exports = ais_add_device;
