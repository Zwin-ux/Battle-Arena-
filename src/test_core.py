"""
StickClash Core Test
"""
import pygame
import random

# Initialize pygame
pygame.init()
screen = pygame.display.set_mode((1280, 720))
pygame.display.set_caption("Core Test")
clock = pygame.time.Clock()

# Test particles
particles = [
    {
        'x': random.randint(0, 1279),
        'y': random.randint(0, 719),
        'size': random.randint(1,3),
        'speed': random.uniform(0.2,0.5)
    } for _ in range(50)
]

# Main loop
running = True
while running:
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False
    
    screen.fill((0,0,0))
    
    # Draw particles
    for p in particles:
        pygame.draw.circle(screen, (255,255,255), (p['x'], p['y']), p['size'])
    
    pygame.display.flip()
    clock.tick(60)

pygame.quit()
