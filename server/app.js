const GoogleAssistant = require('google-assistant');
const express = require('express');
const bodyParser = require('body-parser');
const FileWriter = require('wav').FileWriter;
const low = require('lowdb');
const FileAsync = require('lowdb/adapters/FileAsync');
const adapter = new FileAsync('server/configurations/config.json');

const startConversation = require('./assistant.js');
const routes = require('./routes.js');
const dashboard = require('./dashboard.js');
const api = require('./api.js');
//const audio = require('./audio.js');

const configureUsers = require('./configuration').configureUsers;
const setupConfigVar = require('./configuration').setupConfigVar;
const setupAssistant = require('./assistant').setupAssistant;
const sendTextInput = require('./assistant').sendTextInput;

const app = express();

low(adapter)
.then(db => {
	global.db = db;

	app.set('view engine', 'ejs');
	app.set('views', `${__dirname}\\views`);

	app.use(express.static(`${__dirname}\\views\\public`));
	app.use(bodyParser.json());
	app.use('/dashboard', dashboard);
	app.use('/api', api);

	app.use(( req, res, next ) => {
		const now = new Date().getHours();
		const enableQuietHours = global.db.get("enableQuietHours").value();
		const start = global.db.get("quietHours.start").value();
		const end = global.db.get("quietHours.end").value();
		if(enableQuietHours) {
			if(now >= start && now <= end) {
				console.log("Quiet hours are currently in effect, ignoring request");
				res.status(420).send("Quiet hours are currently in effect, ignoring request");
				return;
			}
		}
		next()
	});

	app.use('/', routes);
	//app.use('/audio', audio);

	// Configure users on first run
	configureUsers()
	.then((config) => {
		global.config = config;
	  app.listen(global.db.get("port").value());
	  return setupAssistant()
	})
	.catch((e) => {
	  console.log(e)
	})
});
