// Debug script for Task 2G - check why tilt/scale/pop isn't applying
// Run in browser console

(() => {
  const t = document.querySelector('.lab-tile');
  const face =
    t?.querySelector('.tile-content') ||
    t?.querySelector('.curved-wrap') ||
    t?.firstElementChild;

  console.log('=== 2G DEBUG - Tilt/Scale/Pop ===');
  console.log('tile style vars:', t?.getAttribute('style'));
  console.log('face selector:', face?.className);
  console.log('computed transform:', getComputedStyle(face).transform);
  console.log('vars:', {
    tilt: t?.style.getPropertyValue('--tilt').trim() || 'NOT SET',
    scale: t?.style.getPropertyValue('--scale').trim() || 'NOT SET',
    pop: t?.style.getPropertyValue('--pop').trim() || 'NOT SET',
    d: t?.style.getPropertyValue('--d').trim() || 'NOT SET'
  });
  
  // Check multiple tiles to see pattern
  console.log('\n=== Multiple Tile Check ===');
  const tiles = document.querySelectorAll('.lab-tile');
  tiles.forEach((tile, i) => {
    if (i < 5) { // First 5 tiles
      const vars = {
        tilt: tile.style.getPropertyValue('--tilt'),
        scale: tile.style.getPropertyValue('--scale'),
        pop: tile.style.getPropertyValue('--pop')
      };
      console.log(`Tile ${i}:`, vars);
    }
  });
  
  // Check effect status
  const dofContainer = document.querySelector('[data-dof="on"]');
  console.log('\n=== Effect Status ===');
  console.log('DoF enabled:', !!dofContainer);
  console.log('Note: Tilt/scale/pop vars should ALWAYS be set (independent of DoF)');
  console.log('CSS selector: .lab-tile :where(.tile-content, .curved-wrap)');
})();