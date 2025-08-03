// If robots move relatuve to each other but appear same distance from each other in both windows, then ensure currRobotID != requestID
//Check if splice(i,1) and shift() deltes items from array: test in OnlineGDB

let game = null;
const id = Math.floor(Math.random() * 10000000);
let last_update_time = new Date();
let clients = [];
clients.push(id);
let fireballs = [];
let requestQueue = []
let mapThere = false;
let mapItems = []
let x_pos = 0;
let y_pos = 0;
let PlayerAndPoints = [];
let playerName;

const MapItemTypes = {
    0: "images/chair.png",
    1: "images/lamp.png",
    2: "images/mushroom.png",
    3: "images/outhouse.png",
    4: "images/pillar.png",
    5: "images/pond.png",
    6: "images/rock.png",
    7: "images/statue.png",
    8: "images/tree.png",
    9: "images/turtle.png",
  };

 

// Represents a moving image
class Sprite {
	constructor(id,x, y, image_url, name) { 
		this.id = id;
		this.x = x;
		this.y = y;
        this.speed = 300; // pixels-per-second
		this.image = new Image();
		this.image.src = image_url;
        this.name = name
		this.points = 0
		this.health = 100

        // Set some default event handlers
		this.update = Sprite.prototype.update_stop;
		this.onleftclick = Sprite.prototype.onclick_ignore;
        this.onrightclick = Sprite.prototype.onclick_ignore;
        this.arrive = Sprite.prototype.update_stop;
	}

	 does_collide = (a,b) =>{
		let aright = a.x + a.image.width / 2;
		let aleft = a.x - a.image.width / 2;
		let atop = a.y - a.image.height;
		let abottom = a.y;
	
		// Compute the boundaries for Sprite B
		let bright = b.x + b.image.width / 2;
		let bleft = b.x - b.image.width / 2;
		let btop = b.y - b.image.height;
		let bbottom = b.y;

		if (aright <= bleft)
			return false;
		if (aleft >= bright)
			return false;
		if (abottom <= btop)
			return false;
		if (atop >= bbottom)
			return false;
		return true;
		
	} 
    // The default update behavior
	update_stop(elapsed_time) {
        delete this.dist_remaining; // causes the object to stop having the property
	}

    // Move forward
	update_travel(elapsed_time) {
		const collisionCheck = (fireball) =>{
			for(let i = 0; i < game.model.sprites.length; i++){
				let player = game.model.sprites[i]

				if(player.name === "mapitem"){
					if(this.does_collide(fireball,player) && player.id != fireball.id ){
						let fireballIndex = game.model.sprites.findIndex(sprite => sprite.id === fireball.id);
						let fireballSprite = game.model.sprites[fireballIndex]
	
						if (fireballSprite) {
							fireballSprite.points = 0;
						}
						game.model.sprites.splice(i, 1);
						return
					}
				}

				if(player.image.src === "http://127.0.0.1:7040/robot.png" ){
					if(this.does_collide(fireball,player) && player.id != fireball.id){
						
						let fireballIndex = game.model.sprites.findIndex(sprite => sprite.id === fireball.id);
						if (fireballIndex > -1) {
							game.model.sprites[fireballIndex].points++;
						}
			
						
		
						return
					}
			} 
			}
		}
		
		if(this.dist_remaining === undefined){
			
			return; // No destination to travel toward
		}
        let dist_step = Math.min(this.dist_remaining, elapsed_time * this.speed);
        this.x += dist_step * this.component_x;
        this.y += dist_step * this.component_y;
        this.dist_remaining = this.dist_remaining - dist_step;
        if (this.dist_remaining === 0){
           this.arrive();
		   if(this.image.src === "http://127.0.0.1:7040/fireball.png"){
			
			collisionCheck(this)
		   }
		}
	}

    // Remove "this" from the list of sprites
    update_disappear(elapsed_time) {
        for (let i = 0; i < game.model.sprites.length; i++) {
            if (game.model.sprites[i] === this) {
                game.model.sprites.splice(i, 1); // remove this sprite from the list
                return;
            }
        }
        console.log('uh oh, I could not find this sprite in model.sprites!');
    }

