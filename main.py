import pygame
import sys
import math
from enum import Enum
import random

# Game Constants
SCREEN_WIDTH, SCREEN_HEIGHT = 1280, 720
FPS = 60
GRAVITY = 0.5

# Character Classes
class CharacterClass(Enum):
    SHADOW = 1
    TANK = 2
    ARCHER = 3
    MAGE = 4
    BERSERKER = 5

class Projectile:
    def __init__(self, x, y, direction, speed, damage, owner):
        self.x = x
        self.y = y
        self.direction = direction
        self.speed = speed
        self.damage = damage
        self.owner = owner
        self.lifetime = 60  # frames until disappearance
    
    def update(self):
        self.x += self.speed * self.direction
        self.lifetime -= 1
        return self.lifetime > 0
    
    def draw(self, screen):
        pygame.draw.line(screen, (100, 100, 100), 
                         (self.x, self.y), 
                         (self.x - 15 * self.direction, self.y), 2)
        pygame.draw.polygon(screen, (200, 200, 200), [
            (self.x, self.y - 3),
            (self.x, self.y + 3),
            (self.x + 10 * self.direction, self.y)
        ])

class StickFighter:
    def __init__(self, x, y, char_class):
        self.x = x
        self.y = y
        self.vel_x = 0
        self.vel_y = 0
        self.jumping = False
        self.facing_right = True
        self.health = 100
        self.stamina = 100
        self.char_class = char_class
        self.projectiles = []
        self.setup_class_attributes()
        
    def setup_class_attributes(self):
        """Configure class-specific stats and abilities"""
        if self.char_class == CharacterClass.SHADOW:
            self.speed = 7
            self.jump_power = 12
            self.attack_cooldown = 15
            self.weapon_range = 120
            self.special_ability = "teleport"
        elif self.char_class == CharacterClass.TANK:
            self.speed = 3
            self.jump_power = 8
            self.attack_cooldown = 30
            self.weapon_range = 80
            self.special_ability = "shield_bash"
        elif self.char_class == CharacterClass.ARCHER:
            self.speed = 5
            self.jump_power = 10
            self.attack_cooldown = 20
            self.weapon_range = 200  # bow range
            self.special_ability = "rapid_fire"
            self.arrow_count = 3  # for rapid fire
    
    def basic_attack(self):
        """Returns hitbox rect for collision detection"""
        direction = 1 if self.facing_right else -1
        
        # Archer shoots projectile
        if self.char_class == CharacterClass.ARCHER:
            self.projectiles.append(Projectile(
                self.x + (30 if self.facing_right else -30),
                self.y - 20,
                direction,
                10,
                15,
                self
            ))
            return None
            
        return pygame.Rect(
            self.x + (30 if self.facing_right else -self.weapon_range),
            self.y - 20,
            self.weapon_range,
            40
        )
    
    def special_attack(self):
        if self.stamina < 20: return
        self.stamina -= 20
        
        if self.special_ability == "teleport":
            self.x += 150 * (1 if self.facing_right else -1)
        elif self.special_ability == "shield_bash":
            self.vel_x = 10 * (1 if self.facing_right else -1)
            return pygame.Rect(
                self.x + (50 if self.facing_right else -80),
                self.y - 30,
                80,
                80
            )
        elif self.special_ability == "rapid_fire" and self.char_class == CharacterClass.ARCHER:
            direction = 1 if self.facing_right else -1
            for i in range(self.arrow_count):
                self.projectiles.append(Projectile(
                    self.x + (30 if self.facing_right else -30),
                    self.y - 20 - i*10,
                    direction,
                    12,
                    10,
                    self
                ))
    
    def update(self):
        # Update projectiles
        self.projectiles = [p for p in self.projectiles if p.update()]
        
        # Apply gravity
        self.vel_y += GRAVITY
        
        # Update position
        self.x += self.vel_x
        self.y += self.vel_y
        
        # Simple ground collision
        if self.y > SCREEN_HEIGHT - 100:
            self.y = SCREEN_HEIGHT - 100
            self.jumping = False
            self.vel_y = 0
        
        # Regen stamina
        if self.stamina < 100:
            self.stamina += 0.2

