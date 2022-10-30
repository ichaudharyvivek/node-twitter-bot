require('dotenv').config();
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

// Database Reference
const dbRef = admin.firestore().doc('tw/tokens');

// Twitter API Init
const twitterApi = require('twitter-api-v2').default;
console.log(process.env.TW_CLIENT_ID, process.env.TW_CLIENT_SECRET);
const twitterClient = new twitterApi({
  clientId: process.env.TW_CLIENT_ID,
  clientSecret: process.env.TW_CLIENT_SECRET,
});

// Callback URL
const callBackURL = process.env.CB_GITPOD_URL;

exports.helloWorld = functions.https.onRequest((request, response) => {
  functions.logger.info('Hello logs!', { structuredData: true });
  response.send('Hello from Firebase!');
});

// STEP 1 - Auth URL
exports.auth = functions.https.onRequest(async (req, res) => {
  const { url, codeVerifier, state } = twitterClient.generateOAuth2AuthLink(
    callBackURL,
    {
      scope: ['tweet.read', 'tweet.write', 'users.read', 'offline.access'],
    }
  );

  // Store verifier
  await dbRef.set({ codeVerifier, state });
  response.send('Hello from Firebase! ${url} \n ${codeVerifier} \n ${state}');
  // response.redirect(url);
});

exports.callback = functions.https.onRequest((req, res) => {
  functions.logger.info('Hello logs!', { structuredData: true });
  response.send('Hello from Firebase!');
});

exports.tweet = functions.https.onRequest((req, res) => {});