    // Do nothing
	onclick_ignore(x, y) {
	}

    // Start travelling to the spot clicked
	onclick_set_destination(x, y) {
		
        let delta_x = x - this.x;
        let delta_y = y - this.y;
        this.dist_remaining = Math.sqrt(delta_x * delta_x + delta_y * delta_y);
		this.component_x = delta_x / this.dist_remaining;
		this.component_y = delta_y / this.dist_remaining;
	}

    // Throw a fireball toward the spot clicked
    onclick_throw_fireball(x, y) {
		let fireball = new Sprite(this.id,this.x, this.y, "fireball.png", "fireball");

        fireball.speed = 300; // pixels-per-second
        fireball.update = Sprite.prototype.update_travel;
        fireball.arrive = Sprite.prototype.update_disappear;
        let delta_x = x - this.x;
        let delta_y = y - this.y;
        fireball.dist_remaining = Math.sqrt(delta_x * delta_x + delta_y * delta_y);
        fireball.component_x = delta_x / fireball.dist_remaining;
        fireball.component_y = delta_y / fireball.dist_remaining;
		game.model.sprites.push(fireball);

    }
}

class Model {
	constructor() {
		this.sprites = [];
        // Make the avatar
		this.avatar = new Sprite(id,500, 250, "robot.png", playerName);
        this.avatar.update = Sprite.prototype.update_travel;
        this.avatar.onleftclick = Sprite.prototype.onclick_set_destination;
        this.avatar.onrightclick = Sprite.prototype.onclick_throw_fireball;
		this.sprites.push(this.avatar);
        this.last_update_time = new Date();
	}

	update() {
        let now = new Date();
        let elapsed_time = (now - this.last_update_time) / 1000; // seconds
        
        // Update all the sprites
		for (const sprite of this.sprites) {
			sprite.update(elapsed_time);
		}
        this.last_update_time = now;
	}

	onleftclick(x, y) {
		this.avatar.onleftclick(x, y);
	}

    onrightclick(x, y) {
		this.avatar.onrightclick(x, y);
    }
}

class View
{
	constructor(model) {
		this.model = model;
		this.canvas = document.getElementById("myCanvas");
        
	}

	

	update() {
        // Clear the screen
		let ctx = this.canvas.getContext("2d");

		ctx.clearRect(0, 0, 1000, 500);

        // Sort the sprites by their y-value to create a pseudo-3D effect
        this.model.sprites.sort((a,b) => a.y - b.y );


		

        //Fetch the map from the server
		const fetchData = async () => {
			try {
				let response = await fetch('map.json')
				console.log(response)
				let map = await response.json();
				for(let i = 0; i < map.items.length; i++ )
					{
						let mapItemX = (map.items[i].x - map.x_scroll) 
						console.log("MA ITEM\n",mapItemX)
						let mapItemY = (map.items[i].y -  map.y_scroll)
						let mapItemNum = map.items[i].type
			
						let newMapItem = new Sprite(Math.floor(Math.random() * 10000000),mapItemX, mapItemY, MapItemTypes[mapItemNum], "mapitem");
						mapItems.push(newMapItem)
						
						this.model.sprites.push(newMapItem);
						
						
					
					}
			} catch (error) {
				console.error('Error fetching data:', error);
			} 
		}

		
		

		if(mapThere === false){
			mapThere = true
			fetchData()
		}
		
        // Draw all the sprites
		for(const sprite of this.model.sprites) {

		
		
			
			ctx.drawImage(sprite.image, sprite.x - sprite.image.width / 2 - 
				x_pos , sprite.y - sprite.image.height - y_pos);
			if(sprite.image.src == "http://127.0.0.1:7040/robot.png"){
			
            ctx.font = '20px Arial';
            ctx.fillStyle = 'black';
            ctx.textAlign = 'center';  // Center the text above the robot
            ctx.fillText(`${sprite.name}`, sprite.x - x_pos, sprite.y - sprite.image.height - 10 - y_pos) ;
			//el.innerHTML = `${this.avatar.name}: ${game.model.avatar.points}`
			}
		}

	
		
		
	}
}




