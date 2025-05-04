"""Enhanced visual feedback system"""
import pygame
import math
from dataclasses import dataclass
import random

@dataclass
class ScreenEffect:
    shake_intensity: float
    flash_color: tuple
    duration: int

class RenderSystem:
    def __init__(self):
        self.effects = []
        self.camera_offset = [0, 0]
        self.screen_shake = 0
        self.debug_font = pygame.font.SysFont('Arial', 16)
    
    def add_effect(self, effect_type, intensity=1.0, duration=30, color=(255,255,255)):
        """Add visual effect"""
        if effect_type == "shake":
            self.screen_shake = max(self.screen_shake, intensity * 10)
        elif effect_type == "flash":
            self.effects.append(ScreenEffect(0, color, duration))
    
    def update(self):
        """Update effects"""
        # Update screen shake
        if self.screen_shake > 0:
            self.camera_offset = [
                random.uniform(-self.screen_shake, self.screen_shake),
                random.uniform(-self.screen_shake, self.screen_shake)
            ]
            self.screen_shake *= 0.9
            if self.screen_shake < 0.1:
                self.screen_shake = 0
                self.camera_offset = [0, 0]
        
        # Update other effects
        for effect in self.effects[:]:
            effect.duration -= 1
            if effect.duration <= 0:
                self.effects.remove(effect)
    
    def apply_flash(self, surface):
        """Apply screen flash effects"""
        for effect in self.effects:
            if effect.flash_color:
                flash_surf = pygame.Surface(surface.get_size())
                flash_surf.fill(effect.flash_color)
                flash_surf.set_alpha(150 * (effect.duration / effect.duration))
                surface.blit(flash_surf, (0, 0))

    def draw_fighter(self, screen, fighter):
        # Draw fighter body
        color = (0, 100, 255) if fighter.is_player else (255, 50, 50)
        pygame.draw.rect(screen, color, (fighter.x - 15, fighter.y - 30, 30, 60))
        
        # Draw health bar
        health_pct = fighter.health.current_health / fighter.health.max_health
        bar_width = 40 * health_pct
        pygame.draw.rect(screen, (255, 0, 0), (fighter.x - 20, fighter.y - 50, 40, 5))
        pygame.draw.rect(screen, (0, 255, 0), (fighter.x - 20, fighter.y - 50, bar_width, 5))
