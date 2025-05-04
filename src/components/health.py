"""Health component for fighters"""
from dataclasses import dataclass

@dataclass
class HealthComponent:
    max_health: int
    current_health: int = None
    
    def __post_init__(self):
        self.current_health = self.current_health or self.max_health
        
    def take_damage(self, amount):
        self.current_health = max(0, self.current_health - amount)
        return self.current_health <= 0
        
    def heal(self, amount):
        self.current_health = min(self.max_health, self.current_health + amount)