class Controller
{
	constructor(model, view) {
		this.model = model;
		this.view = view;
		let self = this;

        // Add event listeners
		view.canvas.addEventListener("click", function(event) { self.onLeftClick(event); return false; });
		view.canvas.addEventListener("contextmenu", function(event) { self.onRightClick(event); return false; });

		view.canvas.addEventListener("keydown", function(event) {
            let x = self.model.avatar.x;
            let y = self.model.avatar.y;

            // Check which arrow key was pressed using event.key
            switch (event.key) {
                case "ArrowUp":
                    console.log("Up arrow pressed");
                    y -= 10;
                    break;
                case "ArrowDown":
                    console.log("Down arrow pressed");
                    y += 10;
                    break;
                case "ArrowLeft":
                    console.log("Left arrow pressed");
                    x -= 10;
                    break; 
                case "ArrowRight":
                    console.log("Right arrow pressed");
                    x += 10;
                    break;
            }

            // Move the robot to the new position
            self.model.avatar.onclick_set_destination(x, y);
        });

		
	}
    

	onLeftClick(event) {
        event.preventDefault(); 
		const x = event.pageX - this.view.canvas.offsetLeft + x_pos;
		const y = event.pageY - this.view.canvas.offsetTop + y_pos;
		this.model.onleftclick(x, y);

		let nombre = document.getElementById("fname").value

        // todo: tell the server about this click
		let now = new Date().toISOString();
		let player = {"id":id.toString(), "mouseX": x.toString(), "mouseY": y.toString(), "avatarX": this.model.avatar.x.toString(), "avatarY":  this.model.avatar.y.toString(), "time": now, "fid": "0", "action": "move", "name": nombre, "points": this.model.avatar.points, "health": this.model.avatar.health}
        
        fetch('ajax.json', {
			body: JSON.stringify(player),
			cache: "no-cache",
			headers: {
				'Content-Type': 'application/json',
			},
			method: "POST",
		})

	}

    onRightClick(event) {
        event.preventDefault(); // Suppress the context menu
		const x = event.pageX - this.view.canvas.offsetLeft + x_pos;
		const y = event.pageY - this.view.canvas.offsetTop + y_pos;
		this.model.onrightclick(x, y);

		

		

        // todo: tell the server about this click
		let nombre = document.getElementById("fname").value
		let now = new Date();
		now.toISOString();
		let fireball = {"id":id.toString(), "mouseX": x.toString(), "mouseY": y.toString(), "avatarX": this.model.avatar.x.toString(), "avatarY":  this.model.avatar.y.toString(), "time": now, "fid": Math.floor(Math.random() * 10000000).toString(), "action": "fireball","name": nombre, "points": this.model.avatar.points, }
        
        fetch('ajax.json', {
			body: JSON.stringify(fireball),
			cache: "no-cache",
			headers: {
				'Content-Type': 'application/json',
			},
			method: "POST",
		})
		.catch(error => {
			console.error('Error fetching or processing the JSON:', error); 
		});
	
		
    }
    