class Game:
    def __init__(self):
        pygame.init()
        self.screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
        pygame.display.set_caption("StickClash")
        self.clock = pygame.time.Clock()
        self.running = True
        
        # Create fighters
        self.player = StickFighter(300, 400, CharacterClass.ARCHER)
        self.enemy = StickFighter(900, 400, CharacterClass.TANK)
    
    def handle_events(self):
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                self.running = False
            
            if event.type == pygame.KEYDOWN:
                if event.key == pygame.K_SPACE:
                    self.player.jump()
                elif event.key == pygame.K_f:
                    self.player.special_attack()
        
        keys = pygame.key.get_pressed()
        if keys[pygame.K_a]:
            self.player.move(-1)
        elif keys[pygame.K_d]:
            self.player.move(1)
        else:
            self.player.move(0)
    
    def draw(self):
        self.screen.fill((240, 240, 245))  # Light gray background
        
        # Draw platform
        pygame.draw.rect(self.screen, (50, 50, 50), (0, SCREEN_HEIGHT - 100, SCREEN_WIDTH, 100))
        
        # Draw projectiles
        for projectile in self.player.projectiles + self.enemy.projectiles:
            projectile.draw(self.screen)
        
        # Draw fighters
        self.draw_fighter(self.player)
        self.draw_fighter(self.enemy)
        
        # Draw HUD
        self.draw_health_bar(self.player, 50, 50)
        self.draw_health_bar(self.enemy, SCREEN_WIDTH - 250, 50)
        
        pygame.display.flip()
    
    def draw_fighter(self, fighter):
        """Simple stick figure drawing"""
        color = (0, 120, 255) if fighter == self.player else (255, 80, 80)
        
        # Head
        pygame.draw.circle(self.screen, color, (int(fighter.x), int(fighter.y - 40)), 15)
        
        # Body
        pygame.draw.line(self.screen, color, (fighter.x, fighter.y - 25), (fighter.x, fighter.y), 3)
        
        # Arms
        arm_angle = 45 if fighter.facing_right else 135
        arm_end_x = fighter.x + 25 * math.cos(math.radians(arm_angle))
        arm_end_y = fighter.y - 15 + 25 * math.sin(math.radians(arm_angle))
        pygame.draw.line(self.screen, color, (fighter.x, fighter.y - 15), (arm_end_x, arm_end_y), 3)
        
        # Bow for archer
        if fighter.char_class == CharacterClass.ARCHER:
            bow_angle = 20 if fighter.facing_right else 160
            bow_end_x = fighter.x + 30 * math.cos(math.radians(bow_angle))
            bow_end_y = fighter.y - 15 + 30 * math.sin(math.radians(bow_angle))
            pygame.draw.arc(self.screen, (139, 69, 19), 
                            (fighter.x - 30, fighter.y - 45, 60, 60),
                            math.radians(160 if fighter.facing_right else 20),
                            math.radians(200 if fighter.facing_right else 340), 3)
        
        # Legs
        pygame.draw.line(self.screen, color, (fighter.x, fighter.y), (fighter.x - 15, fighter.y + 30), 3)
        pygame.draw.line(self.screen, color, (fighter.x, fighter.y), (fighter.x + 15, fighter.y + 30), 3)
    
    def draw_health_bar(self, fighter, x, y):
        pygame.draw.rect(self.screen, (200, 200, 200), (x, y, 200, 20))
        pygame.draw.rect(self.screen, (0, 200, 0), (x, y, fighter.health * 2, 20))
        
        # Class name
        font = pygame.font.SysFont(None, 24)
        text = font.render(fighter.char_class.name, True, (0, 0, 0))
        self.screen.blit(text, (x, y - 25))
    
    def run(self):
        while self.running:
            self.handle_events()
            
            # Update game state
            self.player.update()
            self.enemy.update()
            
            # Simple AI for enemy
            if random.random() < 0.02:
                self.enemy.move(-1 if self.enemy.x > self.player.x else 1)
            if random.random() < 0.01:
                self.enemy.jump()
            
            self.draw()
            self.clock.tick(FPS)

if __name__ == "__main__":
    game = Game()
    game.run()
    pygame.quit()
    sys.exit()
