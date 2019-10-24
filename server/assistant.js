const async = require('async');
const GoogleAssistant = require('google-assistant');
const FileReader = require('wav').Reader;
const FileWriter = require('wav').FileWriter;
const wavFileInfo = require('wav-file-info');

const terminalImage = require('terminal-image');
const path = require('path');
const fs = require("fs");
var tou8 = require('buffer-to-uint8array');


const defaultAudio = false;
let returnAudio;
let gConfig;

var playbackWriter = new FileWriter('server/playback.wav', {
  sampleRate: 24000,
  channels: 1
});


const inputFiles = [
  `${path.resolve(__dirname, 'broadcast.wav')}`,
  `${path.resolve(__dirname, 'response.wav')}`
];

var self = module.exports = {
  setupAssistant: function() {
    return new Promise((resolve, reject) => {
      let users = []
      async.forEachOfLimit(global.config.users, 1, function(i, k, cb){
        let auth = i;
        users.push(k)
        global.config.assistants[k] = new GoogleAssistant(i)
        let assistant = global.config.assistants[k];
        assistant.on('ready', () => cb());
        assistant.on('error', (e) => {
          console.log(`❌ Assistant Error when activating user ${k}. Trying next user ❌ \n`);
          return cb();
        })
      }, function(err){
        if(err) return reject(err.message);
        (async() => {
          console.log(await terminalImage.file('./icon.png'))
          console.log(`Assistant Relay is now setup and running for${users.map(u => ` ${u}`)} \n`)
          console.log(`You can now visit ${global.config.baseUrl} in a browser, or send POST requests to it`);
        })();
        if (!global.config.muteStartup) {
		      self.sendTextInput('broadcast Assistant Relay is now setup and running')
	      }
        resolve()
      })
    })
  },

  sendTextInput: function(text, n, converse) {
    return new Promise((resolve, reject) => {
      console.log(`Received command ${text} \n`);
      if(converse) returnAudio = true;
      // set the conversation query to text
      global.config.conversation.textQuery = text;
      const assistant = self.setUser(n)

       assistant.start(global.config.conversation, (conversation) => {
          return self.startConversation(conversation, null, n)
          .then((data) => {
            resolve(data)
          })
          .catch((err) => {
            reject(err)
          })
        });
    })
  },

  sendAudioInput: function(n) {
    console.log("sendAudioInput user: " + n)
    let raw = []
    const assistant = self.setUser(n);
    fs.readFile(`${path.resolve(__dirname, n + '-response.wav')}`, (err, file) => {
      if(err) console.log(err)
      assistant.start(global.config.conversation, (conversation) => {
         return self.startConversation(conversation, file, n)
         .then((data) => {
           console.log(data)
           //resolve(data)
         })
         .catch((err) => {
           console.log(err)
           //reject(err)
         })
       });
    });
  },

  startConversation: function(conversation, file, n) {
    console.log("startConversation user: " + n)
    let response = {};
    const fileStream = self.outputFileStream(n);
    return new Promise((resolve, reject) => {
      conversation.write(file)
      conversation
        .on('audio-data', data => {
          // AIS TODO
          fileStream.write(data)
          // set a random parameter on audio url to prevent caching
          //response.audio = '/audio/?user=' + n +`&v=${Math.floor(Math.random() *  100)}`
          response.audio = '/audio/' + n +`.vaw&v=${Math.floor(Math.random() *  100)}`
        })
        .on('response', (text) => {
          if (text) {
            console.log(`Google Assistant: ${text} \n`)
            response.response = text;
            // AIS TODO
            if(returnAudio) {
              console.log("returnAudio for user: " + n + " text: " + text)
              // self.sendTextInput(`broadcast ${text}`, n, gConfig);
              returnAudio = false;
            }
          }
        })
        .on('end-of-utterance', () => {
          console.log("Done speaking")
        })
        .on('transcription', (data) => {
          console.log(data)
        })
        .on('volume-percent', percent => {
          console.log(`Volume has been set to ${percent} \n`)
          response.volume = `New Volume Percent is ${percent}`;
        })
        .on('device-action', action => {
          console.log(`Device Action: ${action} \n`)
          response.action = `Device Action is ${action}`;
        })
        .on('ended', (error, continueConversation) => {
          if (error) {
            console.log('Conversation Ended Error:', error);
            response.success = false;
            reject(response)
          } else if (continueConversation) {
            response.success = true;
            console.log('Continue the conversation... somehow \n');
            conversation.end();
            resolve();
          } else {
            response.success = true;
            console.log('Conversation Complete \n');
            // AIS TODO 
            fileStream.end();
            conversation.end();

            resolve(response);
          }
        })
        .on('error', (error) => {
          console.log(`Something went wrong: ${error}`)
          response.success = false;
          response.error = error;
          reject(response)
        });
    })
  },

  setUser: function(n) {
    // set default assistant to Jolka user
    // assistant = Object.keys(global.config.assistants)[0];
    assistant_name = 'jolka'
    assistant = global.config.assistants[`${assistant_name}`];

    // check to see if user passed exists
    if(n) {
      const users = Object.keys(global.config.users);
      if(!users.includes(n.toLowerCase())) {
        console.log('User not found, using Jolka')
      } else {
        n = n.toLowerCase();
        console.log(`User specified was ${n} \n`)
        assistant = global.config.assistants[`${n}`]
      }
    } else {
      console.log(`No user specified, using Jolka \n`)
    }

    return assistant;
  },

  outputFileStream: function(n) {
    console.log("outputFileStream for " + n)
    return new FileWriter(global.config.conversation.audio.path + n + '-response.wav', {
      sampleRate: global.config.conversation.audio.sampleRateOut,
      channels: 1
    });
  },
}
