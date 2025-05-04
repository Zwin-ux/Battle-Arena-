class StickClash {
    constructor() {
        console.log('Initializing game...');
        
        this.canvas = document.getElementById('gameCanvas');
        if (!this.canvas) throw new Error('Canvas not found');
        
        this.ctx = this.canvas.getContext('2d');
        if (!this.ctx) throw new Error('Could not get 2D context');
        
        // Test render
        this.ctx.fillStyle = 'green';
        this.ctx.fillRect(100, 100, 50, 50);
        console.log('Game initialized successfully');
        
        console.log('Initializing StickClash...');
        
        // Debug canvas
        console.log('Canvas dimensions:', this.canvas.width, 'x', this.canvas.height);
        this.ctx.fillStyle = 'red';
        this.ctx.fillRect(0, 0, 50, 50); // Test render
        
        this.input = new InputManager();
        this.gameEngine = new GameEngine(this.canvas);
        
        // Set canvas size
        this.canvas.width = 800;
        this.canvas.height = 400;
        
        // Simple prototype fighters
        this.player1 = new Fighter({
            name: 'Player 1',
            speed: 8,
            jumpForce: 12,
            weapon: 'Sword'
        }, 1);
        
        this.player2 = new Fighter({
            name: 'Player 2',  
            speed: 8,
            jumpForce: 12,
            weapon: 'Axe'
        }, 2);
        
        // Position players
        this.player1.position = { x: 200, y: 300 };
        this.player2.position = { x: 600, y: 300 };
        
        // Connect fighter to engine
        this.player1.gameEngine = this.gameEngine;
        this.player2.gameEngine = this.gameEngine;
        
        // Screen effects
        this.screenShake = 0;
        this.hitSparks = [];
        
        // Start game loop
        this.lastTime = 0;
        requestAnimationFrame(this.gameLoop.bind(this));
        
        // Setup mobile controls
        if ('ontouchstart' in window) {
            this.setupMobileControls();
        }
        
        this.dynamicDifficulty = {
            comebackThreshold: 0.3, // 30% health difference
            damageBoost: 1.2,
            defenseBoost: 0.8
        };
    }
    
    setupMobileControls() {
        const controls = document.getElementById('mobileControls');
        
        // Map buttons to actions
        const bindButton = (className, action) => {
            const btn = controls.querySelector(`.${className}`);
            btn.addEventListener('touchstart', () => this.input.keys[action] = true);
            btn.addEventListener('touchend', () => this.input.keys[action] = false);
        };
        
        bindButton('up', 'ArrowUp');
        bindButton('down', 'ArrowDown');
        bindButton('left', 'ArrowLeft');
        bindButton('right', 'ArrowRight');
        bindButton('light', 'n');
        bindButton('heavy', 'm');
        bindButton('block', ',');
        bindButton('jump', 'Enter');
    }
    
    gameLoop(timestamp) {
        const deltaTime = (timestamp - this.lastTime) / 1000;
        this.lastTime = timestamp;
        
        // Handle input
        this.handlePlayerInput(this.player1, 'player1', deltaTime);
        this.handlePlayerInput(this.player2, 'player2', deltaTime);
        
        // Update and render
        this.player1.update(deltaTime);
        this.player2.update(deltaTime);
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Apply screen shake
        if (this.screenShake > 0) {
            const intensity = this.screenShake * 5;
            this.ctx.save();
            this.ctx.translate(
                (Math.random() - 0.5) * intensity,
                (Math.random() - 0.5) * intensity
            );
            this.screenShake -= deltaTime;
        }
        
        // Render hit sparks
        this.hitSparks.forEach((spark, i) => {
            spark.lifetime -= deltaTime;
            if (spark.lifetime <= 0) {
                this.hitSparks.splice(i, 1);
                return;
            }
            
            spark.particles.forEach(particle => {
                this.ctx.fillStyle = `rgba(255, ${Math.random() > 0.5 ? 200 : 100}, 50, ${spark.lifetime / 0.3})`;
                this.ctx.fillRect(
                    spark.x + Math.cos(particle.angle) * particle.speed * (1 - spark.lifetime / 0.3) * 20,
                    spark.y + Math.sin(particle.angle) * particle.speed * (1 - spark.lifetime / 0.3) * 20,
                    particle.size, particle.size
                );
            });
        });
        
        this.player1.render(this.ctx);
        this.player2.render(this.ctx);
        
        if (this.screenShake > 0) {
            this.ctx.restore();
        }
        
        requestAnimationFrame(this.gameLoop.bind(this));
    }
    
    addHitSpark(x, y) {
        this.hitSparks.push({
            x, y,
            lifetime: 0.3,
            particles: Array(8).fill().map(() => ({
                angle: Math.random() * Math.PI * 2,
                speed: 2 + Math.random() * 3,
                size: 2 + Math.random() * 3
            }))
        });
    }
    
    handlePlayerInput(player, playerId, deltaTime) {
        // Movement
        const dir = this.input.getDirection(playerId);
        
        // Blocking stops movement
        if (!player.isBlocking) {
            player.velocity.x = dir.x * player.data.speed;
        }
        
        // Defensive actions
        if (this.input.isPressed(playerId, 'block')) {
            player.block();
        } else {
            player.isBlocking = false;
        }
        
        if (this.input.isPressed(playerId, 'dodge')) {
            player.dodge();
        }
        
        // Attacks
        if (this.input.isPressed(playerId, 'light')) {
            player.attack('light');
        } else if (this.input.isPressed(playerId, 'heavy')) {
            player.attack('heavy');
        }
        
        // Jump
        if (this.input.isPressed(playerId, 'jump') && !player.isBlocking) {
            player.jump();
        }
    }
    
    checkHitboxes() {
        if (this.player1.attackHitbox.collides(this.player2.hurtbox)) {
            this.player2.takeHit(this.player1.currentAttack.type, this.player1);
            this.addHitSpark(this.player2.position.x, this.player2.position.y - 30);
            if (this.player1.currentAttack.type === 'heavy') {
                this.screenShake = 0.1;
            }
        }
        // Add more hitbox checks here...
        
        // Apply comeback mechanics
        const healthDiff = Math.abs(
            (this.player1.health/this.player1.maxHealth) - 
            (this.player2.health/this.player2.maxHealth)
        );
        
        if (healthDiff > this.dynamicDifficulty.comebackThreshold) {
            const underdog = this.player1.health > this.player2.health ? 
                this.player2 : this.player1;
                
            underdog.damageOutput *= this.dynamicDifficulty.damageBoost;
            underdog.damageTaken *= this.dynamicDifficulty.defenseBoost;
        }
    }
}

// Minimal test
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Test render
ctx.fillStyle = 'red';
ctx.fillRect(0, 0, 100, 100);

console.log('Basic render test complete - you should see a red square');

// Start game when ready
document.addEventListener('DOMContentLoaded', () => new StickClash());
