// Change this file to createPrompt.js
// Edit/Add the topics & wildcards based on your preference.

// List of topics
const topics = [
  "Python",
  "Mobile Dev",
  "Web Dev",
  "Flutter",
  "React",
  "MAANG",
  "FAANG",
];

// All the extra features for the prompts
const wildcards = [
  "use one hashtag",
  "use multiple hashtags",
  "mention a famous twitter user",
  "use a bunch of emojis",
  "ask people to follow your account",
];

// Randomize topics and wildcards. Create unique prompts.
exports.generatePrompt = () => {
  const topic = topics[Math.floor(Math.random() * topics.length)];
  const wildcard = wildcards[Math.floor(Math.random() * wildcards.length)];
  const prompt = topic + " " + wildcard;
  return prompt;
};
