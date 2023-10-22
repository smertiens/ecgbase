const express = require('express')
const app = express()
const PORT = 5000
app.use(express.static('./web'))
app.listen(PORT)

console.log('Started dev server on http://localhost:' + PORT)