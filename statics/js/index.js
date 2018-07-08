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
            username: "Xavier",
            
            newServerRequest: function(){
                console.log(this.username)
                socket.emit("RequestRoom", {"code":this.roomNumber, "username": this.username});
                app.currentView = "wait-lobby"
            }

        }
    }
})

Vue.component("wait-lobby", {
    template:`
    <div>
        <h1>Wait Lobby"</h1>
        <ul v-for="player in roster">
            <li>{{player}}</li>
        </ul>
    </div>
    `,
    data: function(){
        return {
            roster: []
        }
    },
    created: function(){
        socket.on("UpdatedLobbyRoster", (data) => {
            this.roster = data
            
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