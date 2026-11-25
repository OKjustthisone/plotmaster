const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const projectRoot = path.resolve(__dirname, '..');
const appSource = fs.readFileSync(path.join(projectRoot, 'app.js'), 'utf8');
const htmlSource = fs.readFileSync(path.join(projectRoot, 'index.html'), 'utf8');
const context = vm.createContext({
  console,
  window: {},
  setTimeout: () => 0,
  clearTimeout: () => {},
});
vm.runInContext(appSource, context, { filename: 'app.js' });

const evaluate = expression => vm.runInContext(expression, context);
const specSummary = JSON.parse(evaluate(`JSON.stringify(Object.fromEntries(
  Object.entries(PLOT_SPECS).map(([key, spec]) => [key, {
    showX: spec.showX,
    showY: spec.showY,
    maxY: spec.maxY === Infinity ? 'many' : spec.maxY,
    group: spec.allowGroup,
    y2: spec.allowY2,
    numericY: spec.numericY !== false,
    specialRole: spec.specialRole || null
  }])
))`));

assert.equal(Object.keys(specSummary).length, 10);
assert.deepEqual(specSummary.histogram, {
  showX: true, showY: false, maxY: 0, group: true, y2: false,
  numericY: true, specialRole: null
});
assert.deepEqual(specSummary.bubble, {
  showX: true, showY: true, maxY: 1, group: true, y2: false,
  numericY: true, specialRole: 'bubbleSize'
});
assert.deepEqual(specSummary.heatmap, {
  showX: true, showY: true, maxY: 1, group: false, y2: false,
  numericY: false, specialRole: 'heatmapValue'
});
assert.deepEqual(specSummary.pie, {
  showX: true, showY: true, maxY: 1, group: false, y2: false,
  numericY: true, specialRole: null
});

evaluate(`appState.activeData = {
  headers: ['x', 'y', 'size', 'category', 'row', 'fill'],
  rows: [
    {x: 1, y: 2, size: 4, category: 'A', row: 'R1', fill: 10},
    {x: 2, y: 3, size: 9, category: 'B', row: 'R2', fill: 20},
    {x: '', y: '', size: -1, category: 'C', row: 'R1', fill: ''}
  ]
}`);
const rows = 'appState.activeData.rows';

assert.deepEqual(JSON.parse(evaluate(`JSON.stringify(validatePlotMappings('histogram', ${rows}, {
  xCol: 'x', yCols: [], bubbleSizeCol: '', heatmapValueCol: ''
}))`)), []);
assert.match(evaluate(`validatePlotMappings('histogram', ${rows}, {
  xCol: 'category', yCols: [], bubbleSizeCol: '', heatmapValueCol: ''
}).join(' ')`), /numeric X/);

assert.deepEqual(JSON.parse(evaluate(`JSON.stringify(validatePlotMappings('bubble', ${rows}, {
  xCol: 'x', yCols: ['y'], bubbleSizeCol: 'size', heatmapValueCol: ''
}))`)), []);
assert.match(evaluate(`validatePlotMappings('bubble', ${rows}, {
  xCol: 'x', yCols: ['y'], bubbleSizeCol: '', heatmapValueCol: ''
}).join(' ')`), /bubble size column/);

assert.deepEqual(JSON.parse(evaluate(`JSON.stringify(validatePlotMappings('heatmap', ${rows}, {
  xCol: 'category', yCols: ['row'], bubbleSizeCol: '', heatmapValueCol: 'fill'
}))`)), []);
assert.match(evaluate(`validatePlotMappings('heatmap', ${rows}, {
  xCol: 'category', yCols: ['row'], bubbleSizeCol: '', heatmapValueCol: ''
}).join(' ')`), /cell-value/);

assert.deepEqual(JSON.parse(evaluate(`JSON.stringify(validatePlotMappings('pie', ${rows}, {
  xCol: 'category', yCols: ['y'], bubbleSizeCol: '', heatmapValueCol: ''
}))`)), []);

assert.equal(evaluate(`aggregateNumericValues(['', null, 2, '4'], 'mean')`), 3);
assert.equal(evaluate(`isFiniteNumericValue('   ')`), false);
assert.equal(evaluate(`aggregateNumericValues([1, 9, 5], 'median')`), 5);
assert.equal(evaluate(`aggregateNumericValues([1, 2, 3], 'sum')`), 6);

evaluate(`
  const testHeatmapYSelect = {value: 'fill'};
  DOM.xSelect = {value: 'category'};
  DOM.heatmapValueSelect = {value: 'fill'};
  document = {
    getElementById(id) {
      if (id === 'y1-cols-container') {
        return {querySelectorAll: () => [testHeatmapYSelect]};
      }
      return null;
    },
    querySelector(selector) {
      return selector === '#y1-cols-container .y1-col-select' ? testHeatmapYSelect : null;
    }
  };
  ensurePlotMappingDefaults('heatmap', {chartType: 'line', yCols: ['fill']});
  globalThis.testHeatmapDefaultY = testHeatmapYSelect.value;
`);
assert.equal(evaluate(`testHeatmapDefaultY`), 'row');

for (const id of [
  'bubble-size-select', 'heatmap-value-select', 'mapping-validation',
  'histogram-bins', 'histogram-stat', 'bubble-min-size', 'bubble-max-size',
  'heatmap-aggregation', 'heatmap-show-values', 'pie-inner-radius'
]) {
  assert.match(htmlSource, new RegExp(`id=["']${id}["']`), `Missing HTML control: ${id}`);
}

const allIds = [...htmlSource.matchAll(/\bid=["']([^"']+)["']/g)].map(match => match[1]);
const duplicateIds = [...new Set(allIds.filter((id, index) => allIds.indexOf(id) !== index))];
assert.deepEqual(duplicateIds, [], `Duplicate HTML ids: ${duplicateIds.join(', ')}`);

console.log('Plot parameter contract tests passed.');
