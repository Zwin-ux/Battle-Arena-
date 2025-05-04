"""Minimal test for StickClash"""
import pygame

# Initialize pygame
pygame.init()
screen = pygame.display.set_mode((800, 600))
pygame.display.set_caption("StickClash Test")

# Main game loop
running = True
while running:
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False
    
    # Clear screen
    screen.fill((0, 0, 0))
    
    # Draw test rectangle
    pygame.draw.rect(screen, (255, 0, 0), (400, 300, 50, 50))
    
    # Update display
    pygame.display.flip()

pygame.quit()
