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
function sortObj(list, key) {
    function compare(a, b) {
        a = a[key];
        b = b[key];
        var type = (typeof(a) === 'string' ||
                    typeof(b) === 'string') ? 'string' : 'number';
        var result;
        if (type === 'string') result = a.localeCompare(b);
        else result = a - b;
        return result;
    }
    return list.sort(compare);
}
class Lobby{
    constructor(){
        this.questions = []
        this.users = []
        this.readyUsers;
        this.inGame = false
        this.questionTracker = []
        this.historicalRounds = []
        this.roundWins = []
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
                "votes": 0,
            })
        }
        // Create historical question tracker
        this.historicalRounds.push({
            "username": username,
            "roundsWon": 0,
        })
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
        if(this.readyUsers.length>1 && allReady == true) {
            return allReady
        }else{
            return false
        }
    }

    getPeople(){
        var rosterToSend = []
        for(var i = 0; i < this.users.length; i++){
            rosterToSend.push({'username':this.users[i]["username"]})
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
    createQuestionTracker(){
        this.questionTracker = [];
        for(var i = 0; i < this.users.length; i++){
            this.questionTracker.push({
                "username":this.users[i]["username"],
                "votes":0
            })
        }
    }
    getRandomQuestion(){
        if (this.questions.length == 0){
            // If lobby has played all of the questions
            //      1. return game results 
            //      2. destroy lobby instance
            return null
        }
        var index = Math.floor(Math.random()*this.questions.length)
        var question = this.questions[index]
        this.questions.pop(index)
        this.createQuestionTracker()
        return question
    }
    registerWinner(winner){
        for (var i = 0; i < this.historicalRounds.length; i++){
            if (this.historicalRounds[i].username == winner.username){
                this.historicalRounds[i]["roundsWon"]++;
            }
        }
        console.log(this.historicalRounds)
    }
    handleVote(username){
        for(var i = 0; i < this.questionTracker.length; i++){
            if(this.questionTracker[i]["username"] == username){
                this.questionTracker[i]["votes"] += 1
            }
        }
        // Check if all people have voted
        var total_votes = 0
        for(var i=0; i < this.questionTracker.length; i++){
            total_votes += this.questionTracker[i]["votes"]
        }
        // If all votes counted
        if(total_votes == this.users.length){
            // Reduce function which finds the user in 'questiontracker' with the highest number of votes
            const maxVotedFor = this.questionTracker.reduce( (prev, current) => {
                return (prev.votes > current.votes) ? prev : current;
            })
            this.registerWinner(maxVotedFor)
            return maxVotedFor
        }
        return false
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
        var lobbyReady = lobby.readyUser(_username)
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
    socket.on("DeclareVote", (data) => {
        var userVotedFor = data["votedFor"]
        var lobby = findLobbyByCode(data["lobbyCode"])
        var max_voted = lobby.handleVote(userVotedFor)
        if(max_voted){
            io.sockets.in(lobby.code).emit("SendWinner", {"winningUser": max_voted})
        }
    })
    socket.on("AnotherQuestion", (data) => {
        var lobby = findLobbyByCode(data["lobbyCode"]);
        // Send question to all members of party
        var question = lobby.getRandomQuestion()
        if(question == null){
            io.sockets.in(lobby.code).emit("GameFinished", 
                {"results": lobby.historicalRounds})
        }else{
            io.sockets.in(lobby.code).emit("SendQuestion", 
                {"question": question})
        }
    })

})

http.listen(process.env.PORT || 3000, app.settings.env, ()=> console.log("The website is running"))