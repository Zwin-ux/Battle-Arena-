"""Test script with proper imports"""
import sys
import os

# Add src to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), 'src')))

from src.main import Game

if __name__ == "__main__":
    try:
        game = Game()
        print("All systems imported successfully!")
    except Exception as e:
        print(f"Import failed: {str(e)}")
