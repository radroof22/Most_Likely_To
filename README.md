# Mostlikely.to
This game was created to replicate the technology base of 'Jack in the Box Partypack' and 'Kahoot', livestreaming, interactive games amongs member groups. Instead of quiz questions or deeply interactive games like Kahoot and 'Jack', respectively, Mostlikely.to is a simple game of allowing users to create their own questions and vote on which members of their lobby are most likely to do it. The project uses Socket.io web sockets to have live communication between the users and the server hosting the game and lobby. The frontend is then rendered using Vue.js to handle state management on the frontend so no user data is confused or lost for the client.

## Run Yourself
After git cloning, the repository, 
`npm install` in order to install the dependiences
and `npm start` to start the server.

## Technology Stack
The technology stack revolved around 
- **NodeJS** to host and serve the static HTML, CSS, and Javascript files 
- **Socket.io** to act as web socket connection between server hosting all game data and client
- **VueJS** responsible for making an interactive user experience for the users

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

## Workflow
![Image of user creating lobby](https://user-images.githubusercontent.com/23004551/120541624-19d94400-c3b8-11eb-87a6-cbddc8f94a96.png)
The image above is a demonstration of a user named "Rohan" creating a lobby for his friends. Users can join the newly created lobby code (displayed on the next image) by following the same steps as above expect adding the lobby code in the appropriate section.

![Image of user waiting in lobby](https://user-images.githubusercontent.com/23004551/120541681-2a89ba00-c3b8-11eb-89cc-5d244f56693a.png)
The image above is a user waiting for his/her friend to join the lobby. When the party is ready, each user can press "ready" in order to confirm with the server that they are ready to move on. The lobby must have 2 or more people though in order to play.

![Image of adding questions](https://user-images.githubusercontent.com/23004551/120542312-f367d880-c3b8-11eb-9b5b-584de47dd24b.png)
This is an image of the user inputting questions to submit to the lobby. These questions will then be randomly displayed to the users in the next part of the game.

![Image of voting](https://user-images.githubusercontent.com/23004551/120542586-43df3600-c3b9-11eb-8de8-3fa242c81820.png)
The image above is of the screen where users vote on who the question is most accurate for. The user would then vote for who they think the question is most accurate for and wait his/her friends in the lobby to vote for who they think its most accurate for. A screen will then be displayed saying who is most likely to do that question (the display only lasts a couple of seconds).

![Image of voting summary](https://user-images.githubusercontent.com/23004551/120542872-9caece80-c3b9-11eb-80b8-76f2a63f1c1e.png)
At the end of the game, users see this image as a summary for the voting throughout the game. People can see who is most likely to do things as a nice summary to the game.




