const dotenv = require('dotenv');

dotenv.config();

module.exports = {
  port: process.env.PORT || 3001,
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/collab-editor',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  },
  client: {
    url: process.env.CLIENT_URL || 'http://localhost:3000'
  }
};