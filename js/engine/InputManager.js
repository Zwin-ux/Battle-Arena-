export class InputManager {
    constructor() {
        this.keys = {};
        this.bindings = {
            'player1': {
                'up': 'w',
                'down': 's',
                'left': 'a',
                'right': 'd',
                'jump': ' ',
                'light': 'j',
                'heavy': 'k',
                'block': 'u',
                'dodge': 'i',
                'special': 'l'
            },
            'player2': {
                'up': 'ArrowUp',
                'down': 'ArrowDown',
                'left': 'ArrowLeft',
                'right': 'ArrowRight',
                'jump': 'Enter',
                'light': 'n',
                'heavy': 'm',
                'block': ',',
                'dodge': '.',
                'special': 'o'
            }
        };
        
        // Set up event listeners
        window.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            console.log(`Key pressed: ${e.key}`);
        });
        window.addEventListener('keyup', (e) => this.keys[e.key] = false);
    }
    
    isPressed(player, action) {
        const key = this.bindings[player][action];
        return this.keys[key];
    }
    
    getDirection(player) {
        let x = 0, y = 0;
        if (this.isPressed(player, 'left')) x = -1;
        if (this.isPressed(player, 'right')) x = 1;
        if (this.isPressed(player, 'up')) y = -1;
        if (this.isPressed(player, 'down')) y = 1;
        return { x, y };
    }
}
