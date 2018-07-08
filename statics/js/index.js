var socket = null;
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
                socket.emit("RequestRoom", {"code":this.roomNumber, "username": this.username});
                socket.on("Invalid Code", ()=>{
                    this.invalidCode = true;
                    alert("Invalid Code")
                    app.currentView = "join-lobby"
                })
                if (this.invalidCode == false){app.currentView = "wait-lobby"}
            }

        }
    },

    mounted: function(){
        
        
    }
    
})

Vue.component("wait-lobby", {
    template:`
    <div>
        <h1>Wait Lobby</h1>
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
        socket.on("UpdatedLobbyRoster", (data) => {
            this.roster = data["roster"]
            console.log(this.lobbyCode)
            this.lobbyCode = data["lobbyCode"]
            
        })
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
        socket = io();
    },
    mounted: function(){
    }
});