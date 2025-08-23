// Verification script for Ghost Back effect
// Run this in browser console while viewing the carousel

(function verifyGhostBack() {
    console.log('=== Ghost Back Effect Verification ===');
    
    // Check tiles for data-ghost attribute
    const tiles = document.querySelectorAll('.lab-tile');
    let tilesWithGhost = 0;
    
    tiles.forEach((tile, i) => {
        const ghostAttr = tile.getAttribute('data-ghost');
        if (ghostAttr === 'on') {
            tilesWithGhost++;
        }
        
        // Check CSS variables
        const tileBg = tile.style.getPropertyValue('--tile-bg');
        const panelW = tile.style.getPropertyValue('--panel-w');
        const panelH = tile.style.getPropertyValue('--panel-h');
        
        if (i === 0) {
            console.log('Sample tile CSS vars:');
            console.log('  --tile-bg:', tileBg ? 'Set' : 'Not set');
            console.log('  --panel-w:', panelW);
            console.log('  --panel-h:', panelH);
        }
    });
    
    console.log(`1. Tiles with ghost="on": ${tilesWithGhost}/${tiles.length}`);
    
    // Check if pseudo-element styles are applied
    if (tiles.length > 0) {
        const testTile = tiles[0];
        const pseudoStyles = window.getComputedStyle(testTile, '::after');
        console.log('2. Pseudo-element (::after) properties:');
        console.log('  - content:', pseudoStyles.content);
        console.log('  - transform:', pseudoStyles.transform?.substring(0, 50) + '...');
        console.log('  - opacity:', pseudoStyles.opacity);
        console.log('  - filter:', pseudoStyles.filter);
        console.log('  - backface-visibility:', pseudoStyles.backfaceVisibility);
    }
    
    // Check DevPanel for toggle
    const devPanelCheckboxes = document.querySelectorAll('input[type="checkbox"]');
    let ghostBackToggle = null;
    devPanelCheckboxes.forEach(cb => {
        const label = cb.parentElement?.textContent;
        if (label && label.includes('Ghost Back')) {
            ghostBackToggle = cb;
        }
    });
    
    console.log('3. Ghost Back toggle in DevPanel:', ghostBackToggle ? 'Found' : 'Not found');
    if (ghostBackToggle) {
        console.log('   - Currently:', ghostBackToggle.checked ? 'ON' : 'OFF');
    }
    
    // Test instructions
    console.log('\n=== Test Instructions ===');
    console.log('1. Press "D" to open DevPanel');
    console.log('2. Enable "Ghost Back" toggle');
    console.log('3. Rotate carousel to see tiles from behind');
    console.log('4. Back sides should show dim, grayscale, blurred image');
    console.log('5. Toggle effect OFF to compare');
    
    // Check interop with other effects
    const dofEnabled = document.querySelector('.lab-carousel-container')?.getAttribute('data-dof') === 'on';
    console.log('\n=== Interop Status ===');
    console.log('- Depth of Field:', dofEnabled ? 'ON' : 'OFF');
    console.log('- Both effects should work together');
    
    return {
        ghostBackEnabled: tilesWithGhost > 0,
        tilesConfigured: tiles.length,
        pseudoElementReady: tiles[0] && window.getComputedStyle(tiles[0], '::after').content !== 'none'
    };
})();