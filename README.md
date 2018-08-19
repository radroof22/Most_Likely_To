# Mostlikely.to
This is a project that I wanted to make inspired from games like "Jack in the Box Partypack" and "Kahoot". 
The website was made with Socket.io, NodeJS, and VueJS. To be able to run this locally, make sure to `npm install` for the dependencies and use `npm start` to run the server.
Feel free to edit this project how evey you would like.
## VueJS
For VueJS, I used multiple components in the single file which made the code a little bit messy. The first component will either make a lobby or join a lobby, followed by a component that requires all of the users to say they are ready before beginning the game.
The next component will send all of the proposed questiosn to the server where they will be stored for the remaining time. Once all users have sent their question, the game will begin.
The game alternates from voting to a recovery phase when users can see who won the previous round. If all questions are finished, the cummulative points earned by each player will be shown.
To hold variables like the lobby's id and username, I used a Javascript class to mimic a state and sent any data to be stored in the object. This was a fairly hackish setup, but worked well for the project overtime.

## NodeJS and Socket.io
All of the backend code saves no data and commits no storage. The app is not designed to store winners or have an leaderboard, hence making the app a stateless one.
To serve one webpage, I used ExpressJS, and Socket.io handled all other client-server communication. To control communication, I used Socket.io's rooms feature to isolate one room to every lobby. This way, I only had to send a message to a room instead of filter individuals by lobby id.
Part of my implementation in the project is that two people cannot get a point in a round, and instead the first voted for person will recieve the point for the round, this may be something to change in the future.

Some questions may not show up. I tested this many times and couldn't seem to replicate the problem.
The `.vscode` folder is for a debugging state that any one using vscode can press `F5` to run the server from VSCode.
