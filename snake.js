const canvas = document.getElementById("canvas");
const canvasContext = canvas.getContext('2d');
let intervalId;
let isGameOver = false;
let animationFrameId;
let lastRenderTime = 0;
let pendingDirectionChange = null;

// Constantes
const CELL_SIZE = 20;
const GAME_SPEED = {
    NORMAL: 150,  // Millisecondes entre les mouvements
    SLOW: 300,    // Ralenti
    FAST: 100     // Rapide
};
let currentSpeed = GAME_SPEED.NORMAL;
let effectTimeout = null;

// Initialisation du jeu
window.onload = () => {
    setupCanvas();
    startGame();
};

function setupCanvas() {
    // Ajuster la taille du canvas pour qu'elle soit un multiple exact de CELL_SIZE
    canvas.width = Math.floor(canvas.width / CELL_SIZE) * CELL_SIZE;
    canvas.height = Math.floor(canvas.height / CELL_SIZE) * CELL_SIZE;
}

function startGame() {
    isGameOver = false;
    cancelAnimationFrame(animationFrameId);
    clearTimeout(effectTimeout);
    gameLoop();
}

function gameLoop(timestamp = 0) {
    // Utiliser requestAnimationFrame pour une animation plus fluide
    animationFrameId = requestAnimationFrame(gameLoop);
    
    // Calculer le temps écoulé depuis le dernier rendu
    const elapsed = timestamp - lastRenderTime;
    
    // Mettre à jour l'état du jeu selon la vitesse actuelle
    if (elapsed > currentSpeed) {
        lastRenderTime = timestamp;
        
        // Appliquer les changements de direction en attente
        if (pendingDirectionChange) {
            snake.changeDirection(pendingDirectionChange.x, pendingDirectionChange.y);
            pendingDirectionChange = null;
        }
        
        if (!isGameOver) {
            update();
        }
    }
    
    // Toujours dessiner même si le jeu est en pause
    draw();
}

function update() {
    snake.move();
    checkCollisions();
    checkFoodCollision();
}

function checkCollisions() {
    const head = snake.getHead();
    
    // Collision avec les murs
    if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height) {
        gameOver("Vous avez heurté un mur !");
        return;
    }
    
    // Collision avec soi-même
    for (let i = 0; i < snake.tail.length - 1; i++) {
        if (head.x === snake.tail[i].x && head.y === snake.tail[i].y) {
            gameOver("Vous vous êtes mordu la queue !");
            return;
        }
    }
    
    // Collision avec les crottes
    poops.forEach((poop, index) => {
        if (head.x === poop.x && head.y === poop.y) {
            // Effet de la crotte (exemple : ralentir le serpent)
            applyEffect('slow');
            // Supprimer la crotte après collision
            poops.splice(index, 1);
        }
    });
}

function checkFoodCollision() {
    const head = snake.getHead();
    
    if (Math.abs(head.x - food.x) < CELL_SIZE / 2 && Math.abs(head.y - food.y) < CELL_SIZE / 2) {
        head.x = food.x;
        head.y = food.y;
        
        switch (food.type) {
            case 'slow':
                applyEffect('slow');
                break;
            case 'fast':
                applyEffect('fast');
                break;
            case 'brown':
                gameOver("Vous avez mangé la nourriture brune !");
                return;
            default:
                // Nourriture normale : grandir sans déplacer la tête
                snake.grow();
                // Générer une crotte à la position de la nourriture mangée
                poops.push(new Poop(food.x, food.y));
                break;
        }
        
        // Générer une nouvelle nourriture
        food = new Food();
    }
}

let poops = [];

function applyEffect(effect) {
    // Annuler tout effet précédent
    clearTimeout(effectTimeout);
    
    switch (effect) {
        case 'slow':
            currentSpeed = GAME_SPEED.SLOW;
            break;
        case 'fast':
            currentSpeed = GAME_SPEED.FAST;
            break;
    }
    
    // Revenir à la vitesse normale après 10 secondes
    effectTimeout = setTimeout(() => {
        currentSpeed = GAME_SPEED.NORMAL;
    }, 10000);
}

function gameOver(message) {
    isGameOver = true;
    alert(message || 'Game Over!');
    showRestartButton();
}

