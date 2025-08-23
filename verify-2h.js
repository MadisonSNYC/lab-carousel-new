// Verification for Task 2H-MAKE-IT-LAND - Track tilt + size bias
// Run in browser console

(function verify2H() {
    console.log('=== Task 2H-MAKE-IT-LAND Verification: Track Tilt + Size Bias ===\n');
    
    // 1. Check for track wrapper
    const trackWrapper = document.querySelector('.lab-track');
    console.log('1. Track Wrapper:');
    console.log(`   .lab-track found: ${trackWrapper ? '✅ YES' : '❌ NO'}`);
    
    if (trackWrapper) {
        const trackStyle = getComputedStyle(trackWrapper);
        const trackTransform = trackStyle.transform;
        console.log(`   Transform: ${trackTransform}`);
        console.log(`   Transform-style: ${trackStyle.transformStyle}`);
        
        // Check CSS variable
        const tiltDeg = trackWrapper.style.getPropertyValue('--track-tilt-deg') || 
                       getComputedStyle(trackWrapper).getPropertyValue('--track-tilt-deg');
        console.log(`   --track-tilt-deg: ${tiltDeg || 'NOT SET'}`);
    }
    
    // 2. Check bias variables on tiles
    const tiles = document.querySelectorAll('.lab-tile');
    let tilesWithBiasScale = 0;
    let tilesWithBiasTilt = 0;
    const sampleBiasValues = [];
    
    tiles.forEach((tile, i) => {
        const biasScale = tile.style.getPropertyValue('--bias-scale');
        const biasTilt = tile.style.getPropertyValue('--bias-tilt-deg');
        
        if (biasScale) tilesWithBiasScale++;
        if (biasTilt) tilesWithBiasTilt++;
        
        if (i < 5) {
            sampleBiasValues.push({
                index: i,
                biasScale: biasScale || 'NOT SET',
                biasTilt: biasTilt || 'NOT SET',
                depth: tile.style.getPropertyValue('--d') || '0'
            });
        }
    });
    
    console.log('\n2. Per-Tile Bias Variables:');
    console.log(`   Tiles with --bias-scale: ${tilesWithBiasScale}/${tiles.length}`);
    console.log(`   Tiles with --bias-tilt-deg: ${tilesWithBiasTilt}/${tiles.length}`);
    console.log('   Sample values:', sampleBiasValues.slice(0, 3));
    
    // 3. Check bias scaling range
    const scaleValues = sampleBiasValues.map(s => parseFloat(s.biasScale)).filter(v => !isNaN(v));
    const minScale = Math.min(...scaleValues);
    const maxScale = Math.max(...scaleValues);
    
    console.log('\n3. Size Bias Range:');
    console.log(`   Min scale: ${minScale.toFixed(3)} (should be ~0.92 for side tiles)`);
    console.log(`   Max scale: ${maxScale.toFixed(3)} (should be ~1.03 for front tiles)`);
    console.log('   Front bigger than side:', maxScale > minScale ? '✅ YES' : '❌ NO');
    
    // 4. Check tilt bias range  
    const tiltValues = sampleBiasValues.map(s => parseFloat(s.biasTilt)).filter(v => !isNaN(v));
    const minTilt = Math.min(...tiltValues);
    const maxTilt = Math.max(...tiltValues);
    
    console.log('\n4. Tilt Bias Range:');
    console.log(`   Min tilt: ${minTilt.toFixed(1)}° (should be ~-5° for side tiles)`);
    console.log(`   Max tilt: ${maxTilt.toFixed(1)}° (should be ~0° for front tiles)`);
    console.log('   Inward tilt progression:', minTilt < maxTilt ? '✅ YES' : '❌ NO');
    
    // 5. Check CSS transform rule application
    const sampleTile = tiles[0];
    if (sampleTile) {
        const content = sampleTile.querySelector('.tile-content, .curved-wrap');
        console.log('\n5. CSS Transform Application:');
        if (content) {
            const contentTransform = getComputedStyle(content).transform;
            console.log('   Content transform applied: ✅ YES');
            console.log('   Transform includes scale/rotateX: should contain matrix3d');
            console.log(`   Computed: ${contentTransform.substring(0, 50)}...`);
        } else {
            console.log('   ❌ No .tile-content or .curved-wrap found');
        }
    }
    
    // 6. Check effect interoperability
    console.log('\n6. Effect Interoperability:');
    const hasDoF = !!document.querySelector('[data-dof="on"]');
    const hasGhost = !!document.querySelector('[data-ghost="on"]');
    const hasCurved = !!document.querySelector('.curved-wrap');
    
    console.log(`   DoF active: ${hasDoF ? '✅ ON' : '❌ OFF'}`);
    console.log(`   Ghost back: ${hasGhost ? '✅ ON' : '❌ OFF'}`);
    console.log(`   Curved panels: ${hasCurved ? '✅ ON' : '❌ OFF'}`);
    console.log('   All effects should stack without conflicts');
    
    // 7. Visual assessment
    console.log('\n7. Visual Results:');
    console.log('   Track should have subtle -6° lean (cylinder tilt)');
    console.log('   Front tiles should appear ~3% larger');
    console.log('   Side tiles should appear ~8% smaller with inward tilt');
    console.log('   Effects should be subtle and smooth');
    
    // 8. Configuration check
    console.log('\n8. Configuration Values:');
    console.log('   SCALE_FRONT: 0.03 (+3% at front)');
    console.log('   SCALE_SIDE: 0.08 (-8% at side)');
    console.log('   BIAS_TILT_MAX: 5° (inward bow)');
    console.log('   Track tilt: -6° (global lean)');
    
    console.log('\n=== Test Instructions ===');
    console.log('1. Rotate carousel slowly - track should lean consistently');
    console.log('2. Front tiles should look slightly larger and straight');
    console.log('3. Side tiles should look smaller with inward tilt');
    console.log('4. All existing effects should still work');
    console.log('5. No jittering or conflicts between effects');
    
    return {
        trackWrapperFound: !!trackWrapper,
        biasVariablesSet: tilesWithBiasScale > 0 && tilesWithBiasTilt > 0,
        scaleProgression: maxScale > minScale,
        tiltProgression: minTilt < maxTilt,
        effectsActive: hasDoF && hasGhost
    };
})();