require('dotenv').config();

const app = require('./App'); // 👈 use lowercase
const connectdb = require('./config/db');

const port = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectdb(); // wait for DB

    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });

  } catch (error) {
    console.error('Server failed to start:', error.message);
    process.exit(1);
  }
};

startServer();