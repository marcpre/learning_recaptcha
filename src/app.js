require('dotenv').config()
const express = require('express')
const path = require('path')
const logger = require('morgan')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')

const app = express()

process.on('uncaughtException', err =>
  console.error('uncaught exception: ', err))
process.on('unhandledRejection', (reason, p) =>
  console.error('unhandled rejection: ', reason, p))

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

app.use(logger(process.env.LOG_ENV))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: false,
}))
app.use(express.static(path.join(__dirname, '/../public'))) // public folder!
app.use(cookieParser())

//Routes
app.get('/', (req, res) => {
  res.render('index')
})

app.post('/submit', (req,res) => {
  // g-recaptcha-response is the key that browser will generate upon form submit.
  // if its blank or null means user has not selected the captcha, so return the error.
  if(req.body['g-recaptcha-response'] === undefined || req.body['g-recaptcha-response'] === '' || req.body['g-recaptcha-response'] === null) {
    return res.json({"responseCode" : 1,"responseDesc" : "Please select captcha"});
  }
  var secretKey = process.env.RECAPTCHA_SECRET_KEY
  var verificationUrl = "https://www.google.com/recaptcha/api/siteverify?secret=" + process.env.RECAPTCHA_SECRET_KEY + "&response=" + req.body['g-recaptcha-response'] + "&remoteip=" + req.connection.remoteAddress;
  request(verificationUrl,function(error,response,body) {
    body = JSON.parse(body);
    if(body.success !== undefined && !body.success) {
      return res.json({"responseCode" : 1,"responseDesc" : "Failed captcha verification"});
    }
    res.json({"responseCode" : 0,"responseDesc" : "Sucess"});
  })
})

app.use("*",function(req,res) {
  res.status(404).send("404");
})

// Server
const port = process.env.APP_PORT || 8080
const host = process.env.APP_HOST || 'localhost'

app.listen(port, () => {
  console.log(`Listening on ${host}:${port}`)
})

module.exports = app