function showRestartButton() {
    const restartButton = document.getElementById('restartButton');
    if (restartButton) {
        restartButton.style.display = 'block';
    }
}

function draw() {
    // Effacer le canvas
    canvasContext.clearRect(0, 0, canvas.width, canvas.height);
    
    // Fond du canvas
    canvasContext.fillStyle = 'black';
    canvasContext.fillRect(0, 0, canvas.width, canvas.height);
    
    // Dessiner le serpent
    snake.draw();
    
    // Dessiner la nourriture
    food.draw();
    
    // Dessiner les crottes
    poops.forEach(poop => poop.draw());
    
    // Afficher le score
    drawScore();
    
    // Si le jeu est terminé, afficher un message
    if (isGameOver) {
        drawGameOver();
    }
}

function drawScore() {
    canvasContext.font = "20px Courier New";
    canvasContext.fillStyle = "#00FF00";
    canvasContext.fillText("Points: " + (snake.tail.length - 1), 10, 25);
}

function drawGameOver() {
    // Assombrir le fond
    canvasContext.fillStyle = "rgba(0, 0, 0, 0.5)";
    canvasContext.fillRect(0, 0, canvas.width, canvas.height);
    
    // Texte Game Over
    canvasContext.font = "30px Courier New";
    canvasContext.fillStyle = "#FF0000";
    canvasContext.textAlign = "center";
    canvasContext.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);
    canvasContext.fillText("Cliquez sur Restart pour rejouer", canvas.width / 2, canvas.height / 2 + 40);
    canvasContext.textAlign = "left";
}

// Gestion des entrées clavier
window.addEventListener("keydown", (event) => {
    if (isGameOver) return;
    
    switch (event.key) {
        case 'ArrowLeft':
            if (snake.rotateX !== 1) {
                pendingDirectionChange = { x: -1, y: 0 };
            }
            break;
        case 'ArrowUp':
            if (snake.rotateY !== 1) {
                pendingDirectionChange = { x: 0, y: -1 };
            }
            break;
        case 'ArrowRight':
            if (snake.rotateX !== -1) {
                pendingDirectionChange = { x: 1, y: 0 };
            }
            break;
        case 'ArrowDown':
            if (snake.rotateY !== -1) {
                pendingDirectionChange = { x: 0, y: 1 };
            }
            break;
    }
    
    // Empêcher le défilement de la page
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(event.key)) {
        event.preventDefault();
    }
});

// Classe Snake améliorée
class Snake {
    constructor() {
        this.size = CELL_SIZE;
        this.reset();
    }
    
    reset() {
        // Position de départ au milieu du canvas
        const startX = Math.floor(canvas.width / 2 / CELL_SIZE) * CELL_SIZE;
        const startY = Math.floor(canvas.height / 2 / CELL_SIZE) * CELL_SIZE;
        
        this.tail = [{ x: startX, y: startY }];
        this.rotateX = 0;
        this.rotateY = 0;
    }
    
    getHead() {
        return this.tail[this.tail.length - 1];
    }
    
    changeDirection(x, y) {
        this.rotateX = x;
        this.rotateY = y;
    }
    
    move() {
        const head = this.getHead();
        
        // Ne bouger que si une direction est définie
        if (this.rotateX !== 0 || this.rotateY !== 0) {
            const newRect = {
                x: head.x + (this.rotateX * this.size),
                y: head.y + (this.rotateY * this.size)
            };
            
            this.tail.push(newRect);
            this.tail.shift();
        }
    }
    
    grow() {
        // Ajouter un segment à la même position que la tête
        // Le prochain mouvement le déplacera correctement
        const head = this.getHead();
        this.tail.push({ ...head });
    }
    
    draw() {
        for (let i = 0; i < this.tail.length; i++) {
            const segment = this.tail[i];
            const isHead = i === this.tail.length - 1;
            
            // Couleur différente pour la tête
            const color = isHead ? '#00FF00' : '#008800';
            
            // Dessiner le segment avec un petit espace pour meilleure visibilité
            canvasContext.fillStyle = color;
            canvasContext.fillRect(
                segment.x + 1,
                segment.y + 1,
                this.size - 2,
                this.size - 2
            );
            
            // Ajouter un contour
            canvasContext.strokeStyle = '#00FF00';
            canvasContext.lineWidth = 1;
            canvasContext.strokeRect(
                segment.x + 1,
                segment.y + 1,
                this.size - 2,
                this.size - 2
            );
            
            // Ajouter des yeux à la tête
            if (isHead) {
                this.drawEyes(segment);
            }
        }
    }
    
