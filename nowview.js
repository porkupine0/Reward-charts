// How "right now" looks, shared by the home page, each kid's page and the Parents page.
import { esc } from './store.js?v=1794442095';

export function nowHtml(st, max = 4) {
  const head = '<div class="now-head"><span class="now-phase">' + esc(st.title) + '</span>' +
    (st.left.length ? '<span class="now-count">' + st.left.length + ' left</span>' : st.phase === 'school' || st.phase === 'night' ? '' : '<span class="now-count done">Done ✓</span>') + '</div>';
  const items = st.left.slice(0, max).map((i) => '<li>' + (i.time ? '<span class="now-time">' + esc(i.time) + '</span>' : '') + esc(i.label) + '</li>').join('');
  const more = st.left.length > max ? '<li class="now-more">+' + (st.left.length - max) + ' more</li>' : '';
  return head + (items ? '<ul class="now-list">' + items + more + '</ul>' : '') + (st.sub ? '<p class="now-sub">' + esc(st.sub) + '</p>' : '');
}
// One line for small spaces (home tiles)
export function nowLine(st) {
  if (!st.left.length) return st.title + (st.phase === 'school' || st.phase === 'night' ? '' : ' done ✓') + (st.sub ? ' · ' + st.sub : '');
  return st.title + ': ' + st.left.length + ' left · next: ' + st.left[0].label + (st.left[0].time ? ' (' + st.left[0].time + ')' : '');
}