    process(obj ){

		const updateScores = () => {
			
			this.model.sprites.sort((a,b) => b.points - a.points );

			const scoreboard = document.getElementById("playerPoints");
			scoreboard.innerHTML = "";

			this.model.sprites.forEach(player => {
				
				if(player.image.src == "http://127.0.0.1:7040/robot.png"){
					const scoreDive = document.createElement("div");
					scoreDive.style.backgroundColor = "#afafaf"
					scoreDive.textContent = `${player.name}: ${player.points}`;

					if (player.name === this.model.avatar.name) {
						scoreDive.classList.add("highlight");
					}
					scoreboard.appendChild(scoreDive);

				}
			
			});
	
		}

		const updateHealth = () => {
			const scoreboard = document.getElementById("health-bar");


		}

        const parseISOString = (s) => {
            let b = s.split(/\D+/);
            return new Date(Date.UTC(b[0], --b[1], b[2], b[3], b[4], b[5], b[6]));
        }
        let now = new Date()
        //console.log(obj)
		const mouseX = parseFloat(obj.mouseX);
		const mouseY = parseFloat(obj.mouseY);
		const avatarX = parseFloat(obj.avatarX);
		const avatarY = parseFloat(obj.avatarY);
		const fid = (obj.fid);

		const action = obj.action;
		let clickTime = parseISOString(obj.time); 
		let elapsed_time = (now - clickTime) / 1000; 

		

		

		if(obj.id == id){
			//this.model.avatar.name = obj.name
			if(action === "move"){
			x_pos = (obj.mouseX - this.view.canvas.width / 2)
			y_pos = (obj.mouseY - this.view.canvas.height / 2)

			}
			updateScores()


			
		}
		
		else if(obj.id != id && !clients.includes(obj.id)){
			clients.push(obj.id);
			let newAvatar = new Sprite(obj.id,avatarX, avatarY, "robot.png", obj.name);
			
			

			newAvatar.update = Sprite.prototype.update_travel;
			newAvatar.onleftclick = Sprite.prototype.onclick_set_destination;
			newAvatar.onrightclick = Sprite.prototype.onclick_throw_fireball;

		
			this.model.sprites.push(newAvatar);
			updateScores()


		
		}
		else if (obj.id != id && clients.includes(obj.id)){
			let x = 0;
			for(;x < this.model.sprites.length;){
				if(this.model.sprites[x].id == obj.id){
					break;
				}
				x++
			}
			
				
			const testSprite = this.model.sprites[x] 
			if (!fireballs.includes(fid) && fid !== 0 && action === "fireball"  ) {
				fireballs.push(fid)
				testSprite.onclick_throw_fireball(mouseX,mouseY)

				
			} 
			else if(action === "move"){

				// ctx.fillText(obj.name, avatarX, avatarY);
				testSprite.y = avatarY ;
				testSprite.x = avatarX ;
				testSprite.onclick_set_destination(mouseX,mouseY);
				testSprite.update_travel(elapsed_time);
			}

			this.model.last_update_time = now;
			// this.model.update()
			updateScores()

	
		}
		requestQueue.shift()

	
    }
    

	update() {
        // Ensure we do not hammer the server with too many update requests
        let now = new Date();

        if (now - last_update_time > 500) { // miliseconds
            last_update_time = now;

			

	
            // todo: request updates from the server here
			const fetchData = async () => {
				try {
					let tes = await fetch('ajax.json')
					let objs = await tes.json();
					// console.log("OBJ\n", objs)
					if(Object.keys(objs).length){
						
						requestQueue.push(objs)
						
						
						let test = document.getElementById("myCanvas");
						let ctx = test.getContext("2d");
	
	
						ctx.font = '20px Arial';
						ctx.fillStyle = 'black';
						ctx.textAlign = 'center'; 
						
	
	
						for(let i = 0; i < requestQueue.length; i++){
							this.process(requestQueue[i]);
						}
					}
				} catch (error) {
					console.error('Error fetching data:', error);
				}
			}

			fetchData()






			
        }
	
	}
	
}






class Game {
    
	constructor() {

		this.model = new Model();
		this.view = new View(this.model);
		this.controller = new Controller(this.model, this.view);
		
        

	}

	on_push() {
		let canvas = document.getElementById('myCanvas')
		let content = document.getElementById('content')
		let score = document.getElementById('score')
		let health = document.getElementById('health-bar-container')
		let healthbar = document.getElementById('health-bar')
		
		canvas.style.display = "block"
		content.style.display = "none"
		score.style.display = "block"
		health.style.display = "block"
		healthbar.style.display = "block"



		playerName = document.getElementById("fname").value
		this.model.avatar.name = playerName
		

		 
	}

	onTimer() {
		this.controller.update();
		this.model.update();
		this.view.update();

	}
}



game = new Game();
let timer = setInterval(() => { game.onTimer(); }, 30);

