export class Fighter {
    constructor(data, playerId) {
        this.data = data || {
            visuals: {
                trailColor: '#FFFFFF'
            }
        };
        this.playerId = playerId;
        this.position = { x: 100 * playerId, y: 300 };
        this.velocity = { x: 0, y: 0 };
        this.state = 'idle';
        this.prevState = 'idle'; // New state logging
        this.health = 300;
        this.maxHealth = 300;
        this.stateTime = 0;
        this.comboCount = 0;
        this.blockStamina = 100;
        this.dodgeCooldown = 0;
        this.isBlocking = false;
        this.hitFlashFrames = 0;
        this.isInvincible = false;
        this.specialCooldown = 0;
        this.squashScale = null;
        this.comboPotential = 100; // New combo resource
        this.comboDecayRate = 15; // Per second
        this.comboMeterGain = {
            light: 8,
            heavy: 15,
            special: 25
        };
        this.stamina = 100; // New stamina system
        
        // Attack data
        this.attacks = {
            light: { damage: 8, knockback: 3 },
            heavy: { damage: 20, knockback: 8 },
            special: { damage: 35, knockback: 12 }
        };
        this.afterImages = []; // New afterimage system
        this.dashCancelWindow = 0; // New dash cancel window
        this.comboRoutes = {
            assassin: [
                {input: 'light→light→heavy', damage: 1.8, meterGain: 25},
                {input: 'dash→heavy→special', damage: 2.2, requiresCorner: true}
            ],
            grappler: [
                {input: 'heavy→light→light', damage: 2.0, armorFrames: 10},
                {input: 'block→heavy→special', damage: 2.5, requiresGrounded: true}
            ]
        };
        this.comboPopups = []; // New combo popups
        this.hitSparkConfig = {
            assassin: {
                color: '#FF66CC',
                count: 12,
                spread: 1.5
            },
            grappler: {
                color: '#FFAA33',
                count: 8,
                spread: 2.0
            }
        };
        
        this.rumblePatterns = {
            light: { duration: 100, intensity: 0.3 },
            heavy: { duration: 200, intensity: 0.7 },
            special: { duration: 300, intensity: 1.0 }
        };
        
        this.hitboxes = [
            { x: -10, y: -30, width: 20, height: 30 },
            { x: -20, y: -10, width: 40, height: 20 }
        ];
        
        this.hurtboxes = [
            { x: -20, y: -40, width: 40, height: 40 },
            { x: -10, y: -20, width: 20, height: 20 }
        ];
        this.armorFrames = 0; // New armor frames
        this.effects = []; // New effects array
    }
    
    update(deltaTime) {
        if (this.state !== this.prevState) {
            console.log(`${this.data.name} state: ${this.prevState} → ${this.state}`);
            this.prevState = this.state;
        }
        
        // Update position based on velocity
        this.position.x += this.velocity.x * deltaTime;
        this.position.y += this.velocity.y * deltaTime;
        
        // Apply gravity
        if (this.position.y < 300) {
            this.velocity.y += 0.5;
        } else {
            this.position.y = 300;
            this.velocity.y = 0;
        }
        
        // Update cooldowns
        if (this.dodgeCooldown > 0) this.dodgeCooldown -= deltaTime;
        if (!this.isBlocking && this.blockStamina < 100) {
            this.blockStamina = Math.min(100, this.blockStamina + 10 * deltaTime);
        }
        
        if (this.specialCooldown > 0) {
            this.specialCooldown -= deltaTime;
        }
        
        // Regenerate combo potential when not attacking
        if (this.state === 'idle') {
            this.comboPotential = Math.min(100, this.comboPotential + 5 * deltaTime);
        }
        
        // Regenerate stamina
        if (this.stamina < 100) {
            this.stamina = Math.min(100, this.stamina + 5 * deltaTime);
        }
        
        // State machine
        switch(this.state) {
            case 'attack':
                if (this.stateTime > 0.2) {
                    this.state = 'idle';
                    this.velocity = { x: 0, y: 0 };
                }
                break;
            case 'hit':
                if (this.stateTime > 0.3) {
                    this.state = 'idle';
                    this.isInvincible = false;
                }
                break;
        }
        
        this.stateTime += deltaTime;
        
        // Update afterimages
        this.afterImages.forEach((image, index) => {
            image.opacity -= deltaTime;
            if (image.opacity <= 0) {
                this.afterImages.splice(index, 1);
            }
        });
        
        // Update combo popups
        this.comboPopups.forEach((popup, i) => {
            popup.y -= 1;
            popup.alpha -= 0.01;
            popup.scale += 0.01;
            
            if (popup.alpha <= 0) {
                this.comboPopups.splice(i, 1);
            }
        });
        
        // Update armor frames
        if (this.armorFrames > 0) {
            this.armorFrames -= deltaTime;
        }
        
        // Update effects
        this.effects.forEach((effect, index) => {
            effect.frames -= deltaTime;
            if (effect.frames <= 0) {
                this.effects.splice(index, 1);
            }
        });
    }
    
