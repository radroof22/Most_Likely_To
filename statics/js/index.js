var socket = null;
Vue.component("join-lobby", {
    template: `
    <div>
        <input v-model="username" placeholder="Username" type="text" />
        <input v-model="roomNumber" placeholder="Will automatically be created if this space is blank" type="number" />
        <button @click="newServerRequest">Create Server</button>
    </div>
    `,

    data: function (){
        return {
            roomNumber: null,
            username: null,
            
            newServerRequest: function(){
                socket.emit("RequestRoom",{"code":this.roomNumber, "username": this.username});
            }
        }
    }
})

var app = new Vue({
    el: "#app",
    data: {
        message: "yoyo",
        state: "join-lobby"
    },
    methods: {
        // Functions to Handle Component Insertion
        lobbyJoin() {
            if (this.state == "join-lobby"){return true}
        }
    },
    created: function(){
        socket = io();
    },
    mounted: function(){
        socket.on("New Opponent", ()=>{
            console.log("New person")
        })
    }
});