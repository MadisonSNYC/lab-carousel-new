// Calculate current carousel geometry metrics
// Current config: W=120px, C=12, P=1200px

const W = 120; // panelWidth
const C = 12;  // panelCount
const P = 1200; // perspective

// Calculate radius using current formula
const r_base = (W / 2) / Math.tan(Math.PI / C);
const R = Math.max(300, Math.min(800, r_base * 1.2));

console.log('=== Current Geometry Metrics ===');
console.log('W (tile width):', W + 'px');
console.log('C (panel count):', C);
console.log('P (perspective):', P + 'px');
console.log('R (radius):', R.toFixed(1) + 'px');

// Calculate tile angular width
const step = 360 / C;
const alpha_tile = 2 * Math.atan((W/2) / R) * 180 / Math.PI;

console.log('\n=== Angular Calculations ===');
console.log('Step (360/C):', step.toFixed(1) + '°');
console.log('α_tile (angular width):', alpha_tile.toFixed(1) + '°');
console.log('α_tile / step ratio:', (alpha_tile / step).toFixed(2));
console.log('Target ratio: ≤ 0.6 for clear gutters');

// Determine if spacing is too tight
const isTight = alpha_tile / step > 0.6;
console.log('Spacing status:', isTight ? 'TOO TIGHT' : 'ACCEPTABLE');

// Calculate better radius for α_target = 14°
const alpha_target = 14;
const R_new = (W/2) / Math.tan(alpha_target * Math.PI / 360);
const R_clamped = Math.max(1.3 * R, Math.min(1.85 * R, R_new));

console.log('\n=== Proposed Improvements ===');
console.log('Target α_tile:', alpha_target + '°');
console.log('Ideal R_new:', R_new.toFixed(1) + 'px');
console.log('Clamped R_new:', R_clamped.toFixed(1) + 'px');
console.log('R increase factor:', (R_clamped / R).toFixed(2) + 'x');

// Calculate new angular width with improved radius
const alpha_new = 2 * Math.atan((W/2) / R_clamped) * 180 / Math.PI;
console.log('New α_tile:', alpha_new.toFixed(1) + '°');
console.log('New ratio:', (alpha_new / step).toFixed(2));