    render(ctx) {
        // Apply squash/stretch during hits
        if (this.squashScale) {
            ctx.save();
            ctx.scale(this.squashScale.x, this.squashScale.y);
        }
        
        // Apply hit freeze effect
        if (this.hitFlashFrames > 0) {
            ctx.save();
            ctx.filter = 'brightness(2)';
        }
        
        // Draw combo trail behind character
        this.drawComboTrail(ctx);
        
        // Draw weapon trail
        if (this.state === 'attack') {
            ctx.save();
            ctx.strokeStyle = this.data.visuals.trailColor || '#FF66CC';
            ctx.lineWidth = 3;
            ctx.lineCap = 'round';
            ctx.globalAlpha = 0.7;
            ctx.beginPath();
            ctx.moveTo(15, -10);
            ctx.lineTo(30, -20);
            ctx.stroke();
            
            // Trail particles
            for (let i = 0; i < 3; i++) {
                const offset = Math.random() * 10;
                ctx.fillStyle = this.data.visuals.trailColor || '#FF66CC';
                ctx.fillRect(
                    15 + (30-15)*i/3 + (Math.random()-0.5)*offset,
                    -10 + (-20+10)*i/3 + (Math.random()-0.5)*offset,
                    2, 2
                );
            }
            ctx.restore();
        }
        
        // Flash when hit
        if (this.hitFlashFrames > 0) {
            ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
            ctx.fillRect(this.position.x - 30, this.position.y - 60, 60, 90);
            this.hitFlashFrames--;
        }
        
        // Draw UI elements
        this.drawHealthBar(ctx);
        this.drawStaminaBar(ctx);
        this.drawComboCounter(ctx);
        
        // Draw combo popups
        this.drawComboPopups(ctx);
        
        // Draw stick figure based on state
        ctx.save();
        ctx.translate(this.position.x, this.position.y);
        
        // Head
        ctx.beginPath();
        ctx.arc(0, -40, 10, 0, Math.PI * 2);
        ctx.fillStyle = '#000';
        ctx.fill();
        
        // Body
        ctx.beginPath();
        ctx.moveTo(0, -30);
        ctx.lineTo(0, 0);
        ctx.stroke();
        
        // Arms
        ctx.beginPath();
        ctx.moveTo(0, -20);
        ctx.lineTo(-15, -10);
        ctx.moveTo(0, -20);
        ctx.lineTo(15, -10);
        ctx.stroke();
        
        // Legs
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-15, 20);
        ctx.moveTo(0, 0);
        ctx.lineTo(15, 20);
        ctx.stroke();
        
        // Weapon
        if (this.data.weapon) {
            ctx.beginPath();
            ctx.moveTo(15, -10);
            ctx.lineTo(30, -20);
            ctx.strokeStyle = '#FF0000';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
        
        // Health bar
        ctx.fillStyle = 'red';
        ctx.fillRect(-30, -60, 60, 5);
        ctx.fillStyle = 'green';
        ctx.fillRect(-30, -60, 60 * (this.health / this.maxHealth), 5);
        
        ctx.restore();
        
        if (this.hitFlashFrames > 0) {
            ctx.restore();
        }
        
        if (this.squashScale) {
            ctx.restore();
            this.squashScale = null;
        }
        
        // Draw afterimages
        this.afterImages.forEach(image => {
            ctx.save();
            ctx.translate(image.x, image.y);
            ctx.globalAlpha = image.opacity;
            
            // Head
            ctx.beginPath();
            ctx.arc(0, -40, 10, 0, Math.PI * 2);
            ctx.fillStyle = '#000';
            ctx.fill();
            
            // Body
            ctx.beginPath();
            ctx.moveTo(0, -30);
            ctx.lineTo(0, 0);
            ctx.stroke();
            
            // Arms
            ctx.beginPath();
            ctx.moveTo(0, -20);
            ctx.lineTo(-15, -10);
            ctx.moveTo(0, -20);
            ctx.lineTo(15, -10);
            ctx.stroke();
            
            // Legs
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(-15, 20);
            ctx.moveTo(0, 0);
            ctx.lineTo(15, 20);
            ctx.stroke();
            
            ctx.restore();
        });
        
        // Draw effects
        this.effects.forEach(effect => {
            ctx.save();
            ctx.translate(this.position.x, this.position.y);
            ctx.fillStyle = effect.color;
            ctx.fillRect(-20, -40, 40, 40);
            ctx.restore();
        });
        
        this.debugRender(ctx);
    }
    
