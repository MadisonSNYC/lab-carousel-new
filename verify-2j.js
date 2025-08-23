// Verification for Task 2J - Main effects enabled by default
// Run in browser console

(function verify2J() {
    console.log('=== Task 2J Verification: Default Effects ===\n');
    
    // Check default effects are ON
    const expectedEffects = {
        monitorStyle: true,
        curvedPanels: true,
        scanLines: true,
        screenGlow: true,
        colorGrading: true,
        atmosphericGrain: true,
        filmNoise: true,
        cinematicLighting: true,
        depthOfField: true,
        ghostBack: true,
        enhancedWireframe: false  // Should remain false
    };
    
    // Check visual evidence of effects
    const evidence = {
        monitorStyle: !!document.querySelector('.lab-tile.monitor-style'),
        curvedPanels: !!document.querySelector('.curved-wrap'),
        scanLines: !!document.querySelector('.scan-lines'),
        screenGlow: !!document.querySelector('.screen-glow'),
        ghostBack: !!document.querySelector('.lab-tile[data-ghost="on"]'),
        depthOfField: !!document.querySelector('[data-dof="on"]'),
        cinematicLighting: !!document.querySelector('.cinematic-lighting'),
        colorGrading: !!document.querySelector('.color-grading')
    };
    
    console.log('1. Expected Default Effects (should be ON):');
    Object.entries(expectedEffects).forEach(([key, expected]) => {
        const status = expected ? '✅ ON' : '❌ OFF';
        console.log(`   ${key}: ${status}`);
    });
    
    console.log('\n2. Visual Evidence in DOM:');
    Object.entries(evidence).forEach(([key, found]) => {
        const status = found ? '✅ FOUND' : '❌ NOT FOUND';
        console.log(`   ${key}: ${status}`);
    });
    
    // Check mobile vs desktop
    const isMobile = window.matchMedia('(max-width: 640px)').matches;
    console.log('\n3. Device Detection:');
    console.log('   Device type:', isMobile ? 'MOBILE' : 'DESKTOP');
    
    // Check chromatic aberration (desktop only)
    const chromaticEl = document.querySelector('.chromatic-aberration-overlay');
    const chromaticVisible = chromaticEl && getComputedStyle(chromaticEl).display !== 'none';
    console.log('   Chromatic aberration:', chromaticVisible ? 'ON' : 'OFF (correct for mobile)');
    
    // Check PRM status
    const prmEnabled = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    console.log('\n4. Accessibility:');
    console.log('   Reduced motion:', prmEnabled ? 'ON' : 'OFF');
    if (prmEnabled) {
        console.log('   DoF should be OFF for PRM');
    }
    
    // Check safe intensities
    const grainEl = document.querySelector('.atmospheric-grain');
    const filmEl = document.querySelector('.film-noise');
    console.log('\n5. Safe Intensities:');
    if (grainEl) {
        const grainOpacity = getComputedStyle(grainEl).opacity;
        console.log('   Atmospheric grain opacity:', grainOpacity, '(should be ~0.06)');
    }
    if (filmEl) {
        const filmOpacity = getComputedStyle(filmEl).opacity;
        console.log('   Film noise opacity:', filmOpacity, '(should be ~0.05)');
    }
    
    // Check localStorage clearing
    console.log('\n6. Dev State:');
    const oldKey = localStorage.getItem('labEffects');
    const newKey = localStorage.getItem('labEffectsV2');
    console.log('   Old storage cleared:', !oldKey ? 'YES' : 'NO');
    console.log('   New version marker:', !!newKey ? 'SET' : 'NOT SET');
    
    console.log('\n=== Overall Assessment ===');
    const effectsCount = Object.values(evidence).filter(Boolean).length;
    console.log(`Effects active: ${effectsCount}/8 expected`);
    console.log('Loading experience:', effectsCount >= 6 ? '✅ CINEMATIC' : '⚠️ NEEDS WORK');
    
    return {
        mobile: isMobile,
        prmEnabled,
        effectsActive: effectsCount,
        chromaticCorrect: !isMobile === chromaticVisible // Should match device type
    };
})();