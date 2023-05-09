require('dotenv').config()
const express = require('express')
const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const session = require('express-session')
const bodyParser = require('body-parser')

const app = express()

app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.use(express.json())
app.use(
  session({
    secret: 'your_secret_key_here',
    resave: false,
    saveUninitialized: false,
  })
)

// User database
const users = []

// Configure passport
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: 'http://localhost:3000/auth/google/callback',
    },
    (accessToken, refreshToken, profile, cb) => {
      // This function will be called when a user logs in with their Google account
      const user = {
        id: profile.id,
        name: profile.displayName,
        email: profile.emails[0].value,
      }
      users.push(user)
      return cb(null, user)
    }
  )
)

// Serialize and deserialize user
passport.serializeUser((user, done) => done(null, user.id))
passport.deserializeUser((id, done) => {
  const user = users.find((user) => user.id === id)
  done(null, user)
})

// Initialize passport
app.use(passport.initialize())

// Routes
app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get(
  '/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
)

app.get(
  '/auth/google/callback',
  passport.authenticate('google'),
  (req, res) => {
    res.redirect('/profile')
  }
)

app.get('/profile', (req, res) => {
  res.json(users)
})

app.get('/signup', (req, res) => {
  res.send(`
    <h1>Sign Up</h1>
    <form method="POST" action="/signup">
      <input type="text" name="name" placeholder="Name">
      <input type="email" name="email" placeholder="Email">
      <input type="password" name="password" placeholder="Password">
      <button type="submit">Sign Up</button>
    </form>
    <br>
    <a href="/auth/google">Sign in with Google</a>
  `)
})

app.post('/signup', (req, res) => {
  const { name, email, password } = req.body
  const user = { name, email, password }
  users.push(user)
  res.redirect('/profile')
})

app.get('/signin', (req, res) => {
  res.send(`
    <h1>Sign In</h1>
    <form method="POST" action="/signin">
      <input type="text" name="name" placeholder="Name">
      <input type="password" name="password" placeholder="Password">
      <button type="submit">Sign In</button>
    </form>
    <br>
    <a href="/auth/google">Sign in with Google</a>
  `)
})

app.post('/signin', (req, res) => {
  const { name, password } = req.body
  const user = users.find(
    (user) => user.name === name && user.password === password
  )
  if (user) {
    req.login(user, (err) => {
      if (err) {
        console.log(err)
        res.sendStatus(500)
      } else {
        res.redirect('/profile')
      }
    })
  } else {
    res.sendStatus(401)
  }
})

app.get('/logout', (req, res) => {
  req.logout()
  res.redirect('/')
})
app.listen(3000, () => {
  console.log('Example app listening on port 3000!')
})
