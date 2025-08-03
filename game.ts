// If robots move relative to each other but appear same distance from each other in both windows, then ensure currRobotID != requestID
//Check if splice(i,1) and shift() deletes items from array: test in OnlineGDB

let game: any = null;
const id: number = Math.floor(Math.random() * 10000000);
let last_update_time: Date = new Date();
let clients: number[] = [];
clients.push(id);
let fireballs: any[] = [];
let requestQueue: any[] = [];
let mapThere: boolean = false;
let x_pos: number = 0;
let y_pos: number = 0;
let playerName: string | undefined;

const MapItemTypes: { [key: number]: string } = {
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
    id: number;
    x: number;
    y: number;
    speed: number;
    image: HTMLImageElement;
    name: string;
    points: number;
    dist_remaining?: number;
    component_x?: number;
    component_y?: number;
    img_url: string;
    update: (elapsed_time: number) => void;
    onleftclick: () => void;
    onrightclick: () => void;
    arrive: () => void;



    constructor(id: number, x: number, y: number, image_url: string, name: string) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.speed = 300; // pixels-per-second
        this.image = new Image();
        this.image.src = image_url;
        this.name = name;
        this.points = 0;

        // Set some default event handlers
        this.update = this.update_stop;
        this.onleftclick = this.onclick_ignore;
        this.onrightclick = this.onclick_ignore;
        this.arrive = this.update_stop;
    }

    does_collide = (a: Sprite, b: Sprite): boolean => {
        let aright = a.x + a.image.width / 2;
        let aleft = a.x - a.image.width / 2;
        let atop = a.y - a.image.height;
        let abottom = a.y;

        // Compute the boundaries for Sprite B
        let bright = b.x + b.image.width / 2;
        let bleft = b.x - b.image.width / 2;
        let btop = b.y - b.image.height;
        let bbottom = b.y;

        if (aright <= bleft) return false;
        if (aleft >= bright) return false;
        if (abottom <= btop) return false;
        if (atop >= bbottom) return false;
        return true;
    }

    // The default update behavior
    update_stop(): void {
        delete this.dist_remaining; // causes the object to stop having the property
    }

    // Move forward
    update_travel(elapsed_time: number): void {
        const collisionCheck = (fireball: Sprite) => {
            for (let i = 0; i < game.model.sprites.length; i++) {
                let player = game.model.sprites[i];

                if (player.name === "mapitem") {
                    if (this.does_collide(fireball, player) && player.id != fireball.id) {
                        let fireballIndex = game.model.sprites.findIndex(sprite => sprite.id === fireball.id);
                        let fireballSprite = game.model.sprites[fireballIndex];

                        if (fireballSprite) {
                            fireballSprite.points = 0;
                        }

                        game.model.sprites.splice(i, 1);
                        return;
                    }
                }

                if (player.image.src === "http://127.0.0.1:7040/robot.png") {
                    if (this.does_collide(fireball, player) && player.id != fireball.id) {
                        let fireballIndex = game.model.sprites.findIndex(sprite => sprite.id === fireball.id);
                        if (fireballIndex > -1) {
                            game.model.sprites[fireballIndex].points++;
                        }
                        return;
                    }
                }
            }
        }

        if (this.dist_remaining === undefined) {
            return; // No destination to travel toward
        }
        let dist_step = Math.min(this.dist_remaining, elapsed_time * this.speed);
        this.x += dist_step * (this.component_x || 0);
        this.y += dist_step * (this.component_y || 0);
        this.dist_remaining = this.dist_remaining - dist_step;
        if (this.dist_remaining === 0) {
            this.arrive();
            if (this.image.src === "http://127.0.0.1:7040/fireball.png") {
                collisionCheck(this);
            }
        }
    }

    // Remove "this" from the list of sprites
    update_disappear(elapsed_time: number): void {
        for (let i = 0; i < game.model.sprites.length; i++) {
            if (game.model.sprites[i] === this) {
                game.model.sprites.splice(i, 1);
                break;
            }
        }
    }

    onclick_ignore(): void {}


    onclick_set_destination(x: number, y: number): void {
        const delta_x = x - this.x;
        const delta_y = y - this.y;
        this.dist_remaining = Math.sqrt(delta_x * delta_x + delta_y * delta_y);
        this.component_x = delta_x / this.dist_remaining;
        this.component_y = delta_y / this.dist_remaining;
    }

    // Throw a fireball toward the spot clicked
    onclick_throw_fireball(x: number, y: number): void {
        const fireball = new Sprite(this.id, this.x, this.y, "fireball.png", "fireball");

        fireball.speed = 300; // pixels-per-second
        fireball.update = Sprite.prototype.update_travel;
        fireball.arrive = Sprite.prototype.update_disappear;
        const delta_x = x - this.x;
        const delta_y = y - this.y;
        fireball.dist_remaining = Math.sqrt(delta_x * delta_x + delta_y * delta_y);
        fireball.component_x = delta_x / fireball.dist_remaining;
        fireball.component_y = delta_y / fireball.dist_remaining;
        game.model.sprites.push(fireball);
    }
}


