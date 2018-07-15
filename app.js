const express = require("express")
const app = express()
const http = require("http").Server(app)
const io = require("socket.io")(http)

app.use(express.static("statics"))
app.get("/", (req, res) => {
    res.sendFile(__dirname+"/index.html")
})

var lobbys = []
function findLobbyByCode(code){
    for(var i =0; i < lobbys.length; i++){
        if (code == lobbys[i].code){
            return lobbys[i]
        }
    }
    return false
}

class Lobby{
    constructor(){
        this.questions = []
        this.users = []
        this.readyUsers;
        this.inGame = false
        // Generate Unique Code
        var foundUnique = false;
        while(!foundUnique){
            foundUnique = true;
            this.code = [Math.floor(Math.random()*10), 
                Math.floor(Math.random()*10), 
                Math.floor(Math.random()*10), 
                Math.floor(Math.random()*10), 
                Math.floor(Math.random()*10)]
            // Checks to make sure the generated code is unique
            for(var i =0; i < lobbys.length; i++){
                if (this.code == lobbys[i].code){
                    foundUnique = false;
                    console.log("Generated Code")
                }
            }
            
        }
        // Convert code to string for proper room handling
        this.code = this.code.join('')
        
    }

    addUser(username, socket){
        // Add user to roster
        this.users.push({"socket": socket.id, "username": username})
        // Reset user readiness array with new user
        this.readyUsers = []
        for(var i = 0; i < this.users.length; i++){
            this.readyUsers.push({
                "username":this.users[i]["username"], 
                "_ready": false,
            })
        }
    }

    readyUser(username){
        // Set user to true for ready
        for(var i = 0; i < this.readyUsers.length; i++){
            if (this.readyUsers[i]['username'] == username){
                this.readyUsers[i]["_ready"] = true
            }
        }
        var allReady = true
        for(var i = 0; i < this.readyUsers.length; i++){
            if (this.readyUsers[i]['_ready'] == false){
                allReady = false
            }
        }
        if(this.readyUsers.length>=1 && allReady == true) {
            return allReady
        }else{
            return false
        }
    }

    getPeople(){
        var rosterToSend = []
        for(var i = 0; i < this.users.length; i++){
            rosterToSend.push({i:this.users[i]["username"]})
        }
        return rosterToSend
    }

    addQuestions(firstQ, secondQ){
        this.questions.push(firstQ)
        this.questions.push(secondQ)
        
        if (this.questions.length == this.users.length * 2){
            return true
        }
    }

    getRandomQuestion(){
        var index = Math.floor(Math.random()*this.questions.length)
        var question = this.questions[index]
        this.questions.pop(index)
        return question
    }
}


io.on("connection", (socket)=>{
    socket.on("RequestRoom", (data) => {
        var lobby = null;
        var error = false;
        if (data["code"] != null) {
            // User is joining an existing room number
            socket.join(data["code"])
            lobby = findLobbyByCode(data["code"], socket)
            
            //if the lobby code is invalid
            if (lobby == false){
                error = true
                socket.emit("Invalid Code", {"state": true});
            }else {error = false}
        }else{
            // User wants to create a lobby
            lobby = new Lobby()
            lobbys.push(lobby)
            socket.join(lobby.code)
            error = false;
        }
        if (error == false){
            lobby.addUser(data["username"], socket)
            io.sockets.in(lobby.code).emit("UpdatedLobbyRoster", {"roster":lobby.readyUsers, "lobbyCode":lobby.code})
        }
    })
    socket.on("ReadyUp", (data) => {
        _username = data["username"]
        _lobbyCode = data["lobbyCode"]
        // Search Lobbys
        var lobby = findLobbyByCode(_lobbyCode)
        lobbyReady = lobby.readyUser(_username)
        if(lobbyReady == true){
            io.sockets.in(lobby.code).emit("FinalLobbyRoster", {"roster":lobby.getPeople()})
        }else{
            io.sockets.in(lobby.code).emit("UpdatedLobbyRoster", {"roster":lobby.readyUsers, "lobbyCode":lobby.code})
        }
    })
    socket.on("ProposeQuestions", (data) => {
        firstQ = data["firstQ"]
        secondQ = data['secondQ']
        lobby = findLobbyByCode(data["lobbyCode"])
        qProposalFinish = lobby.addQuestions(firstQ, secondQ)
        if (qProposalFinish){
            io.sockets.in(lobby.code).emit("SendQuestion", {"question": lobby.getRandomQuestion()})
        }
    })
})

http.listen(3000, ()=> console.log("The website is running"))