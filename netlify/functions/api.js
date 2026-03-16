const app = require('../../server.js');
const serverless = require('serverless-http');

// Provide the Netlify function handler
module.exports.handler = serverless(app);
