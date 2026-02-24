import express from 'express';
import cors from 'cors';
// Import dotenv and call config() to load environment variables
// from the .env file into process.env
import dotenv from 'dotenv';
dotenv.config();

const app = express();
// Access environment variables using process.env
const PORT = process.env.PORT || 3000;

// Middleware
// Enable all CORS requests
app.use(cors());
// Optionally configure specific origins, e.g.:
// const corsOptions = {
//   origin: 'http://localhost:3000'
// };
// app.use(cors(corsOptions));

// Built-in middleware for parsing JSON bodies of incoming requests
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.send('Server is running and operational!');
});

app.get('/api/data', (req, res) => {
  // Example of using another environment variable
  const secretMessage = `The API secret is: ${process.env.API_SECRET}`;
  res.status(200).json({
    message: 'Hello from the API route!',
    secretInfo: secretMessage
  });
});

async function getTrivia() {
  const url = "https://opentdb.com/api.php?amount=10&category=9&difficulty=easy&type=multiple";

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

    const data = await response.json();
    return data.results; // results array
  } catch (error) {
    console.error("Error fetching trivia:", error);
  }
}

// Example use
getTrivia().then(questions => {
  console.log(questions);
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server ready at http://localhost:${PORT}`);
});
