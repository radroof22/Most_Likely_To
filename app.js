const express = require("express")
const app = express()

app.use(express.static("statics"))

app.get("/", (req, res) => {
    res.sendFile(__dirname+"/index.html")
})

app.listen(3000, ()=> console.log("The website is running"))