"""
STICK CLASH - Rebuilt Core
"""

# Phase 1: Essentials
import pygame
from random import randint, random
import math
from enum import Enum

# Phase 2: Pygame initialization
pygame.init()
pygame.mixer.init()

# Phase 3: Game constants (safe to use everywhere below)
SCREEN_WIDTH, SCREEN_HEIGHT = 1280, 720
FPS = 60
GRAVITY = 0.5
GROUND_Y = SCREEN_HEIGHT - 50
BASE_HEALTH = 300
BASE_DAMAGE = 10

# Phase 4: Class definitions (everything below can use constants)
class CharacterClass(Enum):
    SHADOW = 1
    TANK = 2
    ARCHER = 3
    MAGE = 4
    BERSERKER = 5

class Projectile:
    def __init__(self, x, y, direction, speed, damage, owner, projectile_type="arrow"):
        self.x = x
        self.y = y
        self.direction = direction
        self.speed = speed
        self.damage = damage
        self.owner = owner
        self.lifetime = 60
        self.type = projectile_type
        self.width = 15 if projectile_type == "arrow" else 25
        self.height = 5 if projectile_type == "arrow" else 25
    
    def update(self):
        self.x += self.speed * self.direction
        self.lifetime -= 1
        return self.lifetime > 0
    
    def get_hitbox(self):
        return pygame.Rect(
            self.x - self.width//2,
            self.y - self.height//2,
            self.width,
            self.height
        )
    
    def draw(self, screen):
        if self.type == "arrow":
            pygame.draw.line(screen, (100, 100, 100), 
                            (self.x, self.y), 
                            (self.x - 15 * self.direction, self.y), 2)
            pygame.draw.polygon(screen, (200, 200, 200), [
                (self.x, self.y - 3),
                (self.x, self.y + 3),
                (self.x + 10 * self.direction, self.y)
            ])
        elif self.type == "fireball":
            pygame.draw.circle(screen, (255, 100, 0), (int(self.x), int(self.y)), 12)
            pygame.draw.circle(screen, (255, 200, 0), (int(self.x), int(self.y)), 8)

