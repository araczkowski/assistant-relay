const express = require('express');
const ais_add_token = express.Router();
const fs = require('fs');
const path = require('path');
const tokensFolder = 'server/configurations/tokens/';
const OAuth2 = new (require('google-auth-library'))().OAuth2;
const configureUsers = require('./configuration').configureUsers;
const setupAssistant = require('./assistant').setupAssistant;


ais_add_token.post('/', function (req, res) {
  let gate_id = req.body.user;
  let oauthCode = req.body.oauthCode;
  let secretInfo = {}
  // get config from file
  secretPath = path.resolve(__dirname, `configurations/secrets/${gate_id}.json`)
  if (fs.existsSync(secretPath)) {
    try {
      secretInfo = fs.readFileSync(secretPath);
      console.log("secretInfo: " + secretInfo)
    } catch(error) {
      res.status(400).json({"err": error});
    }
  } else {
    res.status(400).json({"err": "No device registered"});
  }
  secretInfo = JSON.parse(secretInfo);
  const key = secretInfo.installed || secretInfo.web;
  const oauthClient = new OAuth2(key.client_id, key.client_secret, key.redirect_uris[0]);

  // get our tokens to save
  oauthClient.getToken(oauthCode, (error, tkns) => {
    // if we didn't have an error, save the tokens
    if (error){
      res.status(400).json({"err": error});
    } else {
      oauthClient.setCredentials(tkns);
      // save token to file
      fs.writeFile(tokensFolder + gate_id + '-tokens.json', JSON.stringify(tkns), function(err) {
        if(err) {
          res.status(400).json({"err": error});
    
        } else {
          // Configure users after the user was added
          configureUsers()
          setupAssistant()

          res.status(200).json({
            message: "The token was saved!"
          });

        }    
      });
    }
  });
})

module.exports = ais_add_token;
