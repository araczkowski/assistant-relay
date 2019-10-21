const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync('./bin/config.json');
const {setCredentials} = require('../helpers/auth');
const {sendTextInput} = require('../helpers/assistant.js');


const FileWriter = require('wav').FileWriter;
const moment = require('moment');
const fs = require("fs");

const Assistant = require('google-assistant/components/assistant');

exports.initializeServer = function (text) {
    return new Promise(async(res, rej) => {
        const db = await low(adapter);
        await db.defaults({
            port: 3000,
            muteStartup: false,
            quietHours: {
                enabled: false,
                start: 0,
                end: 0
            },
            maxAudioResponses: 5,
            maxTextResponses: 10,
            conversation: {
                audio: {
                    encodingIn: 'LINEAR16',
                    sampleRateIn: 16000,
                    encodingOut: 'LINEAR16',
                    sampleRateOut: 24000,
                },
                lang: 'en-US',
                screen: {
                    isOn: true,
                }
            },
            users: [],
            textResponses: [],
            audioResponses: [],
            transcriptions:[]
        }).write();
        const size = db.get('users').size().value();
        const users = db.get('users').value();
        const muted = await exports.isStartupMuted();
        const isQH = await exports.isQuietHour();
        const promises = [];

        if(size > 0 ) {
            users.forEach(user => {
                promises.push(new Promise(async(resolve,rej) => {
                    const client = await setCredentials(user.name);
                    global.assistants[user.name] = new Assistant(client);
                    resolve();
                }));
            });
            await Promise.all(promises);
        }
        if(!muted && !isQH) await sendTextInput(`broadcast Assistant Relay initialised`);
        return res();
    })
};

exports.outputFileStream = function(conversation, fileName) {
    return new FileWriter(`bin/audio-responses/${fileName}.wav`, {
        sampleRate: conversation.audio.sampleRateOut,
        channels: 1
    });
};

exports.updateAudioResponses = function(command, timestamp) {
    return new Promise(async(res, rej) => {
        const db = await low(adapter);
        const size = db.get('audioResponses').size().value();
        const maxAudio = db.get('maxAudioResponses').value();
        if(size >= maxAudio) {
            const results = db.get('audioResponses').sortBy('timestamp').value();
            const timestamp = results[0].response;
            fs.unlinkSync(`bin/audio-responses/${timestamp}.wav`);
            const entries = db.get('audioResponses').sortBy('timestamp').drop(1).value();
            await db.set('audioResponses', entries).write();
        }
        await db.get('audioResponses').push({command, response: timestamp}).write();
        res();
    })
}

exports.isQuietHour = function() {
    return new Promise(async(res,rej) => {
        const db = await low(adapter);
        const quietHours = db.get('quietHours').value();

        if(!quietHours.enabled) return res(false);

        const start = moment(quietHours.start, "HH:mm");
        const until = moment(quietHours.end, "HH:mm");
        let diff  = moment.duration(until.diff(start)).asMinutes();

        if(diff < 0) until.add(1, 'days');

        return res(moment().isBetween(start, until).toString());
    })
};

exports.isStartupMuted = function() {
    return new Promise(async(res, rej) => {
        const db = await low(adapter);
        const muteStartup = db.get('muteStartup').value();
        if (muteStartup) return res(true);
        return res(false);
    })
}