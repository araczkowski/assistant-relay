const express = require('express');
const ais_add_token = express.Router();
const fs = require('fs');
const path = require('path');
const secretsFolder = 'server/configurations/secrets/';
const OAuth2 = new (require('google-auth-library'))().OAuth2;

ais_add_token.get('/', function (req, res) {
  console.log(req);
  res.status(200).json({
      message: 'POST ais_add_token to add token '
  });
})

ais_add_token.post('/', function (req, res) {
  let gate_id = req.query.gate_id;
  let oauthCode = req.body;
  let secretInfo = {}
  // get config from file
  secretPath = path.resolve(__dirname, `configurations/secrets/${gate_id}.json`)
  console.log("secretPath " + secretPath)
  if (fs.existsSync(secretPath)) {
    try {
      let secretRaw = fs.readFileSync(secretPath);
      console.log("secretRaw: " + secretRaw)
      secretInfo = JSON.parse(secretRaw);
      console.log("secretInfo: " + secretInfo)
    } catch(error) {
      // we need to get the tokens
      res.status(200).json({
        status: 'error',
        message: 'Device secret not json'
      });
    }
  } else {
    res.status(200).json({
      status: 'error',
      message: 'No device registered'
    });
  }

  console.log("secretInfo " + secretInfo)
  const key = secretInfo.installed || secretInfo.web;
  const oauthClient = new OAuth2(key.client_id, key.client_secret, key.redirect_uris[0]);

  // get our tokens to save
  oauthClient.getToken(oauthCode, (error, tkns) => {
    // if we didn't have an error, save the tokens
    if (error){
      console.log("error getToken: " + error)

      res.status(200).json({
        status: 'error',
        message: 'Error getting token: ' + error
      });
      
    } 

    oauthClient.setCredentials(tkns);
    // save token to file
    fs.writeFile(`configurations/tokens/${gate_id}-tokens.json`, JSON.stringify(tkns), () => {});
  
  });

  fs.writeFile(secretsFolder + gate_id + ".json", JSON.stringify(config), function(err) {

    if(err) {
      res.status(200).json({
        status: 'error',
        message: 'Error saving token: ' + error
      });

    }

    console.log("The file was saved!");
  });

  res.status(200).json({
      message: 'Ais device added'
  });
})

module.exports = ais_add_token;
