"""StickClash 2.0 Main"""
import pygame
import sys
import os

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import systems
from systems.input_system import InputSystem
from systems.combat_system import CombatSystem
from systems.render_system import RenderSystem
from entities.fighter import Fighter

class Game:
    def __init__(self):
        # Initialize pygame
        pygame.init()
        self.screen = pygame.display.set_mode((1280, 720))
        pygame.display.set_caption("StickClash 2.0")
        self.clock = pygame.time.Clock()
        self.running = True
        
        try:
            # Initialize systems
            self.input = InputSystem()
            self.combat = CombatSystem()
            self.render = RenderSystem()
            
            # Create fighters
            self.player1 = Fighter(300, 360, is_player=True)
            self.player2 = Fighter(900, 360, is_player=False)
            
            print("All systems initialized successfully")
        except Exception as e:
            print(f"Initialization failed: {e}")
            self.running = False
    
    def handle_events(self):
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                self.running = False
    
    def update(self):
        if not self.running:
            return
            
        # Process inputs
        inputs = self.input.process_inputs()
        
        # Update combat
        self.combat.update(self.player1, self.player2)
        
        # Update entities
        self.player1.update()
        self.player2.update()
    
    def render(self):
        if not self.running:
            return
            
        self.screen.fill((0, 0, 0))
        
        # Render entities
        self.render.draw_fighter(self.screen, self.player1)
        self.render.draw_fighter(self.screen, self.player2)
        
        pygame.display.flip()
    
    def run(self):
        while self.running:
            self.handle_events()
            self.update()
            self.render()
            self.clock.tick(60)

if __name__ == "__main__":
    game = Game()
    game.run()
    pygame.quit()
    sys.exit()
