const express = require('express');
const path = require('path'); // Import the path module to work with file paths
const mongoose = require('mongoose'); // Import mongoose for MongoDB connection

const app = express();
const port = 3000;

// Serve static files from the 'pages' folder
app.use(express.static(path.join(__dirname, 'pages')));

// Route to serve the index.html file at /main_page
app.get('/main_page', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'main_page', 'index.html'));
});

// A sample route to check server connection
app.get('/check', (req, res) => {
    res.send('Sample text to check connection');
});

// Start the server
app.listen(port, () => {
    console.log(`Server listening at port: ${port}`);
});

// MongoDB Connection using Mongoose
async function main() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/project_1', {
      useNewUrlParser: true, // Options to avoid deprecation warnings
      useUnifiedTopology: true,
    });
    console.log("MONGO CONNECTION OPEN!");
  } catch (err) {
    console.log("MONGO CONNECTION ERROR!");
    console.log(err);
  }
}

// Call the main function to connect to the database
main();
