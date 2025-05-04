class QCValidator {
    static validateFighter(fighter) {
        const errors = [];
        const warnings = [];
        
        // 1. Basic Stats Validation
        if (fighter.speed > 15) {
            errors.push(`HIGH: Speed (${fighter.speed}) exceeds max threshold`);
        }
        
        // 2. Special Move Check
        if (!fighter.special || !fighter.special.cooldown) {
            errors.push(`CRITICAL: Missing special move configuration`);
        }
        
        // 3. Visual Feedback Check
        if (!fighter.visuals || !fighter.visuals.trailColor) {
            warnings.push(`MEDIUM: Missing visual trail color`);
        }
        
        return { errors, warnings, fighter: fighter.name };
    }
    
    static runMatchSimulation(fighterA, fighterB, iterations=50) {
        // Simple simulation based on speed and special cooldown
        const aScore = fighterA.speed * (1/fighterA.special.cooldown);
        const bScore = fighterB.speed * (1/fighterB.special.cooldown);
        const winRate = (aScore / (aScore + bScore)) * 100;
        
        return {
            matchup: `${fighterA.name} vs ${fighterB.name}`,
            winRate: winRate.toFixed(1),
            balanced: winRate >= 40 && winRate <= 60
        };
    }
}

module.exports = QCValidator;
