const express = require('express')
const app = express()
const c_main = require('./app/controllers/controller_main')
const cors = require("cors")
const PORT = 8000
app.use(cors())
app.enable("trust proxy")

app.get('/', (req, res) => {
  res.send('Hello World')
})

app.use('/api/v1', c_main)

app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
})
