export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

export function formatNumber(num) {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
  if (num >= 1_000)     return (num / 1_000).toFixed(1) + 'K';
  return String(num);
}

export function sliceByPeriod(dataArr, period) {
  // period: '6m' | '1y' | '2y'
  const len = dataArr.length;
  if (period === '6m') return dataArr.slice(Math.max(0, len - 6));
  if (period === '2y') return dataArr.slice(Math.max(0, len - 24)); // if only 12 exists, returns all 12
  return dataArr.slice(Math.max(0, len - 12)); // 1y
}

export function setActive(el, groupSel) {
  $$(groupSel).forEach(b => b.classList.remove('active'));
  el.classList.add('active');
}

export function show(el) { el.classList.add('active'); }
export function hide(el) { el.classList.remove('active'); }
