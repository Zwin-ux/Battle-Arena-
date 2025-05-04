// Minimal canvas test
try {
    console.log('Running minimal test...');
    
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) throw new Error('Canvas element not found!');
    
    console.log('Canvas found:', canvas);
    
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get 2D context!');
    
    ctx.fillStyle = 'red';
    ctx.fillRect(50, 50, 100, 100);
    console.log('Successfully drew test square');
} catch (error) {
    console.error('Test failed:', error);
}
