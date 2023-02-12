require("dotenv").config();
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { createTweet } = require("./openai");
const { async } = require("@firebase/util");
admin.initializeApp();

// Database Reference
const dbRef = admin.firestore().doc("tokens/tw");

// Status check for serverless functions
exports.checkStatus = functions.https.onRequest((request, response) => {
  functions.logger.info("Check Status!", { structuredData: true });
  response.status(200).json({
    success: true,
    author: process.env.AUTHOR,
    msg: "Serverless functions online!",
  });
});

// Twitter API Init
const twitterApi = require("twitter-api-v2").default;
const twitterClient = new twitterApi({
  clientId: process.env.TW_CLIENT_ID,
  clientSecret: process.env.TW_CLIENT_SECRET,
});

// Callback URL
const callBackURL = process.env.CB_URL;

// STEP 1 - Auth URL
exports.auth = functions.https.onRequest(async (request, response) => {
  // Logger
  functions.logger.info("Auth Route!", { structuredData: true });

  // Function Starts
  const { url, codeVerifier, state } = twitterClient.generateOAuth2AuthLink(
    callBackURL,
    {
      scope: ["tweet.read", "tweet.write", "users.read", "offline.access"],
    }
  );

  // Store verifier
  await dbRef.set({ codeVerifier, state });
  response.redirect(url);
});

// STEP 2 - Verify callback code, store access_token
exports.callback = functions.https.onRequest(async (request, response) => {
  // Logger
  functions.logger.info("Callback Route!", { structuredData: true });

  // Functions Starts
  const { state, code } = request.query;

  const dbSnapshot = await dbRef.get();
  const { codeVerifier, state: storedState } = dbSnapshot.data();

  if (state !== storedState) {
    return response
      .status(400)
      .json({ success: false, msg: "Stored tokens do not match!" });
  }

  const {
    client: loggedClient,
    accessToken,
    refreshToken,
  } = await twitterClient.loginWithOAuth2({
    code,
    codeVerifier,
    redirectUri: callBackURL,
  });

  await dbRef.set({ accessToken, refreshToken });

  // Can start using the client if we want
  const { data } = await loggedClient.v2.me();
  response.status(200).json({ success: false, data });
});

// STEP 3 - Refresh tokens and post tweets
exports.tweet = functions.https.onRequest(async (request, response) => {
  // Logger
  functions.logger.info("Tweet Route!", { structuredData: true });

  // Function Starts
  // If some time has passed, we would need a new access token obtained by calling twitter api with existing refresh token.
  const { refreshToken } = (await dbRef.get()).data();

  const {
    client: refreshedClient,
    accessToken,
    refreshToken: newRefreshToken,
  } = await twitterClient.refreshOAuth2Token(refreshToken);

  // Save the new refresh token to the database
  await dbRef.set({ accessToken, refreshToken: newRefreshToken });

  // Use GPT3 to create new tweet
  const newTweet = (await createTweet()).data.choices[0].text;

  // Publish that tweet to twitter using Oauth2.0 v2 API
  const { data } = await refreshedClient.v2.tweet(newTweet);

  // Send response
  response.status(200).json({ success: true, data });
});

// STEP 4 - Set up cron job to run the tweets automatically
// Visit https://crontab.guru/ to generate cron job syntax with ease.
// Cron Job Details:
//    - 0 11,18 * * 1,3,5
//    - At minute 0 past hour 11 and 18 on Monday, Wednesday, Friday
exports.scheduleTweet = functions.pubsub
  .schedule("every 1 minute")
  .onRun(async (context) => {
    console.log("This pub/sub runs every 1 minute.");
    console.log(context);
  });
