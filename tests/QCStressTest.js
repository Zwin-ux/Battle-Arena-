const QCValidator = require('../js/engine/QCValidator.js');
const fightersData = require('../data/fighters.json');

// Convert to array of fighters
const fighters = Object.values(fightersData);

function runFullQCSuite() {
    const results = {
        fighters: [],
        matchups: []
    };
    
    // Validate each fighter
    fighters.forEach(fighter => {
        results.fighters.push(QCValidator.validateFighter(fighter));
    });
    
    // Test matchups
    for (let i = 0; i < fighters.length; i++) {
        for (let j = i + 1; j < fighters.length; j++) {
            results.matchups.push(
                QCValidator.runMatchSimulation(fighters[i], fighters[j])
            );
        }
    }
    
    return results;
}

// Quick console report
const report = runFullQCSuite();
console.log('=== QC Validation Report ===');
console.log('Fighter Issues:', report.fighters.filter(f => f.errors.length > 0));
console.log('Unbalanced Matchups:', 
    report.matchups.filter(m => !m.balanced));
