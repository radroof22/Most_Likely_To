const express = require("express")
const app = express()
const http = require("http").Server(app)
const io = require("socket.io")(http)

app.use(express.static("statics"))
app.get("/", (req, res) => {
    res.sendFile(__dirname+"/index.html")
})

class Lobby{
    constructor(){
        this.questions = []
        this.users = []
        // Generate Unique Code
        var foundUnique = false;
        while(!foundUnique){
            foundUnique = true;
            this.roomCode = [Math.floor(Math.random()*10), 
                Math.floor(Math.random()*10), 
                Math.floor(Math.random()*10), 
                Math.floor(Math.random()*10), 
                Math.floor(Math.random()*10)]
            // Checks to make sure the generated code is unique
            for(var i =0; i < lobbys.length; i++){
                if (this.roomCode == lobbys[i].roomCode){
                    foundUnique = false;
                    console.log("Generated Code")
                }
            }
            
        }
        // Convert code to string for proper room handling
        this.roomCode = this.roomCode.join('')
        
    }

    addUser(username, socket){
        this.users.push({"socket": socket.id, "username": username})
    }
}
var lobbys = []
function findLobbyByCode(code){
    for(var i =0; i < lobbys.length; i++){
        if (code == lobbys[i].roomCode){
            return lobby[i]
        }
    }
}

io.on("connection", (socket)=>{
    socket.on("RequestRoom", (data) => {
        if (data["roomCode"] != null) {
            // User is joining an existing room number
            socket.join(data["roomCode"])
        }else{
            // User wants to create a lobby
            var lobby = new Lobby()
            lobbys.push(lobby)
            socket.join(lobby.code)            
        }
        findLobbyByCode(data["roomCode"], socket)
        io.sockets.in(lobby.code).emit("New Opponent")
    })
})

http.listen(3000, ()=> console.log("The website is running"))