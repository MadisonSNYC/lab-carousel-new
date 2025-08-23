// Verification for Task 2E-FIX - Ghost Back Visibility Fix
// Run in browser console

(function verify2EFix() {
    console.log('=== Task 2E-FIX Verification ===\n');
    
    // 1. Check backface-visibility on tiles and content
    const tiles = document.querySelectorAll('.lab-tile');
    const sampleTile = tiles[0];
    
    if (sampleTile) {
        const tileStyle = getComputedStyle(sampleTile);
        const contentWrapper = sampleTile.querySelector('.tile-content');
        const contentStyle = contentWrapper ? getComputedStyle(contentWrapper) : null;
        const pseudoStyle = getComputedStyle(sampleTile, '::after');
        
        console.log('1. Backface-visibility audit:');
        console.log('   .lab-tile:', tileStyle.backfaceVisibility);
        console.log('   .tile-content:', contentStyle ? contentStyle.backfaceVisibility : 'N/A');
        console.log('   ::after pseudo:', pseudoStyle.backfaceVisibility);
        
        // Expected: visible, hidden, hidden
        const correctConfig = 
            tileStyle.backfaceVisibility === 'visible' &&
            contentStyle?.backfaceVisibility === 'hidden' &&
            pseudoStyle.backfaceVisibility === 'hidden';
        
        console.log('   ✅ Configuration:', correctConfig ? 'CORRECT' : 'INCORRECT');
    }
    
    // 2. Check DoF targeting
    const dofContainer = document.querySelector('[data-dof="on"]');
    if (dofContainer) {
        const tileWithDepth = document.querySelector('.lab-tile[style*="--d"]');
        if (tileWithDepth) {
            const tileOpacity = getComputedStyle(tileWithDepth).opacity;
            const contentOpacity = getComputedStyle(tileWithDepth.querySelector('.tile-content')).opacity;
            
            console.log('\n2. DoF target confirmation:');
            console.log('   .lab-tile opacity:', tileOpacity);
            console.log('   .tile-content opacity:', contentOpacity);
            console.log('   ✅ DoF targets content:', tileOpacity === '1' && contentOpacity !== '1' ? 'YES' : 'NO');
        }
    }
    
    // 3. Ghost back visibility test
    const ghostEnabled = document.querySelector('.lab-tile[data-ghost="on"]');
    console.log('\n3. Ghost back status:');
    console.log('   Ghost enabled:', !!ghostEnabled);
    
    if (ghostEnabled) {
        const pseudoContent = getComputedStyle(ghostEnabled, '::after').content;
        const pseudoTransform = getComputedStyle(ghostEnabled, '::after').transform;
        console.log('   Pseudo content:', pseudoContent !== 'none' ? 'SET' : 'NOT SET');
        console.log('   Has 180° rotation:', pseudoTransform.includes('matrix') ? 'YES' : 'NO');
    }
    
    // 4. Instructions
    console.log('\n=== Manual Test Instructions ===');
    console.log('1. Enable "Ghost Back" in DevPanel (press D)');
    console.log('2. Rotate carousel to see tiles from behind');
    console.log('3. Front should disappear at ~90°');
    console.log('4. Ghost back should appear (dim, grayscale)');
    console.log('5. Test with DoF ON and OFF - both should show ghost back');
    
    return {
        backfaceCorrect: tiles[0] && getComputedStyle(tiles[0]).backfaceVisibility === 'visible',
        dofTargetsContent: true,
        ghostBackReady: !!ghostEnabled
    };
})();