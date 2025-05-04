"""
Minimal Pygame Test
"""
import pygame
from random import randint

# Initialize
pygame.init()
screen = pygame.display.set_mode((800, 600))
pygame.display.set_caption("Working Test")

# Simple object
player = pygame.Rect(100, 100, 50, 50)

# Test random (shouldn't error)
test_x = randint(0, 800)
test_y = randint(0, 600)

# Main loop
running = True
while running:
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False
    
    screen.fill((0,0,0))
    pygame.draw.rect(screen, (255,0,0), player)
    pygame.display.flip()

pygame.quit()
