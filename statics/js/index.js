var socket = null;
var app = new Vue({
    el: "#app",
    data: {
        message: "yoyo",
    },
    methods: {
        
    },
    created: function(){
        socket = io();
    },
    mounted: function(){
        socket.on("", ()=>{
            
        })
    }
});