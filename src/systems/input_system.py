"""Advanced input handling system"""
import pygame
from enum import Enum
from dataclasses import dataclass

class ControlType(Enum):
    KEYBOARD = 1
    GAMEPAD = 2

@dataclass
class InputBuffer:
    move_left: bool = False
    move_right: bool = False
    jump: bool = False
    attack: bool = False
    special: bool = False
    buffer_time: int = 0  # Frames to buffer input

class InputSystem:
    def __init__(self):
        self.control_schemes = {
            "player1": {
                "left": [pygame.K_a, pygame.K_LEFT],
                "right": [pygame.K_d, pygame.K_RIGHT],
                "jump": [pygame.K_w, pygame.K_UP],
                "light_attack": [pygame.K_j, pygame.K_z],
                "heavy_attack": [pygame.K_k, pygame.K_x],
                "special": [pygame.K_l, pygame.K_c],
                "type": ControlType.KEYBOARD
            },
            "player2": {
                "left": [pygame.K_LEFT],
                "right": [pygame.K_RIGHT],
                "jump": [pygame.K_UP],
                "light_attack": [pygame.K_KP1],
                "heavy_attack": [pygame.K_KP2],
                "special": [pygame.K_KP3],
                "type": ControlType.KEYBOARD
            },
            "gamepad": {
                "left": [0],  # Axis
                "right": [0],
                "jump": [0],
                "light_attack": [1],  # Button
                "heavy_attack": [2],
                "special": [3],
                "type": ControlType.GAMEPAD
            }
        }
        
        self.buffers = {
            "player1": InputBuffer(),
            "player2": InputBuffer(),
            "gamepad": InputBuffer()
        }
        
        self.gamepads = [pygame.joystick.Joystick(i) for i in range(pygame.joystick.get_count())]
    
    def process_inputs(self):
        """Process all inputs and update buffers"""
        keys = pygame.key.get_pressed()
        
        # Process keyboard inputs
        for player in ["player1", "player2"]:
            scheme = self.control_schemes[player]
            buffer = self.buffers[player]
            
            if scheme["type"] == ControlType.KEYBOARD:
                buffer.move_left = any(keys[key] for key in scheme["left"])
                buffer.move_right = any(keys[key] for key in scheme["right"])
                buffer.jump = any(keys[key] for key in scheme["jump"])
                buffer.attack = any(keys[key] for key in scheme["light_attack"])
                buffer.special = any(keys[key] for key in scheme["special"])
                
                # Input buffering
                if buffer.move_left or buffer.move_right or buffer.jump or buffer.attack:
                    buffer.buffer_time = 5  # 5 frame buffer window
                elif buffer.buffer_time > 0:
                    buffer.buffer_time -= 1
        
        # Process gamepad inputs
        for gamepad in self.gamepads:
            # Implement axis/button checks
            pass
    
    def get_input_state(self, player_id):
        """Get processed input state for a player"""
        return self.buffers.get(player_id, InputBuffer())
