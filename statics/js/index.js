var store = {
    state : {
        Username: "",
        RoomNumber: null,
        Socket: null,
        FinalRoster: null,
        currentQuestion: null
    },
    setSocket(ioInstance){
        this.state.Socket = ioInstance
    },
    setUsername(newName){
        this.state.Username = newName
    },
    setRoomNumber(newNumber){
        this.state.RoomNumber = newNumber
    },
    setFinalRoster(roster){
        this.state.FinalRoster = roster
    },
    setQuestion(question){
        this.currentQuestion = question
    }
}

Vue.component("join-lobby", {
    template: `
    <div id="main" class="jumbotron jumbotron-fluid">
        <div class="container">
            <h1 class="display-4">Mostlikely.to</h1>
            <p class="lead"> Join your friends and get a lobby to play a game and understand what they think about you! One person should enter without a digital code to create a lobby, and the rest should join that persons lobby using their code.
            <hr class="my-4">
            <form @submit.prevent="newServerRequest">
                <div class="form-group">
                    <label for="usernameEntry">Username </label>
                    <input class="form-control" id="usernameEntry" v-model="username" placeholder="Enter Username" />
                    <small class="form-text text-muted">This will be the name that everyone will see during the game</small>
                </div>
                <div class="form-group">
                    <label for="codeEntry">Code </label>
                    <input id="codeEntry" class="form-control" v-model="roomNumber" placeholder="Enter Code" type="number" />
                    <small class="form-text text-muted">The code will be 5 digits long. If you are creating a lobby, leave this section blank and you can share your lobby's code on the next page.</small>
                </div>
                
                
                <button type="submit">
                    <div v-if="roomNumber == null || roomNumber == '' ">
                        Create Server
                    </div>
                    <div v-else>
                        Join Server
                    </div>
                </button>
            </form>
        </div>
    </div>
    `,

    data: function (){
        return {
            roomNumber: null,
            username: "",
            invalidCode:false,
            
            newServerRequest: function(){
                this.invalidCode = false;
                store.state.Socket.emit("RequestRoom", {"code":this.roomNumber, "username": this.username});
                store.state.Socket.on("Invalid Code", ()=>{
                    this.invalidCode = true;
                    alert("Invalid Code")
                    app.currentView = "join-lobby"
                })
                if (this.invalidCode == false){
                    // Returned official state that the user has created or joined new lobby
                    store.setUsername(this.username)                 
                    app.currentView = "wait-lobby"
                }
            }

        }
    },   
})

Vue.component("wait-lobby", {
    template:`
    <div class=" jumbotron-fluid">
        <div class="container">
            <h1 class="display-4">Lobby <strong>{{lobbyCode}}</strong></h1>
            <p class="lead">Make sure you ready up to have the game start. Once all of the users in the lobby ready up, the game will begin. If the lobby only has one person, it will require a second person to join and ready for the game to start</p>
            <button @click='readyUp'type="button" class="btn btn-primary">Ready Up</button>
            <hr class="my-4">
            <br/>
            <ul class="list-group">
                <li v-for="player in roster" class="list-group-item d-flex justify-content-between align-items-center">
                    {{player.username}} <div v-if="player['_ready']"> <span class="badge badge-primary badge-pill">Ready</span> </div>
                </li>
            </ul>
        </div>
    </div>
    `,
    data: function(){
        return {
            roster: [],
            lobbyCode: null,
            readyUp(){
                // Tell the Server that client is ready
                store.state.Socket.emit("ReadyUp", 
                    {"lobbyCode":store.state.RoomNumber, 
                    "username":store.state.Username})
            }
        }
    },
    mounted: function(){
        store.state.Socket.on("UpdatedLobbyRoster", (data) => {
            this.roster = data["roster"]
            // Update lobby code state 
            this.lobbyCode = data["lobbyCode"]
            store.setRoomNumber(this.lobbyCode)
        })
        // If Lobby is finished and everyone is ready
        store.state.Socket.on("FinalLobbyRoster", (data) => {
            store.setFinalRoster(data["roster"])
            app.currentView = "propose-questions"
        })
    },
})

Vue.component("propose-questions", {
    template:`
    <div class="jumbotron-fluid">
        <div class="container-fluid">
            <h1 class="display-4">Propose Questions</h1>
            <p class="lead">The questions you write will be the questions that others will answer in the game. Make sure the questions are typed correctly and make sure to press the submit button.</p>
            <hr class="my-4">
            <form @submit.prevent="proposeQuestions" v-show='proposing'>
                <div class="form-group">
                    <label for="firstQ">First Question </label>
                    <input class="form-control" id="firstQ" v-model="firstQuestion" placeholder="First Question" type="text"/>
                </div>
                <div class="form-group">
                    <label for="secondQ">Second Question</label>
                    <input id="secondQ" class="form-control" v-model="secondQuestion" placeholder="Second Question" type="text" />
                </div>
                
                
                <button type="submit" class="btn btn-lg btn-success">Submit Questions</button>
            </form>
            <div v-show="!proposing">
                <p>Please wait for the others to finish up with their questions</p>
            </div>
            <br/>
            <ul class="list-group">
                <li class="list-group-item" v-for="person in this.roster">{{person.i}}</li>
            </ul>
        </div>
    </div>
    `,
    data: function(){
        return {
            roster: store.state.FinalRoster,
            firstQuestion: "",
            secondQuestion:"",
            proposing: true,
            proposeQuestions(){
                store.state.Socket.emit("ProposeQuestions", {"lobbyCode": store.state.RoomNumber, "firstQ":this.firstQuestion, "secondQ": this.secondQuestion})
                this.proposing = false
            }
        }
    },
    mounted: function(){
        store.state.Socket.on("SendQuestion", (data)=>{
            store.setQuestion(data["question"])
            app.currentView = "AnswerQuestion"
        })
    },
})

Vue.component("AnswerQuestion", {
    template: `
    <h1> AnswerQuestion</h1>
    `
})
Vue.component("PresentResult", {
    template: `
    <h1> Answer Question </h1>
    `
})
var app = new Vue({
    el: "#app",
    data: {
        message: "yoyo",
        currentView: "join-lobby"
        
    },
    methods: {
        // Functions to Handle Component Insertion
        lobbyJoin() {
            if (this.state == "join-lobby"){return true}
        },
        updateCurrentView (name){
            this.currentView = name
        }
    },
    created: function(){
        store.setSocket(io());
    },
});