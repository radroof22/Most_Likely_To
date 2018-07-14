var store = {
    state : {
        Username: "",
        RoomNumber: null,
        Socket: null,
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
}

Vue.component("join-lobby", {
    template: `
    <div>
        <form @submit.prevent="newServerRequest">
            <input v-model="username" placeholder="Username" />
            <input v-model="roomNumber" placeholder="5 Digit Code (Optional)" type="number" />
            <button type="submit">
                <div v-if="roomNumber == null || roomNumber == '' ">
                    Create Server
                </div>
                <div v-else>
                    Join Server
                </div></button>
        </form>
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
    <div>
        <h1>Wait Lobby</h1>
        <button @click='readyUp'>Ready Up</button>
        <label> Code: {{lobbyCode}}</label>
        <ul>
            <li v-for="player in roster">
                {{player.username}}
            </li>
        </ul>
    </div>
    `,
    data: function(){
        return {
            roster: [],
            lobbyCode: null
        }
    },
    created: function(){
        store.state.Socket.on("UpdatedLobbyRoster", (data) => {
            this.roster = data["roster"]
            // Update lobby code state 
            this.lobbyCode = data["lobbyCode"]
            store.setRoomNumber(this.lobbyCode)
        })
    },
    methods: function(){
        return {
            readyUp(){
                // Tell the Server that client is ready
                store.state.Socket.emit("ReadyUp", {"lobbyCode":store.state.RoomNumber, "username":store.state.Username})
            }
        }
    }
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