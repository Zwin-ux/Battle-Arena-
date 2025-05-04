# StickClash

A browser-based fighting game with real-time data synchronization, authentication, and advanced fighter management.

## Project Structure

```
StickClash/
├── assets/           # Game assets
│   └── sounds/       # Sound effects
├── backend/          # Node.js backend
│   ├── server.js     # Express API server
│   ├── migrations.js # Database migrations
│   └── package.json  # Backend dependencies
├── components/       # React/Three.js components
├── data/            # Game data and loaders
│   └── FighterLoader.js # Fighter data management
├── db.json          # Local database (for development)
├── src/             # Main source code
│   ├── game/        # Game modules
│   └── main.py      # Entry point
├── requirements.txt  # Python dependencies
└── README.md        # This file
```

## Getting Started

### Prerequisites

- Node.js 16+ (for backend)
- Python 3.8+ (for game logic)
- npm (comes with Node.js)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/stickclash.git
cd stickclash
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install game dependencies:
```bash
pip install -r requirements.txt
```

### Running the Game

1. Start the mock backend (for development):
```bash
cd backend
npm run mock
```

2. Start the game server:
```bash
python main.py
```

3. Open your browser and navigate to `http://localhost:3000`

### Development Setup

1. For local development with hot reload:
```bash
# In one terminal
npm run mock  # Start mock backend

# In another terminal
python main.py --dev  # Start game in dev mode
```

2. For real backend with authentication:
```bash
cd backend
npm start  # Start real backend server
```

### Features

- Real-time fighter data synchronization
- Authentication system
- Advanced data migration
- Hot reloading for development
- Localization support
- Undo/redo functionality
- Template-based fighter creation
- Comprehensive data validation

### Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### License

This project is licensed under the MIT License - see the LICENSE file for details

## Next Steps

1. Add actual sound files to assets/sounds/
2. Implement Berserker class
3. Add more special effects
4. Create tutorial level
5. Add more fighter types and abilities
6. Implement multiplayer features

## API Documentation

The backend API is available at `/api/fighters` and supports:

- GET `/api/fighters` - Get all fighters
- GET `/api/fighters/:id` - Get a specific fighter
- POST `/api/fighters` - Create a new fighter (requires auth)
- PUT `/api/fighters/:id` - Update a fighter (requires auth)
- DELETE `/api/fighters/:id` - Delete a fighter (requires auth)
- POST `/api/login` - Get authentication token

For more details, see the backend documentation in `backend/` directory.
