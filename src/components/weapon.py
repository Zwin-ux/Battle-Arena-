"""Weapon component with enhanced visuals"""
import pygame
import random
from enum import Enum
from dataclasses import dataclass

class WeaponType(Enum):
    SWORD = 1
    HAMMER = 2
    SPEAR = 3
    WHIP = 4
    GUN = 5

@dataclass
class WeaponTrail:
    points: list
    color: tuple
    lifetime: int

@dataclass
class WeaponComponent:
    weapon_type: WeaponType
    damage: int = 10
    range: float = 50.0
    cooldown: int = 0
    
    def __post_init__(self):
        # Set weapon-specific properties
        if self.weapon_type == WeaponType.SWORD:
            self.damage = 15
            self.range = 80
            self.cooldown_max = 20
            self.trail_color = (100, 200, 255)
        elif self.weapon_type == WeaponType.HAMMER:
            self.damage = 30
            self.range = 60
            self.cooldown_max = 45
            self.trail_color = (255, 150, 50)
        elif self.weapon_type == WeaponType.SPEAR:
            self.damage = 20
            self.range = 100
            self.cooldown_max = 30
            self.trail_color = (150, 255, 100)
        elif self.weapon_type == WeaponType.WHIP:
            self.damage = 10
            self.range = 120
            self.cooldown_max = 15
            self.trail_color = (200, 100, 255)
        else:  # GUN
            self.damage = 25
            self.range = 200
            self.cooldown_max = 60
            self.trail_color = (255, 255, 100)
    
    def update(self):
        """Update weapon state"""
        if self.cooldown > 0:
            self.cooldown -= 1
        
        # Update trails
        for trail in self.trails[:]:
            trail.lifetime -= 1
            if trail.lifetime <= 0:
                self.trails.remove(trail)
    
    def start_attack(self):
        """Initiate weapon attack"""
        if self.cooldown <= 0:
            self.cooldown = self.cooldown_max
            self.attack_frame = 0
            return True
        return False
    
    def add_trail(self, start_pos, end_pos):
        """Add visual trail effect"""
        self.trails.append(WeaponTrail(
            points=[start_pos, end_pos],
            color=self.trail_color,
            lifetime=10
        ))
    
    def draw_trails(self, surface, camera_offset):
        """Draw weapon trails"""
        for trail in self.trails:
            if len(trail.points) >= 2:
                adjusted_points = [
                    (p[0] + camera_offset[0], p[1] + camera_offset[1])
                    for p in trail.points
                ]
                pygame.draw.line(
                    surface,
                    trail.color,
                    adjusted_points[0],
                    adjusted_points[1],
                    3
                )
