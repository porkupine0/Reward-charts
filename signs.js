// Blank sign shapes for quiz questions ("a sign of this shape and color means…"): no words or symbols, which
// would give the answer away. Shapes and colors checked against the Iowa manual's pictures (pp. 6-7, 11):
// stop = red octagon; yield = downward triangle, red border, white middle; regulatory = white rectangle;
// no passing = yellow pennant pointing right; warning = yellow diamond; railroad ahead = yellow circle;
// school = yellow-green pentagon, point up; railroad crossing = white crossbuck; slow-moving vehicle =
// orange triangle, point up, red border. A question carries sign: { shape, color }.
export const SHAPES = ['octagon', 'yield', 'rectangle', 'pennant', 'diamond', 'circle', 'pentagon', 'crossbuck', 'smv'];
export const COLORS = { red: '#C8102E', white: '#FFFFFF', yellow: '#FFD100', 'yellow-green': '#C4D600', orange: '#FF7F00', green: '#00704A', blue: '#0050A0', brown: '#6B3A1F', pink: '#FF5BA7' };
const NAMES = { octagon: 'eight-sided (octagon)', yield: 'downward-pointing triangle with a red border', rectangle: 'rectangular', pennant: 'sideways triangle (pennant) pointing right',
  diamond: 'diamond-shaped', circle: 'round', pentagon: 'five-sided (pentagon), pointed at the top', crossbuck: 'X-shaped (crossbuck)', smv: 'triangle pointing up, with a red border' };

// What's drawn, in words (for screen readers): never its meaning.
export const signLabel = (s) => 'A blank ' + (s.color && s.shape !== 'yield' && s.shape !== 'smv' ? s.color + ' ' : '') + (s.shape === 'smv' ? 'orange ' : '') + NAMES[s.shape] + ' sign';

const INK = '#1A1A1A';
// An inline SVG, fixed size, with a dark outline so it reads on light and dark backgrounds.
export function signSvg(s) {
  const f = COLORS[s.color] || '#FFFFFF', o = 'stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"';
  const body = {
    octagon: '<polygon points="31,4 69,4 96,31 96,69 69,96 31,96 4,69 4,31" fill="' + f + '" ' + o + '/><polygon points="34,11 66,11 89,34 89,66 66,89 34,89 11,66 11,34" fill="none" stroke="#fff" stroke-width="3"/>',
    yield: '<polygon points="4,10 96,10 50,94" fill="' + COLORS.red + '" ' + o + '/><polygon points="24,22 76,22 50,70" fill="#fff"/>',
    rectangle: '<rect x="18" y="6" width="64" height="88" rx="6" fill="' + f + '" ' + o + '/>',
    pennant: '<polygon points="4,18 96,50 4,82" fill="' + f + '" ' + o + '/>',
    diamond: '<polygon points="50,3 97,50 50,97 3,50" fill="' + f + '" ' + o + '/>',
    circle: '<circle cx="50" cy="50" r="46" fill="' + f + '" ' + o + '/>',
    pentagon: '<polygon points="50,4 94,40 94,96 6,96 6,40" fill="' + f + '" ' + o + '/>',
    crossbuck: '<g transform="rotate(35 50 50)"><rect x="2" y="40" width="96" height="20" rx="3" fill="' + f + '" ' + o + '/></g><g transform="rotate(-35 50 50)"><rect x="2" y="40" width="96" height="20" rx="3" fill="' + f + '" ' + o + '/></g>',
    smv: '<polygon points="50,6 96,90 4,90" fill="' + COLORS.red + '" ' + o + '/><polygon points="50,24 81,80 19,80" fill="' + COLORS.orange + '"/>'
  }[s.shape] || '';
  return '<svg class="dsign" viewBox="0 0 100 100" width="96" height="96" role="img" aria-label="' + signLabel(s) + '">' + body + '</svg>';
}

// Problems with a question's sign (empty = fine), for the content checkers.
export function checkSign(id, s) {
  if (!s) return [];
  const out = [];
  if (!SHAPES.includes(s.shape)) out.push(id + ': unknown sign shape ' + s.shape);
  if (!['yield', 'smv'].includes(s.shape) && !COLORS[s.color]) out.push(id + ': unknown sign color ' + s.color);
  return out;
}
