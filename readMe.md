# Installation

Download a copy of this repository and then use `npm install` to get started

pm2 start npm --name GoogleHome -- start

---

# Google configure

1. OAuth2 JSON file for project/device from Google
https://developers.google.com/assistant/sdk/guides/service/python/embed/config-dev-project-and-account

2. Enable Google Assistant API
https://console.developers.google.com/apis/library/embeddedassistant.googleapis.com

3. Enable the oAuthScreen


# Configure device and user

## device authentication
POST http://host:3000/ais_add_device

```json
{"user": "dom-xxxxxxxxxx", "oauthJson":
{"installed":{"client_id":"xxxxxxxx-fsdfdsfdsfdsfds.apps.googleusercontent.com","project_id":"ai-speaker-fsdfsdfsdf ","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://accounts.google.com/o/oauth2/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_secret":"uGJYidEoSH6RaFOjuk58X5k3","redirect_uris":["urn:ietf:wg:oauth:2.0:oob","http://localhost"]}})

```


## user authentication

POST http://host:3000/ais_add_token

```json
{"user": "dom-xxxxxxxxxx", "oauthCode": "z/dasdsadsadsadsadsadsa-dasdsadwqwqwqqwwqwww"}

```


## ask question

POST http://host:3000/ais_add_token

```json
{"user":"dom-xxxxxxxxxx", "command":"opowiedz jakiś nowy dowcip",  "broadcast":"false", "converse": "true"}
```


## remove integration for gate

POST http://host:3000/ais_remove_integration

```json
{"user":"dom-xxxxxxxxxx"}
```


# Credit
This project uses the assistant-relay repository from greghesp
https://github.com/greghesp/assistant-relay
