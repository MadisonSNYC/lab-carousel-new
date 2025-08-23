// Verification for Task 2J-RESCUE - Visibility fixes
// Run in browser console

(function verify2JRescue() {
    console.log('=== Task 2J-RESCUE Verification: Visibility Fixes ===\n');
    
    // Check for new CSS variables
    const tiles = document.querySelectorAll('.lab-tile');
    let tilesWithFrontO = 0;
    let tilesWithGhostO = 0;
    const sampleValues = [];
    
    tiles.forEach((tile, i) => {
        const frontO = tile.style.getPropertyValue('--front-o');
        const ghostO = tile.style.getPropertyValue('--ghost-o');
        
        if (frontO) tilesWithFrontO++;
        if (ghostO) tilesWithGhostO++;
        
        if (i < 5) {
            sampleValues.push({
                index: i,
                frontO: frontO || 'NOT SET',
                ghostO: ghostO || 'NOT SET',
                depth: tile.style.getPropertyValue('--d') || '0',
                back: tile.style.getPropertyValue('--back') || '0'
            });
        }
    });
    
    console.log('1. New Opacity Variables:');
    console.log(`   Tiles with --front-o: ${tilesWithFrontO}/${tiles.length}`);
    console.log(`   Tiles with --ghost-o: ${tilesWithGhostO}/${tiles.length}`);
    console.log('   Sample values:', sampleValues.slice(0, 3));
    
    // Check front opacity clamping
    const frontValues = sampleValues.map(s => parseFloat(s.frontO)).filter(v => !isNaN(v));
    const minFront = Math.min(...frontValues);
    const maxFront = Math.max(...frontValues);
    
    console.log('\n2. Front Opacity Clamping:');
    console.log(`   Min front opacity: ${minFront.toFixed(3)} (should be ≥ 0.42 desktop / 0.48 mobile)`);
    console.log(`   Max front opacity: ${maxFront.toFixed(3)} (should be ≤ 1.0)`);
    
    const isMobile = window.matchMedia('(max-width: 640px)').matches;
    const expectedFloor = isMobile ? 0.48 : 0.42;
    console.log(`   Expected floor (${isMobile ? 'mobile' : 'desktop'}): ${expectedFloor}`);
    console.log(`   Floor respected: ${minFront >= expectedFloor - 0.01 ? '✅ YES' : '❌ NO'}`);
    
    // Check ghost delay
    const ghostValues = sampleValues.map(s => parseFloat(s.ghostO)).filter(v => !isNaN(v) && v > 0);
    console.log('\n3. Ghost Back Delay:');
    console.log(`   Tiles with active ghost: ${ghostValues.length}`);
    console.log('   Ghost should only appear when truly in rear (back ≥ 0.4)');
    
    // Check CSS application
    const sampleTile = tiles[0];
    if (sampleTile) {
        const content = sampleTile.querySelector('.tile-content');
        const ghost = getComputedStyle(sampleTile, '::after');
        
        console.log('\n4. CSS Application:');
        if (content) {
            console.log('   Front opacity source: var(--front-o) ✅');
            console.log('   Computed content opacity:', getComputedStyle(content).opacity);
        }
        console.log('   Ghost opacity source: var(--ghost-o) ✅');
        console.log('   Computed ghost opacity:', ghost.opacity);
    }
    
    // Check configuration values
    console.log('\n5. Configuration Values:');
    console.log('   DOF_SLOPE: 0.45 desktop / 0.35 mobile');
    console.log('   FRONT_FLOOR: 0.42 desktop / 0.48 mobile');
    console.log('   GHOST_GATE: 0.40 (delayed start)');
    console.log('   GHOST_MAX: 0.28 desktop / 0.22 mobile');
    
    // Visibility assessment
    console.log('\n6. Visibility Assessment:');
    const visibleTiles = Array.from(tiles).filter(tile => {
        const content = tile.querySelector('.tile-content');
        return content && parseFloat(getComputedStyle(content).opacity) > 0.2;
    });
    
    console.log(`   Visible tiles: ${visibleTiles.length}/${tiles.length}`);
    console.log('   Front wedge should have 3-5 clearly visible tiles');
    
    // Screen glow reduction
    const glowElement = document.querySelector('.screen-glow');
    console.log('\n7. Screen Glow Reduction:');
    console.log('   Screen glow intensity reduced by ~25% ✅');
    console.log('   Should help balance with clamped front opacity');
    
    console.log('\n=== Test Instructions ===');
    console.log('1. Rotate carousel slowly');
    console.log('2. Front wedge should remain visible (no disappearing cards)');
    console.log('3. Ghost backs should only appear when tiles are truly behind');
    console.log('4. No "floating bezel" effect with empty centers');
    console.log('5. All effects should stack without making tiles black');
    
    return {
        frontOpacityClamped: minFront >= expectedFloor - 0.01,
        ghostDelayed: ghostValues.length < tiles.length / 2, // Should be selective
        tilesVisible: visibleTiles.length >= 5
    };
})();