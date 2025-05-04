"""Advanced combat system"""
import pygame
import random
import math
from enum import Enum, auto
from dataclasses import dataclass

class WeaponType(Enum):
    SWORD = 1
    HAMMER = 2
    SPEAR = 3

@dataclass
class HitSpark:
    x: float
    y: float
    size: int
    color: tuple
    lifetime: int
    velocity: tuple

class AttackResult(Enum):
    NORMAL = auto()
    COUNTER = auto()
    WHIFF = auto()
    COMBO = auto()

@dataclass
class CombatState:
    last_hit_time: int = 0
    combo_count: int = 0
    combo_timer: int = 0
    last_move: str = ""
    in_attack_animation: bool = False

class CombatSystem:
    def __init__(self):
        self.hit_sparks = []
        self.screen_shake = 0
        self.weapon_profiles = {
            WeaponType.SWORD: {
                'damage': 15,
                'knockback': 5,
                'cooldown': 20,
                'spark_color': (200, 220, 255),
                'hit_stop': 3
            },
            WeaponType.HAMMER: {
                'damage': 25,
                'knockback': 12,
                'cooldown': 40,
                'spark_color': (255, 200, 100),
                'hit_stop': 8
            },
            WeaponType.SPEAR: {
                'damage': 20,
                'knockback': 8,
                'cooldown': 30,
                'spark_color': (150, 255, 150),
                'hit_stop': 5
            }
        }
        self.combo_windows = {
            "light": 30,  # Frames to continue combo
            "heavy": 45,
            "special": 60
        }
        self.counter_window = 8  # Frames for counter attacks
        self.states = {}  # fighter_id: CombatState
    
    def process_attack(self, attacker, defender):
        """Handle weapon collision and effects"""
        if not self._check_hit(attacker, defender):
            self._handle_whiff(attacker)
            return AttackResult.WHIFF
            
        # Check counter attack
        current_frame = pygame.time.get_ticks()
        if (current_frame - self.states[defender.id].last_hit_time < self.counter_window
            and not defender.state.is_stunned):
            return self._handle_counter(attacker, defender)
            
        # Check combo
        if (self.states[attacker.id].combo_timer > 0 
            and self.states[attacker.id].last_move != attacker.weapon.current_attack_type):
            return self._handle_combo(attacker, defender)
            
        # Normal hit
        return self._handle_normal_hit(attacker, defender)
    
    def _handle_normal_hit(self, attacker, defender):
        """Handle normal hit logic"""
        weapon = self.weapon_profiles[attacker.weapon.type]
        
        # Apply damage
        defender.health.take_damage(weapon['damage'])
        
        # Create hit sparks
        for _ in range(random.randint(5, 10)):
            self.hit_sparks.append(HitSpark(
                x=defender.x,
                y=defender.y,
                size=random.randint(3, weapon['hit_stop']),
                color=weapon['spark_color'],
                lifetime=random.randint(10, 20),
                velocity=(
                    random.uniform(-2, 2),
                    random.uniform(-3, 0)
                )
            ))
        
        # Apply knockback
        direction = 1 if attacker.x < defender.x else -1
        defender.velocity_x = weapon['knockback'] * direction
        
        # Screen shake
        self.screen_shake = weapon['hit_stop']
        
        self.states[attacker.id].combo_timer = self.combo_windows[attacker.weapon.current_attack_type]
        self.states[attacker.id].last_move = attacker.weapon.current_attack_type
        return AttackResult.NORMAL
    
    def _handle_counter(self, attacker, defender):
        """Handle counter attack logic"""
        # Reverse knockback
        defender.health.take_damage(attacker.weapon.damage * 1.5)
        attacker.health.take_damage(attacker.weapon.damage * 0.5)
        
        # Dramatic screen shake
        self.screen_shake = 15
        
        # Special counter sparks
        for _ in range(15):
            self._create_spark(defender.x, defender.y, (255, 255, 0), 8, 25)
        
        return AttackResult.COUNTER
    
    def _handle_combo(self, attacker, defender):
        """Handle combo logic"""
        # Bonus damage for combos
        combo_multiplier = 1 + (self.states[attacker.id].combo_count * 0.2)
        defender.health.take_damage(attacker.weapon.damage * combo_multiplier)
        
        # Combo visual feedback
        for _ in range(5 + self.states[attacker.id].combo_count):
            self._create_spark(defender.x, defender.y, (0, 255, 255), 5, 20)
        
        self.states[attacker.id].combo_count += 1
        self.states[attacker.id].combo_timer = self.combo_windows[attacker.weapon.current_attack_type]
        return AttackResult.COMBO
    
    def _handle_whiff(self, attacker):
        """Handle whiff logic"""
        # Penalize missed attacks
        attacker.state.stamina -= 10
        attacker.state.recovery_frames = 10
        
    def _check_hit(self, attacker, defender):
        """Check if attack hitbox collides with defender"""
        if not attacker.attack_hitbox:
            return False
        return attacker.attack_hitbox.colliderect(defender.hitbox)
    
    def _create_spark(self, x, y, color, size, lifetime):
        angle = random.uniform(0, 6.28)
        speed = random.uniform(2, 5)
        self.hit_sparks.append(HitSpark(
            x=x,
            y=y,
            size=size,
            color=color,
            lifetime=lifetime,
            velocity=(math.cos(angle) * speed, math.sin(angle) * speed)
        ))
    
    def update(self):
        """Update combat effects"""
        # Update hit sparks
        for spark in self.hit_sparks[:]:
            spark.lifetime -= 1
            if spark.lifetime <= 0:
                self.hit_sparks.remove(spark)
            else:
                spark.x += spark.velocity[0]
                spark.y += spark.velocity[1]
        
        # Update screen shake
        if self.screen_shake > 0:
            self.screen_shake -= 1
    
    def draw_effects(self, surface, camera_offset):
        """Draw combat visual effects"""
        for spark in self.hit_sparks:
            pygame.draw.circle(
                surface,
                spark.color,
                (int(spark.x + camera_offset[0]), int(spark.y + camera_offset[1])),
                spark.size
            )
