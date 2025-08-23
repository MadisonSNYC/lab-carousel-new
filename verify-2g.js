// Verification for Task 2G - Subtle inward tilt + scale bias
// Run in browser console

(function verify2G() {
    console.log('=== Task 2G Verification: Tilt + Scale Bias ===\n');
    
    // Check for new CSS variables
    const tiles = document.querySelectorAll('.lab-tile');
    let tilesWithTilt = 0;
    let tilesWithScale = 0;
    let tilesWithPop = 0;
    const sampleValues = [];
    
    tiles.forEach((tile, i) => {
        const tiltValue = tile.style.getPropertyValue('--tilt');
        const scaleValue = tile.style.getPropertyValue('--scale');
        const popValue = tile.style.getPropertyValue('--pop');
        
        if (tiltValue) tilesWithTilt++;
        if (scaleValue) tilesWithScale++;
        if (popValue) tilesWithPop++;
        
        if (i < 3 && (tiltValue || scaleValue || popValue)) {
            sampleValues.push({
                index: i,
                tilt: tiltValue || '0',
                scale: scaleValue || '1',
                pop: popValue || '0px'
            });
        }
    });
    
    console.log('1. CSS Variables Assignment:');
    console.log(`   Tiles with --tilt: ${tilesWithTilt}/${tiles.length}`);
    console.log(`   Tiles with --scale: ${tilesWithScale}/${tiles.length}`);
    console.log(`   Tiles with --pop: ${tilesWithPop}/${tiles.length}`);
    console.log('   Sample values:', sampleValues);
    
    // Check content transform application
    if (tiles[0]) {
        const content = tiles[0].querySelector('.tile-content');
        if (content) {
            const computedTransform = getComputedStyle(content).transform;
            const transformOrigin = getComputedStyle(content).transformOrigin;
            
            console.log('\n2. Content Transform Application:');
            console.log('   Transform origin:', transformOrigin);
            console.log('   Computed transform:', computedTransform !== 'none' ? 'APPLIED' : 'NOT APPLIED');
            console.log('   Transform details:', computedTransform.substring(0, 80) + '...');
        }
    }
    
    // Configuration values
    console.log('\n3. Configuration Values:');
    console.log('   TILT_MAX: 6° (negative = inward lean)');
    console.log('   FRONT_BOOST: 0.03 (+3% for front tiles)');
    console.log('   SIDE_SHRINK: 0.08 (-8% for side tiles)');
    console.log('   POP_Z: 12px (front tiles pop forward)');
    
    // Formula explanations
    console.log('\n4. Transform Formulas:');
    console.log('   tilt = -6 * depth (inward lean increases with angle)');
    console.log('   scale = 1 + 0.03*(1-depth) - 0.08*depth');
    console.log('   pop = 12 * (1-depth) (front pops, sides flat)');
    console.log('   Transform order: translateZ() rotateX() scale()');
    
    // Check interop
    const dofEnabled = document.querySelector('[data-dof="on"]');
    const ghostEnabled = document.querySelector('.lab-tile[data-ghost="on"]');
    
    console.log('\n5. Effect Interop:');
    console.log('   Depth of Field:', dofEnabled ? 'ON' : 'OFF');
    console.log('   Ghost Back:', ghostEnabled ? 'ON' : 'OFF');
    console.log('   Target: .tile-content (not wrapper)');
    console.log('   Ghost back unaffected (uses ::after pseudo)');
    
    // Test instructions
    console.log('\n=== Visual Test Instructions ===');
    console.log('1. Enable "Depth of Field" to see tilt/scale effects');
    console.log('2. Rotate carousel slowly to observe:');
    console.log('   - Front tiles: larger (~103%), slight forward pop');
    console.log('   - Side tiles: smaller (~92%), inward tilt (~6°)');
    console.log('   - Smooth transitions during rotation');
    console.log('3. Try with curved panels - should show no seams');
    console.log('4. Ghost back should work normally with these effects');
    
    // Expected ranges
    console.log('\n=== Expected Value Ranges ===');
    console.log('Front tile (depth=0): tilt=0°, scale=1.03, pop=12px');
    console.log('Side tile (depth=1): tilt=-6°, scale=0.92, pop=0px');
    console.log('Mid tile (depth=0.5): tilt=-3°, scale=0.975, pop=6px');
    
    return {
        tiltVariables: tilesWithTilt,
        scaleVariables: tilesWithScale,
        popVariables: tilesWithPop,
        transformApplied: tiles[0] && getComputedStyle(tiles[0].querySelector('.tile-content')).transform !== 'none'
    };
})();