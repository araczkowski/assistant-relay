const path = require('path');
const fs = require("fs");

const secretsFolder = 'server/configurations/secrets/';

const self = module.exports = {
  configureUsers: function() {
    return new Promise(resolve => {
      let secrets = [];

      // loop through the secrets folder. Add new files to newFiles array
      fs.readdirSync(secretsFolder).forEach(file => {
        if(file.split('.').pop() === 'json') secrets.push(file)
      })
      //wipe users
      global.db.set('users', {}).write();

      // add users to db
      secrets.forEach(file => {
        const name = path.parse(file).name;
        global.db.set(`users[${name}]`, {
          keyFilePath: path.resolve(__dirname, `configurations/secrets/${file}`),
          savedTokensPath: path.resolve(__dirname, `configurations/tokens/${name}-tokens.json`)
        }).write()
      })
      resolve(global.db.getState())
    })
  }
}
