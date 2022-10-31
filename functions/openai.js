require('dotenv').config();
const { Configuration, OpenAIApi } = require('openai');
const { generatePrompt } = require('./utils/createPrompt');

// Setup Open AI Configurations
const configuration = new Configuration({
  organization: process.env.OPENAI_ORG_ID,
  apiKey: process.env.OPENAI_API_KEY,
});

// Get API Instance
const openai = new OpenAIApi(configuration);

// Function to create new tweet
// Open AI GPT3 takes many arguments of which prompt is the most important one. Prompt can be a string or array of strings.
// Note: Open AI is not free. At the time of writing this, we get $18 worth of credit which automatically expires in few months.
//       Every request you make to the API is chargeable. Use with care.
exports.createTweet = () =>
  openai.createCompletion({
    model: 'text-davinci-002',
    prompt: generatePrompt(), // Or write any string instead of this function.
    temperature: 0.7,
    max_tokens: 64,
  });