    drawHealthBar(ctx) {
        // Health bar background
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(this.position.x - 35, this.position.y - 80, 70, 10);
        
        // Health bar
        const healthWidth = 66 * (this.health / this.maxHealth);
        ctx.fillStyle = this.health > 50 ? '#2ecc71' : 
                       this.health > 25 ? '#f39c12' : '#e74c3c';
        ctx.fillRect(this.position.x - 33, this.position.y - 78, healthWidth, 6);
    }
    
    drawStaminaBar(ctx) {
        if (this.stamina < 100) {
            // Stamina bar background
            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            ctx.fillRect(this.position.x - 35, this.position.y - 65, 70, 5);
            
            // Stamina bar
            ctx.fillStyle = '#3498db';
            ctx.fillRect(this.position.x - 33, this.position.y - 64, 66 * (this.stamina / 100), 3);
        }
    }
    
    drawComboCounter(ctx) {
        if (this.comboCount > 1) {
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`${this.comboCount} HIT`, this.position.x, this.position.y - 90);
        }
    }
    
    drawComboTrail(ctx) {
        // Draw combo trail behind character
        ctx.save();
        ctx.strokeStyle = this.data.visuals.trailColor || '#FF66CC';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.globalAlpha = 0.7;
        ctx.beginPath();
        ctx.moveTo(this.position.x - 30, this.position.y);
        ctx.lineTo(this.position.x + 30, this.position.y);
        ctx.stroke();
        ctx.restore();
    }
    
    drawComboPopups(ctx) {
        this.comboPopups.forEach((popup, i) => {
            ctx.save();
            ctx.translate(this.position.x, popup.y);
            ctx.scale(popup.scale, popup.scale);
            ctx.globalAlpha = popup.alpha;
            
            ctx.font = 'bold 24px Arial';
            ctx.textAlign = 'center';
            ctx.fillStyle = '#FFFFFF';
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 4;
            
            ctx.strokeText(popup.text, 0, 0);
            ctx.fillText(popup.text, 0, 0);
            
            ctx.restore();
        });
    }
    
    createHitSparks(x, y) {
        const config = this.hitSparkConfig[this.data.archetype] || {};
        return Array(config.count || 8).fill().map(() => ({
            x,
            y,
            angle: Math.random() * Math.PI * 2,
            speed: 2 + Math.random() * config.spread,
            color: config.color || '#FFFFFF',
            size: 2 + Math.random() * 3,
            lifetime: 0.5
        }));
    }
    
    rumbleController(pattern) {
        if ('gamepad' in navigator && this.gamepad) {
            const gp = navigator.getGamepads()[this.gamepad.index];
            if (gp && gp.vibrationActuator) {
                gp.vibrationActuator.playEffect('dual-rumble', {
                    duration: pattern.duration,
                    strongMagnitude: pattern.intensity,
                    weakMagnitude: pattern.intensity * 0.7
                });
            }
        }
    }
    
    attack(direction) {
        if (this.comboPotential < 20) return;
        
        // Scale damage by combo potential
        const damageMultiplier = 0.5 + (this.comboPotential / 100);
        const baseDamage = this.attacks[direction].damage * damageMultiplier;
        
        // Combo resource management
        this.comboPotential = Math.max(0, this.comboPotential - this.comboDecayRate);
        
        if (this.state !== 'idle') return;
        
        this.state = 'attack';
        this.stateTime = 0;
        
        // Set attack velocity based on direction
        switch(direction) {
            case 'up': this.velocity.y = -5; break;
            case 'down': this.velocity.y = 5; break;
            case 'left': this.velocity.x = -this.data.speed; break;
            case 'right': this.velocity.x = this.data.speed; break;
        }
        
        // Event hook
        if (this.onAttackStart) this.onAttackStart();
    }
    
    jump() {
        if (this.position.y < 300) return; // Already in air
        this.velocity.y = -this.data.jumpForce;
    }
    
    takeHit(attackType, attacker) {
        if (this.armorFrames > 0 && attackType !== 'throw') {
            this.showEffect('armor');
            return;
        }
        
        // Trigger hitstop based on attack
        const hitStopFrames = attackType === 'heavy' ? 12 : 8;
        this.gameEngine.triggerHitStop(hitStopFrames);
        
        // Visual feedback
        this.hitFlashFrames = hitStopFrames;
        this.squashScale = { x: 1.3, y: 0.7 };
        
        // Block calculations
        if (this.isBlocking && this.blockStamina > 0) {
            const blockedDamage = this.attacks[attackType].damage * 0.3;
            this.blockStamina -= this.attacks[attackType].damage * 0.7;
            this.health -= blockedDamage;
            return;
        }
        
        // Combo scaling
        const scaledDamage = this.attacks[attackType].damage * Math.pow(0.8, this.comboCount);
        this.health -= scaledDamage;
        
        // Knockback
        const dir = attacker.position.x < this.position.x ? 1 : -1;
        this.velocity.x = dir * this.attacks[attackType].knockback;
        
        // Combo tracking
        attacker.comboCount++;
        this.comboCount = 0;
    }
    
    block() {
        if (this.blockStamina > 0) {
            this.isBlocking = true;
        }
    }
    
    dodge() {
        if (this.dodgeCooldown <= 0) {
            this.isInvincible = true;
            this.dodgeCooldown = 1.5;
            setTimeout(() => this.isInvincible = false, 250); // 8 invincibility frames
        }
    }
    
    dash(direction) {
        if (this.stamina < 15) return;
        this.stamina -= 15;
        
        // Dash mechanics
        this.velocity.x = direction * this.data.speed * 2.5;
        this.isInvincible = true;
        
        // Dash cancel window
        this.dashCancelWindow = 0.15; 
        
        // Visual effect
        this.afterImages = Array(3).fill({
            x: this.position.x,
            y: this.position.y,
            opacity: 0.7
        });
    }
    
    useSpecial() {
        if (this.specialCooldown > 0) return;
        
        this.specialCooldown = this.data.special.cooldown;
        this.state = 'special';
        this.stateTime = 0;
        
        // Special move effects
        switch(this.data.special.onHitEffect) {
            case 'teleportBehind':
                this.position.x += 100 * (this.playerId === 1 ? 1 : -1);
                break;
            case 'knockdown':
                this.velocity.y = -15;
                break;
        }
        
        // Event hook
        if (this.onSpecialCast) this.onSpecialCast();
    }
    
    onAttackStart() {
        // Can be overridden for character-specific behavior
        this.comboCount = 0;
    }
    
    onComboFinish() {
        // Can be overridden
        this.comboCount++;
    }
    
    checkComboRoute(currentInputs) {
        const routes = this.comboRoutes[this.data.archetype] || [];
        
        return routes.find(route => {
            const inputMatch = route.input.split('→').every((input, i) => {
                return currentInputs[i] === input;
            });
            
            return inputMatch && 
                (!route.requiresCorner || this.isCornered) &&
                (!route.requiresGrounded || this.isGrounded);
        });
    }
    
    showEffect(type) {
        this.effects.push({
            type,
            frames: type === 'armor' ? 10 : 20,
            color: type === 'armor' ? '#FF9900' : '#FFFFFF'
        });
    }
    
    debugRender(ctx) {
        // Draw hitboxes
        ctx.strokeStyle = 'rgba(0,255,0,0.7)';
        ctx.lineWidth = 2;
        this.hitboxes.forEach(hitbox => {
            ctx.strokeRect(
                this.position.x + hitbox.x,
                this.position.y + hitbox.y,
                hitbox.width,
                hitbox.height
            );
        });
        
        // Draw hurtboxes
        ctx.strokeStyle = 'rgba(255,0,0,0.5)';
        this.hurtboxes.forEach(hurtbox => {
            ctx.strokeRect(
                this.position.x + hurtbox.x,
                this.position.y + hurtbox.y,
                hurtbox.width,
                hurtbox.height
            );
        });
        
        // Frame data text
        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
        ctx.fillText(
            `State: ${this.state} (${this.stateTime.toFixed(2)}s)`,
            this.position.x - 40,
            this.position.y - 60
        );
    }
}