    drawEyes(head) {
        const eyeSize = 4;
        const eyeOffset = 5;
        
        canvasContext.fillStyle = '#000000';
        
        // Position des yeux selon la direction
        if (this.rotateX === 1) { // Droite
            canvasContext.fillRect(head.x + this.size - eyeOffset, head.y + eyeOffset, eyeSize, eyeSize);
            canvasContext.fillRect(head.x + this.size - eyeOffset, head.y + this.size - eyeOffset - eyeSize, eyeSize, eyeSize);
        } else if (this.rotateX === -1) { // Gauche
            canvasContext.fillRect(head.x + eyeOffset - eyeSize, head.y + eyeOffset, eyeSize, eyeSize);
            canvasContext.fillRect(head.x + eyeOffset - eyeSize, head.y + this.size - eyeOffset - eyeSize, eyeSize, eyeSize);
        } else if (this.rotateY === 1) { // Bas
            canvasContext.fillRect(head.x + eyeOffset, head.y + this.size - eyeOffset, eyeSize, eyeSize);
            canvasContext.fillRect(head.x + this.size - eyeOffset - eyeSize, head.y + this.size - eyeOffset, eyeSize, eyeSize);
        } else if (this.rotateY === -1) { // Haut
            canvasContext.fillRect(head.x + eyeOffset, head.y + eyeOffset - eyeSize, eyeSize, eyeSize);
            canvasContext.fillRect(head.x + this.size - eyeOffset - eyeSize, head.y + eyeOffset - eyeSize, eyeSize, eyeSize);
        } else { // Par défaut (à droite)
            canvasContext.fillRect(head.x + this.size - eyeOffset, head.y + eyeOffset, eyeSize, eyeSize);
            canvasContext.fillRect(head.x + this.size - eyeOffset, head.y + this.size - eyeOffset - eyeSize, eyeSize, eyeSize);
        }
    }
}

// Classe Food améliorée
class Food {
    constructor() {
        this.size = CELL_SIZE;
        this.type = this.getRandomType();
        this.color = this.getColorByType(this.type);
        this.setPosition();
    }
    
    getRandomType() {
        const types = ['normal', 'normal', 'normal', 'slow', 'fast', 'brown'];
        const randomIndex = Math.floor(Math.random() * types.length);
        return types[randomIndex]; // Augmenter la probabilité de nourriture normale
    }
    
    getColorByType(type) {
        switch (type) {
            case 'slow': return '#0000FF'; // Bleu
            case 'fast': return '#FF0000'; // Rouge
            case 'brown': return '#8B4513'; // Marron
            default: return '#FFFF00';      // Jaune pour normal (plus visible)
        }
    }
    
    setPosition() {
        // Essayer de placer la nourriture sur une position valide
        for (let attempts = 0; attempts < 100; attempts++) {
            if (this.type === 'brown' && snake.tail.length > 1) {
                // Pour la nourriture brune, la placer sur le corps (pas sur la tête)
                const randomIndex = Math.floor(Math.random() * (snake.tail.length - 1));
                this.x = snake.tail[randomIndex].x;
                this.y = snake.tail[randomIndex].y;
                return;
            } else {
                // Pour les autres types de nourriture, position aléatoire
                this.x = Math.floor(Math.random() * (canvas.width / CELL_SIZE)) * CELL_SIZE;
                this.y = Math.floor(Math.random() * (canvas.height / CELL_SIZE)) * CELL_SIZE;
                
                // Vérifier si la nourriture n'est pas sur le serpent
                let isTouching = false;
                for (let i = 0; i < snake.tail.length; i++) {
                    if (this.x === snake.tail[i].x && this.y === snake.tail[i].y) {
                        isTouching = true;
                        break;
                    }
                }
                
                if (!isTouching) {
                    return;
                }
            }
        }
        
        // Si aucune position valide n'est trouvée après 100 tentatives
        // Trouver le premier emplacement libre
        const occupied = new Set();
        snake.tail.forEach(segment => {
            occupied.add(`${segment.x},${segment.y}`);
        });
        
        for (let x = 0; x < canvas.width; x += CELL_SIZE) {
            for (let y = 0; y < canvas.height; y += CELL_SIZE) {
                if (!occupied.has(`${x},${y}`)) {
                    this.x = x;
                    this.y = y;
                    return;
                }
            }
        }
    }
    
