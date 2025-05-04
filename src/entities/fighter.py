"""Fighter entity with physics"""
import pygame
import math
import random
from dataclasses import dataclass

# Local imports
from ..components.health import HealthComponent
from ..components.weapon import WeaponComponent

@dataclass
class FighterState:
    grounded: bool = False
    attacking: bool = False
    fast_falling: bool = False

class Fighter:
    def __init__(self, x, y, is_player=False):
        self.x = x
        self.y = y
        self.vel_x = 0
        self.vel_y = 0
        self.is_player = is_player
        
        # Initialize components
        self.health = HealthComponent(max_health=100)
        self.weapon = WeaponComponent(
            weapon_type=WeaponComponent.WeaponType.SWORD if is_player 
                      else WeaponComponent.WeaponType.HAMMER
        )
        
        # Initialize state
        self.state = FighterState()
        
        # Physics properties
        self.physics = {
            "gravity": 0.5,
            "acceleration": 0.2,
            "max_speed": 5
        }
    
    def update(self):
        # Apply gravity
        if not self.state.grounded:
            self.vel_y += self.physics["gravity"]
        
        # Update position
        self.x += self.vel_x
        self.y += self.vel_y
