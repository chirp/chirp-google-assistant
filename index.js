'use strict';

// Import the Dialogflow module from the Actions on Google client library.
const {dialogflow} = require('actions-on-google');
const express = require('express')
const bodyParser = require('body-parser')
const request = require('request');


/**
 * Chirp Credentials
 **/
const APP_KEY = 'APP_KEY';
const APP_SECRET = 'APP_SECRET';
const CHIRP_API_AUTH = 'https://' + APP_KEY + ':' + APP_SECRET + '@auth.chirp.io/v3/connect/token';

/**
 * WiFi Credentials
 */
const WIFI_SSID = 'Chirp';
const WIFI_PASSWORD = 'secret';

function hexEncode(utf8String) {
  var hex, i;

  var result = "";
  for (i = 0; i < utf8String.length; i++) {
    hex = utf8String.charCodeAt(i).toString(16);
    result += (hex).slice(-4);
  }

  return result;
}

function buildCredentialsPayload(ssid, passwd) {
  return hexEncode(ssid + ":" + passwd);
}

const expressApp = express().use(bodyParser.json())

// Instantiate the Dialogflow client.
const app = dialogflow({debug: true});

// Handle the Dialogflow intent named 'Send'.
app.intent('Send', sendWiFICredentials);


// Handle the Dialogflow intent named 'send'.
app.intent('send', sendWiFICredentials);


function sendWiFICredentials(conv) {
  return new Promise((resolve, reject) => {
    request({url: CHIRP_API_AUTH}, function (error, response_status, body) {

        let ssml = "<speak>" +
        "Failed to send WiFi credentials! Unable to authenticate for Chirp API!" +
        "</speak>";
        if (!error) {
          body = JSON.parse(body);
          if (body.token) {
            const wiFiToken = buildCredentialsPayload(WIFI_SSID, WIFI_PASSWORD);
            const url = 'https://audio.chirp.io/v3/default/' + wiFiToken + "?token=" + body.token;
            ssml = '<speak>' +
              'Sending credentials <audio src="' + url + '">' + WIFI_SSID + '</audio>' +
              '</speak>';
          }
        }
        resolve(conv.close(ssml));
    });
  });

}

expressApp.post('/fulfillment', app)
expressApp.listen(3000)
