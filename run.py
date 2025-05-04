"""Launch script for StickClash"""
import sys
import os

# Add project root to path
sys.path.insert(0, os.path.abspath('.'))

from src.main import Game

if __name__ == "__main__":
    game = Game()
    game.run()