class StickFighter:
    def __init__(self, x, y, char_class):
        self.x = x
        self.y = y
        self.vel_x = 0
        self.vel_y = 0
        self.jumping = False
        self.facing_right = True
        self.health = BASE_HEALTH
        self.max_health = BASE_HEALTH
        self.stamina = 100
        self.char_class = char_class
        self.projectiles = []
        self.combo_count = 0
        self.last_hit_time = 0
        self.combo_multiplier = 1.0
        self.blocking = False
        self.attacking = False
        self.attack_frame = 0
        self.attack_pos = 0
        
    def setup_class_attributes(self):
        if self.char_class == CharacterClass.MAGE:
            self.speed = 4
            self.jump_power = 9
            self.weapon_range = 180
            self.special_ability = "fireball"
        # Other classes remain same...
    
    def basic_attack(self):
        damage = BASE_DAMAGE * self.combo_multiplier
        self.attacking = True
        self.attack_frame = 0
        self.attack_pos = self.x + (30 if self.facing_right else -30)
        return damage
        
    def draw_attack(self, screen):
        if self.attacking:
            self.attack_frame += 1
            if self.attack_frame < 10:  # Attack duration
                # Draw weapon arc
                pygame.draw.arc(screen, (255, 255, 100), 
                               (self.attack_pos-20, self.y-50, 40, 40),
                               0, math.pi/2, 3)
                # Hit spark
                if self.attack_frame == 5:
                    for _ in range(5):
                        spark_x = self.attack_pos + randint(-10,10)
                        spark_y = self.y-30 + randint(-10,10)
                        pygame.draw.line(screen, (255, 200, 100),
                                        (spark_x, spark_y),
                                        (spark_x+randint(-5,5), spark_y+randint(-5,5)), 2)
            else:
                self.attacking = False
                self.attack_frame = 0
                
    def take_damage(self, amount, direction):
        # Flash effect
        self.hit_flash = 5
        self.hit_direction = direction
        
        # Screen shake proportional to damage
        game.apply_screen_shake(min(5, amount/10))
        
        if self.blocking:
            amount *= 0.5
        self.health = max(0, self.health - amount)

    def draw(self, screen):
        # Hit flash overlay
        if hasattr(self, 'hit_flash') and self.hit_flash > 0:
            flash_surf = pygame.Surface((50,80), pygame.SRCALPHA)
            flash_surf.fill((255,255,255, min(150, self.hit_flash*30)))
            screen.blit(flash_surf, (self.x-25, self.y-60))
            
            # Directional streak
            streak_len = 10 + (5-self.hit_flash)*3
            pygame.draw.line(screen, (255,200,100,200),
                           (self.x, self.y-30),
                           (self.x + self.hit_direction*streak_len, self.y-30), 3)
            self.hit_flash -= 1
        
        # Anti-aliased limbs
        limb_thickness = 3
        colors = {
            CharacterClass.SHADOW: (150, 150, 200),
            CharacterClass.TANK: (200, 100, 100),
            CharacterClass.ARCHER: (100, 200, 150),
            CharacterClass.MAGE: (200, 100, 200),
            CharacterClass.BERSERKER: (200, 50, 50)
        }
        pygame.draw.aaline(screen, colors[self.char_class], 
                          (self.x, self.y-30), (self.x, self.y-10), limb_thickness)
        # Arms
        arm_angle = math.sin(pygame.time.get_ticks()/200)*0.3 if not self.attacking else 1.0
        pygame.draw.aaline(screen, colors[self.char_class], 
                          (self.x, self.y-25), (self.x-15*arm_angle, self.y-15), limb_thickness)
        pygame.draw.aaline(screen, colors[self.char_class], 
                          (self.x, self.y-25), (self.x+15*arm_angle, self.y-15), limb_thickness)
        # Legs
        leg_sway = math.sin(pygame.time.get_ticks()/300)*0.2
        pygame.draw.aaline(screen, colors[self.char_class], 
                          (self.x, self.y-10), (self.x-12, self.y+20+leg_sway*10), limb_thickness)
        pygame.draw.aaline(screen, colors[self.char_class], 
                          (self.x, self.y-10), (self.x+12, self.y+20-leg_sway*10), limb_thickness)
        # Glowing head
        glow_surf = pygame.Surface((24,24), pygame.SRCALPHA)
        pygame.draw.circle(glow_surf, (*colors[self.char_class], 50), (12,12), 12)
        screen.blit(glow_surf, (self.x-12, self.y-52))
        
        # Combo text
        if self.combo_count > 1:
            combo_font = pygame.font.SysFont('Arial', 24, bold=True)
            combo_text = f"{self.combo_count} HIT!"
            text_surf = combo_font.render(combo_text, True, 
                (255, 255, 0) if self.combo_count < 5 else 
                (255, 165, 0) if self.combo_count < 10 else 
                (255, 0, 0))
            screen.blit(text_surf, (self.x - text_surf.get_width()//2, self.y - 60))

    def update_combo(self):
        current_time = pygame.time.get_ticks()
        if current_time - self.last_hit_time < 2000:  # 2 second combo window
            self.combo_count += 1
            self.combo_multiplier = min(3.0, 1.0 + (self.combo_count * 0.5))
        else:
            self.combo_count = 0
            self.combo_multiplier = 1.0
        self.last_hit_time = current_time

    def update(self):
        # Movement
        self.x += self.vel_x
        self.y += self.vel_y
        
        # Attack cooldown
        if self.attack_frame > 0:
            self.draw_attack(pygame.display.get_surface())
            
        # Gravity
        if self.y < GROUND_Y:
            self.vel_y += GRAVITY
        else:
            self.y = GROUND_Y
            self.vel_y = 0
            self.jumping = False
            
        # Stamina regen
        if self.stamina < 100:
            self.stamina += 0.5

        keys = pygame.key.get_pressed()
        if keys[pygame.K_SPACE] and not self.jumping:
            self.vel_y = -self.jump_power
            self.jumping = True
        if keys[pygame.K_LEFT]:
            self.vel_x = -self.speed
            self.facing_right = False
        elif keys[pygame.K_RIGHT]:
            self.vel_x = self.speed
            self.facing_right = True
        else:
            self.vel_x = 0

        for proj in self.projectiles:
            if not proj.update():
                self.projectiles.remove(proj)

    def draw_damage(self, screen, amount, x, y):
        damage_font = pygame.font.SysFont('Arial', 20, bold=True)
        color = (
            (150, 150, 255) if amount < 15 else
            (255, 200, 100) if amount < 30 else
            (255, 100, 100))
        text = damage_font.render(f"-{int(amount)}", True, color)
        screen.blit(text, (x - text.get_width()//2, y - 40))

class MenuState(Enum):
    MAIN = 0
    CLASS_SELECT = 1
    SETTINGS = 2
    IN_GAME = 3

class Button:
    def __init__(self, x, y, text, action=None):
        self.rect = pygame.Rect(x, y, 300, 80)
        self.text = text
        self.action = action
        self.color = (70, 70, 70)
        self.hover_color = (100, 100, 100)
        self.text_color = (255, 255, 255)
        self.font = pygame.font.SysFont('Arial', 32)
        
    def draw(self, screen):
        mouse_pos = pygame.mouse.get_pos()
        color = self.hover_color if self.rect.collidepoint(mouse_pos) else self.color
        pygame.draw.rect(screen, color, self.rect, border_radius=10)
        text_surf = self.font.render(self.text, True, self.text_color)
        text_rect = text_surf.get_rect(center=self.rect.center)
        screen.blit(text_surf, text_rect)
        
    def check_click(self, pos):
        return self.rect.collidepoint(pos)

class MainMenu:
    def __init__(self):
        self.state = MenuState.MAIN
        self.buttons = [
            Button(SCREEN_WIDTH//2 - 150, 250, "Play", self.start_game),
            Button(SCREEN_WIDTH//2 - 150, 350, "Settings", self.open_settings),
            Button(SCREEN_WIDTH//2 - 150, 450, "Quit", self.quit_game)
        ]
        self.background = pygame.Surface((SCREEN_WIDTH, SCREEN_HEIGHT))
        self.setup_background()
        
    def setup_background(self):
        # Animated background
        self.background.fill((30, 30, 40))
        for i in range(50):
            x = randint(0, SCREEN_WIDTH)
            y = randint(0, SCREEN_HEIGHT)
            pygame.draw.circle(self.background, (60, 60, 80), (x, y), 2)
        
    def handle_events(self):
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                sys.exit()
            if event.type == pygame.MOUSEBUTTONDOWN:
                for button in self.buttons:
                    if button.check_click(event.pos):
                        if button.action:
                            button.action()
    
    def draw(self, screen):
        screen.fill((20, 20, 40))
        
        # Title
        title_font = pygame.font.SysFont('Arial', 64, bold=True)
        title = title_font.render("STICK CLASH", True, (255, 200, 100))
        screen.blit(title, (SCREEN_WIDTH//2 - title.get_width()//2, 100))
        
        # Class previews
        if self.state == MenuState.CLASS_SELECT:
            class_colors = {
                CharacterClass.SHADOW: (150, 150, 200),
                CharacterClass.TANK: (200, 100, 100),
                CharacterClass.ARCHER: (100, 200, 150),
                CharacterClass.MAGE: (200, 100, 200),
                CharacterClass.BERSERKER: (200, 50, 50)
            }
            
            for i, char_class in enumerate(CharacterClass):
                x = 200 + (i * 200)
                pygame.draw.rect(screen, class_colors[char_class], 
                                (x-50, 250, 100, 150), 0, 10)
                
                # Class name
                class_font = pygame.font.SysFont('Arial', 24)
                class_text = class_font.render(char_class.name, True, (255,255,255))
                screen.blit(class_text, (x - class_text.get_width()//2, 420))
                
                # Class descriptions
                descriptions = {
                    CharacterClass.SHADOW: "Quick attacks\nLow damage\nHigh mobility",
                    CharacterClass.TANK: "Slow but tough\nHigh health\nPowerful strikes",
                    CharacterClass.ARCHER: "Ranged attacks\nKeep distance\nPrecision hits",
                    CharacterClass.MAGE: "Area attacks\nSpecial effects\nComplex",
                    CharacterClass.BERSERKER: "Rage mechanic\nDamage boosts\nHigh risk"
                }
                
                desc_font = pygame.font.SysFont('Arial', 16)
                lines = descriptions[char_class].split('\\n')
                for j, line in enumerate(lines):
                    desc_text = desc_font.render(line, True, (240,240,240))
                    screen.blit(desc_text, (x - desc_text.get_width()//2, 450 + (j*20)))
                
        # Draw buttons
        for button in self.buttons:
            button.draw(screen)
        
        # Version
        version_font = pygame.font.SysFont('Arial', 16)
        version = version_font.render("v0.1 Prototype", True, (150, 150, 150))
        screen.blit(version, (20, SCREEN_HEIGHT - 30))
    
    def start_game(self):
        self.state = MenuState.IN_GAME
        
    def open_settings(self):
        self.state = MenuState.SETTINGS
        
    def quit_game(self):
        pygame.quit()
        sys.exit()

class Game:
    def __init__(self):
        # Core systems (safe - uses only Phase 1-3 items)
        self.screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
        pygame.display.set_caption("StickClash")
        self.clock = pygame.time.Clock()
        
        # Game objects (initialized later)
        self.menu = None
        self.player = None
        self.enemy = None
        
        # Effects systems (initialized last)
        self._init_game_objects()
        self._init_effects()
        
        self.running = True
    
    def _init_game_objects(self):
        """Initialize objects that need constants"""
        self.menu = MainMenu()
        
    def _init_effects(self):
        """Final initialization stage"""
        self.particles = [
            {
                'x': random.randint(0, SCREEN_WIDTH-1),
                'y': random.randint(0, SCREEN_HEIGHT-1),
                'size': random.randint(1,3),
                'speed': random.uniform(0.2,0.5)
            } for _ in range(50)
        ]
        self.screen_shake = 0
        self.shake_offset = [0, 0]
    
    def apply_screen_shake(self, intensity):
        self.screen_shake = min(10, self.screen_shake + intensity)
    
    def update_shake(self):
        if self.screen_shake > 0:
            self.shake_offset = [
                random.uniform(-1, 1) * self.screen_shake,
                random.uniform(-1, 1) * self.screen_shake
            ]
            self.screen_shake -= 0.5
        else:
            self.shake_offset = [0, 0]
    
    def draw_arena(self, screen):
        # Gradient floor
        for y in range(SCREEN_HEIGHT-50, SCREEN_HEIGHT):
            shade = 30 + (y - (SCREEN_HEIGHT-50))
            pygame.draw.line(screen, (shade, shade, shade+20), (0,y), (SCREEN_WIDTH,y))
        
        # Ambient particles
        for p in self.particles:
            pygame.draw.circle(screen, (100,100,120,150), 
                             (int(p['x']), int(p['y'])), p['size'])
            p['y'] -= p['speed']
            if p['y'] < 0:
                p['y'] = SCREEN_HEIGHT
                p['x'] = random.randint(0, SCREEN_WIDTH)
    
    def run(self):
        while self.running:
            if self.menu.state == MenuState.IN_GAME:
                if not self.player:
                    self.player = StickFighter(300, 400, CharacterClass.MAGE)
                    self.enemy = StickFighter(900, 400, CharacterClass.TANK)
                self.player.update()
                self.enemy.update()
                self.screen.fill((0, 0, 0))
                self.draw_arena(self.screen)
                self.player.draw(self.screen)
                self.enemy.draw(self.screen)
                for proj in self.player.projectiles + self.enemy.projectiles:
                    proj.draw(self.screen)
                self.update_shake()
                self.screen.blit(self.screen, (self.shake_offset[0], self.shake_offset[1]))
                pygame.display.flip()
            else:
                self.menu.handle_events()
                self.menu.draw(self.screen)
                pygame.display.flip()
            self.clock.tick(60)

if __name__ == "__main__":
    game = Game()
    game.run()
    pygame.quit()
    sys.exit()
