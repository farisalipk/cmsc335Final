// app.js
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const config = require('./config'); // Load configuration module
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB Connection
const mongoDB = `mongodb+srv://${process.env.MONGO_DB_USERNAME}:${process.env.MONGO_DB_PASSWORD}@cluster0.kqzh6kb.mongodb.net/${process.env.MONGO_DB_NAME}?retryWrites=true&w=majority`;
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// Define User Schema
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
});

const User = mongoose.model('User', userSchema);

// Middleware
app.use(express.static(__dirname));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: config.SESSION_SECRET, resave: true, saveUninitialized: true }));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');


// *Set up routes*

// Route to render login page
// Route to render login page
app.get('/login', (req, res) => {
  const errorMessage = req.session.errorMessage || '';
  req.session.errorMessage = ''; // Clear the error message after displaying it

  res.render('login.html', {
    errorMessage,
  });
});


// Route to handle login form submission
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });

    if (user && bcrypt.compareSync(password, user.password)) {
      req.session.user = username;
      res.redirect('/dashboard');
    } else {
      // Set an error message in the session and redirect back to the login page
      req.session.errorMessage = 'Invalid credentials. Please try again.';
      res.redirect('/login');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});



// Route to handle logout
app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
    }
    res.redirect('/login');
  });
});

// Route to render dashboard page
app.get('/dashboard', (req, res) => {
  if (req.session.user) {
    const username = req.session.user;
    res.render("dashboard", {
      user: req.session.user
    })
  } else {
    res.redirect('/login');
  }
});

// Route to render registration page
app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'register.html'));
});

// Route to handle registration form submission
app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if the username already exists in the database
    const existingUser = await User.findOne({ username });

    if (existingUser) {
      res.send('Username already exists. Please choose a different one.');
    } else {
      // Hash and salt the password before saving it to the database
      const hashedPassword = bcrypt.hashSync(password, 10);
      const newUser = new User({ username, password: hashedPassword });
      await newUser.save();
      res.send('Registration successful! You can now log in. <br> <a href="/login">Login</a>');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

// Default route
app.get('/', (req, res) => {
  res.redirect('/login');
});

app.get('/getActivity', async (req, res) => {
  if(req.session.user){
    res.render("activityForm", {
      user: req.session.user
    })
  } else {
     res.redirect("/login")
  }
})
app.post('/getActivity', async (req, res) => {
  const activityType = req.body.actType;
  const diffMin = req.body.chooseDifficulty === "Yes" ? req.body.minAcc : "any";
  const diffMax = req.body.chooseDifficulty === "Yes" ? req.body.maxAcc : "any";
  const priceMin = req.body.choosePrice === "Yes" ? req.body.minPrice : "any";
  const priceMax = req.body.choosePrice === "Yes" ? req.body.maxPrice : "any";
  const numParticipants = req.body.choosePart === "Yes" ? req.body.participants : "any";
  //endpoint to hit api
  const endpoint = generateEndpoint(activityType, diffMin, diffMax, priceMin, priceMax, numParticipants);
  const response = await fetch(endpoint);
  const json = await response.json();
  let requests = "<h5>Here are the things you requested for your activity: </h5>"
  requests += `<ol> <li> Activity Type: ${activityType} </li>`
  requests += `<li> Difficulty Range: ${req.body.chooseDifficulty === "No" ? "any": diffMin + " to " + diffMax}</li>`
  requests += `<li> Price Range: ${req.body.choosePrice === "No" ? "any": priceMin + " to " + priceMax}</li>`
  requests += `<li> Participants: ${req.body.choosePart === "No" ? "any": numParticipants}</li> </ol>`
  res.render("activityPage.html", {
    activity: json["activity"] ?? json["error"],
    requests: requests
  });
  
})

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

function generateEndpoint(activityType, diffMin, diffMax, priceMin, priceMax, numParticipants){
  identifier = "?"
  endpoint = "http://www.boredapi.com/api/activity"
  if(activityType != "any"){
    endpoint += `${identifier}type=${activityType}`
    identifier = "&"
  }
  if(diffMin != "any" && diffMax != "any"){
    endpoint += `${identifier}minaccessibility=${diffMin}&maxaccessibility=${diffMax}`
    identifier = "&"
  } 
  if(priceMin != "any" && priceMax != "any"){
    endpoint += `${identifier}minprice=${priceMin}&maxprice=${priceMax}`
    identifier = "&"
  } 
  if(numParticipants != "any"){
    endpoint += `${identifier}participants=${numParticipants}`
    identifier = "&"
  }
  return endpoint
}
