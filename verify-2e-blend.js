// Verification for Task 2E-BLEND - Cross-fade implementation
// Run in browser console

(function verify2EBlend() {
    console.log('=== Task 2E-BLEND Cross-fade Verification ===\n');
    
    // Check for --back and --d variables
    const tiles = document.querySelectorAll('.lab-tile');
    let tilesWithBack = 0;
    let tilesWithDepth = 0;
    const sampleValues = [];
    
    tiles.forEach((tile, i) => {
        const backValue = tile.style.getPropertyValue('--back');
        const depthValue = tile.style.getPropertyValue('--d');
        
        if (backValue) tilesWithBack++;
        if (depthValue) tilesWithDepth++;
        
        if (i < 3 && (backValue || depthValue)) {
            sampleValues.push({
                index: i,
                back: backValue || '0',
                depth: depthValue || '0'
            });
        }
    });
    
    console.log('1. Variable Assignment:');
    console.log(`   Tiles with --back: ${tilesWithBack}/${tiles.length}`);
    console.log(`   Tiles with --d: ${tilesWithDepth}/${tiles.length}`);
    console.log('   Sample values:', sampleValues);
    
    // Check front content opacity calculation
    if (tiles[0]) {
        const tile = tiles[0];
        const content = tile.querySelector('.tile-content');
        if (content) {
            const contentStyle = getComputedStyle(content);
            console.log('\n2. Front Content Cross-fade:');
            console.log('   Computed opacity:', contentStyle.opacity);
            console.log('   Computed filter:', contentStyle.filter);
        }
    }
    
    // Check ghost back pseudo-element
    const ghostTile = document.querySelector('.lab-tile[data-ghost="on"]');
    if (ghostTile) {
        const pseudoStyle = getComputedStyle(ghostTile, '::after');
        console.log('\n3. Ghost Back Cross-fade:');
        console.log('   Ghost opacity:', pseudoStyle.opacity);
        console.log('   Ghost filter:', pseudoStyle.filter);
        console.log('   Background image:', pseudoStyle.backgroundImage !== 'none' ? 'SET' : 'NOT SET');
    } else {
        console.log('\n3. Ghost Back: OFF (enable in DevPanel)');
    }
    
    // Fade window configuration
    console.log('\n4. Cross-fade Configuration:');
    console.log('   FADE_START: 80° (--back starts ramping)');
    console.log('   FADE_END: 100° (--back reaches 1.0)');
    console.log('   Desktop GHOST_MAX: 0.28');
    console.log('   Mobile GHOST_MAX: 0.22');
    
    // Test instructions
    console.log('\n=== Test Instructions ===');
    console.log('1. Enable "Ghost Back" in DevPanel (press D)');
    console.log('2. Rotate carousel slowly with scroll or arrows');
    console.log('3. Watch for smooth cross-fade around 80°-100°:');
    console.log('   - Front content fades OUT');
    console.log('   - Ghost back fades IN');
    console.log('   - No sudden pops or double-bright moments');
    console.log('4. Test with DoF ON/OFF - both should cross-fade');
    
    // Formula display
    console.log('\n=== Cross-fade Formulas ===');
    console.log('Front: opacity = (1 - d*0.45) * (1 - back)');
    console.log('Ghost: opacity = back * min(1, d) * 0.28');
    console.log('Ghost blur: blur(1px + back * 2px)');
    
    return {
        backVariables: tilesWithBack,
        depthVariables: tilesWithDepth,
        ghostEnabled: !!ghostTile,
        crossFadeReady: tilesWithBack > 0
    };
})();