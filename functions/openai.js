require('dotenv').config();
const { Configuration, OpenAIApi } = require('openai');

// Setup Open AI Configurations
const configuration = new Configuration({
  organization: process.env.OPENAI_ORG_ID,
  apiKey: process.env.OPENAI_API_KEY,
});

// Get API instance
const openai = new OpenAIApi(configuration);

// Function to create new tweet
const createTweet = async () => {
  // Open AI GPT3 takes many arguments of which prompt is the most important one. It can be a string or array of strings.
  const prompt = 'tweet something cool for #techtwitter';

  // Generate response.
  // Note: Open AI is not free. At the time of writing this, we get $18 worth of credit which automatically expires in few months.
  //       Every request you make to the API is chargeable. Use with care.
  const response = await openai.createCompletion('text-davinci-001', {
    prompt: prompt,
    max_tokens: 64,
  });
  //   console.log(response.data);
};

const nextTweet = createTweet();
console.log(nextTweet);
