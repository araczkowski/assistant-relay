const express = require('express');
const ais_remove_integration = express.Router();
const fs = require('fs');
const path = require('path');
const configureUsers = require('./configuration').configureUsers;
const setupAssistant = require('./assistant').setupAssistant;


ais_remove_integration.post('/', function (req, res) {
  let gate_id = req.body.user;
  // remove secret file
  secretPath = path.resolve(__dirname, `configurations/secrets/${gate_id}.json`)
  if (fs.existsSync(secretPath)) { 
    fs.unlinkSync(secretPath);
  }

  // remove token file
  secretPath = path.resolve(__dirname, `configurations/tokens/${gate_id}-tokens.json`)
  if (fs.existsSync(secretPath)) { 
    fs.unlinkSync(secretPath);
  }

  // Configure users after the user was removed
  configureUsers().then(setupAssistant())

  res.status(200).json({
    message: "The user was removed!"
  });

})

module.exports = ais_remove_integration;
