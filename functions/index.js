require('dotenv').config();
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

// Database Reference
const dbRef = admin.firestore().doc('tw/tokens');

// Status check for serverless functions
exports.checkStatus = functions.https.onRequest((request, response) => {
  functions.logger.info('Check Status!', { structuredData: true });
  response.json({
    success: true,
    author: process.env.AUTHOR,
    msg: 'Serverless functions online!',
  });
});

// Twitter API Init
const twitterApi = require('twitter-api-v2').default;
const twitterClient = new twitterApi({
  clientId: process.env.TW_CLIENT_ID,
  clientSecret: process.env.TW_CLIENT_SECRET,
});

// Callback URL
const callBackURL = process.env.CB_URL;

// STEP 1 - Auth URL
exports.auth = functions.https.onRequest(async (request, response) => {
  const { url, codeVerifier, state } = twitterClient.generateOAuth2AuthLink(
    callBackURL,
    {
      scope: ['tweet.read', 'tweet.write', 'users.read', 'offline.access'],
    }
  );

  // Store verifier
  await dbRef.set({ codeVerifier, state });
  response.redirect(url);
});

// STEP 2 - Verify callback code, store access_token
exports.callback = functions.https.onRequest((request, response) => {});

// STEP 3 - Refresh tokens and post tweets
exports.tweet = functions.https.onRequest((request, response) => {});
