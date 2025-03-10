const canvas = document.getElementById("canvas")
const canvasContext = canvas.getContext('2d')
let intervalId;

window.onload = () => {
    gameLoop();
}

function gameLoop(){
    intervalId = setInterval(show, 1500/20) 
}

function show(){
    update()
    draw()
}

function update(){
    canvasContext.clearRect(0, 0, canvas.width, canvas.height)
    snake.move()
    checkHitWall()
    checkHitSelf()
    getPoint()
}

function getPoint() {
    if(snake.tail[snake.tail.length - 1].x == point.x &&
        snake.tail[snake.tail.length - 1].y == point.y){
            snake.tail[snake.tail.length] = {x: point.x, y: point.y}
            point = new Point();
    }
}

function stopGame() {
    clearInterval(intervalId);
}

function checkHitWall() {
    let headTail = snake.tail[snake.tail.length -1]

    if (headTail.x == - snake.size) {
        stopGame();
    } else if (headTail.x == canvas.width) {
        stopGame();
    } else if (headTail.y == - snake.size) {   
        stopGame();
    } else if (headTail.y == canvas.height) {
        stopGame();
    }
}

function checkHitSelf() {
    let headTail = snake.tail[snake.tail.length -1] 

    for(let i = 1; i < snake.tail.length; i++){
        if(headTail.x == snake.tail[i - 1].x && headTail.y == snake.tail[i - 1].y ){
            stopGame();
        }
    }
}

function draw(){
    createRect(0,0,canvas.width, canvas.height, 'black', 'black')
    createRect(0,0, canvas.width, canvas.height)

    for(let i = 0; i < snake.tail.length; i++){
        createRect(snake.tail[i].x + 2.5, snake.tail[i].y + 2.5, snake.size - 5, snake.size- 5, '#444444', '#00FF00') 
    }

    canvasContext.font = "20px Courier New"
    canvasContext.fillStyle = "#00FF00"

    canvasContext.fillText("Points: " + (snake.tail.length -1), canvas.width -470, 18)
    createRect(point.x, point.y, point.size, point.size, point.color, '#0000')
}

function createRect(x,y,width,height,color, borders){ 
    canvasContext.fillStyle = color
    canvasContext.strokeStyle = borders 
    canvasContext.fillRect(x,y,width,height)
    canvasContext.strokeRect(x,y,width,height)

}

window.addEventListener("keydown", (event)=>{
    setTimeout(()=>{
        if(event.keyCode == 37 && snake.rotateX != 1){
            snake.rotateX = -1
            snake.rotateY = 0
        } else if(event.keyCode == 38 && snake.rotateY != 1){
            snake.rotateX = 0
            snake.rotateY = -1
        } else if(event.keyCode == 39 && snake.rotateX != -1){
            snake.rotateX = 1
            snake.rotateY = 0
        } else if(event.keyCode == 40 && snake.rotateY != -1){
            snake.rotateX = 0
            snake.rotateY = 1
        }
    }, 1)
})

class Snake{
    constructor(x, y, size){
        this.x = x
        this.y = y
        this.size = size
        this.tail = [{x:this.x, y:this.y}]
        this.rotateX = 0
        this.rotateY = 0
    }

    move(){
        let newRect

        if(this.rotateX == 1){
            newRect = {
                x: this.tail[this.tail.length - 1].x + this.size,
                y: this.tail[this.tail.length - 1].y
            }
        } else if(this.rotateX == -1){
            newRect = {
                x: this.tail[this.tail.length - 1].x - this.size,
                y: this.tail[this.tail.length - 1].y
            }
        } else if(this.rotateY == 1){
            newRect = {
                x: this.tail[this.tail.length - 1].x,
                y: this.tail[this.tail.length - 1].y + this.size
            }
        } else if(this.rotateY == -1){
            newRect = {
                x: this.tail[this.tail.length - 1].x,
                y: this.tail[this.tail.length - 1].y - this.size
            }
        } else if(this.rotateX == 0 && this.rotateY == 0){
            newRect = {
                x: this.tail[this.tail.length - 1].x,
                y: this.tail[this.tail.length - 1].y,
            }
        }

        this.tail.shift()
        this.tail.push(newRect)
    }
}

class Point{
    constructor(){
        let isTouching;
        while(true){
            isTouching = false;
            this.x = Math.floor(Math.random() * canvas.width / snake.size) * snake.size
            this.y = Math.floor(Math.random() * canvas.height / snake.size) * snake.size
            for(let i = 0; i < snake.tail.length; i++){
                if(this.x == snake.tail[i].x && this.y == snake.tail[i].y){
                    isTouching = true
                }
            }

            this.size = snake.size
            this.color = "red"

            if(!isTouching){
                break;
            }
        }
    }
}

const snake = new Snake(80, 80, 20);
let point = new Point();


