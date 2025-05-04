export class GameEngine {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.entities = [];
        this.lastTime = 0;
        this.accumulator = 0;
        this.timestep = 1000/60; // 60 FPS
        this.timeScale = 1.0; // Add time control
        this.hitStopFrames = 0;
        this.hitSparks = [];
        this.activeRumbles = [];
        this.debugMode = false;
        this.hitboxVisualization = false;
        this.frameCount = 0;
    }
    
    start(entities) {
        this.entities = entities;
        console.log('GameEngine started with', entities.length, 'entities');
        
        let lastTime = 0;
        const gameLoop = (timestamp) => {
            const deltaTime = (timestamp - lastTime) / 1000;
            lastTime = timestamp;
            
            this.update(deltaTime);
            this.render();
            
            // Verify loop is running
            if (!this.frameCount || this.frameCount % 120 === 0) {
                console.log('Game loop running, frame:', this.frameCount);
            }
            
            requestAnimationFrame(gameLoop);
        };
        
        requestAnimationFrame(gameLoop);
    }
    
    update(deltaTime) {
        this.frameCount++;
        if (this.frameCount % 60 === 0) {
            console.log(`Game running @ ${Math.round(1/deltaTime)}fps`);
        }
        
        this.entities.forEach(entity => entity.update(deltaTime));
        
        // Update hit sparks
        this.hitSparks.forEach((spark, i) => {
            spark.lifetime -= deltaTime;
            spark.particles.forEach(p => {
                p.x += Math.cos(p.angle) * p.speed * 10 * deltaTime;
                p.y += Math.sin(p.angle) * p.speed * 10 * deltaTime;
                p.lifetime -= deltaTime;
            });
            
            if (spark.lifetime <= 0) {
                this.hitSparks.splice(i, 1);
            }
        });
    }
    
    render() {
        // Camera follow with bounds
        const centerX = (this.entities[0].position.x + this.entities[1].position.x) / 2;
        const centerY = (this.entities[0].position.y + this.entities[1].position.y) / 2;
        
        // Base zoom with dynamic adjustment
        let zoom = 1;
        if (Math.abs(this.entities[0].position.x - this.entities[1].position.x) < 200) {
            zoom = 1.2;
        }
        
        this.ctx.save();
        this.ctx.translate(this.ctx.canvas.width/2, this.ctx.canvas.height/2);
        this.ctx.scale(zoom, zoom);
        this.ctx.translate(-centerX, -centerY - 50);
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        
        // Draw all entities
        this.entities.forEach(entity => entity.render(this.ctx));
        
        // Render hit sparks
        this.hitSparks.forEach(spark => {
            spark.particles.forEach(p => {
                if (p.lifetime > 0) {
                    this.ctx.fillStyle = `${p.color.replace(')', `, ${p.lifetime/0.5})`).replace('rgb', 'rgba')}`;
                    this.ctx.fillRect(p.x, p.y, p.size, p.size);
                }
            });
        });
        
        // Debug rendering
        if (this.debugMode) {
            this.entities.forEach(entity => {
                if (entity.debugRender) entity.debugRender(this.ctx);
            });
        }
        
        this.ctx.restore();
    }
    
    triggerHitStop(frames) {
        this.hitStopFrames = frames;
        this.timeScale = 0.1; // Slow-mo effect
        setTimeout(() => this.timeScale = 1.0, frames * 16);
    }
    
    addHitSparks(x, y, particles) {
        this.hitSparks.push({
            x, y,
            particles,
            lifetime: 0.5
        });
    }
    
    toggleDebug() {
        this.debugMode = !this.debugMode;
        this.hitboxVisualization = this.debugMode;
    }
}
