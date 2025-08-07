# Robot-Game
About:
RobotGame is a real-time, multiplayer, player-vs-player (PvP) robot game where multiple clients can connect and interact simultaneously. Each player controls a robot on a shared grid-based arena, receiving live updates as other players move and act. The game combines classic grid-based movement with modern web-based multiplayer features.
Built using HTML for the user interface and JavaScript for the backend logic and WebSocket communication, this project demonstrates how simple browser-based games can be extended into interactive, networked experiences.


How to run:
1. Clone this repository
2. Enter the projects directory: enter cd RobotGame into your terminal
3. Give the bash file permissions: chmod 755 run.bash
4. Run the bash file: enter ./run.bash in your terminal 
** If two windows dont open in your browser just copy and paste this url into your browser: http://127.0.0.1:7040/client.html **


Things that need work: 
The different clinets get updates, but if the actions happen too quickly (e.g. you rapid fire a lot of fireballs at another player) then some of the actions wont be sent over. I am still working on this bug and will have an update as soon as I can. Thank you for your patianece. 