    draw() {
        // Dessiner la nourriture avec un effet selon le type
        canvasContext.fillStyle = this.color;
        
        if (this.type === 'normal') {
            // Nourriture normale: cercle plein
            canvasContext.beginPath();
            canvasContext.arc(
                this.x + CELL_SIZE / 2,
                this.y + CELL_SIZE / 2,
                CELL_SIZE / 2 - 2,
                0,
                Math.PI * 2
            );
            canvasContext.fill();
        } else if (this.type === 'slow') {
            // Nourriture ralentissante: carré avec symbole
            canvasContext.fillRect(this.x + 2, this.y + 2, this.size - 4, this.size - 4);
            
            // Symbole de pause
            canvasContext.fillStyle = 'white';
            canvasContext.fillRect(this.x + 5, this.y + 6, 3, 8);
            canvasContext.fillRect(this.x + this.size - 8, this.y + 6, 3, 8);
        } else if (this.type === 'fast') {
            // Nourriture accélérante: flèche
            canvasContext.fillRect(this.x + 2, this.y + 2, this.size - 4, this.size - 4);
            
            // Symbole de flèche
            canvasContext.fillStyle = 'white';
            canvasContext.beginPath();
            canvasContext.moveTo(this.x + 5, this.y + this.size / 2);
            canvasContext.lineTo(this.x + this.size - 5, this.y + this.size / 2);
            canvasContext.lineTo(this.x + this.size - 8, this.y + this.size / 2 - 3);
            canvasContext.lineTo(this.x + this.size - 8, this.y + this.size / 2 + 3);
            canvasContext.lineTo(this.x + this.size - 5, this.y + this.size / 2);
            canvasContext.fill();
        } else if (this.type === 'brown') {
            // Nourriture mortelle: crâne
            canvasContext.fillRect(this.x + 2, this.y + 2, this.size - 4, this.size - 4);
            
            // Symbole de danger
            canvasContext.fillStyle = 'white';
            canvasContext.beginPath();
            canvasContext.arc(
                this.x + CELL_SIZE / 2,
                this.y + CELL_SIZE / 2,
                2,
                0,
                Math.PI * 2
            );
            canvasContext.fill();
            
            // Symbole X
            canvasContext.strokeStyle = 'white';
            canvasContext.lineWidth = 2;
            canvasContext.beginPath();
            canvasContext.moveTo(this.x + 6, this.y + 6);
            canvasContext.lineTo(this.x + this.size - 6, this.y + this.size - 6);
            canvasContext.moveTo(this.x + this.size - 6, this.y + 6);
            canvasContext.lineTo(this.x + 6, this.y + this.size - 6);
            canvasContext.stroke();
        }
    }
}

class Poop {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = CELL_SIZE;
        this.color = '#8B4513'; // Couleur marron pour les crottes
    }

    draw() {
        canvasContext.fillStyle = this.color;
        canvasContext.fillRect(this.x + 2, this.y + 2, this.size - 4, this.size - 4);
    }
}

// Initialisation
const snake = new Snake();
let food = new Food();

// Fonction pour redémarrer le jeu
function restartGame() {
    snake.reset();
    food = new Food();
    poops = []; // Réinitialiser les crottes
    isGameOver = false;
    currentSpeed = GAME_SPEED.NORMAL;
    clearTimeout(effectTimeout);
    
    // Cacher le bouton restart
    const restartButton = document.getElementById('restartButton');
    if (restartButton) {
        restartButton.style.display = 'none';
    }
    
    // Redémarrer le jeu
    startGame();
}

// S'assurer que le bouton restart est configuré correctement
const restartButton = document.getElementById('restartButton');
if (restartButton) {
    restartButton.addEventListener('click', restartGame);
}