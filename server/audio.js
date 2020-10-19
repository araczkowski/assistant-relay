const express = require('express');
const audio = express.Router();

const path = require('path');

audio.get('/', function (req, res) {
  const user = req.query.user;
  res.sendFile(path.resolve(__dirname, user + '-response.wav'));
})

module.exports = audio;
