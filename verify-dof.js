// Verification script for Depth of Field effect
// Run this in browser console while viewing the carousel

(function verifyDoF() {
    console.log('=== Depth of Field Verification ===');
    
    // Check if container has data-dof attribute
    const container = document.querySelector('.lab-carousel-container');
    const hasDofAttr = container?.getAttribute('data-dof');
    console.log('1. Container data-dof:', hasDofAttr || 'Not set');
    
    // Check tiles for --d variable
    const tiles = document.querySelectorAll('.lab-tile');
    let tilesWithDepth = 0;
    let depthValues = [];
    
    tiles.forEach((tile, i) => {
        const dValue = tile.style.getPropertyValue('--d');
        if (dValue) {
            tilesWithDepth++;
            depthValues.push({ index: i, depth: dValue });
        }
    });
    
    console.log(`2. Tiles with depth: ${tilesWithDepth}/${tiles.length}`);
    console.log('3. Depth values:', depthValues);
    
    // Check if CSS is applying blur
    if (tiles.length > 0) {
        const sampleTile = tiles[Math.floor(tiles.length / 2)];
        const computedStyle = getComputedStyle(sampleTile);
        console.log('4. Sample tile filter:', computedStyle.filter);
        console.log('5. Sample tile opacity:', computedStyle.opacity);
    }
    
    // Check DevPanel
    const devPanel = document.querySelector('[data-dev-panel]');
    console.log('6. DevPanel present:', !!devPanel);
    
    // Instructions
    console.log('\n=== Instructions ===');
    console.log('1. Press "D" to open DevPanel');
    console.log('2. Toggle "Depth of Field" checkbox');
    console.log('3. Rotate carousel to see blur effect on back tiles');
    console.log('4. Front tiles should be sharp, back tiles blurred');
    
    return {
        dofEnabled: hasDofAttr === 'on',
        tilesWithDepth,
        totalTiles: tiles.length
    };
})();