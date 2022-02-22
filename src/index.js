const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");
const app = express();
const port = process.env.PORT || 8080;
// CS5356 TODO #1


// CS5356 TODO #2
// Import the functions you need from the SDKs you need


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAg8y-uxS77v94U1DIuQM7DQoHHtjPpW-E",
  authDomain: "bss-milestone-1.firebaseapp.com",
  projectId: "bss-milestone-1",
  storageBucket: "bss-milestone-1.appspot.com",
  messagingSenderId: "1017080592232",
  appId: "1:1017080592232:web:5395bea3c8bf4ce54c08dd",
  measurementId: "G-P1LGNVPNBS"
};
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// Initialize Firebase

// Uncomment this next line after you've created
// serviceAccountKey.json
const serviceAccount = require("./../config/bss-milestone-1-firebase-adminsdk-t5r8j-a10d0f2502.json");
const userFeed = require("./app/user-feed");
const authMiddleware = require("./app/auth-middleware");


// CS5356 TODO #2
// Uncomment this next block after you've created serviceAccountKey.json
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// use cookies
app.use(cookieParser());
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
// set the view engine to ejs
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static("src/views/pages"))

app.use("/static", express.static("static/"));


// use res.render to load up an ejs view file
// index page
app.get("/", function (req, res) {
  res.render("pages/index");
});

app.get("/sign-in", function (req, res) {
  res.render("pages/sign-in");
});

app.get("/sign-up", function (req, res) {
  res.render("pages/sign-up");
});

app.get("/dashboard", authMiddleware, async function (req, res) {
  const feed = await userFeed.get();
  res.render("pages/dashboard", { user: req.user, feed });
});

app.post("/sessionLogin", async (req, res) => {
  // CS5356 TODO #4
  // Get the ID token from the request body
  // Create a session cookie using the Firebase Admin SDK
  // Set that cookie with the name 'session'
  // And then return a 200 status code instead of a 501
  const idToken = req.body.idToken.toString();

  const expiresIn = 60*60*24*1000 //Expires in one day

  admin.auth()
  .createSessionCookie(idToken, { expiresIn })
  .then(
    (sessionCookie) => {
      // Set cookie policy for session cookie.
      const options = { maxAge: expiresIn, httpOnly: true, secure: true };
      res.cookie('session', sessionCookie, options);
      res.end(JSON.stringify({ status: 'success' }));
      res.status(200).send();
    },
    (error) => {
      res.status(401).send('UNAUTHORIZED REQUEST!');
    }
  );
});
  

app.get("/sessionLogout", (req, res) => {
  res.clearCookie("session");
  res.redirect("/sign-in");
});

app.post("/dog-messages", authMiddleware, async (req, res) => {
  // CS5356 TODO #5
  // Get the message that was submitted from the request body
  // Get the user object from the request body
  // Add the message to the userFeed so its associated with the user
  try{
    const dogMessage = req.body;

    await userFeed.add(req.user, dogMessage.message);
    res.redirect('/dashboard');
}catch (err) {
  res.status(500).send({message:err});
}


});

// getDogPictures().then(response => {
//   console.log(response)
// });


app.listen(port);
console.log("Server started at http://localhost:" + port);
