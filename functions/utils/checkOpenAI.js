const { createTweet } = require('../openai');

// NOTE: This is a function to test the Open AI endpoint w/o running Firebase.
const checkAPI = async () => {
  const newTweet = (await createTweet()).data.choices[0].text;
  console.log(newTweet);
};

// Call this function when you are ready. Each execution to Open AI is chargeable.
// checkAPI();
