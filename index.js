const express = require('express')
const app = express()
const path = require('path')
const session = require("express-session")
const c_main = require('./app/controllers/controller_main')
const app_config = require('./app/config/app.json')
const cors = require("cors")
app.use(cors())
app.enable("trust proxy")

//Views
app.use(express.urlencoded({ limit: '50mb', extended: true, parameterLimit:50000 }))
app.use(express.json({limit: '50mb'}))
app.set('views', path.join(__dirname, 'app/views'))
app.set('view engine', 'ejs')
app.use(express.static(path.join(__dirname+'/public')))
app.use(session({
    secret: app_config.secret,
    resave: false,
    unset: 'destroy',
    saveUninitialized: true
  }))

app.use('/', c_main)

app.listen(app_config["APP_PORT"], () => console.log('Example app listening on port ' + app_config["APP_PORT"]))
