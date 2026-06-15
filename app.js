// ==============================================================================
//                         PLOTMASTER - APPLICATION LOGIC
// ==============================================================================

// 1. Academic & Scientific Color Palettes Definition (10 Palettes x 15 Colors)
const PALETTES = {
  nature: {
    name: 'Nature Publishing Group',
    colors: ['#0C457D', '#E87D22', '#169E57', '#8E28B0', '#EEB609', '#00A896', '#C1121F', '#5C677D', '#9A8C98', '#6F7F1C', '#D90429', '#028090', '#3D348B', '#E76F51', '#7F4F24']
  },
  science: {
    name: 'Science Journal',
    colors: ['#1D3557', '#E63946', '#F4A261', '#2A9D8F', '#9B5DE5', '#00BBF9', '#8C3B1A', '#2B2D42', '#3F37C9', '#4895EF', '#F72585', '#7209B7', '#344E41', '#E7C169', '#E07A5F']
  },
  lancet: {
    name: 'The Lancet',
    colors: ['#BC0000', '#002060', '#FFC000', '#00B050', '#7030A0', '#00A2E8', '#8B0000', '#2E4057', '#0B6623', '#F26419', '#6B2D5C', '#5C3D2E', '#3A86C8', '#FF6B6B', '#5A189A']
  },
  nejm: {
    name: 'New England Journal of Medicine',
    colors: ['#184A7A', '#B22222', '#008080', '#6F4E37', '#DAA520', '#6A7B83', '#7A2240', '#48C9B0', '#2B6CB0', '#EC7063', '#808000', '#2ECC71', '#F5B041', '#E59866', '#5D4037']
  },
  jama: {
    name: 'JAMA (Amer. Medical Assoc.)',
    colors: ['#111111', '#E63946', '#1D3557', '#F4A261', '#4A4E69', '#9B5DE5', '#560BAD', '#84A59D', '#D90429', '#00B4D8', '#F26419', '#FFD166', '#03045E', '#7209B7', '#2A9D8F']
  },
  cell: {
    name: 'Cell Press',
    colors: ['#8E0000', '#0E6251', '#1A5276', '#D68910', '#5B2C6F', '#CA6F1E', '#D01C8B', '#2C3E50', '#27AE60', '#FF85A2', '#8A6D3B', '#3498DB', '#196F3D', '#B03A2E', '#6C3483']
  },
  ggplot2: {
    name: 'Classic ggplot2',
    colors: ['#F8766D', '#00BFC4', '#D39200', '#619CFF', '#93AA00', '#D890F0', '#00BA38', '#FF62BC', '#E7872B', '#00B4F0', '#B79F00', '#B783FF', '#5EB300', '#00C19F', '#F375F3']
  },
  warm: {
    name: 'Warm Academic',
    colors: ['#C0392B', '#F39C12', '#E59866', '#7E5109', '#922B21', '#D35400', '#F1948A', '#F5C242', '#641E16', '#7D3C98', '#E67E22', '#BA4A00', '#A04000', '#EDBB99', '#78281F']
  },
  cool: {
    name: 'Cool Academic',
    colors: ['#2E4053', '#16A085', '#2980B9', '#27AE60', '#8E44AD', '#A3E4D7', '#7FB3D5', '#1B4F72', '#4A235A', '#2471A3', '#117A65', '#1F3A60', '#A569BD', '#388E8E', '#48C9B0']
  },
  retro: {
    name: 'Retro Academic',
    colors: ['#556B2F', '#D35400', '#5D6D7E', '#C0392B', '#B7950B', '#2C3E50', '#A9DFBF', '#78281F', '#17A589', '#D4AC0D', '#5B2C6F', '#EC7063', '#7D3C98', '#A04000', '#1E8449']
  },
  red_grad: {
    name: 'Red Gradient (红色渐变)',
    colors: ['#fc9272', '#fb6a4a', '#ef3b2c', '#cb181d', '#a50f15', '#80000a', '#540005']
  },
  green_grad: {
    name: 'Green Gradient (绿色渐变)',
    colors: ['#a1d99b', '#74c476', '#41ab5d', '#238b45', '#006d2c', '#004d1f', '#003010']
  },
  blue_grad: {
    name: 'Blue Gradient (蓝色渐变)',
    colors: ['#9ecae1', '#6baed6', '#4292c6', '#2171b5', '#084594', '#082d6b', '#051b40']
  },
  orange_grad: {
    name: 'Orange Gradient (橙色渐变)',
    colors: ['#fdae6b', '#fd8d3c', '#f16913', '#d94801', '#a63603', '#7f2704', '#541500']
  },
  purple_grad: {
    name: 'Purple Gradient (紫色渐变)',
    colors: ['#bcbddc', '#9e9ac8', '#807dba', '#6a51a3', '#54278f', '#3f007d', '#280050']
  }
};

// Prepend black (#000000) to all palettes, shift others, and remove the last color
Object.keys(PALETTES).forEach(key => {
  PALETTES[key].colors.unshift('#000000');
  PALETTES[key].colors.pop();
});

// 2. Global State Management
let appState = {
  activeFile: null,
  activeFileName: '',
  sheets: {},            // Map of sheetName -> { headers: [], rows: [] }
  activeSheetName: '',
  activeData: null,      // Reference to the active sheet's { headers: [], rows: [] }
  currentChartType: 'line',
  selectedPalette: 'ggplot2',
  chartInstance: null,
  renderer: 'canvas',     // 'canvas' or 'svg' for vector export
  savedCharts: [],        // Saved chart sheets tabs
  activeChartId: null,    // Active chart tab ID
  columnFilters: {}       // Column filters search mapping
};

function getFilteredRows() {
  const data = appState.activeData;
  if (!data) return [];
  if (!appState.columnFilters) return data.rows;
  
  return data.rows.filter(row => {
    return Object.keys(appState.columnFilters).every(colName => {
      const q = appState.columnFilters[colName];
      if (!q || q.trim() === '') return true;
      const val = row[colName];
      if (val === undefined || val === null) return false;
      return String(val).toLowerCase().includes(q.trim().toLowerCase());
    });
  });
}

// 3. DOM Elements references
// 3. DOM Elements references
let DOM = {};

// 4. Initializer
function init() {
  DOM.uploadZone = document.getElementById('upload-zone');
  DOM.fileInput = document.getElementById('file-input');
  DOM.xSelect = document.getElementById('x-axis-select');
  DOM.ySelect = document.getElementById('y1-cols-container');
  DOM.y2Select = document.getElementById('y2-cols-container');
  DOM.groupSelect = document.getElementById('group-select');
  DOM.mappingSection = document.getElementById('mapping-section');
  DOM.plotSection = document.getElementById('plot-section');
  DOM.chartTypeGrid = document.getElementById('chart-type-grid');
  DOM.paletteSelect = document.getElementById('palette-select');
  DOM.palette2Select = document.getElementById('palette2-select');
  DOM.fileStatusBadge = document.getElementById('file-status-badge');
  DOM.fileStatusText = document.getElementById('file-status-text');
  DOM.sheetSelectorGroup = document.getElementById('sheet-selector-group');
  DOM.sheetSelect = document.getElementById('sheet-select');
  DOM.btnDraw = document.getElementById('btn-draw');
  DOM.chartCanvas = document.getElementById('chart-canvas');
  DOM.placeholderView = document.getElementById('placeholder-view');
  DOM.tableHeaders = document.getElementById('table-headers');
  DOM.tableBody = document.getElementById('table-body');
  DOM.gridStats = document.getElementById('grid-stats');
  
  DOM.pointSize = document.getElementById('point-size-slider');
  DOM.pointSizeVal = document.getElementById('point-size-val');
  DOM.pointSize2 = document.getElementById('point-size-2-slider');
  DOM.pointSize2Val = document.getElementById('point-size-2-val');
  DOM.lineWidth = document.getElementById('line-width-slider');
  DOM.lineWidthVal = document.getElementById('line-width-val');
  DOM.barPadding = document.getElementById('bar-padding-slider');
  DOM.barPaddingVal = document.getElementById('bar-padding-val');
  DOM.boxWidth = document.getElementById('box-width-slider');
  DOM.boxWidthVal = document.getElementById('box-width-val');
  DOM.plotWidth = document.getElementById('plot-width-slider');
  DOM.plotWidthVal = document.getElementById('plot-width-val');
  DOM.plotHeight = document.getElementById('plot-height-slider');
  DOM.plotHeightVal = document.getElementById('plot-height-val');
  DOM.fontSelect = document.getElementById('font-select');
  DOM.themeSelect = document.getElementById('theme-select');
  DOM.gridX = document.getElementById('grid-x-checkbox');
  DOM.gridY = document.getElementById('grid-y-checkbox');
  DOM.xAxisShowLabels = document.getElementById('x-axis-show-labels');
  DOM.xAxisLabelRotate = document.getElementById('x-axis-label-rotate');
  DOM.xAxisLabelRotateVal = document.getElementById('x-axis-label-rotate-val');
  
  DOM.exportPng = document.getElementById('export-png');
  DOM.exportJpg = document.getElementById('export-jpg');
  DOM.exportSvg = document.getElementById('export-svg');
  DOM.exportPzfx = document.getElementById('export-pzfx');
  DOM.exportPrism = document.getElementById('export-prism');
  DOM.copyClipboard = document.getElementById('copy-clipboard');

  lucide.createIcons();
  renderPalettePicker();
  setupEventListeners();
  setupAnnotationToolbar();
  loadStyleTemplatesDropdown();
}

// Dynamic Variable Mapping Inputs matching
function updateColumnMappingInputs(chartType) {
  const xGroup = document.getElementById('x-axis-group');
  const yGroup = document.getElementById('y-axis-group');
  const y2Group = document.getElementById('y2-axis-group');
  const addY2Container = document.getElementById('add-y2-btn-container');
  const gGroup = document.getElementById('group-axis-group');
  
  if (!xGroup || !yGroup || !gGroup) return;
  
  const xLabel = xGroup.querySelector('label');
  const yLabel = yGroup.querySelector('label');
  const gLabel = gGroup.querySelector('label');
  
  const tab = getActiveTab();
  const hasY2Axis = tab && tab.hasY2Axis;

  if (chartType === 'pie') {
    xGroup.style.display = 'block';
    yGroup.style.display = 'block';
    if (y2Group) y2Group.style.display = 'none';
    if (addY2Container) addY2Container.style.display = 'none';
    gGroup.style.display = 'none';
    if (xLabel) xLabel.textContent = 'Categories / Names Column';
    if (yLabel) yLabel.textContent = 'Value Column (Numeric)';
  } else if (chartType === 'histogram') {
    xGroup.style.display = 'none';
    yGroup.style.display = 'block';
    if (y2Group) y2Group.style.display = 'none';
    if (addY2Container) addY2Container.style.display = 'none';
    gGroup.style.display = 'none';
    if (yLabel) yLabel.textContent = 'Value Column (Numeric)';
  } else if (chartType === 'heatmap') {
    xGroup.style.display = 'block';
    yGroup.style.display = 'block';
    if (y2Group) y2Group.style.display = 'none';
    if (addY2Container) addY2Container.style.display = 'none';
    gGroup.style.display = 'block';
    if (xLabel) xLabel.textContent = 'X-Axis Column (Categories)';
    if (yLabel) yLabel.textContent = 'Y-Axis Column (Categories)';
    if (gLabel) gLabel.textContent = 'Cell Value Column (Numeric)';
  } else {
    xGroup.style.display = 'block';
    yGroup.style.display = 'block';
    if (y2Group) y2Group.style.display = hasY2Axis ? 'block' : 'none';
    if (addY2Container) addY2Container.style.display = hasY2Axis ? 'none' : 'block';
    gGroup.style.display = 'block';
    if (xLabel) xLabel.textContent = 'X-Axis Column (Categorical/Numeric)';
    if (yLabel) yLabel.textContent = 'Y-Axis Column (Numeric)';
    if (gLabel) gLabel.textContent = 'Grouping / Color Variable (Optional)';
  }
  toggleSecondaryYAxisStyles();
}

function toggleSecondaryYAxisStyles() {
  const tab = getActiveTab();
  const hasY2 = tab && tab.hasY2Axis;

  const y2PaletteGroup = document.getElementById('secondary-y-palette-group');
  const y2PointSizeGroup = document.getElementById('secondary-point-size-group');
  const y2PointShapeGroup = document.getElementById('secondary-point-shape-group');
  const y2MinMaxGroup = document.getElementById('axis-y2minmax-group');
  const y2LabelInput = document.getElementById('chart-y2label-input');

  const displayVal = hasY2 ? 'block' : 'none';
  const displayFlexVal = hasY2 ? 'flex' : 'none';

  if (y2PaletteGroup) y2PaletteGroup.style.display = displayFlexVal;
  if (y2PointSizeGroup) y2PointSizeGroup.style.display = displayVal;
  if (y2PointShapeGroup) y2PointShapeGroup.style.display = displayFlexVal;
  if (y2MinMaxGroup) y2MinMaxGroup.style.display = displayFlexVal;
  if (y2LabelInput) y2LabelInput.style.display = displayVal;
}

// Helper to read Y-axis split values from the DOM
function getYSplitParamsFromDOM() {
  const mode = document.getElementById('y-axis-split-mode').value;
  const params = {
    min1: null, max1: null, height1: 30,
    min2: null, max2: null, height2: 40,
    min3: null, max3: null
  };
  
  if (mode === '2') {
    const min1El = document.getElementById('y-split-min1');
    const max1El = document.getElementById('y-split-max1');
    const min2El = document.getElementById('y-split-min2');
    const max2El = document.getElementById('y-split-max2');
    const h1El = document.getElementById('y-split-height1');
    
    if (min1El) params.min1 = min1El.value !== '' ? parseFloat(min1El.value) : null;
    if (max1El) params.max1 = max1El.value !== '' ? parseFloat(max1El.value) : null;
    if (min2El) params.min2 = min2El.value !== '' ? parseFloat(min2El.value) : null;
    if (max2El) params.max2 = max2El.value !== '' ? parseFloat(max2El.value) : null;
    if (h1El) params.height1 = parseFloat(h1El.value) || 30;
  } else if (mode === '3') {
    const min1El = document.getElementById('y-split-min1');
    const max1El = document.getElementById('y-split-max1');
    const min2El = document.getElementById('y-split-min2');
    const max2El = document.getElementById('y-split-max2');
    const min3El = document.getElementById('y-split-min3');
    const max3El = document.getElementById('y-split-max3');
    const h1El = document.getElementById('y-split-height1');
    const h2El = document.getElementById('y-split-height2');
    
    if (min1El) params.min1 = min1El.value !== '' ? parseFloat(min1El.value) : null;
    if (max1El) params.max1 = max1El.value !== '' ? parseFloat(max1El.value) : null;
    if (min2El) params.min2 = min2El.value !== '' ? parseFloat(min2El.value) : null;
    if (max2El) params.max2 = max2El.value !== '' ? parseFloat(max2El.value) : null;
    if (min3El) params.min3 = min3El.value !== '' ? parseFloat(min3El.value) : null;
    if (max3El) params.max3 = max3El.value !== '' ? parseFloat(max3El.value) : null;
    if (h1El) params.height1 = parseFloat(h1El.value) || 30;
    if (h2El) params.height2 = parseFloat(h2El.value) || 40;
  }
  return params;
}

// Helper to render Y-axis split input fields in the sidebar
function renderYSplitControls(mode, params = null) {
  const container = document.getElementById('y-axis-split-params-container');
  if (!container) return;
  
  if (mode === '1') {
    container.style.display = 'none';
    container.innerHTML = '';
    return;
  }
  
  container.style.display = 'block';
  
  const min1 = params && params.min1 !== null ? params.min1 : '';
  const max1 = params && params.max1 !== null ? params.max1 : '';
  const min2 = params && params.min2 !== null ? params.min2 : '';
  const max2 = params && params.max2 !== null ? params.max2 : '';
  const min3 = params && params.min3 !== null ? params.min3 : '';
  const max3 = params && params.max3 !== null ? params.max3 : '';
  const height1 = params ? params.height1 : 30;
  const height2 = params ? params.height2 : 40;
  
  if (mode === '2') {
    const height2Computed = 100 - height1;
    container.innerHTML = `
      <div style="font-weight: 600; margin-bottom: 4px; color: var(--accent-color);">Segment 2 (Top, ${height2Computed}% height):</div>
      <div style="display: flex; gap: 4px; margin-bottom: 8px;">
        <input type="number" step="any" class="form-input" id="y-split-min2" placeholder="Min" style="font-size: 11px; padding: 4px; flex: 1;" value="${min2}">
        <input type="number" step="any" class="form-input" id="y-split-max2" placeholder="Max" style="font-size: 11px; padding: 4px; flex: 1;" value="${max2}">
      </div>
      
      <div style="font-weight: 600; margin-bottom: 4px; color: var(--accent-color);">Segment 1 (Bottom, ${height1}% height):</div>
      <div style="display: flex; gap: 4px; margin-bottom: 8px;">
        <input type="number" step="any" class="form-input" id="y-split-min1" placeholder="Min" style="font-size: 11px; padding: 4px; flex: 1;" value="${min1}">
        <input type="number" step="any" class="form-input" id="y-split-max1" placeholder="Max" style="font-size: 11px; padding: 4px; flex: 1;" value="${max1}">
      </div>
      
      <div class="slider-group" style="margin-bottom: 0;">
        <div class="slider-header" style="font-size: 10px;">
          <span>Bottom Height Ratio</span>
          <span id="y-split-height1-val">${height1}%</span>
        </div>
        <input type="range" id="y-split-height1" min="10" max="90" value="${height1}" style="height: 4px; margin-top: 4px;">
      </div>
    `;
    
    document.getElementById('y-split-height1').addEventListener('input', (e) => {
      document.getElementById('y-split-height1-val').textContent = e.target.value + '%';
      saveActiveTabState();
      if (appState.activeData) drawChart();
    });
    
  } else if (mode === '3') {
    const height3Computed = 100 - height1 - height2;
    container.innerHTML = `
      <div style="font-weight: 600; margin-bottom: 4px; color: var(--accent-color);">Segment 3 (Top, ${height3Computed}% height):</div>
      <div style="display: flex; gap: 4px; margin-bottom: 8px;">
        <input type="number" step="any" class="form-input" id="y-split-min3" placeholder="Min" style="font-size: 11px; padding: 4px; flex: 1;" value="${min3}">
        <input type="number" step="any" class="form-input" id="y-split-max3" placeholder="Max" style="font-size: 11px; padding: 4px; flex: 1;" value="${max3}">
      </div>
      
      <div style="font-weight: 600; margin-bottom: 4px; color: var(--accent-color);">Segment 2 (Middle, ${height2}% height):</div>
      <div style="display: flex; gap: 4px; margin-bottom: 8px;">
        <input type="number" step="any" class="form-input" id="y-split-min2" placeholder="Min" style="font-size: 11px; padding: 4px; flex: 1;" value="${min2}">
        <input type="number" step="any" class="form-input" id="y-split-max2" placeholder="Max" style="font-size: 11px; padding: 4px; flex: 1;" value="${max2}">
      </div>
      
      <div style="font-weight: 600; margin-bottom: 4px; color: var(--accent-color);">Segment 1 (Bottom, ${height1}% height):</div>
      <div style="display: flex; gap: 4px; margin-bottom: 8px;">
        <input type="number" step="any" class="form-input" id="y-split-min1" placeholder="Min" style="font-size: 11px; padding: 4px; flex: 1;" value="${min1}">
        <input type="number" step="any" class="form-input" id="y-split-max1" placeholder="Max" style="font-size: 11px; padding: 4px; flex: 1;" value="${max1}">
      </div>
      
      <div class="slider-group" style="margin-bottom: 4px;">
        <div class="slider-header" style="font-size: 10px;">
          <span>Bottom Height Ratio</span>
          <span id="y-split-height1-val">${height1}%</span>
        </div>
        <input type="range" id="y-split-height1" min="10" max="80" value="${height1}" style="height: 4px; margin-top: 4px;">
      </div>
      
      <div class="slider-group" style="margin-bottom: 0;">
        <div class="slider-header" style="font-size: 10px;">
          <span>Middle Height Ratio</span>
          <span id="y-split-height2-val">${height2}%</span>
        </div>
        <input type="range" id="y-split-height2" min="10" max="80" value="${height2}" style="height: 4px; margin-top: 4px;">
      </div>
    `;
    
    document.getElementById('y-split-height1').addEventListener('input', (e) => {
      document.getElementById('y-split-height1-val').textContent = e.target.value + '%';
      saveActiveTabState();
      if (appState.activeData) drawChart();
    });
    document.getElementById('y-split-height2').addEventListener('input', (e) => {
      document.getElementById('y-split-height2-val').textContent = e.target.value + '%';
      saveActiveTabState();
      if (appState.activeData) drawChart();
    });
  }
  
  container.querySelectorAll('input[type="number"]').forEach(input => {
    input.addEventListener('input', () => {
      saveActiveTabState();
      if (appState.activeData) drawChart();
    });
  });
}

// Render the palette choices in the sidebar dropdown
function renderPalettePicker() {
  if (!DOM.paletteSelect) return;
  DOM.paletteSelect.innerHTML = '';
  
  const bulkPaletteSelect = document.getElementById('bulk-manual-palette');
  if (bulkPaletteSelect) {
    bulkPaletteSelect.innerHTML = '<option value="">-- Select Palette --</option>';
  }

  if (DOM.palette2Select) {
    DOM.palette2Select.innerHTML = '';
  }

  Object.keys(PALETTES).forEach(key => {
    const pal = PALETTES[key];
    const opt = document.createElement('option');
    opt.value = key;
    opt.textContent = pal.name;
    if (appState.selectedPalette === key) {
      opt.selected = true;
    }
    DOM.paletteSelect.appendChild(opt);

    if (DOM.palette2Select) {
      const opt2 = document.createElement('option');
      opt2.value = key;
      opt2.textContent = pal.name;
      const tab = getActiveTab();
      const currentPalette2 = (tab && tab.palette2) ? tab.palette2 : 'ggplot2';
      if (currentPalette2 === key) {
        opt2.selected = true;
      }
      DOM.palette2Select.appendChild(opt2);
    }

    if (bulkPaletteSelect) {
      const optBulk = document.createElement('option');
      optBulk.value = key;
      optBulk.textContent = pal.name;
      bulkPaletteSelect.appendChild(optBulk);
    }
  });
  updatePalettePreviewBar();
  updatePalette2PreviewBar();
}

function updatePalettePreviewBar() {
  const previewBar = document.getElementById('palette-preview-bar');
  if (!previewBar) return;
  previewBar.innerHTML = '';
  const key = appState.selectedPalette || 'ggplot2';
  const pal = PALETTES[key];
  if (pal && pal.colors) {
    pal.colors.slice(0, 15).forEach(c => {
      const block = document.createElement('div');
      block.style.flex = '1';
      block.style.backgroundColor = c;
      previewBar.appendChild(block);
    });
  }
}

function updatePalette2PreviewBar() {
  const previewBar = document.getElementById('palette2-preview-bar');
  if (!previewBar) return;
  previewBar.innerHTML = '';
  const tab = getActiveTab();
  const key = (tab && tab.palette2) || 'ggplot2';
  const pal = PALETTES[key];
  if (pal && pal.colors) {
    pal.colors.slice(0, 15).forEach(c => {
      const block = document.createElement('div');
      block.style.flex = '1';
      block.style.backgroundColor = c;
      previewBar.appendChild(block);
    });
  }
}

// 5. Event Listeners Setup
function setupEventListeners() {
  // Trigger file input click when upload zone is clicked
  DOM.uploadZone.addEventListener('click', () => {
    DOM.fileInput.click();
  });

  // Drag & drop file upload
  DOM.uploadZone.addEventListener('dragenter', (e) => {
    e.preventDefault();
    e.stopPropagation();
    DOM.uploadZone.classList.add('dragover');
  });

  DOM.uploadZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
    DOM.uploadZone.classList.add('dragover');
  });

  DOM.uploadZone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    e.stopPropagation();
    DOM.uploadZone.classList.remove('dragover');
  });

  DOM.uploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    e.stopPropagation();
    DOM.uploadZone.classList.remove('dragover');
    if (e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  });

  DOM.fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  });

  // Chart type card selection
  DOM.chartTypeGrid.addEventListener('click', (e) => {
    const card = e.target.closest('.chart-card');
    if (!card) return;
    document.querySelectorAll('.chart-card').forEach(c => c.classList.remove('active'));
    card.classList.add('active');
    appState.currentChartType = card.dataset.chart;
    updateColumnMappingInputs(appState.currentChartType);
    if (appState.activeData) drawChart();
  });

  // Controls triggers
  [DOM.xSelect, DOM.groupSelect].forEach(select => {
    select.addEventListener('change', () => {
      if (select === DOM.groupSelect) {
        updateGroupCheckboxes();
      }
      updateManualStylesList();
      updateStatsGroupsList();
      saveActiveTabState();
      recommendStatisticalTest();
      if (appState.activeData) drawChart();
    });
  });

  // Dynamic Y selectors action buttons
  const btnAddY1Col = document.getElementById('btn-add-y1-col');
  if (btnAddY1Col) {
    btnAddY1Col.addEventListener('click', () => {
      const container = document.getElementById('y1-cols-container');
      if (container) {
        const headers = appState.activeData ? appState.activeData.headers : [];
        const defaultCol = headers.length > 1 ? headers[1] : (headers[0] || '');
        const row = createYColRow(false, defaultCol);
        container.appendChild(row);
        updateRemoveButtonsVisibility(false);
        saveActiveTabState();
        updateManualStylesList();
        if (appState.activeData) drawChart();
      }
    });
  }

  const btnAddY2Col = document.getElementById('btn-add-y2-col');
  if (btnAddY2Col) {
    btnAddY2Col.addEventListener('click', () => {
      const container = document.getElementById('y2-cols-container');
      if (container) {
        const headers = appState.activeData ? appState.activeData.headers : [];
        const defaultCol = headers.length > 1 ? headers[1] : (headers[0] || '');
        const row = createYColRow(true, defaultCol);
        container.appendChild(row);
        updateRemoveButtonsVisibility(true);
        saveActiveTabState();
        updateManualStylesList();
        if (appState.activeData) drawChart();
      }
    });
  }

  const btnAddY2Axis = document.getElementById('btn-add-y2-axis');
  if (btnAddY2Axis) {
    btnAddY2Axis.addEventListener('click', () => {
      const tab = getActiveTab();
      if (tab) {
        tab.hasY2Axis = true;
        renderYColsUI();
        toggleSecondaryYAxisStyles();
        saveActiveTabState();
        updateManualStylesList();
        if (appState.activeData) drawChart();
      }
    });
  }

  const btnRemoveY2Axis = document.getElementById('btn-remove-y2-axis');
  if (btnRemoveY2Axis) {
    btnRemoveY2Axis.addEventListener('click', () => {
      const tab = getActiveTab();
      if (tab) {
        tab.hasY2Axis = false;
        tab.y2Cols = [];
        renderYColsUI();
        toggleSecondaryYAxisStyles();
        saveActiveTabState();
        updateManualStylesList();
        if (appState.activeData) drawChart();
      }
    });
  }

  // Style sliders triggers
  DOM.pointSize.addEventListener('input', (e) => {
    DOM.pointSizeVal.textContent = e.target.value;
    saveActiveTabState();
    if (appState.activeData) drawChart();
  });
  DOM.lineWidth.addEventListener('input', (e) => {
    DOM.lineWidthVal.textContent = e.target.value;
    saveActiveTabState();
    if (appState.activeData) drawChart();
  });
  DOM.barPadding.addEventListener('input', (e) => {
    DOM.barPaddingVal.textContent = e.target.value + '%';
    saveActiveTabState();
    if (appState.activeData) drawChart();
  });
  DOM.boxWidth.addEventListener('input', (e) => {
    DOM.boxWidthVal.textContent = e.target.value + '%';
    saveActiveTabState();
    if (appState.activeData) drawChart();
  });

  DOM.plotWidth.addEventListener('input', (e) => {
    DOM.plotWidthVal.textContent = e.target.value + ' cm';
    saveActiveTabState();
    if (appState.activeData) drawChart();
  });

  DOM.plotHeight.addEventListener('input', (e) => {
    DOM.plotHeightVal.textContent = e.target.value + ' cm';
    saveActiveTabState();
    if (appState.activeData) drawChart();
  });

  DOM.xAxisShowLabels.addEventListener('change', () => {
    saveActiveTabState();
    if (appState.activeData) drawChart();
  });
  DOM.xAxisLabelRotate.addEventListener('input', (e) => {
    DOM.xAxisLabelRotateVal.textContent = e.target.value + '°';
    saveActiveTabState();
    if (appState.activeData) drawChart();
  });

  const legDistSlider = document.getElementById('legend-distance-slider');
  const legDistVal = document.getElementById('legend-distance-val');
  if (legDistSlider && legDistVal) {
    legDistSlider.addEventListener('input', (e) => {
      legDistVal.textContent = e.target.value + ' cm';
      saveActiveTabState();
      if (appState.activeData) drawChart();
    });
  }

  DOM.paletteSelect.addEventListener('change', (e) => {
    appState.selectedPalette = e.target.value;
    updatePalettePreviewBar();
    saveActiveTabState();
    if (appState.activeData) drawChart();
  });

  if (DOM.palette2Select) {
    DOM.palette2Select.addEventListener('change', (e) => {
      const tab = getActiveTab();
      if (tab) tab.palette2 = e.target.value;
      updatePalette2PreviewBar();
      saveActiveTabState();
      if (appState.activeData) drawChart();
    });
  }

  if (DOM.pointSize2) {
    DOM.pointSize2.addEventListener('input', (e) => {
      if (DOM.pointSize2Val) DOM.pointSize2Val.textContent = e.target.value;
      saveActiveTabState();
      if (appState.activeData) drawChart();
    });
  }

  const pointShape2Select = document.getElementById('point-shape-2-select');
  if (pointShape2Select) {
    pointShape2Select.addEventListener('change', () => {
      saveActiveTabState();
      if (appState.activeData) drawChart();
    });
  }

  document.getElementById('stats-method-select').addEventListener('change', () => {
    runStatisticalTest();
  });

  document.getElementById('stats-filter-col').addEventListener('change', () => {
    updateStatsFilterValues();
    runStatisticalTest();
  });

  document.getElementById('stats-filter-val').addEventListener('change', () => {
    runStatisticalTest();
  });
  
  // Stats comparison type toggles reference group container
  const compType = document.getElementById('stats-comparison-type');
  if (compType) {
    compType.addEventListener('change', () => {
      const refContainer = document.getElementById('stats-reference-group-container');
      if (refContainer) {
        refContainer.style.display = compType.value === 'vs_control' ? 'flex' : 'none';
      }
    });
  }

  // Legend position change triggers chart redraw
  document.getElementById('legend-position-select').addEventListener('change', () => {
    saveActiveTabState();
    if (appState.activeData) drawChart();
  });

  // Y-axis customization listeners
  const yScaleSelect = document.getElementById('y-axis-scale-type');
  if (yScaleSelect) {
    yScaleSelect.addEventListener('change', () => {
      saveActiveTabState();
      if (appState.activeData) drawChart();
    });
  }
  const yFormatSelect = document.getElementById('y-axis-num-format');
  if (yFormatSelect) {
    yFormatSelect.addEventListener('change', () => {
      saveActiveTabState();
      if (appState.activeData) drawChart();
    });
  }
  const ySplitSelect = document.getElementById('y-axis-split-mode');
  if (ySplitSelect) {
    ySplitSelect.addEventListener('change', (e) => {
      renderYSplitControls(e.target.value);
      saveActiveTabState();
      if (appState.activeData) drawChart();
    });
  }

  // Individual curves checkbox triggers chart redraw
  document.getElementById('individual-curves-checkbox').addEventListener('change', () => {
    saveActiveTabState();
    if (appState.activeData) drawChart();
  });

  // Add guide line click listener
  document.getElementById('btn-add-guideline').addEventListener('click', () => {
    const axis = document.getElementById('guideline-axis-select').value;
    const valueVal = parseFloat(document.getElementById('guideline-value-input').value);
    const label = document.getElementById('guideline-label-input').value;
    const color = document.getElementById('guideline-color-picker').value;
    const style = document.getElementById('guideline-style-select').value;
    const symbol = document.getElementById('guideline-symbol-select').value;
    const widthVal = parseInt(document.getElementById('guideline-width-input').value, 10) || 2;
    
    if (isNaN(valueVal)) {
      alert('Please enter a valid numeric value for the guide line.');
      return;
    }
    
    const tab = getActiveTab();
    if (!tab) return;
    
    if (!tab.markingLines) {
      tab.markingLines = [];
    }
    
    const newLine = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
      axis: axis,
      value: valueVal,
      label: label,
      color: color,
      style: style,
      symbol: symbol,
      width: widthVal
    };
    
    tab.markingLines.push(newLine);
    saveActiveTabState();
    renderGuideLinesList();
    
    // Clear inputs
    document.getElementById('guideline-value-input').value = '';
    document.getElementById('guideline-label-input').value = '';
    
    if (appState.activeData) drawChart();
  });
  
  DOM.fontSelect.addEventListener('change', () => { saveActiveTabState(); if (appState.activeData) drawChart(); });
  DOM.themeSelect.addEventListener('change', () => {
    const theme = DOM.themeSelect.value;
    if (theme === 'dark') {
      document.getElementById('title-font-color').value = '#f8fafc';
      document.getElementById('axis-title-font-color').value = '#f8fafc';
      document.getElementById('axis-value-font-color').value = '#cbd5e1';
      document.getElementById('legend-font-color').value = '#cbd5e1';
    } else {
      document.getElementById('title-font-color').value = '#334155';
      document.getElementById('axis-title-font-color').value = '#334155';
      document.getElementById('axis-value-font-color').value = '#475569';
      document.getElementById('legend-font-color').value = '#475569';
    }
    saveActiveTabState();
    if (appState.activeData) drawChart();
  });
  DOM.gridX.addEventListener('change', () => { saveActiveTabState(); if (appState.activeData) drawChart(); });
  DOM.gridY.addEventListener('change', () => { saveActiveTabState(); if (appState.activeData) drawChart(); });

  DOM.btnDraw.addEventListener('click', () => { if (appState.activeData) drawChart(); });

  // Sheet switching
  DOM.sheetSelect.addEventListener('change', (e) => {
    const sheetName = e.target.value;
    switchActiveSheet(sheetName);
    saveActiveTabState();
  });

  // Window Resize
  window.addEventListener('resize', () => {
    if (appState.chartInstance) appState.chartInstance.resize();
    alignSvgLayer();
  });

  // Exporters
  DOM.exportPng.addEventListener('click', () => exportImage('png'));
  DOM.exportJpg.addEventListener('click', () => exportImage('jpeg'));
  DOM.exportSvg.addEventListener('click', exportSVGFile);
  DOM.exportPzfx.addEventListener('click', exportPZFXFile);
  DOM.exportPrism.addEventListener('click', exportPRISMFile);
  DOM.copyClipboard.addEventListener('click', copyChartToClipboard);

  // Group splitting and overlay toggles
  document.getElementById('group-tabs-checkbox').addEventListener('change', () => {
    saveActiveTabState();
    drawChart();
  });
  
  document.getElementById('show-points-checkbox').addEventListener('change', () => {
    saveActiveTabState();
    drawChart();
  });
  
  document.getElementById('show-mean-checkbox').addEventListener('change', () => {
    saveActiveTabState();
    drawChart();
  });
  
  document.getElementById('error-bar-select').addEventListener('change', () => {
    saveActiveTabState();
    drawChart();
  });
  
  // Quick Title Editor
  ['chart-title-input', 'chart-xlabel-input', 'chart-ylabel-input', 'chart-y2label-input'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', () => {
        saveActiveTabState();
        drawChart();
      });
    }
  });
  
  // Stats buttons
  document.getElementById('btn-run-stats').addEventListener('click', runStatisticalTest);
  document.getElementById('btn-add-sig-bar').addEventListener('click', addSignificanceBar);

  // Add chart filter button
  const addFilterBtn = document.getElementById('btn-add-chart-filter');
  if (addFilterBtn) {
    addFilterBtn.addEventListener('click', () => {
      addChartFilterRow();
      saveActiveTabState();
      if (appState.activeData) drawChart();
    });
  }

  // Font style event listeners
  ['title-font-size', 'title-font-color', 'axis-title-font-size', 'axis-title-font-color',
   'axis-value-font-size', 'axis-value-font-color', 'legend-font-size', 'legend-font-color'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', () => {
        saveActiveTabState();
        if (appState.activeData) drawChart();
      });
    }
  });
  // Point Shape Change
  const pointShapeSelect = document.getElementById('point-shape-select');
  if (pointShapeSelect) {
    pointShapeSelect.addEventListener('change', () => {
      saveActiveTabState();
      if (appState.activeData) drawChart();
    });
  }

  // Axis Limits Inputs Changes
  ['axis-xmin', 'axis-xmax', 'axis-ymin', 'axis-ymax', 'axis-y2min', 'axis-y2max'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', () => {
        saveActiveTabState();
        if (appState.activeData) drawChart();
      });
    }
  });

  // Restore Defaults click listener
  const btnRestoreFont = document.getElementById('btn-restore-font-defaults');
  if (btnRestoreFont) {
    btnRestoreFont.addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById('title-font-size').value = 16;
      document.getElementById('axis-title-font-size').value = 13;
      document.getElementById('axis-value-font-size').value = 12;
      document.getElementById('legend-font-size').value = 12;
      
      const theme = DOM.themeSelect.value;
      if (theme === 'dark') {
        document.getElementById('title-font-color').value = '#f8fafc';
        document.getElementById('axis-title-font-color').value = '#f8fafc';
        document.getElementById('axis-value-font-color').value = '#cbd5e1';
        document.getElementById('legend-font-color').value = '#cbd5e1';
      } else {
        document.getElementById('title-font-color').value = '#334155';
        document.getElementById('axis-title-font-color').value = '#334155';
        document.getElementById('axis-value-font-color').value = '#475569';
        document.getElementById('legend-font-color').value = '#475569';
      }
      
      saveActiveTabState();
      if (appState.activeData) drawChart();
    });
  }

  // Style Templates listeners
  const btnSaveTemplate = document.getElementById('btn-save-template');
  if (btnSaveTemplate) {
    btnSaveTemplate.addEventListener('click', (e) => {
      e.preventDefault();
      const name = document.getElementById('template-name-input').value;
      saveStyleTemplate(name);
    });
  }

  const btnDeleteTemplate = document.getElementById('btn-delete-template');
  if (btnDeleteTemplate) {
    btnDeleteTemplate.addEventListener('click', (e) => {
      e.preventDefault();
      const select = document.getElementById('template-select');
      if (select && select.value) {
        deleteStyleTemplate(select.value);
      } else {
        alert('Please select a template to delete.');
      }
    });
  }

  const templateSelect = document.getElementById('template-select');
  if (templateSelect) {
    templateSelect.addEventListener('change', () => {
      if (templateSelect.value) {
        applyStyleTemplate(templateSelect.value);
      }
    });
  }

  // Manual styling checkbox and bulk apply button
  const manualStyleCheckbox = document.getElementById('manual-style-checkbox');
  if (manualStyleCheckbox) {
    manualStyleCheckbox.addEventListener('change', () => {
      updateManualStylesList();
      saveActiveTabState();
      if (appState.activeData) drawChart();
    });
  }

  const btnApplyBulkStyle = document.getElementById('btn-apply-bulk-style');
  if (btnApplyBulkStyle) {
    btnApplyBulkStyle.addEventListener('click', (e) => {
      e.preventDefault();
      const bulkColor = document.getElementById('bulk-manual-color').value;
      const bulkPalette = document.getElementById('bulk-manual-palette').value;
      const bulkShape = document.getElementById('bulk-manual-shape').value;
      
      const rows = Array.from(document.querySelectorAll('#manual-styles-list .manual-style-row'));
      const checkedRows = rows.filter(row => {
        const cb = row.querySelector('.manual-target-enable');
        return cb && cb.checked;
      });

      if (checkedRows.length === 0) {
        alert('Please check at least one group in the list below to apply styles.');
        return;
      }

      let changed = false;

      if (bulkPalette && PALETTES[bulkPalette]) {
        const colors = PALETTES[bulkPalette].colors;
        checkedRows.forEach((row, idx) => {
          const cp = row.querySelector('.manual-target-color');
          const ss = row.querySelector('.manual-target-shape');
          if (cp) {
            cp.value = colors[idx % colors.length];
          }
          if (ss && bulkShape) {
            ss.value = bulkShape;
          }
          changed = true;
        });
      } else {
        checkedRows.forEach(row => {
          const cp = row.querySelector('.manual-target-color');
          const ss = row.querySelector('.manual-target-shape');
          if (cp && bulkColor) cp.value = bulkColor;
          if (ss && bulkShape) ss.value = bulkShape;
          changed = true;
        });
      }

      if (changed) {
        saveActiveTabState();
        if (appState.activeData) drawChart();
      }
    });
  }

  // Tab buttons
  document.getElementById('add-chart-tab').addEventListener('click', () => {
    saveActiveTabState();
    createChartTab();
  });
}

// 6. File Handler Routing
function handleFile(file) {
  appState.activeFile = file;
  appState.activeFileName = file.name;
  
  const extension = file.name.split('.').pop().toLowerCase();
  const reader = new FileReader();

  if (extension === 'csv') {
    reader.onload = function(e) {
      parseCSV(e.target.result);
    };
    reader.readAsText(file);
  } else if (extension === 'xlsx' || extension === 'xls') {
    reader.onload = function(e) {
      parseXLSX(e.target.result);
    };
    reader.readAsArrayBuffer(file);
  } else if (extension === 'md') {
    reader.onload = function(e) {
      parseMarkdownTable(e.target.result);
    };
    reader.readAsText(file);
  } else if (extension === 'pzfx') {
    reader.onload = function(e) {
      parsePZFX(e.target.result);
    };
    reader.readAsText(file);
  } else if (extension === 'prism') {
    reader.onload = function(e) {
      parsePRISM(e.target.result);
    };
    reader.readAsArrayBuffer(file);
  } else {
    alert('Unsupported file extension. Please load CSV, XLSX, MD, PZFX, or PRISM.');
  }
}

// Set up UI states after file loading
function onFileLoadSuccess(sheetsMap) {
  appState.sheets = sheetsMap;
  
  // Set sheet selector options
  const sheetNames = Object.keys(sheetsMap);
  DOM.sheetSelect.innerHTML = '';
  sheetNames.forEach(name => {
    const opt = document.createElement('option');
    opt.value = name;
    opt.textContent = name;
    DOM.sheetSelect.appendChild(opt);
  });

  if (sheetNames.length > 1) {
    DOM.sheetSelectorGroup.style.display = 'flex';
  } else {
    DOM.sheetSelectorGroup.style.display = 'none';
  }

  // Reset tabs
  appState.savedCharts = [];
  appState.activeChartId = null;

  // Switch to the first sheet
  switchActiveSheet(sheetNames[0]);
  
  // Create first chart tab
  createChartTab("Chart 1");

  // Unlock UI Panels
  DOM.fileStatusBadge.classList.add('loaded');
  DOM.fileStatusText.textContent = appState.activeFileName;
  DOM.mappingSection.style.opacity = '1';
  DOM.mappingSection.style.pointerEvents = 'auto';
  DOM.plotSection.style.opacity = '1';
  DOM.plotSection.style.pointerEvents = 'auto';
  DOM.btnDraw.style.display = 'flex';
  DOM.placeholderView.style.display = 'none';
  
  // Show toolbars and stats section
  document.getElementById('quick-title-editor').style.display = 'flex';
  document.getElementById('annotation-toolbar').style.display = 'flex';
  document.getElementById('stats-section').style.opacity = '1';
  document.getElementById('stats-section').style.pointerEvents = 'auto';

  // Enable download buttons
  [DOM.exportPng, DOM.exportJpg, DOM.exportSvg, DOM.exportPzfx, DOM.exportPrism, DOM.copyClipboard].forEach(btn => {
    btn.removeAttribute('disabled');
  });
}

function switchActiveSheet(sheetName) {
  appState.columnFilters = {}; // Reset filters on switch
  appState.activeSheetName = sheetName;
  appState.activeData = appState.sheets[sheetName];
  
  // Update Grid preview
  updateDataGrid();

  // Update Variable dropdowns
  updateMappingDropdowns();

  // Draw chart automatically
  drawChart();
}

// Update Table headers and data rows in grid
function updateDataGrid() {
  const data = appState.activeData;
  if (!data) return;

  // Clear headers
  DOM.tableHeaders.innerHTML = '';
  
  // Find or create filters row
  let filterRow = document.getElementById('table-filters-row');
  if (!filterRow) {
    filterRow = document.createElement('tr');
    filterRow.id = 'table-filters-row';
    DOM.tableHeaders.parentNode.insertBefore(filterRow, DOM.tableHeaders.nextSibling);
  }
  filterRow.innerHTML = '';

  data.headers.forEach(h => {
    // Header cell
    const th = document.createElement('th');
    th.textContent = h;
    DOM.tableHeaders.appendChild(th);

    // Filter cell
    const thFilter = document.createElement('th');
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = `Filter ${h}...`;
    input.className = 'column-filter-input';
    
    if (appState.columnFilters && appState.columnFilters[h]) {
      input.value = appState.columnFilters[h];
    }
    
    input.addEventListener('input', (e) => {
      if (!appState.columnFilters) appState.columnFilters = {};
      appState.columnFilters[h] = e.target.value;
      
      // Update body and redraw chart
      renderTableBodyOnly();
      drawChart();
    });
    
    thFilter.appendChild(input);
    filterRow.appendChild(thFilter);
  });

  renderTableBodyOnly();
}

function renderTableBodyOnly() {
  const data = appState.activeData;
  if (!data) return;
  
  const filteredRows = getFilteredRows();
  DOM.gridStats.textContent = `${filteredRows.length} of ${data.rows.length} Rows | ${data.headers.length} Columns`;
  
  DOM.tableBody.innerHTML = '';
  const rowsToRender = filteredRows.slice(0, 100);
  rowsToRender.forEach((row, rowIdx) => {
    const tr = document.createElement('tr');
    data.headers.forEach(h => {
      const td = document.createElement('td');
      td.textContent = row[h] !== undefined ? row[h] : '';
      td.contentEditable = "true";
      
      // Update cell content on edit and refresh chart
      td.addEventListener('blur', (e) => {
        const newVal = coerceNumber(e.target.textContent.trim());
        row[h] = newVal;
        drawChart();
      });

      tr.appendChild(td);
    });
    DOM.tableBody.appendChild(tr);
  });

  if (filteredRows.length > 100) {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td colspan="${data.headers.length}" style="text-align: center; color: var(--text-muted); font-style: italic; padding: 10px 0;">Previewing first 100 rows. Total filtered: ${filteredRows.length}</td>`;
    DOM.tableBody.appendChild(tr);
  }
}

// Update Dropdowns
function updateMappingDropdowns() {
  const headers = appState.activeData ? appState.activeData.headers : [];
  
  // Clear select elements
  DOM.xSelect.innerHTML = '';
  DOM.groupSelect.innerHTML = '<option value="">-- No Grouping --</option>';

  headers.forEach((h) => {
    const optX = document.createElement('option');
    optX.value = h;
    optX.textContent = h;
    DOM.xSelect.appendChild(optX);

    const optG = document.createElement('option');
    optG.value = h;
    optG.textContent = h;
    DOM.groupSelect.appendChild(optG);
  });

  // Also update any active chart filter column selects
  document.querySelectorAll('.chart-filter-col').forEach(colSelect => {
    const selectedVal = colSelect.value;
    colSelect.innerHTML = '';
    headers.forEach(h => {
      const opt = document.createElement('option');
      opt.value = h;
      opt.textContent = h;
      if (h === selectedVal) opt.selected = true;
      colSelect.appendChild(opt);
    });
  });

  // Populate Stats Filter Column Dropdown
  const statsFilterCol = document.getElementById('stats-filter-col');
  if (statsFilterCol) {
    statsFilterCol.innerHTML = '<option value="">-- No Filter --</option>';
    headers.forEach(h => {
      const opt = document.createElement('option');
      opt.value = h;
      opt.textContent = h;
      statsFilterCol.appendChild(opt);
    });
    statsFilterCol.value = '';
    const statsFilterVal = document.getElementById('stats-filter-val');
    if (statsFilterVal) statsFilterVal.value = '';
  }
  updateStatsGroupsList();

  // Sensible default selections
  if (headers.length > 0) DOM.xSelect.value = headers[0];
  
  const tab = getActiveTab();
  if (tab) {
    if (headers.length > 1) {
      tab.yCols = [headers[1]];
    } else if (headers.length > 0) {
      tab.yCols = [headers[0]];
    }
    tab.y2Cols = [];
    tab.hasY2Axis = false;
  }

  renderYColsUI();

  updateStatsFilterValues();
  updateColumnMappingInputs(appState.currentChartType);
  updateManualStylesList();
}

function getYCols() {
  const container = document.getElementById('y1-cols-container');
  if (!container) return [];
  const selects = container.querySelectorAll('.y1-col-select');
  return Array.from(selects).map(sel => sel.value).filter(val => val !== '');
}

function getY2Cols() {
  const tab = getActiveTab();
  if (!tab || !tab.hasY2Axis) return [];
  const container = document.getElementById('y2-cols-container');
  if (!container) return [];
  const selects = container.querySelectorAll('.y2-col-select');
  return Array.from(selects).map(sel => sel.value).filter(val => val !== '');
}

function updateRemoveButtonsVisibility(isY2) {
  const container = document.getElementById(isY2 ? 'y2-cols-container' : 'y1-cols-container');
  if (!container) return;
  const rows = container.querySelectorAll(isY2 ? '.y2-col-row' : '.y1-col-row');
  rows.forEach(row => {
    const btn = row.querySelector('button');
    if (btn) {
      btn.style.display = rows.length > 1 ? 'flex' : 'none';
    }
  });
}

function createYColRow(isY2, selectedValue) {
  const headers = appState.activeData ? appState.activeData.headers : [];
  const row = document.createElement('div');
  row.className = isY2 ? 'y2-col-row' : 'y1-col-row';
  row.style.cssText = 'display: flex; gap: 6px; align-items: center; width: 100%;';

  const select = document.createElement('select');
  select.className = isY2 ? 'form-select y2-col-select' : 'form-select y1-col-select';
  select.style.cssText = 'flex: 1;';

  headers.forEach(h => {
    const opt = document.createElement('option');
    opt.value = h;
    opt.textContent = h;
    if (h === selectedValue) opt.selected = true;
    select.appendChild(opt);
  });

  if (!selectedValue && headers.length > 0) {
    select.value = headers[0];
  }

  select.addEventListener('change', () => {
    saveActiveTabState();
    updateManualStylesList();
    if (appState.activeData) drawChart();
  });

  const removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.className = 'btn btn-icon';
  removeBtn.style.cssText = 'padding: 4px; border: none; background: none; cursor: pointer; display: flex; align-items: center; justify-content: center;';
  removeBtn.innerHTML = '<i data-lucide="x" style="width: 14px; height: 14px; color: var(--text-muted);"></i>';
  
  removeBtn.addEventListener('click', () => {
    row.remove();
    updateRemoveButtonsVisibility(isY2);
    saveActiveTabState();
    updateManualStylesList();
    if (appState.activeData) drawChart();
  });

  row.appendChild(select);
  row.appendChild(removeBtn);

  if (window.lucide) {
    setTimeout(() => {
      lucide.createIcons({
        attrs: { class: 'lucide-icon' },
        nameAttr: 'data-lucide'
      });
    }, 10);
  }

  return row;
}

function renderYColsUI() {
  const tab = getActiveTab();
  const y1Container = document.getElementById('y1-cols-container');
  const y2Container = document.getElementById('y2-cols-container');
  const y2Group = document.getElementById('y2-axis-group');
  const addY2Container = document.getElementById('add-y2-btn-container');

  if (!y1Container) return;

  const headers = appState.activeData ? appState.activeData.headers : [];

  // Render Y1
  y1Container.innerHTML = '';
  const yCols = (tab && tab.yCols) ? tab.yCols : [];
  if (yCols.length === 0) {
    let defaultCol = headers[0] || '';
    if (headers.length > 1) {
      defaultCol = headers[1];
    }
    const row = createYColRow(false, defaultCol);
    y1Container.appendChild(row);
  } else {
    yCols.forEach(col => {
      const row = createYColRow(false, col);
      y1Container.appendChild(row);
    });
  }
  updateRemoveButtonsVisibility(false);

  // Render Y2
  if (y2Container && y2Group) {
    const hasY2Axis = (tab && tab.hasY2Axis) || false;
    const chartType = tab ? tab.chartType : appState.currentChartType;
    const isY2Supported = chartType !== 'pie' && chartType !== 'histogram' && chartType !== 'heatmap';

    if (hasY2Axis && isY2Supported) {
      y2Group.style.display = 'block';
      if (addY2Container) addY2Container.style.display = 'none';

      y2Container.innerHTML = '';
      const y2Cols = (tab && tab.y2Cols) ? tab.y2Cols : [];
      if (y2Cols.length === 0) {
        let defaultCol = headers[0] || '';
        if (headers.length > 1) {
          defaultCol = headers[1];
        }
        const row = createYColRow(true, defaultCol);
        y2Container.appendChild(row);
      } else {
        y2Cols.forEach(col => {
          const row = createYColRow(true, col);
          y2Container.appendChild(row);
        });
      }
      updateRemoveButtonsVisibility(true);
    } else {
      y2Group.style.display = 'none';
      if (addY2Container) addY2Container.style.display = isY2Supported ? 'block' : 'none';
      y2Container.innerHTML = '';
    }
  }
}

// Add filter row dynamically inside Column Mapping Data Filters
function addChartFilterRow(colName = '', operator = '=', value = '') {
  const container = document.getElementById('chart-filters-container');
  const data = appState.activeData;
  if (!data) return;
  
  const row = document.createElement('div');
  row.className = 'chart-filter-row';
  row.style = 'display: flex; gap: 4px; align-items: center; background: rgba(0,0,0,0.15); padding: 4px; border-radius: var(--radius-sm); margin-top: 4px;';
  
  // 1. Column select
  const colSelect = document.createElement('select');
  colSelect.className = 'form-select chart-filter-col';
  colSelect.style = 'font-size: 11px; padding: 2px; flex: 2; height: auto; min-width: 0;';
  data.headers.forEach(h => {
    const opt = document.createElement('option');
    opt.value = h;
    opt.textContent = h;
    if (h === colName) opt.selected = true;
    colSelect.appendChild(opt);
  });
  
  // 2. Operator select
  const opSelect = document.createElement('select');
  opSelect.className = 'form-select chart-filter-op';
  opSelect.style = 'font-size: 11px; padding: 2px; flex: 1.5; height: auto; min-width: 0;';
  const ops = [
    { value: '=', label: '=' },
    { value: '!=', label: '≠' },
    { value: '>', label: '>' },
    { value: '>=', label: '≥' },
    { value: '<', label: '<' },
    { value: '<=', label: '≤' },
    { value: 'contains', label: 'contains' },
    { value: 'not_contains', label: 'not contains' }
  ];
  ops.forEach(op => {
    const opt = document.createElement('option');
    opt.value = op.value;
    opt.textContent = op.label;
    if (op.value === operator) opt.selected = true;
    opSelect.appendChild(opt);
  });
  
  // 3. Value input
  const valInput = document.createElement('input');
  valInput.type = 'text';
  valInput.className = 'form-input chart-filter-val';
  valInput.placeholder = 'Value';
  valInput.value = value;
  valInput.style = 'font-size: 11px; padding: 2px 4px; flex: 2; min-width: 0; height: auto;';
  
  // 4. Remove button
  const removeBtn = document.createElement('button');
  removeBtn.className = 'btn btn-secondary';
  removeBtn.style = 'padding: 2px 4px; font-size: 11px; height: auto; display: flex; align-items: center; justify-content: center; border-radius: var(--radius-sm);';
  removeBtn.innerHTML = '✕';
  removeBtn.title = 'Remove Filter';
  removeBtn.addEventListener('click', () => {
    row.remove();
    saveActiveTabState();
    if (appState.activeData) drawChart();
  });
  
  row.appendChild(colSelect);
  row.appendChild(opSelect);
  row.appendChild(valInput);
  row.appendChild(removeBtn);
  
  // Add change listeners to auto-draw/save on change
  [colSelect, opSelect].forEach(el => {
    el.addEventListener('change', () => {
      saveActiveTabState();
      if (appState.activeData) drawChart();
    });
  });
  valInput.addEventListener('input', () => {
    saveActiveTabState();
    if (appState.activeData) drawChart();
  });
  
  container.appendChild(row);
  return row;
}

// Evaluate both global data table filters and tab-specific mapping filters
function getPlotFilteredRows() {
  const rows = getFilteredRows();
  const filterRows = document.querySelectorAll('.chart-filter-row');
  if (filterRows.length === 0) return rows;
  
  return rows.filter(row => {
    return Array.from(filterRows).every(rowEl => {
      const col = rowEl.querySelector('.chart-filter-col').value;
      const op = rowEl.querySelector('.chart-filter-op').value;
      const val = rowEl.querySelector('.chart-filter-val').value.trim();
      
      if (val === '') return true; // ignore empty filter values
      
      const rawVal = row[col];
      if (rawVal === undefined || rawVal === null) return false;
      
      const valStr = String(rawVal);
      const valNum = parseFloat(rawVal);
      const filterNum = parseFloat(val);
      
      switch (op) {
        case '=':
          return (!isNaN(valNum) && !isNaN(filterNum)) ? valNum === filterNum : valStr.toLowerCase() === val.toLowerCase();
        case '!=':
          return (!isNaN(valNum) && !isNaN(filterNum)) ? valNum !== filterNum : valStr.toLowerCase() !== val.toLowerCase();
        case '>':
          return !isNaN(valNum) && !isNaN(filterNum) && valNum > filterNum;
        case '>=':
          return !isNaN(valNum) && !isNaN(filterNum) && valNum >= filterNum;
        case '<':
          return !isNaN(valNum) && !isNaN(filterNum) && valNum < filterNum;
        case '<=':
          return !isNaN(valNum) && !isNaN(filterNum) && valNum <= filterNum;
        case 'contains':
          return valStr.toLowerCase().includes(val.toLowerCase());
        case 'not_contains':
          return !valStr.toLowerCase().includes(val.toLowerCase());
        default:
          return true;
      }
    });
  });
}

// Helper to coerce value into numeric if possible
function coerceNumber(val) {
  if (val === null || val === undefined || val === '') return null;
  const num = Number(val);
  return isNaN(num) ? val : num;
}

// 7. Data Parsers Implementation

// CSV parser using PapaParse
function parseCSV(text) {
  Papa.parse(text, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
    complete: function(results) {
      if (results.data && results.data.length > 0) {
        const headers = Object.keys(results.data[0]);
        // Format rows as standard object records
        const rows = results.data;
        const sheets = {
          'CSV Dataset': { headers, rows }
        };
        onFileLoadSuccess(sheets);
      }
    }
  });
}

// Excel parser using SheetJS
function parseXLSX(dataBuffer) {
  const workbook = XLSX.read(new Uint8Array(dataBuffer), { type: 'array' });
  const sheets = {};
  
  workbook.SheetNames.forEach(sheetName => {
    const worksheet = workbook.Sheets[sheetName];
    const rawData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
    
    if (rawData.length > 0) {
      // Find all unique keys/headers
      const headers = [];
      rawData.forEach(row => {
        Object.keys(row).forEach(k => {
          if (!headers.includes(k)) headers.push(k);
        });
      });
      
      // Coerce numeric columns
      const rows = rawData.map(row => {
        const coerced = {};
        headers.forEach(h => {
          coerced[h] = coerceNumber(row[h]);
        });
        return coerced;
      });

      sheets[sheetName] = { headers, rows };
    }
  });

  if (Object.keys(sheets).length > 0) {
    onFileLoadSuccess(sheets);
  } else {
    alert('No data sheets found in Excel file.');
  }
}

// Markdown parser
function parseMarkdownTable(text) {
  const lines = text.split('\n').map(l => l.trim());
  let headers = [];
  const rows = [];

  let foundHeader = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.startsWith('|')) continue;
    
    // Split columns
    const cols = line.split('|').map(c => c.trim()).filter((c, idx, arr) => idx > 0 && idx < arr.length - 1);
    
    if (!foundHeader) {
      headers = cols;
      foundHeader = true;
      // Skip next line if it is a separator (e.g., |---|---|)
      if (i + 1 < lines.length && lines[i + 1].includes('-')) {
        i++;
      }
    } else {
      const row = {};
      headers.forEach((h, idx) => {
        row[h] = coerceNumber(cols[idx]);
      });
      rows.push(row);
    }
  }

  if (headers.length > 0) {
    onFileLoadSuccess({ 'Markdown Table': { headers, rows } });
  } else {
    alert('Could not parse any markdown table structure. Ensure rows start and end with "|" symbols.');
  }
}

// GraphPad Prism PZFX XML Parser
function parsePZFX(xmlText) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, "text/xml");
  const tableNodes = xmlDoc.getElementsByTagName("Table");
  const sheets = {};

  if (tableNodes.length === 0) {
    alert('No Table nodes found in PZFX XML document.');
    return;
  }

  for (let t = 0; t < tableNodes.length; t++) {
    const tableNode = tableNodes[t];
    const tableTitleNode = tableNode.getElementsByTagName("Title")[0];
    const tableTitle = tableTitleNode ? tableTitleNode.textContent : `Table_${t + 1}`;
    
    const rows = [];
    const headers = [];
    
    // Row titles if any
    const rowTitleNodes = tableNode.getElementsByTagName("RowTitlesColumn");
    let rowTitles = [];
    if (rowTitleNodes.length > 0) {
      const sub = rowTitleNodes[0].getElementsByTagName("Subcolumn")[0];
      if (sub) {
        const dNodes = sub.getElementsByTagName("d");
        for (let d = 0; d < dNodes.length; d++) {
          rowTitles.push(dNodes[d].textContent);
        }
      }
    }

    // X Column
    const xNodes = tableNode.getElementsByTagName("XColumn");
    let xValues = [];
    let xTitle = 'X Axis';
    if (xNodes.length > 0) {
      const titleNode = xNodes[0].getElementsByTagName("Title")[0];
      if (titleNode) xTitle = titleNode.textContent;
      
      const sub = xNodes[0].getElementsByTagName("Subcolumn")[0];
      if (sub) {
        const dNodes = sub.getElementsByTagName("d");
        for (let d = 0; d < dNodes.length; d++) {
          xValues.push(coerceNumber(dNodes[d].textContent));
        }
      }
    }

    // Y Columns
    const yNodes = tableNode.getElementsByTagName("YColumn");
    const yData = []; // Array of { title, subcolumns: [[]] }
    
    for (let y = 0; y < yNodes.length; y++) {
      const yNode = yNodes[y];
      const titleNode = yNode.getElementsByTagName("Title")[0];
      const yTitle = titleNode ? titleNode.textContent : `Y_Col_${y + 1}`;
      
      const subNodes = yNode.getElementsByTagName("Subcolumn");
      const subs = [];
      for (let s = 0; s < subNodes.length; s++) {
        const sub = subNodes[s];
        const dNodes = sub.getElementsByTagName("d");
        const vals = [];
        for (let d = 0; d < dNodes.length; d++) {
          // Check if excluded
          const dNode = dNodes[d];
          if (dNode.getAttribute("Excluded") === "1") {
            vals.push(null);
          } else {
            vals.push(coerceNumber(dNode.textContent));
          }
        }
        subs.push(vals);
      }
      yData.push({ title: yTitle, subcolumns: subs });
    }

    // Determine row count
    let rowCount = 0;
    if (rowTitles.length > rowCount) rowCount = rowTitles.length;
    if (xValues.length > rowCount) rowCount = xValues.length;
    yData.forEach(y => {
      y.subcolumns.forEach(sub => {
        if (sub.length > rowCount) rowCount = sub.length;
      });
    });

    // Build Headers
    if (rowTitles.length > 0) headers.push('RowTitle');
    if (xValues.length > 0) headers.push(xTitle);
    
    // Add Y headers. For multiple replicates, we can create multiple columns or flatten
    yData.forEach(y => {
      if (y.subcolumns.length === 1) {
        headers.push(y.title);
      } else {
        y.subcolumns.forEach((sub, subIdx) => {
          headers.push(`${y.title}_Rep_${subIdx + 1}`);
        });
      }
    });

    // Build Rows
    for (let r = 0; r < rowCount; r++) {
      const row = {};
      if (rowTitles.length > 0) row['RowTitle'] = rowTitles[r] || '';
      if (xValues.length > 0) row[xTitle] = xValues[r] !== undefined ? xValues[r] : null;
      
      yData.forEach(y => {
        if (y.subcolumns.length === 1) {
          row[y.title] = y.subcolumns[0][r] !== undefined ? y.subcolumns[0][r] : null;
        } else {
          y.subcolumns.forEach((sub, subIdx) => {
            row[`${y.title}_Rep_${subIdx + 1}`] = sub[r] !== undefined ? sub[r] : null;
          });
        }
      });
      rows.push(row);
    }

    sheets[tableTitle] = { headers, rows };
  }

  onFileLoadSuccess(sheets);
}

// GraphPad Prism V10+ ZIP format (.prism) Parser
function parsePRISM(dataBuffer) {
  JSZip.loadAsync(dataBuffer).then(zip => {
    // Scan all CSV files in the zip (located under data/tables/ or data/)
    const csvFiles = [];
    zip.forEach((relativePath, file) => {
      if (relativePath.endsWith('.csv') && !file.dir) {
        csvFiles.push({ path: relativePath, file: file });
      }
    });

    if (csvFiles.length === 0) {
      // Fallback: look for document.json to see files
      alert('Could not find raw data CSV tables inside .prism ZIP file.');
      return;
    }

    const sheets = {};
    let parsedCount = 0;

    csvFiles.forEach(item => {
      item.file.async('string').then(content => {
        // Strip path to get table name
        let name = item.path.split('/').pop().replace('.csv', '');
        
        Papa.parse(content, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          complete: function(results) {
            if (results.data && results.data.length > 0) {
              const headers = Object.keys(results.data[0]);
              sheets[name] = { headers, rows: results.data };
            }
            parsedCount++;
            if (parsedCount === csvFiles.length) {
              onFileLoadSuccess(sheets);
            }
          }
        });
      });
    });
  }).catch(err => {
    alert('Failed to extract .prism ZIP container: ' + err.message);
  });
}

function getPlotDimensions() {
  const plotWidthCm = parseFloat(DOM.plotWidth ? DOM.plotWidth.value : 15) || 15;
  const plotHeightCm = parseFloat(DOM.plotHeight ? DOM.plotHeight.value : 12) || 12;
  const legendPos = document.getElementById('legend-position-select').value;
  const legendDistSlider = document.getElementById('legend-distance-slider');
  const legendDistCm = legendDistSlider ? parseFloat(legendDistSlider.value) : 0.5;
  const legendDistPx = Math.round(legendDistCm * 37.8);

  const gridWidth = Math.round(plotWidthCm * 37.8);
  const gridHeight = Math.round(plotHeightCm * 37.8);

  // Dynamic Y-axis values length calculations to prevent overlap
  const yNumFormat = document.getElementById('y-axis-num-format') ? document.getElementById('y-axis-num-format').value : 'std';
  const axisValSize = parseInt(document.getElementById('axis-value-font-size') ? document.getElementById('axis-value-font-size').value : 12, 10) || 12;
  const axisTitleSize = parseInt(document.getElementById('axis-title-font-size') ? document.getElementById('axis-title-font-size').value : 13, 10) || 13;

  let maxYCharCount = 4;
  const formatLength = (val) => {
    if (val === null || val === undefined || isNaN(val)) return 0;
    let s = val.toString();
    const yNumFormat = document.getElementById('y-axis-num-format')?.value || 'std';
    if (yNumFormat === 'sci') {
      return 8;
    }
    if (s.includes('.')) {
      const parts = s.split('.');
      s = parts[0] + '.' + parts[1].substring(0, 2);
    }
    return s.length;
  };

  if (yNumFormat === 'sci') {
    maxYCharCount = 8;
  } else if (appState.activeData) {
    const yCols = getYCols();
    
    // Check manual Y-axis limits from DOM
    const yMinInput = document.getElementById('axis-ymin');
    const yMaxInput = document.getElementById('axis-ymax');
    const yMinVal = yMinInput && yMinInput.value !== '' ? parseFloat(yMinInput.value) : null;
    const yMaxVal = yMaxInput && yMaxInput.value !== '' ? parseFloat(yMaxInput.value) : null;

    let minVal = yMinVal;
    let maxVal = yMaxVal;

    if (minVal === null || maxVal === null) {
      const rows = typeof getPlotFilteredRows === 'function' ? getPlotFilteredRows() : appState.activeData.rows;
      let dataMin = Infinity;
      let dataMax = -Infinity;
      rows.forEach(r => {
        yCols.forEach(col => {
          const val = parseFloat(r[col]);
          if (!isNaN(val)) {
            if (val > dataMax) dataMax = val;
            if (val < dataMin) dataMin = val;
          }
        });
      });
      if (isFinite(dataMin) && isFinite(dataMax)) {
        if (minVal === null) minVal = dataMin;
        if (maxVal === null) maxVal = dataMax;
      }
    }

    if (minVal !== null && maxVal !== null) {
      const chartType = appState.currentChartType;
      if (chartType === 'bar') {
        if (minVal > 0) minVal = 0;
        if (maxVal < 0) maxVal = 0;
      }
      maxYCharCount = Math.max(formatLength(minVal), formatLength(maxVal), 4);
      maxYCharCount += 1; // buffer for tick/minus
    }
  }

  // Secondary Y-axis values length calculations
  let maxY2CharCount = 4;
  let dynamicNameGap2 = 30;
  let calculatedRight = 40;

  const y2Cols = getY2Cols();

  if (y2Cols.length > 0 && appState.activeData) {
    const y2MinInput = document.getElementById('axis-y2min');
    const y2MaxInput = document.getElementById('axis-y2max');
    const y2MinVal = y2MinInput && y2MinInput.value !== '' ? parseFloat(y2MinInput.value) : null;
    const y2MaxVal = y2MaxInput && y2MaxInput.value !== '' ? parseFloat(y2MaxInput.value) : null;

    let min2Val = y2MinVal;
    let max2Val = y2MaxVal;

    if (min2Val === null || max2Val === null) {
      const rows = typeof getPlotFilteredRows === 'function' ? getPlotFilteredRows() : appState.activeData.rows;
      let dataMin = Infinity;
      let dataMax = -Infinity;
      rows.forEach(r => {
        y2Cols.forEach(col => {
          const val = parseFloat(r[col]);
          if (!isNaN(val)) {
            if (val > dataMax) dataMax = val;
            if (val < dataMin) dataMin = val;
          }
        });
      });
      if (isFinite(dataMin) && isFinite(dataMax)) {
        if (min2Val === null) min2Val = dataMin;
        if (max2Val === null) max2Val = dataMax;
      }
    }

    if (yNumFormat === 'sci') {
      maxY2CharCount = 8;
    } else if (min2Val !== null && max2Val !== null) {
      const chartType = appState.currentChartType;
      if (chartType === 'bar') {
        if (min2Val > 0) min2Val = 0;
        if (max2Val < 0) max2Val = 0;
      }
      maxY2CharCount = Math.max(formatLength(min2Val), formatLength(max2Val), 4);
      maxY2CharCount += 1;
    }
    dynamicNameGap2 = Math.round(maxY2CharCount * (axisValSize * 0.55) + 8);
    calculatedRight = Math.round(dynamicNameGap2 + axisTitleSize + 10);
  }

  // Tighter nameGap and left margin calculation
  const dynamicNameGap = Math.round(maxYCharCount * (axisValSize * 0.55) + 8);
  const calculatedLeft = Math.round(dynamicNameGap + axisTitleSize + 10);

  // Calculate X-axis label height dynamically based on rotation
  let maxXCharCount = 0;
  if (appState.activeData) {
    const xCol = DOM.xSelect.value;
    const rows = appState.activeData.rows || [];
    const xVals = [...new Set(rows.map(r => String(r[xCol] || '')))];
    xVals.forEach(x => {
      if (x.length > maxXCharCount) maxXCharCount = x.length;
    });
  }
  const showLabels = DOM.xAxisShowLabels ? DOM.xAxisShowLabels.checked : true;
  const rotateAngle = DOM.xAxisLabelRotate ? parseInt(DOM.xAxisLabelRotate.value, 10) : 0;
  
  let xLabelHeight = 0;
  if (showLabels) {
    const rotateRad = (rotateAngle * Math.PI) / 180;
    const labelLengthEst = maxXCharCount * (axisValSize * 0.55);
    xLabelHeight = Math.round(Math.abs(Math.sin(rotateRad) * labelLengthEst) + Math.abs(Math.cos(rotateRad) * axisValSize) + 8);
  }
  let gridBottom = Math.max(45, xLabelHeight + 25);

  // Define paddings - expanded dynamically
  let gridLeft = Math.max(65, calculatedLeft);
  let gridTop = 60;
  let gridRight = y2Cols.length > 0 ? Math.max(65, calculatedRight) : 40;

  // Dynamic Legend calculations for spacing/layout
  let numLegendItems = 1;
  let maxLegendCharCount = 0;
  if (appState.activeData) {
    const gCol = document.getElementById('group-select') ? document.getElementById('group-select').value : '';
    if (gCol) {
      const activeGroupCheckboxes = document.querySelectorAll('.group-filter-checkbox');
      let activeGroups = [];
      if (activeGroupCheckboxes.length > 0) {
        activeGroups = Array.from(activeGroupCheckboxes).filter(cb => cb.checked).map(cb => cb.value);
      }
      if (activeGroups.length > 0) {
        numLegendItems = activeGroups.length;
        activeGroups.forEach(g => {
          const s = String(g);
          if (s.length > maxLegendCharCount) maxLegendCharCount = s.length;
        });
      } else {
        const rows = appState.activeData.rows;
        const uniqueGroups = [...new Set(rows.map(r => String(r[gCol])).filter(v => v !== null && v !== ''))];
        numLegendItems = uniqueGroups.length;
        uniqueGroups.forEach(g => {
          const s = String(g);
          if (s.length > maxLegendCharCount) maxLegendCharCount = s.length;
        });
      }
    } else {
      const combinedCols = [...getYCols(), ...getY2Cols()];
      numLegendItems = Math.max(1, combinedCols.length);
      combinedCols.forEach(col => {
        const s = String(col || '');
        if (s.length > maxLegendCharCount) maxLegendCharCount = s.length;
      });
    }
  }

  const legendSize = parseInt(document.getElementById('legend-font-size')?.value || 12, 10) || 12;
  const legendWidthEst = Math.max(120, Math.round(maxLegendCharCount * (legendSize * 0.65) + 30));
  const legendHeightPx = legendPos !== 'hide' ? (numLegendItems * 20) : 0;

  if (legendPos === 'left') {
    gridLeft = Math.max(95, calculatedLeft) + legendDistPx + legendWidthEst; // buffer for left legend
  } else if (legendPos === 'right') {
    gridRight = (y2Cols.length > 0 ? Math.max(65, calculatedRight) : 40) + legendDistPx + legendWidthEst; // buffer for right legend
  } else if (legendPos === 'top') {
    gridTop = 60 + legendDistPx + legendHeightPx; // adjust Top margin dynamically
  } else if (legendPos === 'bottom') {
    gridBottom = 60 + legendDistPx + legendHeightPx; // adjust Bottom margin dynamically
  }

  const canvasWidth = gridLeft + gridWidth + gridRight;
  const canvasHeight = gridTop + gridHeight + gridBottom;

  const y2AxisWidth = y2Cols.length > 0 ? Math.max(65, calculatedRight) : 0;
  return { gridWidth, gridHeight, canvasWidth, canvasHeight, legendDistPx, legendPos, gridLeft, gridTop, gridRight, dynamicNameGap, dynamicNameGap2, y2AxisWidth };
}

function applyCanvasDimensions() {
  const canvas = DOM.chartCanvas;
  const svgLayer = document.getElementById('annotation-layer');
  if (!canvas || !svgLayer) return;
  const wrapper = canvas.parentElement;

  const { canvasWidth, canvasHeight } = getPlotDimensions();

  canvas.style.position = 'relative';
  canvas.style.width = canvasWidth + 'px';
  canvas.style.height = canvasHeight + 'px';
  canvas.style.flex = 'none';
  canvas.style.margin = 'auto';

  svgLayer.style.position = 'absolute';
  svgLayer.style.width = canvasWidth + 'px';
  svgLayer.style.height = canvasHeight + 'px';

  if (wrapper) {
    wrapper.style.display = 'flex';
    wrapper.style.alignItems = 'center';
    wrapper.style.justifyContent = 'center';
    wrapper.style.overflow = 'auto';
  }

  // Position alignment after layout
  setTimeout(() => {
    svgLayer.style.left = canvas.offsetLeft + 'px';
    svgLayer.style.top = canvas.offsetTop + 'px';
  }, 0);
}

function alignSvgLayer() {
  const canvas = DOM.chartCanvas;
  const svgLayer = document.getElementById('annotation-layer');
  if (canvas && svgLayer) {
    svgLayer.style.left = canvas.offsetLeft + 'px';
    svgLayer.style.top = canvas.offsetTop + 'px';
  }
}

function renderGuideLinesList() {
  const list = document.getElementById('guidelines-list');
  if (!list) return;
  list.innerHTML = '';
  
  const tab = getActiveTab();
  if (!tab || !tab.markingLines) return;
  
  tab.markingLines.forEach(ml => {
    const item = document.createElement('div');
    item.style.display = 'flex';
    item.style.justifyContent = 'space-between';
    item.style.alignItems = 'center';
    item.style.background = 'rgba(255,255,255,0.05)';
    item.style.padding = '4px 8px';
    item.style.borderRadius = '4px';
    item.style.fontSize = '11px';
    
    const text = document.createElement('span');
    text.textContent = `${ml.axis.toUpperCase()}: ${ml.value} (${ml.label || 'No Label'})`;
    text.style.color = ml.color;
    
    const delBtn = document.createElement('button');
    delBtn.innerHTML = '×';
    delBtn.style.border = 'none';
    delBtn.style.background = 'none';
    delBtn.style.color = 'var(--danger-color)';
    delBtn.style.cursor = 'pointer';
    delBtn.style.fontWeight = 'bold';
    delBtn.style.fontSize = '14px';
    delBtn.addEventListener('click', () => {
      tab.markingLines = tab.markingLines.filter(x => x.id !== ml.id);
      saveActiveTabState();
      renderGuideLinesList();
      drawChart();
    });
    
    item.appendChild(text);
    item.appendChild(delBtn);
    list.appendChild(item);
  });
}

function updateStatsFilterValues() {
  const colSelect = document.getElementById('stats-filter-col');
  const valSelect = document.getElementById('stats-filter-val');
  if (!colSelect || !valSelect) return;
  
  const col = colSelect.value;
  valSelect.innerHTML = '<option value="">-- All --</option>';
  
  if (!col || !appState.activeData) return;
  
  const rows = appState.activeData.rows;
  const uniqueVals = [...new Set(rows.map(r => String(r[col])).filter(v => v !== null && v !== undefined && v !== ''))].sort();
  
  uniqueVals.forEach(v => {
    const opt = document.createElement('option');
    opt.value = v;
    opt.textContent = v;
    valSelect.appendChild(opt);
  });
}

// 8. Core Plotting Engine (Apache ECharts Integration)

function drawChart() {
  if (!appState.activeData) return;

  applyCanvasDimensions();

  const xCol = DOM.xSelect.value;
  
  // Get all selected Y columns
  const yCols = getYCols();
  const y2Cols = getY2Cols();
  
  if (yCols.length === 0 && y2Cols.length === 0) return;

  const gCol = DOM.groupSelect.value;
  const type = appState.currentChartType;
  const isXColSameAsGCol = !!(xCol && gCol && xCol === gCol);

  // Group selection checklist filtering
  const rows = getPlotFilteredRows();
  const activeGroupCheckboxes = document.querySelectorAll('.group-filter-checkbox');
  let activeGroups = [];
  if (activeGroupCheckboxes.length > 0) {
    activeGroups = Array.from(activeGroupCheckboxes).filter(cb => cb.checked).map(cb => cb.value);
  }
  
  let filteredRows = rows;
  if (gCol && activeGroupCheckboxes.length > 0) {
    filteredRows = rows.filter(r => activeGroups.includes(String(r[gCol])));
  }

  // Render group split tabs if active
  const splitCheckbox = document.getElementById('group-tabs-checkbox');
  if (gCol && splitCheckbox && splitCheckbox.checked) {
    const uniqueGroups = [...new Set(filteredRows.map(r => String(r[gCol])).filter(v => v !== null && v !== '' && v !== 'undefined'))].sort();
    renderGroupTabs(uniqueGroups);
  } else {
    renderGroupTabs([]);
  }

  // Sub-tab specific filtering
  let plotRows = filteredRows;
  if (gCol && splitCheckbox && splitCheckbox.checked && currentSplitGroupTab !== 'ALL') {
    plotRows = filteredRows.filter(r => String(r[gCol]) === currentSplitGroupTab);
  }

  const pointShape = document.getElementById('point-shape-select') ? document.getElementById('point-shape-select').value : 'circle';
  
  function getSymbolConfig(color, size, isOverlay = false, shapeOverride = null) {
    let symbol = 'circle';
    let itemStyle = {};
    const opacity = isOverlay ? 0.65 : 0.8;
    const activeShape = shapeOverride || pointShape;
    
    if (activeShape.endsWith('-hollow')) {
      symbol = activeShape.split('-')[0];
      itemStyle = {
        color: '#ffffff', // hollow fill
        borderColor: color,
        borderWidth: 2,
        opacity: opacity
      };
    } else {
      symbol = activeShape;
      itemStyle = {
        color: color,
        opacity: opacity
      };
    }
    
    return {
      symbol: symbol,
      symbolSize: size,
      itemStyle: itemStyle
    };
  }

  function getGlobalYBounds(allRows, xCol, yCols, gCol, errorBarType, showPoints, type) {
    let minVal = Infinity;
    let maxVal = -Infinity;
    
    yCols.forEach(yCol => {
      // 1. Gather all raw values
      allRows.forEach(r => {
        const v = Number(r[yCol]);
        if (!isNaN(v) && r[yCol] !== null && r[yCol] !== undefined && r[yCol] !== '') {
          if (v < minVal) minVal = v;
          if (v > maxVal) maxVal = v;
        }
      });
      
      // 2. Gather group/X means and error bars
      const groups = gCol ? [...new Set(allRows.map(r => String(r[gCol])).filter(g => g !== null && g !== ''))] : ['All'];
      const xVals = [...new Set(allRows.map(r => String(r[xCol])))];
      
      xVals.forEach(x => {
        groups.forEach(g => {
          const matchRows = allRows.filter(r => String(r[xCol]) === x && (!gCol || String(r[gCol]) === g));
          const vals = matchRows.map(r => Number(r[yCol])).filter(v => !isNaN(v) && v !== null);
          if (vals.length > 0) {
            const stats = getErrorBarStats(vals, errorBarType);
            if (stats.mean < minVal) minVal = stats.mean;
            if (stats.mean > maxVal) maxVal = stats.mean;
            if (errorBarType !== 'none') {
              if (stats.low < minVal) minVal = stats.low;
              if (stats.high > maxVal) maxVal = stats.high;
            }
          }
        });
      });
    });
    
    // For bar charts, Y-axis typically starts at 0 or includes 0
    if (type === 'bar') {
      if (minVal > 0) minVal = 0;
      if (maxVal < 0) maxVal = 0;
    }
    
    if (minVal !== Infinity && maxVal !== -Infinity) {
      const range = maxVal - minVal;
      if (range > 0) {
        minVal = minVal - range * 0.05;
        maxVal = maxVal + range * 0.05;
      } else {
        minVal = minVal - 1;
        maxVal = maxVal + 1;
      }
      return { min: minVal, max: maxVal };
    }
    return null;
  }

  // Initialize ECharts instance if not already done
  if (appState.chartInstance) {
    appState.chartInstance.dispose();
  }
  
  // Initialize with selected renderer (use 'svg' to support vector export, otherwise 'canvas')
  appState.chartInstance = echarts.init(DOM.chartCanvas, null, {
    renderer: appState.renderer
  });

  const font = DOM.fontSelect.value;
  const theme = DOM.themeSelect.value;
  const paletteColors = PALETTES[appState.selectedPalette].colors;

  // Theme settings mapping
  let textStyle = { fontFamily: font, fontSize: 13 };
  let gridLineStyle = { lineStyle: { type: 'dashed', color: '#e2e8f0' } };
  let axisLineStyle = { show: true, lineStyle: { type: 'solid', color: '#64748b' } };
  let backgroundColor = '#ffffff';

  // Retrieve user Font and Color preferences
  const titleSize = parseInt(document.getElementById('title-font-size').value, 10) || 16;
  const titleColor = document.getElementById('title-font-color').value;
  const axisTitleSize = parseInt(document.getElementById('axis-title-font-size').value, 10) || 13;
  const axisTitleColor = document.getElementById('axis-title-font-color').value;
  const axisValSize = parseInt(document.getElementById('axis-value-font-size').value, 10) || 12;
  const axisValColor = document.getElementById('axis-value-font-color').value;
  const legendSize = parseInt(document.getElementById('legend-font-size').value, 10) || 12;
  const legendColor = document.getElementById('legend-font-color').value;

  if (theme === 'dark') {
    textStyle.color = '#f8fafc';
    gridLineStyle.lineStyle.color = 'rgba(255,255,255,0.06)';
    axisLineStyle.lineStyle.color = '#475569';
    backgroundColor = '#121829';
  } else if (theme === 'ggplot2') {
    backgroundColor = '#f1f5f9';
    gridLineStyle.lineStyle.color = '#ffffff';
    gridLineStyle.lineStyle.type = 'solid';
    axisLineStyle.lineStyle.color = '#334155';
  } else if (theme === 'classic') {
    gridLineStyle.lineStyle.color = 'transparent'; // No grid in classic ggplot
    axisLineStyle.lineStyle.color = '#000000';
    axisLineStyle.lineStyle.width = 1.5;
  }

  // Get titles from quick editor
  const chartTitle = document.getElementById('chart-title-input').value.trim();
  const chartXLabel = document.getElementById('chart-xlabel-input').value.trim();
  const chartYLabel = document.getElementById('chart-ylabel-input').value.trim();
  const chartY2Label = document.getElementById('chart-y2label-input') ? document.getElementById('chart-y2label-input').value.trim() : '';

  const { gridWidth, gridHeight, canvasWidth, canvasHeight, legendDistPx, legendPos, gridLeft, gridTop, gridRight, dynamicNameGap, dynamicNameGap2, y2AxisWidth } = getPlotDimensions();

  const legendData = [];
  let legendConfig = {
    show: legendPos !== 'hide',
    textStyle: {
      fontFamily: font,
      fontSize: legendSize,
      color: legendColor
    }
  };
  if (legendPos === 'bottom') {
    legendConfig.top = gridTop + gridHeight + legendDistPx + 25; // 25px for X-axis labels and ticks
    legendConfig.left = 'center';
    legendConfig.orient = 'vertical';
  } else if (legendPos === 'top') {
    legendConfig.bottom = canvasHeight - gridTop + legendDistPx + 10; // 10px above the grid (using bottom offset for auto height)
    legendConfig.left = 'center';
    legendConfig.orient = 'vertical';
  } else if (legendPos === 'left') {
    legendConfig.right = canvasWidth - gridLeft + legendDistPx + 10; // 10px to the left of the grid (using right offset for auto width)
    legendConfig.top = 'center';
    legendConfig.orient = 'vertical';
  } else if (legendPos === 'right') {
    legendConfig.left = gridLeft + gridWidth + y2AxisWidth + legendDistPx + 10; // offset by secondary y-axis if active
    legendConfig.top = 'center';
    legendConfig.orient = 'vertical';
  }

  let yAxisConfig;
  if (y2Cols.length > 0) {
    yAxisConfig = [
      {
        type: 'value',
        name: chartYLabel || yCols.join(' / '),
        nameLocation: 'middle',
        nameGap: dynamicNameGap,
        position: 'left',
        axisLabel: {
          fontFamily: font,
          fontSize: axisValSize,
          color: axisValColor
        },
        nameTextStyle: {
          fontFamily: font,
          fontSize: axisTitleSize,
          color: axisTitleColor,
          fontWeight: 'bold'
        },
        axisLine: axisLineStyle,
        axisTick: axisLineStyle,
        splitLine: {
          show: DOM.gridY.checked,
          lineStyle: gridLineStyle.lineStyle
        }
      },
      {
        type: 'value',
        name: chartY2Label || y2Cols.join(' / '),
        nameLocation: 'middle',
        nameGap: dynamicNameGap2,
        position: 'right',
        axisLabel: {
          fontFamily: font,
          fontSize: axisValSize,
          color: axisValColor
        },
        nameTextStyle: {
          fontFamily: font,
          fontSize: axisTitleSize,
          color: axisTitleColor,
          fontWeight: 'bold'
        },
        axisLine: axisLineStyle,
        axisTick: axisLineStyle,
        splitLine: {
          show: false
        }
      }
    ];
  } else {
    yAxisConfig = {
      type: 'value',
      name: chartYLabel || yCols.join(' / '),
      nameLocation: 'middle',
      nameGap: dynamicNameGap,
      axisLabel: {
        fontFamily: font,
        fontSize: axisValSize,
        color: axisValColor
      },
      nameTextStyle: {
        fontFamily: font,
        fontSize: axisTitleSize,
        color: axisTitleColor,
        fontWeight: 'bold'
      },
      axisLine: axisLineStyle,
      axisTick: axisLineStyle,
      splitLine: {
        show: DOM.gridY.checked,
        lineStyle: gridLineStyle.lineStyle
      }
    };
  }

  // Calculate X-axis label height dynamically based on rotation
  let maxXCharCount = 0;
  if (appState.activeData) {
    const rows = plotRows || [];
    const xVals = [...new Set(rows.map(r => String(r[xCol] || '')))];
    xVals.forEach(x => {
      if (x.length > maxXCharCount) maxXCharCount = x.length;
    });
  }
  const showLabels = DOM.xAxisShowLabels ? DOM.xAxisShowLabels.checked : true;
  const rotateAngle = DOM.xAxisLabelRotate ? parseInt(DOM.xAxisLabelRotate.value, 10) : 0;
  let xLabelHeight = 0;
  if (showLabels) {
    const rotateRad = (rotateAngle * Math.PI) / 180;
    const labelLengthEst = maxXCharCount * (axisValSize * 0.55);
    xLabelHeight = Math.round(Math.abs(Math.sin(rotateRad) * labelLengthEst) + Math.abs(Math.cos(rotateRad) * axisValSize) + 8);
  }

  // Common ECharts Option templates
  let option = {
    backgroundColor: backgroundColor,
    color: paletteColors,
    tooltip: { 
      trigger: 'axis',
      formatter: isXColSameAsGCol ? function (params) {
        if (!params || params.length === 0) return '';
        let res = `<strong>${params[0].axisValue}</strong><br/>`;
        let activeCount = 0;
        params.forEach(p => {
          if (p.seriesName.endsWith('Error') || p.seriesName.includes('(Scatter)') || p.seriesName.includes('(Mean)')) return;
          const val = p.value;
          if (val === null || val === undefined) return;
          if (Array.isArray(val) && val.every(v => v === null || v === undefined)) return;
          
          let valStr = '';
          if (Array.isArray(val)) {
            if (type === 'violin') {
              valStr = `Median: ${val[1].toFixed(2)}`;
            } else if (val.length >= 6) {
              valStr = `Min: ${val[1].toFixed(2)}, Median: ${val[3].toFixed(2)}, Max: ${val[5].toFixed(2)}`;
            } else if (val.length === 5) {
              valStr = `Min: ${val[0].toFixed(2)}, Median: ${val[2].toFixed(2)}, Max: ${val[4].toFixed(2)}`;
            } else {
              valStr = val.join(', ');
            }
          } else {
            valStr = typeof val === 'number' ? val.toFixed(4) : val;
          }
          res += `${p.marker} ${p.seriesName}: <strong>${valStr}</strong><br/>`;
          activeCount++;
        });
        return activeCount > 0 ? res : `<strong>${params[0].axisValue}</strong>`;
      } : undefined
    },
    legend: legendConfig,
    grid: {
      left: gridLeft,
      top: gridTop,
      width: gridWidth,
      height: gridHeight,
      containLabel: false
    },
    xAxis: {
      type: 'category',
      name: chartXLabel || xCol,
      nameLocation: 'middle',
      nameGap: showLabels ? Math.max(25, xLabelHeight + 10) : 15,
      axisLabel: {
        fontFamily: font,
        fontSize: axisValSize,
        color: axisValColor,
        show: showLabels,
        rotate: rotateAngle
      },
      nameTextStyle: {
        fontFamily: font,
        fontSize: axisTitleSize,
        color: axisTitleColor,
        fontWeight: 'bold'
      },
      axisLine: axisLineStyle,
      axisTick: axisLineStyle,
      splitLine: {
        show: DOM.gridX.checked,
        lineStyle: gridLineStyle.lineStyle
      }
    },
    yAxis: yAxisConfig,
    series: []
  };

  if (chartTitle) {
    option.title = {
      text: chartTitle,
      left: gridLeft + gridWidth / 2,
      textAlign: 'center',
      top: 15,
      textStyle: {
        fontFamily: font,
        fontSize: titleSize,
        color: titleColor,
        fontWeight: 'bold'
      }
    };
  }

  // Get active configurations
  const pointSize = parseInt(DOM.pointSize.value);
  const lineWidth = parseInt(DOM.lineWidth.value);
  const barPadding = parseInt(DOM.barPadding.value);
  const boxWidthPercent = parseInt(DOM.boxWidth.value);

  // Determine groups to render
  let groups = ['All Data'];
  if (gCol) {
    if (splitCheckbox && splitCheckbox.checked && currentSplitGroupTab !== 'ALL') {
      groups = [currentSplitGroupTab];
    } else if (activeGroups.length > 0) {
      groups = activeGroups;
    } else {
      groups = [...new Set(plotRows.map(r => String(r[gCol])).filter(g => g !== null && g !== ''))];
    }
  }

  // Get full list of unique groups in filteredRows to ensure stable colors across split tabs
  const allGroupsList = gCol ? (activeGroups.length > 0 ? activeGroups : [...new Set(filteredRows.map(r => String(r[gCol])).filter(g => g !== null && g !== ''))]) : [];

  const errorBarType = document.getElementById('error-bar-select').value;

  // Box / Violin options panel visibility
  const boxViolinOptions = document.getElementById('box-violin-options');
  if (type === 'box' || type === 'violin') {
    boxViolinOptions.style.display = 'block';
  } else {
    boxViolinOptions.style.display = 'none';
  }

  const axesToPlot = [];
  if (yCols.length > 0) {
    axesToPlot.push({
      axisIndex: 0,
      cols: yCols,
      palette: appState.selectedPalette || 'ggplot2',
      pointSize: pointSize,
      pointShape: pointShape
    });
  }
  if (y2Cols.length > 0) {
    const tab = getActiveTab();
    const palette2 = (tab && tab.palette2) || 'ggplot2';
    const pointSize2 = (tab && tab.pointSize2 !== undefined) ? tab.pointSize2 : 8;
    const pointShape2El = document.getElementById('point-shape-2-select');
    const pointShape2 = pointShape2El ? pointShape2El.value : 'circle';
    
    axesToPlot.push({
      axisIndex: 1,
      cols: y2Cols,
      palette: palette2,
      pointSize: pointSize2,
      pointShape: pointShape2
    });
  }

  const totalColsCount = yCols.length + y2Cols.length;

  const getSeriesName = (group, col, gCol, totalColsCount) => {
    if (!gCol) return col;
    if (totalColsCount > 1) {
      return `${group} (${col})`;
    }
    return String(group);
  };

  if (type === 'scatter') {
    // Scatter Plot mapping
    axesToPlot.forEach(axisInfo => {
      const { axisIndex, cols, palette, pointSize: activePointSize, pointShape: activePointShape } = axisInfo;
      const paletteColors = PALETTES[palette]?.colors || PALETTES['ggplot2'].colors;

      cols.forEach((yCol, yIdx) => {
        groups.forEach((g, gIdx) => {
          const globalGIdx = gCol ? allGroupsList.indexOf(String(g)) : gIdx;
          const seriesName = getSeriesName(g, yCol, gCol, totalColsCount);
          const autoColor = paletteColors[(yIdx + globalGIdx * cols.length) % paletteColors.length];
          const styleOverride = getSeriesStyle(seriesName, autoColor, activePointShape);
          const color = styleOverride.color;
          const currentShape = styleOverride.shape;
          
          const matchRows = plotRows.filter(r => !gCol || String(r[gCol]) === g);
          const seriesData = matchRows
            .map(r => [r[xCol], r[yCol]])
            .filter(pt => pt[0] !== null && pt[1] !== null);

          option.xAxis.type = isNumeric(seriesData.map(d => d[0])) ? 'value' : 'category';

          if (option.xAxis.type === 'value') {
            seriesData.sort((a, b) => a[0] - b[0]);
          }

          // Draw raw points
          legendData.push(seriesName);
          const symbolConfig = getSymbolConfig(color, activePointSize, false, currentShape);
          option.series.push({
            name: seriesName,
            type: 'scatter',
            yAxisIndex: axisIndex,
            symbol: symbolConfig.symbol,
            symbolSize: symbolConfig.symbolSize,
            itemStyle: symbolConfig.itemStyle,
            data: seriesData
          });

          // Add error bars on mean if requested
          if (errorBarType !== 'none' && seriesData.length > 0) {
            const xMap = new Map();
            seriesData.forEach(pt => {
              const xVal = pt[0];
              const yVal = Number(pt[1]);
              if (!xMap.has(xVal)) xMap.set(xVal, []);
              xMap.get(xVal).push(yVal);
            });

            const errorData = [];
            xMap.forEach((vals, xVal) => {
              const stats = getErrorBarStats(vals, errorBarType);
              errorData.push([xVal, parseFloat(stats.high.toFixed(4)), parseFloat(stats.low.toFixed(4))]);
            });

            option.series.push({
              name: `${seriesName} Error`,
              type: 'custom',
              renderItem: renderErrorBarItem,
              yAxisIndex: axisIndex,
              data: errorData,
              itemStyle: { color: color },
              z: 5,
              tooltip: { show: false }
            });
          }
        });
      });
    });

  } else if (type === 'line') {
    // Line Plot mapping (shows means connected by lines + error bars)
    axesToPlot.forEach(axisInfo => {
      const { axisIndex, cols, palette, pointSize: activePointSize, pointShape: activePointShape } = axisInfo;
      const paletteColors = PALETTES[palette]?.colors || PALETTES['ggplot2'].colors;

      cols.forEach((yCol, yIdx) => {
        groups.forEach((g, gIdx) => {
          const globalGIdx = gCol ? allGroupsList.indexOf(String(g)) : gIdx;
          const seriesName = getSeriesName(g, yCol, gCol, totalColsCount);
          const autoColor = paletteColors[(yIdx + globalGIdx * cols.length) % paletteColors.length];
          const styleOverride = getSeriesStyle(seriesName, autoColor, activePointShape);
          const color = styleOverride.color;
          const currentShape = styleOverride.shape;
          
          const matchRows = plotRows.filter(r => !gCol || String(r[gCol]) === g);
          const rawPoints = matchRows
            .map(r => [r[xCol], r[yCol]])
            .filter(pt => pt[0] !== null && pt[1] !== null);

          if (rawPoints.length === 0) return;

          option.xAxis.type = isNumeric(rawPoints.map(d => d[0])) ? 'value' : 'category';

          // Group by X values to calculate mean & error bars
          const xMap = new Map();
          rawPoints.forEach(pt => {
            const xVal = pt[0];
            const yVal = Number(pt[1]);
            if (!xMap.has(xVal)) xMap.set(xVal, []);
            xMap.get(xVal).push(yVal);
          });

          const sortedX = Array.from(xMap.keys());
          if (option.xAxis.type === 'value') {
            sortedX.sort((a, b) => a - b);
          } else {
            sortedX.sort();
          }

          const lineData = [];
          const errorData = [];
          sortedX.forEach(x => {
            const vals = xMap.get(x);
            const stats = getErrorBarStats(vals, errorBarType);
            lineData.push([x, parseFloat(stats.mean.toFixed(4))]);
            
            if (errorBarType !== 'none') {
              errorData.push([x, parseFloat(stats.high.toFixed(4)), parseFloat(stats.low.toFixed(4))]);
            }
          });

          legendData.push(seriesName);
          const individualCurvesChecked = document.getElementById('individual-curves-checkbox').checked;
          const showPoints = document.getElementById('show-points-checkbox').checked;

          if (individualCurvesChecked) {
            // Group rows by replicate index
            const xRepMap = new Map();
            matchRows.forEach(r => {
              const xVal = r[xCol];
              if (xVal === null || xVal === undefined || r[yCol] === null || r[yCol] === undefined) return;
              if (!xRepMap.has(xVal)) xRepMap.set(xVal, []);
              xRepMap.get(xVal).push(r);
            });
            
            let maxReps = 0;
            xRepMap.forEach(rowsAtX => {
              if (rowsAtX.length > maxReps) maxReps = rowsAtX.length;
            });
            
            for (let repIdx = 0; repIdx < maxReps; repIdx++) {
              const curveData = [];
              sortedX.forEach(x => {
                const rowsAtX = xRepMap.get(x) || [];
                if (rowsAtX[repIdx]) {
                  curveData.push([x, Number(rowsAtX[repIdx][yCol])]);
                }
              });
              
              if (curveData.length > 0) {
                const curveSymbolConfig = getSymbolConfig(color, Math.max(3, activePointSize - 2), true, currentShape);
                option.series.push({
                  name: seriesName, // same name for unified legend toggle
                  type: 'line',
                  yAxisIndex: axisIndex,
                  lineStyle: { width: Math.max(1, lineWidth - 1), color: color, opacity: 0.6 },
                  symbol: curveSymbolConfig.symbol,
                  symbolSize: curveSymbolConfig.symbolSize,
                  itemStyle: curveSymbolConfig.itemStyle,
                  data: curveData
                });
              }
            }
          } else {
            const meanSymbolConfig = getSymbolConfig(color, activePointSize, false, currentShape);
            option.series.push({
              name: seriesName,
              type: 'line',
              yAxisIndex: axisIndex,
              lineStyle: { width: lineWidth, color: color },
              symbol: meanSymbolConfig.symbol,
              symbolSize: meanSymbolConfig.symbolSize,
              itemStyle: meanSymbolConfig.itemStyle,
              data: lineData
            });

            if (errorBarType !== 'none' && errorData.length > 0) {
              option.series.push({
                name: `${seriesName} Error`,
                type: 'custom',
                renderItem: renderErrorBarItem,
                yAxisIndex: axisIndex,
                data: errorData,
                itemStyle: { color: color },
                z: 5,
                tooltip: { show: false }
              });
            }
          }

          // Overlay scatters if checked
          if (showPoints) {
            const scatterData = [];
            rawPoints.forEach(pt => {
              scatterData.push([pt[0], pt[1]]);
            });

            const scatterSymbolConfig = getSymbolConfig(color, Math.max(4, activePointSize - 2), true, currentShape);
            option.series.push({
              name: `${seriesName} (Scatter)`,
              type: 'scatter',
              yAxisIndex: axisIndex,
              symbol: scatterSymbolConfig.symbol,
              symbolSize: scatterSymbolConfig.symbolSize,
              itemStyle: scatterSymbolConfig.itemStyle,
              data: scatterData,
              z: 6,
              tooltip: { show: false }
            });
          }
        });
      });
    });

  } else if (type === 'bar') {
    // Bar Plot mapping
    const xCategories = [...new Set(plotRows.map(r => String(r[xCol])))];
    option.xAxis.data = xCategories;

    axesToPlot.forEach(axisInfo => {
      const { axisIndex, cols, palette, pointSize: activePointSize, pointShape: activePointShape } = axisInfo;
      const paletteColors = PALETTES[palette]?.colors || PALETTES['ggplot2'].colors;

      cols.forEach((yCol, yIdx) => {
        groups.forEach((g, gIdx) => {
          const globalGIdx = gCol ? allGroupsList.indexOf(String(g)) : gIdx;
          const seriesName = getSeriesName(g, yCol, gCol, totalColsCount);
          const autoColor = paletteColors[(yIdx + globalGIdx * cols.length) % paletteColors.length];
          const styleOverride = getSeriesStyle(seriesName, autoColor, activePointShape);
          const color = styleOverride.color;
          const currentShape = styleOverride.shape;
          
          legendData.push(seriesName);
          const showPoints = document.getElementById('show-points-checkbox').checked;
          const barData = [];
          const errorData = [];
          const scatterData = [];
          
          xCategories.forEach((cat, catIdx) => {
            const matchRows = plotRows.filter(r => String(r[xCol]) === cat && (!gCol || String(r[gCol]) === g));
            const vals = matchRows.map(r => Number(r[yCol])).filter(v => !isNaN(v) && v !== null);
            
            if (vals.length === 0) {
              barData.push(null);
            } else {
              const stats = getErrorBarStats(vals, errorBarType);
              barData.push(parseFloat(stats.mean.toFixed(4)));
              
              const globalColIdx = (axisIndex === 0) ? yIdx : (yCols.length + yIdx);
              const totalSeriesCount = totalColsCount * groups.length;
              const currentSeriesIndex = globalColIdx + gIdx * totalColsCount;
              let center = catIdx;
              if (totalSeriesCount > 1 && !isXColSameAsGCol) {
                const barWidthOffset = 0.65 / totalSeriesCount;
                center = catIdx + (currentSeriesIndex - (totalSeriesCount - 1) / 2) * barWidthOffset;
              }

              if (errorBarType !== 'none') {
                errorData.push([center, parseFloat(stats.high.toFixed(4)), parseFloat(stats.low.toFixed(4))]);
              }

              if (showPoints) {
                vals.forEach(v => {
                  const jitter = (Math.random() - 0.5) * 0.08;
                  scatterData.push([center + jitter, v]);
                });
              }
            }
          });

          option.series.push({
            name: seriesName,
            type: 'bar',
            yAxisIndex: axisIndex,
            barGap: isXColSameAsGCol ? '-100%' : '15%',
            barCategoryGap: `${barPadding}%`,
            itemStyle: { color: color },
            data: barData
          });

          if (errorBarType !== 'none' && errorData.length > 0) {
            option.series.push({
              name: `${seriesName} Error`,
              type: 'custom',
              renderItem: renderErrorBarItem,
              yAxisIndex: axisIndex,
              data: errorData,
              itemStyle: { color: color },
              z: 5,
              tooltip: { show: false }
            });
          }

          if (showPoints && scatterData.length > 0) {
            const scatterSymbolConfig = getSymbolConfig(color, Math.max(4, activePointSize - 2), true, currentShape);
            const finalItemStyle = { ...scatterSymbolConfig.itemStyle };
            if (!currentShape.endsWith('-hollow')) {
              finalItemStyle.borderColor = '#ffffff';
              finalItemStyle.borderWidth = 0.5;
            }
            option.series.push({
              name: `${seriesName} (Scatter)`,
              type: 'scatter',
              yAxisIndex: axisIndex,
              symbol: scatterSymbolConfig.symbol,
              symbolSize: scatterSymbolConfig.symbolSize,
              itemStyle: finalItemStyle,
              data: scatterData,
              z: 6,
              tooltip: { show: false }
            });
          }
        });
      });
    });

  } else if (type === 'box') {
    // Boxplot calculations
    const xCategories = [...new Set(plotRows.map(r => String(r[xCol])))];
    option.xAxis.data = xCategories;
    
    axesToPlot.forEach(axisInfo => {
      const { axisIndex, cols, palette, pointSize: activePointSize, pointShape: activePointShape } = axisInfo;
      const paletteColors = PALETTES[palette]?.colors || PALETTES['ggplot2'].colors;

      cols.forEach((yCol, yIdx) => {
        groups.forEach((g, gIdx) => {
          const globalGIdx = gCol ? allGroupsList.indexOf(String(g)) : gIdx;
          const seriesName = getSeriesName(g, yCol, gCol, totalColsCount);
          const autoColor = paletteColors[(yIdx + globalGIdx * cols.length) % paletteColors.length];
          const styleOverride = getSeriesStyle(seriesName, autoColor, activePointShape);
          const color = styleOverride.color;
          
          // Calculate box stats per category
          const boxData = xCategories.map(cat => {
            const vals = plotRows
              .filter(r => String(r[xCol]) === cat && (!gCol || String(r[gCol]) === g))
              .map(r => Number(r[yCol]))
              .filter(v => !isNaN(v));
            if (vals.length === 0) return [null, null, null, null, null];
            return calculateBoxplotStats(vals);
          });

          legendData.push(seriesName);
          option.series.push({
            name: seriesName,
            type: 'boxplot',
            yAxisIndex: axisIndex,
            boxWidth: `${boxWidthPercent}%`,
            barGap: isXColSameAsGCol ? '-100%' : undefined,
            itemStyle: { borderColor: color, color: hexToRgba(color, 0.4) },
            data: boxData
          });
        });
      });
    });

    // Box Overlay (Jitter Points & Mean markers)
    const showPoints = document.getElementById('show-points-checkbox').checked;
    const showMean = document.getElementById('show-mean-checkbox').checked;
    
    if (showPoints || showMean) {
      axesToPlot.forEach(axisInfo => {
        const { axisIndex, cols, palette, pointSize: activePointSize, pointShape: activePointShape } = axisInfo;
        const paletteColors = PALETTES[palette]?.colors || PALETTES['ggplot2'].colors;

        cols.forEach((yCol, yIdx) => {
          groups.forEach((g, gIdx) => {
            const globalGIdx = gCol ? allGroupsList.indexOf(String(g)) : gIdx;
            const seriesName = getSeriesName(g, yCol, gCol, totalColsCount);
            const autoColor = paletteColors[(yIdx + globalGIdx * cols.length) % paletteColors.length];
            const styleOverride = getSeriesStyle(seriesName, autoColor, activePointShape);
            const color = styleOverride.color;
            const currentShape = styleOverride.shape;
            
            const jitterData = [];
            const meanData = [];
            
            xCategories.forEach((cat, catIdx) => {
              const vals = plotRows
                .filter(r => String(r[xCol]) === cat && (!gCol || String(r[gCol]) === g))
                .map(r => Number(r[yCol]))
                .filter(v => !isNaN(v) && v !== null);
                
              if (vals.length === 0) return;
              
              const globalColIdx = (axisIndex === 0) ? yIdx : (yCols.length + yIdx);
              const totalSeriesCount = totalColsCount * groups.length;
              const currentSeriesIndex = globalColIdx + gIdx * totalColsCount;
              let center = catIdx;
              if (totalSeriesCount > 1 && !isXColSameAsGCol) {
                const barWidthOffset = 0.22; // spacing between box centroids
                center = catIdx + (currentSeriesIndex - (totalSeriesCount - 1) / 2) * barWidthOffset;
              }
              
              if (showPoints) {
                vals.forEach(v => {
                  const jitter = (Math.random() - 0.5) * 0.12;
                  jitterData.push([center + jitter, v]);
                });
              }
              
              if (showMean) {
                const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
                meanData.push([center, parseFloat(mean.toFixed(4))]);
              }
            });
            
            if (showPoints && jitterData.length > 0) {
              const scatterSymbolConfig = getSymbolConfig(color, Math.max(4, activePointSize - 2), true, currentShape);
              option.series.push({
                name: `${seriesName} (Scatter)`,
                type: 'scatter',
                yAxisIndex: axisIndex,
                symbol: scatterSymbolConfig.symbol,
                symbolSize: scatterSymbolConfig.symbolSize,
                itemStyle: scatterSymbolConfig.itemStyle,
                data: jitterData,
                tooltip: { show: false }
              });
            }
            
            if (showMean && meanData.length > 0) {
              option.series.push({
                name: `${seriesName} (Mean)`,
                type: 'scatter',
                yAxisIndex: axisIndex,
                symbol: 'diamond',
                symbolSize: activePointSize + 3,
                itemStyle: {
                  color: '#ff3b30',
                  borderColor: '#ffffff',
                  borderWidth: 1.5,
                  opacity: 0.9
                },
                data: meanData,
                z: 10,
                tooltip: {
                  formatter: (params) => `Mean of ${seriesName}: ${params.value[1]}`
                }
              });
            }
          });
        });
      });
    }

  } else if (type === 'violin') {
    const xCategories = [...new Set(plotRows.map(r => String(r[xCol])))];
    option.xAxis.data = xCategories;
    
    axesToPlot.forEach(axisInfo => {
      const { axisIndex, cols, palette, pointSize: activePointSize, pointShape: activePointShape } = axisInfo;
      const paletteColors = PALETTES[palette]?.colors || PALETTES['ggplot2'].colors;

      cols.forEach((yCol, yIdx) => {
        groups.forEach((g, gIdx) => {
          const globalGIdx = gCol ? allGroupsList.indexOf(String(g)) : gIdx;
          const seriesName = getSeriesName(g, yCol, gCol, totalColsCount);
          const autoColor = paletteColors[(yIdx + globalGIdx * cols.length) % paletteColors.length];
          const styleOverride = getSeriesStyle(seriesName, autoColor, activePointShape);
          const color = styleOverride.color;
          
          legendData.push(seriesName);
          xCategories.forEach((cat, catIdx) => {
            const vals = plotRows
              .filter(r => String(r[xCol]) === cat && (!gCol || String(r[gCol]) === g))
              .map(r => Number(r[yCol]))
              .filter(v => !isNaN(v));

            if (vals.length < 2) return; // Need at least 2 points for density

            const stats = calculateBoxplotStats(vals);
            let min = stats[0];
            let max = stats[4];
            if (max === min) {
              min = min - 0.5;
              max = max + 0.5;
            }
            let step = (max - min) / 20;
            if (step <= 0) step = 1;
            
            const densityPoints = [];
            for (let val = min; val <= max; val += step) {
              let dens = calculateKdeDensity(vals, val);
              densityPoints.push({ val, dens });
            }

            const maxDens = Math.max(...densityPoints.map(d => d.dens)) || 1;
            const scale = isXColSameAsGCol ? 0.4 : (0.4 / Math.max(1, totalColsCount * groups.length)); // auto scale spacing

            const globalColIdx = (axisIndex === 0) ? yIdx : (yCols.length + yIdx);
            const totalSeriesCount = totalColsCount * groups.length;
            const currentSeriesIndex = globalColIdx + gIdx * totalColsCount;
            let center = catIdx;
            if (totalSeriesCount > 1 && !isXColSameAsGCol) {
              center = catIdx + (currentSeriesIndex - (totalSeriesCount - 1) / 2) * 0.22;
            }

            const polyCoords = [];
            densityPoints.forEach(pt => {
              polyCoords.push([center + (pt.dens / maxDens) * scale, pt.val]);
            });
            [...densityPoints].reverse().forEach(pt => {
              polyCoords.push([center - (pt.dens / maxDens) * scale, pt.val]);
            });

            option.series.push({
              name: seriesName,
              type: 'custom',
              yAxisIndex: axisIndex,
              coordinateSystem: 'cartesian2d',
              encode: { x: 0, y: 1 },
              clip: false,
              renderItem: function (params, api) {
                const points = polyCoords.map(c => api.coord(c));
                return {
                  type: 'polygon',
                  shape: { points: points },
                  style: {
                    fill: color,
                    stroke: '#475569',
                    opacity: 0.65
                  }
                };
              },
              data: [[center, stats[2]]], // Median point
              tooltip: {
                formatter: () => `${seriesName} at ${cat}<br/>Min: ${stats[0].toFixed(2)}<br/>Median: ${stats[2].toFixed(2)}<br/>Max: ${stats[4].toFixed(2)}`
              }
            });
          });
        });
      });
    });

    // Violin Overlay (Jitter Points & Mean markers)
    const showPoints = document.getElementById('show-points-checkbox').checked;
    const showMean = document.getElementById('show-mean-checkbox').checked;
    
    if (showPoints || showMean) {
      axesToPlot.forEach(axisInfo => {
        const { axisIndex, cols, palette, pointSize: activePointSize, pointShape: activePointShape } = axisInfo;
        const paletteColors = PALETTES[palette]?.colors || PALETTES['ggplot2'].colors;

        cols.forEach((yCol, yIdx) => {
          groups.forEach((g, gIdx) => {
            const globalGIdx = gCol ? allGroupsList.indexOf(String(g)) : gIdx;
            const seriesName = getSeriesName(g, yCol, gCol, totalColsCount);
            const autoColor = paletteColors[(yIdx + globalGIdx * cols.length) % paletteColors.length];
            const styleOverride = getSeriesStyle(seriesName, autoColor, activePointShape);
            const color = styleOverride.color;
            const currentShape = styleOverride.shape;
            
            const jitterData = [];
            const meanData = [];
            
            xCategories.forEach((cat, catIdx) => {
              const vals = plotRows
                .filter(r => String(r[xCol]) === cat && (!gCol || String(r[gCol]) === g))
                .map(r => Number(r[yCol]))
                .filter(v => !isNaN(v) && v !== null);
                
              if (vals.length === 0) return;
              
              const globalColIdx = (axisIndex === 0) ? yIdx : (yCols.length + yIdx);
              const totalSeriesCount = totalColsCount * groups.length;
              const currentSeriesIndex = globalColIdx + gIdx * totalColsCount;
              let center = catIdx;
              if (totalSeriesCount > 1 && !isXColSameAsGCol) {
                center = catIdx + (currentSeriesIndex - (totalSeriesCount - 1) / 2) * 0.22;
              }
              
              if (showPoints) {
                vals.forEach(v => {
                  const jitter = (Math.random() - 0.5) * 0.12;
                  jitterData.push([center + jitter, v]);
                });
              }
              
              if (showMean) {
                const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
                meanData.push([center, parseFloat(mean.toFixed(4))]);
              }
            });
            
            if (showPoints && jitterData.length > 0) {
              const scatterSymbolConfig = getSymbolConfig(color, Math.max(4, activePointSize - 2), true, currentShape);
              option.series.push({
                name: `${seriesName} (Scatter)`,
                type: 'scatter',
                yAxisIndex: axisIndex,
                symbol: scatterSymbolConfig.symbol,
                symbolSize: scatterSymbolConfig.symbolSize,
                itemStyle: scatterSymbolConfig.itemStyle,
                data: jitterData,
                tooltip: { show: false }
              });
            }
            
            if (showMean && meanData.length > 0) {
              option.series.push({
                name: `${seriesName} (Mean)`,
                type: 'scatter',
                yAxisIndex: axisIndex,
                symbol: 'diamond',
                symbolSize: activePointSize + 3,
                itemStyle: {
                  color: '#ff3b30',
                  borderColor: '#ffffff',
                  borderWidth: 1.5,
                  opacity: 0.9
                },
                data: meanData,
                z: 10,
                tooltip: {
                  formatter: (params) => `Mean of ${seriesName}: ${params.value[1]}`
                }
              });
            }
          });
        });
      });
    }

  } else if (type === 'histogram') {
    const activeY = yCols[0];
    const vals = plotRows.map(r => Number(r[activeY])).filter(v => !isNaN(v));
    
    if (vals.length > 0) {
      const min = Math.min(...vals);
      const max = Math.max(...vals);
      const binCount = Math.max(5, Math.round(Math.sqrt(vals.length)));
      const binWidth = (max - min) / binCount;
      
      const binEdges = [];
      for (let i = 0; i <= binCount; i++) {
        binEdges.push(min + i * binWidth);
      }

      const counts = Array(binCount).fill(0);
      vals.forEach(v => {
        let binIdx = Math.floor((v - min) / binWidth);
        if (binIdx >= binCount) binIdx = binCount - 1;
        counts[binIdx]++;
      });

      option.xAxis.type = 'value';
      option.xAxis.name = chartXLabel || activeY;
      option.yAxis.name = chartYLabel || 'Frequency';
      
      const histData = [];
      for (let i = 0; i < binCount; i++) {
        histData.push([binEdges[i] + binWidth / 2, counts[i]]);
      }

      legendData.push(`${activeY} Distribution`);
      option.series.push({
        name: `${activeY} Distribution`,
        type: 'bar',
        barWidth: '98%',
        data: histData
      });
    }

  } else if (type === 'bubble') {
    const activeY = yCols[0];
    const sizeCol = yCols[1] || activeY;
    const colorCol = gCol || xCol;

    const seriesData = plotRows.map(r => {
      return {
        value: [r[xCol], r[activeY], r[sizeCol]],
        group: r[colorCol]
      };
    }).filter(d => d.value[0] !== null && d.value[1] !== null);

    const bubbleGroups = [...new Set(seriesData.map(d => d.group))];
    option.xAxis.type = isNumeric(seriesData.map(d => d.value[0])) ? 'value' : 'category';

    bubbleGroups.forEach((g, gIdx) => {
      const gData = seriesData.filter(d => d.group === g).map(d => d.value);
      legendData.push(String(g));
      option.series.push({
        name: String(g),
        type: 'scatter',
        data: gData,
        symbolSize: function (data) {
          const rawSize = Number(data[2]);
          return isNaN(rawSize) ? pointSize : Math.max(5, Math.min(60, rawSize * 2));
        },
        itemStyle: { color: paletteColors[gIdx % paletteColors.length] },
        opacity: 0.75
      });
    });

  } else if (type === 'heatmap') {
    const xCategories = [...new Set(plotRows.map(r => String(r[xCol])))];
    const yCategories = [...new Set(plotRows.map(r => String(r[yCols[0]])))];
    
    option.xAxis.data = xCategories;
    option.yAxis.type = 'category';
    option.yAxis.data = yCategories;

    const heatValues = [];
    xCategories.forEach((xc, xIdx) => {
      yCategories.forEach((yc, yIdx) => {
        const matchRows = plotRows.filter(r => String(r[xCol]) === xc && String(r[yCols[0]]) === yc);
        const vals = matchRows.map(r => Number(r[yCols[1] || yCols[0]])).filter(v => !isNaN(v));
        const avg = vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
        heatValues.push([xIdx, yIdx, parseFloat(avg.toFixed(3))]);
      });
    });

    const valuesOnly = heatValues.map(h => h[2]);
    const minHeat = Math.min(...valuesOnly);
    const maxHeat = Math.max(...valuesOnly);

    option.visualMap = {
      min: minHeat,
      max: maxHeat,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: 0,
      textStyle: textStyle,
      inRange: {
        color: [paletteColors[2] || '#313695', paletteColors[1] || '#fdae61', paletteColors[0] || '#a50026']
      }
    };

    legendData.push('Heatmap Matrix');
    option.series.push({
      name: 'Heatmap Matrix',
      type: 'heatmap',
      data: heatValues,
      label: { show: true },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    });

  } else if (type === 'area') {
    axesToPlot.forEach(axisInfo => {
      const { axisIndex, cols, palette, pointSize: activePointSize, pointShape: activePointShape } = axisInfo;
      const paletteColors = PALETTES[palette]?.colors || PALETTES['ggplot2'].colors;

      cols.forEach((yCol, yIdx) => {
        groups.forEach((g, gIdx) => {
          const globalGIdx = gCol ? allGroupsList.indexOf(String(g)) : gIdx;
          const seriesName = getSeriesName(g, yCol, gCol, totalColsCount);
          const autoColor = paletteColors[(yIdx + globalGIdx * cols.length) % paletteColors.length];
          const styleOverride = getSeriesStyle(seriesName, autoColor, activePointShape);
          const color = styleOverride.color;
          const currentShape = styleOverride.shape;
          
          const seriesData = plotRows
            .filter(r => !gCol || String(r[gCol]) === g)
            .map(r => [r[xCol], r[yCol]])
            .filter(pt => pt[0] !== null && pt[1] !== null);

          option.xAxis.type = isNumeric(seriesData.map(d => d[0])) ? 'value' : 'category';

          if (option.xAxis.type === 'value') {
            seriesData.sort((a, b) => a[0] - b[0]);
          }

          legendData.push(seriesName);
          const symbolConfig = getSymbolConfig(color, activePointSize, false, currentShape);
          option.series.push({
            name: seriesName,
            type: 'line',
            yAxisIndex: axisIndex,
            lineStyle: { width: lineWidth, color: color },
            symbol: symbolConfig.symbol,
            symbolSize: symbolConfig.symbolSize,
            itemStyle: symbolConfig.itemStyle,
            areaStyle: { opacity: 0.35, color: hexToRgba(color, 0.3) },
            data: seriesData
          });
        });
      });
    });

  } else if (type === 'pie') {
    const activeY = yCols[0];
    const slices = plotRows.map(r => {
      return { value: Number(r[activeY]), name: String(r[xCol]) };
    }).filter(d => !isNaN(d.value) && d.value > 0);

    const aggregatedSlices = [];
    const categoryList = [...new Set(slices.map(s => s.name))];
    categoryList.forEach(cat => {
      const sum = slices.filter(s => s.name === cat).reduce((a, b) => a + b.value, 0);
      aggregatedSlices.push({ value: parseFloat(sum.toFixed(3)), name: cat });
    });

    delete option.xAxis;
    delete option.yAxis;

    option.series.push({
      name: activeY,
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: true,
      itemStyle: {
        borderRadius: 8,
        borderColor: backgroundColor,
        borderWidth: 2
      },
      label: {
        show: true,
        formatter: '{b}: {c} ({d}%)',
        textStyle: textStyle
      },
      data: aggregatedSlices
    });
  }

  // Filter legend data
  if (type !== 'pie' && option.legend) {
    option.legend.data = legendData;
  }

  // Append Guide Lines (Marking Lines)
  const activeTab = getActiveTab();
  if (activeTab && activeTab.markingLines && activeTab.markingLines.length > 0) {
    const markLineData = [];
    activeTab.markingLines.forEach(ml => {
      const isY = ml.axis === 'y';
      const symbolType = ml.symbol === 'none' ? 'none' : ml.symbol;
      
      // 1. Line component (if style !== 'none')
      if (ml.style !== 'none') {
        const lineItem = {
          name: ml.label || '',
          lineStyle: {
            color: ml.color,
            type: ml.style,
            width: ml.width
          },
          label: {
            show: ml.label ? true : false,
            position: isY ? 'start' : 'start',
            formatter: ml.label ? `${ml.label}: {c}` : '{c}'
          },
          symbol: ['none', 'none']
        };
        if (isY) {
          lineItem.yAxis = ml.value;
        } else {
          lineItem.xAxis = ml.value;
        }
        markLineData.push(lineItem);
      }
      
      // 2. Symbol component (if symbol !== 'none')
      if (symbolType !== 'none') {
        const symbolItem = {
          name: ml.label || '',
          lineStyle: {
            color: 'transparent',
            type: 'solid',
            width: 0
          },
          itemStyle: {
            color: ml.color
          },
          label: {
            show: (ml.style === 'none' && ml.label) ? true : false,
            position: isY ? 'start' : 'start',
            formatter: ml.label ? `${ml.label}: {c}` : '{c}'
          },
          symbol: [symbolType, 'none'],
          symbolSize: 8
        };
        if (isY) {
          symbolItem.yAxis = ml.value;
        } else {
          symbolItem.xAxis = ml.value;
        }
        markLineData.push(symbolItem);
      }
    });
    
    option.series.push({
      name: 'Guide Lines',
      type: 'line',
      data: [],
      markLine: {
        data: markLineData
      },
      tooltip: { show: false }
    });
  }

  // ========== Y-AXIS POST-PROCESSING: Log / Scientific / Multi-Grid Split ==========
  // Only apply to Cartesian chart types with a numeric Y-axis (not pie, heatmap, histogram)
  const _skipYAxisPostProcess = type === 'pie' || type === 'heatmap' || type === 'histogram';
  if (!_skipYAxisPostProcess && option.xAxis && option.yAxis) {
    const yScaleType = document.getElementById('y-axis-scale-type')?.value || 'linear';
    const yNumFormat = document.getElementById('y-axis-num-format')?.value || 'std';
    const ySplitMode = document.getElementById('y-axis-split-mode')?.value || '1';
    const showPoints = document.getElementById('show-points-checkbox')?.checked || false;

    // Helper: scientific notation formatter
    const sciFormatter = (val) => {
      if (val === 0) return '0';
      return Number(val).toExponential(2);
    };

    // Retrieve manual range parameters from DOM
    const xMinInput = document.getElementById('axis-xmin');
    const xMaxInput = document.getElementById('axis-xmax');
    const yMinInput = document.getElementById('axis-ymin');
    const yMaxInput = document.getElementById('axis-ymax');

    const xMinVal = xMinInput && xMinInput.value !== '' ? parseFloat(xMinInput.value) : null;
    const xMaxVal = xMaxInput && xMaxInput.value !== '' ? parseFloat(xMaxInput.value) : null;
    const yMinVal = yMinInput && yMinInput.value !== '' ? parseFloat(yMinInput.value) : null;
    const yMaxVal = yMaxInput && yMaxInput.value !== '' ? parseFloat(yMaxInput.value) : null;

    if (option.xAxis && option.xAxis.type === 'value') {
      if (xMinVal !== null) option.xAxis.min = xMinVal;
      if (xMaxVal !== null) option.xAxis.max = xMaxVal;
    }

    if (option.yAxis instanceof Array) {
      // ---------- Double Y-axis ----------
      const yAxis1 = option.yAxis[0];
      const yAxis2 = option.yAxis[1];

      // Retrieve manual range parameters for Y2 from DOM
      const y2MinInput = document.getElementById('axis-y2min');
      const y2MaxInput = document.getElementById('axis-y2max');
      const y2MinVal = y2MinInput && y2MinInput.value !== '' ? parseFloat(y2MinInput.value) : null;
      const y2MaxVal = y2MaxInput && y2MaxInput.value !== '' ? parseFloat(y2MaxInput.value) : null;

      // Apply Y1 limits
      if (yMinVal !== null) yAxis1.min = yMinVal;
      if (yMaxVal !== null) yAxis1.max = yMaxVal;

      // Apply Y2 limits
      if (y2MinVal !== null) yAxis2.min = y2MinVal;
      if (y2MaxVal !== null) yAxis2.max = y2MaxVal;

      // Apply scale to both
      if (yScaleType === 'log') {
        yAxis1.type = 'log';
        yAxis1.logBase = 10;
        yAxis2.type = 'log';
        yAxis2.logBase = 10;
      }

      // Apply scientific format to both
      if (yNumFormat === 'sci') {
        yAxis1.axisLabel = {
          ...yAxis1.axisLabel,
          formatter: sciFormatter
        };
        yAxis2.axisLabel = {
          ...yAxis2.axisLabel,
          formatter: sciFormatter
        };
      }
    } else if (ySplitMode === '1') {
      // Apply manual limits / split-tab locked range
      if (yMinVal !== null) {
        option.yAxis.min = yMinVal;
      } else if (gCol && splitCheckbox && splitCheckbox.checked) {
        const globalBounds = getGlobalYBounds(filteredRows, xCol, yCols, gCol, errorBarType, showPoints, type);
        if (globalBounds) option.yAxis.min = parseFloat(globalBounds.min.toFixed(4));
      }

      if (yMaxVal !== null) {
        option.yAxis.max = yMaxVal;
      } else if (gCol && splitCheckbox && splitCheckbox.checked) {
        const globalBounds = getGlobalYBounds(filteredRows, xCol, yCols, gCol, errorBarType, showPoints, type);
        if (globalBounds) option.yAxis.max = parseFloat(globalBounds.max.toFixed(4));
      }

      // ---------- Single grid: just apply scale + format ----------
      if (yScaleType === 'log') {
        option.yAxis.type = 'log';
        option.yAxis.logBase = 10;
      }
      if (yNumFormat === 'sci') {
        option.yAxis.axisLabel = {
          ...option.yAxis.axisLabel,
          formatter: sciFormatter
        };
      }
    } else {
      // ---------- Multi-segment Y-axis split ----------
      const splitParams = getYSplitParamsFromDOM();
      const numSegments = parseInt(ySplitMode);

      // Collect global data range from series for auto-range fallback
      let globalMin = Infinity, globalMax = -Infinity;
      if (gCol && splitCheckbox && splitCheckbox.checked) {
        const globalBounds = getGlobalYBounds(filteredRows, xCol, yCols, gCol, errorBarType, showPoints, type);
        if (globalBounds) {
          globalMin = globalBounds.min;
          globalMax = globalBounds.max;
        }
      } else {
        option.series.forEach(s => {
          if (!s.data) return;
          s.data.forEach(d => {
            let yVal = NaN;
            if (Array.isArray(d)) {
              yVal = Number(d[1]);
            } else if (d && typeof d === 'object' && d.value !== undefined) {
              yVal = Number(Array.isArray(d.value) ? d.value[1] : d.value);
            } else {
              yVal = Number(d);
            }
            if (!isNaN(yVal) && isFinite(yVal)) {
              if (yVal < globalMin) globalMin = yVal;
              if (yVal > globalMax) globalMax = yVal;
            }
          });
        });
      }

      // Apply manual limit overrides if provided
      if (yMinVal !== null) globalMin = yMinVal;
      if (yMaxVal !== null) globalMax = yMaxVal;

      if (!isFinite(globalMin)) globalMin = 0;
      if (!isFinite(globalMax)) globalMax = 100;

      // Resolve segment ranges with auto-defaults
      const segments = []; // ordered bottom-to-top
      if (numSegments === 2) {
        const h1 = splitParams.height1 || 30; // bottom height %
        const h2 = 100 - h1;                  // top height %
        const midPoint = globalMin + (globalMax - globalMin) * 0.4;
        segments.push({
          min: splitParams.min1 !== null ? splitParams.min1 : globalMin,
          max: splitParams.max1 !== null ? splitParams.max1 : midPoint,
          heightPct: h1
        });
        segments.push({
          min: splitParams.min2 !== null ? splitParams.min2 : midPoint,
          max: splitParams.max2 !== null ? splitParams.max2 : globalMax,
          heightPct: h2
        });
      } else if (numSegments === 3) {
        const h1 = splitParams.height1 || 30;
        const h2 = splitParams.height2 || 40;
        const h3 = 100 - h1 - h2;
        const third1 = globalMin + (globalMax - globalMin) * 0.3;
        const third2 = globalMin + (globalMax - globalMin) * 0.7;
        segments.push({
          min: splitParams.min1 !== null ? splitParams.min1 : globalMin,
          max: splitParams.max1 !== null ? splitParams.max1 : third1,
          heightPct: h1
        });
        segments.push({
          min: splitParams.min2 !== null ? splitParams.min2 : third1,
          max: splitParams.max2 !== null ? splitParams.max2 : third2,
          heightPct: h2
        });
        segments.push({
          min: splitParams.min3 !== null ? splitParams.min3 : third2,
          max: splitParams.max3 !== null ? splitParams.max3 : globalMax,
          heightPct: h3
        });
      }

      // Calculate grid positions (bottom-to-top stacking)
      const gapPx = 15; // gap between segments
      const totalGapPx = gapPx * (numSegments - 1);
      const { gridWidth: gW, gridHeight: gH, gridLeft: gL, gridTop: gT } = getPlotDimensions();
      const availableHeight = gH - totalGapPx;

      const grids = [];
      const xAxes = [];
      const yAxes = [];

      // Build from top segment to bottom segment for rendering order
      // segments[0] = bottom, segments[last] = top
      // Grid positions: top-most grid starts at gridTop, going downwards
      let currentTop = gT;
      for (let si = segments.length - 1; si >= 0; si--) {
        const seg = segments[si];
        const segHeight = Math.round(availableHeight * seg.heightPct / 100);
        const gridIdx = segments.length - 1 - si; // 0 = top grid, etc.

        grids.push({
          left: gL,
          top: currentTop,
          width: gW,
          height: segHeight,
          containLabel: false
        });

        // X-axis: only show labels/ticks on the bottom-most segment
        const isBottomSegment = si === 0;
        xAxes.push({
          ...option.xAxis,
          gridIndex: gridIdx,
          position: 'bottom',
          axisLabel: isBottomSegment ? option.xAxis.axisLabel : { show: false },
          axisTick: isBottomSegment ? option.xAxis.axisTick : { show: false },
          axisLine: isBottomSegment ? option.xAxis.axisLine : { show: false },
          name: isBottomSegment ? option.xAxis.name : '',
          nameGap: isBottomSegment ? (option.xAxis.nameGap || 30) : 0,
          splitLine: option.xAxis.splitLine
        });

        // Y-axis: show name only on the middle (or top for 2-segment) segment
        const isNameSegment = numSegments === 2 ? si === 1 : si === 1;
        const yAxisEntry = {
          ...option.yAxis,
          gridIndex: gridIdx,
          type: yScaleType === 'log' ? 'log' : 'value',
          min: seg.min,
          max: seg.max,
          name: isNameSegment ? option.yAxis.name : '',
          nameGap: isNameSegment ? (option.yAxis.nameGap || 45) : 0,
          axisLabel: {
            ...option.yAxis.axisLabel,
            ...(yNumFormat === 'sci' ? { formatter: sciFormatter } : {})
          },
          splitLine: option.yAxis.splitLine
        };
        if (yScaleType === 'log') yAxisEntry.logBase = 10;
        yAxes.push(yAxisEntry);

        currentTop += segHeight + gapPx;
      }

      // Duplicate original series across all grid segments
      const originalSeries = [...option.series];
      const newSeries = [];
      const totalGrids = grids.length;

      originalSeries.forEach(s => {
        // Guide Lines series (markLine only) need special handling
        if (s.markLine && s.data && s.data.length === 0) {
          // Distribute guide lines to their matching segments
          for (let gi = 0; gi < totalGrids; gi++) {
            const segIdx = segments.length - 1 - gi; // map grid index back to segment
            const seg = segments[segIdx];
            const filteredMarkData = s.markLine.data.filter(ml => {
              if (ml.yAxis !== undefined) {
                // Horizontal Y-axis line: belongs to the segment whose range contains the value
                return ml.yAxis >= seg.min && ml.yAxis <= seg.max;
              }
              // Vertical X-axis line: show on all segments
              return true;
            });
            if (filteredMarkData.length > 0) {
              newSeries.push({
                ...s,
                xAxisIndex: gi,
                yAxisIndex: gi,
                markLine: { ...s.markLine, data: filteredMarkData },
                clip: true
              });
            }
          }
        } else {
          // Normal data series: clone to all grids
          for (let gi = 0; gi < totalGrids; gi++) {
            newSeries.push({
              ...s,
              xAxisIndex: gi,
              yAxisIndex: gi,
              clip: true
            });
          }
        }
      });

      // Replace option with multi-grid config
      option.grid = grids;
      option.xAxis = xAxes;
      option.yAxis = yAxes;
      option.series = newSeries;

      // Fix legend position if it references the old single-grid layout
      if (option.legend) {
        const lastGrid = grids[grids.length - 1]; // bottom-most grid
        const legendPos = document.getElementById('legend-position-select')?.value || 'right';
        const legendDistPx = getPlotDimensions().legendDistPx;
        if (legendPos === 'bottom') {
          option.legend.top = lastGrid.top + lastGrid.height + legendDistPx + 25;
        } else if (legendPos === 'top') {
          option.legend.bottom = undefined;
          option.legend.top = gT - legendDistPx - 40;
        }
        // left and right positions remain valid from original calculation
      }
    }
  }

  // Draw options
  appState.chartInstance.setOption(option);
  
  // Refresh annotation drawing layer
  setTimeout(() => {
    alignSvgLayer();
    drawAnnotations();
  }, 150);
}

// 9. Statistical Helper Functions

// Check if array is mostly numeric
function isNumeric(arr) {
  const nums = arr.filter(x => typeof x === 'number' && !isNaN(x));
  return nums.length > arr.length * 0.7; // 70% threshold
}

// Compute Percentile
function getPercentile(data, percentile) {
  const index = percentile * (data.length - 1);
  const low = Math.floor(index);
  const high = Math.ceil(index);
  return data[low] + (data[high] - data[low]) * (index - low);
}

// Compute Boxplot statistics
function calculateBoxplotStats(arr) {
  const sorted = arr.filter(v => typeof v === 'number' && !isNaN(v)).sort((a, b) => a - b);
  if (sorted.length === 0) return [0, 0, 0, 0, 0];
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const q1 = getPercentile(sorted, 0.25);
  const median = getPercentile(sorted, 0.5);
  const q3 = getPercentile(sorted, 0.75);
  return [min, q1, median, q3, max];
}

// Kernel Density Estimation (Gaussian Kernel simulation)
function calculateKdeDensity(data, x) {
  // Bandwidth calculation (Silverman's rule of thumb)
  const mean = data.reduce((a, b) => a + b, 0) / data.length;
  const variance = data.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / data.length;
  const stdDev = Math.sqrt(variance) || 1;
  const bandwidth = 0.9 * stdDev * Math.pow(data.length, -0.2);

  const sum = data.reduce((acc, val) => {
    const u = (x - val) / bandwidth;
    const g = (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * Math.pow(u, 2)); // Gaussian formula
    return acc + g;
  }, 0);

  return sum / (data.length * bandwidth);
}

// Calculate mean, standard deviation, standard error
function getErrorBarStats(vals, type) {
  if (vals.length === 0) return { mean: 0, low: 0, high: 0 };
  const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
  if (vals.length === 1 || type === 'none') {
    return { mean, low: mean, high: mean };
  }
  
  const variance = vals.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / (vals.length - 1);
  const sd = Math.sqrt(variance);
  
  let errorVal = sd;
  if (type === 'sem') {
    errorVal = sd / Math.sqrt(vals.length);
  }
  
  return {
    mean: mean,
    low: mean - errorVal,
    high: mean + errorVal
  };
}

// Render custom error bar lines in ECharts
function renderErrorBarItem(params, api) {
  var xValue = api.value(0);
  var highPoint = api.coord([xValue, api.value(1)]);
  var lowPoint = api.coord([xValue, api.value(2)]);
  var halfWidth = api.size([1, 0])[0] * 0.08; // width of error bar cap
  if (halfWidth > 10) halfWidth = 10;
  if (halfWidth < 4) halfWidth = 4;
  
  const slider = document.getElementById('line-width-slider');
  const configuredLineWidth = slider ? parseInt(slider.value, 10) : 1.5;
  
  var style = api.style({
    stroke: api.visual('color') || '#000000',
    fill: 'none',
    lineWidth: configuredLineWidth
  });
  
  return {
    type: 'group',
    children: [
      {
        type: 'line',
        shape: {
          x1: highPoint[0] - halfWidth, y1: highPoint[1],
          x2: highPoint[0] + halfWidth, y2: highPoint[1]
        },
        style: style
      },
      {
        type: 'line',
        shape: {
          x1: highPoint[0], y1: highPoint[1],
          x2: lowPoint[0], y2: lowPoint[1]
        },
        style: style
      },
      {
        type: 'line',
        shape: {
          x1: lowPoint[0] - halfWidth, y1: lowPoint[1],
          x2: lowPoint[0] + halfWidth, y2: lowPoint[1]
        },
        style: style
      }
    ]
  };
}

// Student's t-distribution two-tailed p-value approximation (AS 3 equivalent)
function studentTProbability(t, df) {
  t = Math.abs(t);
  if (df <= 0) return 1.0;
  
  // Normal approximation for df > 30
  if (df > 30) {
    const z = t * (1 - 1 / (4 * df)) / Math.sqrt(1 + t * t / (2 * df));
    return 2 * (1 - normalCDF(z));
  }
  
  // Series summation for integer degrees of freedom
  const theta = Math.atan(t / Math.sqrt(df));
  let p = 0;
  if (Math.round(df) % 2 === 1) {
    // Odd df
    let sum = 0;
    let term = Math.cos(theta);
    sum += term;
    for (let i = 1; i <= (df - 3) / 2; i++) {
      term = term * Math.cos(theta) * Math.cos(theta) * (2 * i) / (2 * i + 1);
      sum += term;
    }
    p = 1 - 2 * (theta + (df > 1 ? sum * Math.sin(theta) : 0)) / Math.PI;
  } else {
    // Even df
    let sum = 0;
    let term = 1;
    sum += term;
    for (let i = 1; i <= (df - 2) / 2; i++) {
      term = term * Math.cos(theta) * Math.cos(theta) * (2 * i - 1) / (2 * i);
      sum += term;
    }
    p = 1 - sum * Math.sin(theta);
  }
  return Math.max(0, Math.min(1, p));
}

function normalCDF(x) {
  // Abramowitz and Stegun 26.2.17 high precision normal CDF approximation
  const p = 0.2316419;
  const b1 = 0.319381530;
  const b2 = -0.356563782;
  const b3 = 1.781477937;
  const b4 = -1.821255978;
  const b5 = 1.330274429;
  
  const t = 1 / (1 + p * Math.abs(x));
  const absXCDF = 1 - (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-x * x / 2) * (b1 * t + b2 * t * t + b3 * Math.pow(t, 3) + b4 * Math.pow(t, 4) + b5 * Math.pow(t, 5));
  return x >= 0 ? absXCDF : 1 - absXCDF;
}

// Wilson-Hilferty transformation approximation for F-distribution
function fDistributionPValue(f, df1, df2) {
  if (f <= 0) return 1.0;
  
  const d1 = 2 / (9 * df1);
  const d2 = 2 / (9 * df2);
  
  const num = Math.pow(f, 1/3) * (1 - d2) - (1 - d1);
  const den = Math.sqrt(Math.pow(f, 2/3) * d2 + d1);
  const z = num / den;
  
  return Math.max(0, Math.min(1, 1 - normalCDF(z)));
}

// ==============================================================================
// 9.1 Multi-Tab & Saved Charts Sheets state managers
// ==============================================================================

function getActiveTab() {
  if (!appState.activeChartId) return null;
  return appState.savedCharts.find(c => c.id === appState.activeChartId);
}

function createChartTab(name = null, config = null) {
  const id = 'chart_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  const tabName = name || `Chart ${appState.savedCharts.length + 1}`;
  
  const newChart = config || {
    id: id,
    name: tabName,
    sheetName: appState.activeSheetName || '',
    chartType: appState.currentChartType || 'line',
    xCol: DOM.xSelect.value || '',
    yCols: getYCols() || [],
    y2Cols: getY2Cols() || [],
    hasY2Axis: false,
    gCol: DOM.groupSelect.value || '',
    selectedPalette: appState.selectedPalette || 'ggplot2',
    palette2: DOM.palette2Select ? DOM.palette2Select.value : 'ggplot2',
    
    // Style settings
    pointSize: parseInt(DOM.pointSize.value) || 8,
    pointShape: document.getElementById('point-shape-select') ? document.getElementById('point-shape-select').value : 'circle',
    pointSize2: DOM.pointSize2 ? parseInt(DOM.pointSize2.value) : 8,
    pointShape2: document.getElementById('point-shape-2-select') ? document.getElementById('point-shape-2-select').value : 'circle',
    lineWidth: parseInt(DOM.lineWidth.value) || 2,
    barPadding: parseInt(DOM.barPadding.value) || 20,
    boxWidth: parseInt(DOM.boxWidth.value) || 50,
    plotWidth: parseInt(DOM.plotWidth.value) || 15,
    plotHeight: parseInt(DOM.plotHeight.value) || 12,
    xMin: null,
    xMax: null,
    yMin: null,
    yMax: null,
    y2Min: null,
    y2Max: null,
    manualStyleEnabled: document.getElementById('manual-style-checkbox') ? document.getElementById('manual-style-checkbox').checked : false,
    manualStyles: {},
    showPoints: document.getElementById('show-points-checkbox').checked,
    showMean: document.getElementById('show-mean-checkbox').checked,
    errorBarType: document.getElementById('error-bar-select').value || 'none',
    font: DOM.fontSelect.value || 'Inter',
    theme: DOM.themeSelect.value || 'minimal',
    gridX: DOM.gridX.checked,
    gridY: DOM.gridY.checked,
    xAxisShowLabels: DOM.xAxisShowLabels ? DOM.xAxisShowLabels.checked : true,
    xAxisLabelRotate: DOM.xAxisLabelRotate ? parseInt(DOM.xAxisLabelRotate.value) : 0,
    
    // Size and legend settings
    legendPosition: document.getElementById('legend-position-select').value || 'bottom',
    legendDistance: document.getElementById('legend-distance-slider') ? parseFloat(document.getElementById('legend-distance-slider').value) : 0.8,
    individualCurves: document.getElementById('individual-curves-checkbox').checked,
    markingLines: [],
    
    // Filter settings
    activeGroups: null, // null means initial default state
    splitGroups: false,
    
    // Text titles
    chartTitle: '',
    chartXLabel: '',
    chartYLabel: '',
    chartY2Label: '',
    
    // Y-axis customization
    yScaleType: 'linear',
    yNumFormat: 'std',
    ySplitMode: '1',
    ySplitParams: null,
    
    // Tab filters
    chartFilters: appState.activeData ? [{ col: appState.activeData.headers[0] || '', op: '=', val: '' }] : [],

    // Tab Font overrides
    titleFontSize: 16,
    titleFontColor: '#334155',
    axisTitleFontSize: 13,
    axisTitleFontColor: '#334155',
    axisValueFontSize: 12,
    axisValueFontColor: '#475569',
    legendFontSize: 12,
    legendFontColor: '#475569',

    // SVG annotations array
    annotations: []
  };

  appState.savedCharts.push(newChart);
  appState.activeChartId = id;
  
  renderChartTabs();
  applyChartTabState(newChart);
  return newChart;
}

function saveActiveTabState() {
  if (!appState.activeChartId) return;
  const tab = appState.savedCharts.find(c => c.id === appState.activeChartId);
  if (!tab) return;
  
  tab.sheetName = appState.activeSheetName;
  tab.chartType = appState.currentChartType;
  tab.xCol = DOM.xSelect.value;
  tab.yCols = getYCols();
  tab.y2Cols = getY2Cols();
  tab.hasY2Axis = document.getElementById('y2-axis-group').style.display !== 'none';
  tab.gCol = DOM.groupSelect.value;
  tab.selectedPalette = appState.selectedPalette;
  tab.palette2 = DOM.palette2Select ? DOM.palette2Select.value : 'ggplot2';
  
  // Style settings
  tab.pointSize = parseInt(DOM.pointSize.value);
  const pointShapeEl = document.getElementById('point-shape-select');
  tab.pointShape = pointShapeEl ? pointShapeEl.value : 'circle';
  tab.pointSize2 = DOM.pointSize2 ? parseInt(DOM.pointSize2.value) : 8;
  const pointShape2El = document.getElementById('point-shape-2-select');
  tab.pointShape2 = pointShape2El ? pointShape2El.value : 'circle';
  tab.lineWidth = parseInt(DOM.lineWidth.value);
  tab.barPadding = parseInt(DOM.barPadding.value);
  tab.boxWidth = parseInt(DOM.boxWidth.value);
  tab.plotWidth = parseInt(DOM.plotWidth.value);
  tab.plotHeight = parseInt(DOM.plotHeight.value);
  
  const xMinInput = document.getElementById('axis-xmin');
  const xMaxInput = document.getElementById('axis-xmax');
  const yMinInput = document.getElementById('axis-ymin');
  const yMaxInput = document.getElementById('axis-ymax');
  const y2MinInput = document.getElementById('axis-y2min');
  const y2MaxInput = document.getElementById('axis-y2max');
  tab.xMin = xMinInput && xMinInput.value !== '' ? parseFloat(xMinInput.value) : null;
  tab.xMax = xMaxInput && xMaxInput.value !== '' ? parseFloat(xMaxInput.value) : null;
  tab.yMin = yMinInput && yMinInput.value !== '' ? parseFloat(yMinInput.value) : null;
  tab.yMax = yMaxInput && yMaxInput.value !== '' ? parseFloat(yMaxInput.value) : null;
  tab.y2Min = y2MinInput && y2MinInput.value !== '' ? parseFloat(y2MinInput.value) : null;
  tab.y2Max = y2MaxInput && y2MaxInput.value !== '' ? parseFloat(y2MaxInput.value) : null;

  tab.showPoints = document.getElementById('show-points-checkbox').checked;
  tab.showMean = document.getElementById('show-mean-checkbox').checked;
  tab.errorBarType = document.getElementById('error-bar-select').value;
  tab.font = DOM.fontSelect.value;
  tab.theme = DOM.themeSelect.value;
  tab.gridX = DOM.gridX.checked;
  tab.gridY = DOM.gridY.checked;
  tab.xAxisShowLabels = DOM.xAxisShowLabels.checked;
  tab.xAxisLabelRotate = parseInt(DOM.xAxisLabelRotate.value);
  
  // Size and legend settings
  tab.legendPosition = document.getElementById('legend-position-select').value;
  const legDistSlider = document.getElementById('legend-distance-slider');
  tab.legendDistance = legDistSlider ? parseFloat(legDistSlider.value) : 0.8;
  tab.individualCurves = document.getElementById('individual-curves-checkbox').checked;
  if (!tab.markingLines) tab.markingLines = [];
  
  // Group selection
  const checkboxes = document.querySelectorAll('.group-filter-checkbox');
  if (checkboxes.length > 0) {
    tab.activeGroups = Array.from(checkboxes).filter(cb => cb.checked).map(cb => cb.value);
  } else {
    tab.activeGroups = null;
  }
  tab.splitGroups = document.getElementById('group-tabs-checkbox').checked;
  
  // Save manual styling preferences
  const manualStyleCheckbox = document.getElementById('manual-style-checkbox');
  tab.manualStyleEnabled = manualStyleCheckbox ? manualStyleCheckbox.checked : false;
  
  const manualStylesMap = {};
  const manualStyleRows = document.querySelectorAll('#manual-styles-list .manual-style-row');
  manualStyleRows.forEach(row => {
    const target = row.dataset.target;
    const isEnabled = row.querySelector('.manual-target-enable').checked;
    const color = row.querySelector('.manual-target-color').value;
    const shape = row.querySelector('.manual-target-shape').value;
    manualStylesMap[target] = { enabled: isEnabled, color: color, shape: shape };
  });
  tab.manualStyles = manualStylesMap;
  
  // Quick Title Editor
  tab.chartTitle = document.getElementById('chart-title-input').value;
  tab.chartXLabel = document.getElementById('chart-xlabel-input').value;
  tab.chartYLabel = document.getElementById('chart-ylabel-input').value;
  tab.chartY2Label = document.getElementById('chart-y2label-input') ? document.getElementById('chart-y2label-input').value : '';
  
  // Y-axis customization
  const yScaleEl = document.getElementById('y-axis-scale-type');
  const yFmtEl = document.getElementById('y-axis-num-format');
  const ySplitEl = document.getElementById('y-axis-split-mode');
  tab.yScaleType = yScaleEl ? yScaleEl.value : 'linear';
  tab.yNumFormat = yFmtEl ? yFmtEl.value : 'std';
  tab.ySplitMode = ySplitEl ? ySplitEl.value : '1';
  tab.ySplitParams = (tab.ySplitMode !== '1') ? getYSplitParamsFromDOM() : null;

  // Chart Filters saving
  const filterRows = document.querySelectorAll('.chart-filter-row');
  const filters = [];
  filterRows.forEach(row => {
    const colSelect = row.querySelector('.chart-filter-col');
    const opSelect = row.querySelector('.chart-filter-op');
    const valInput = row.querySelector('.chart-filter-val');
    if (colSelect && opSelect && valInput) {
      filters.push({ col: colSelect.value, op: opSelect.value, val: valInput.value });
    }
  });
  tab.chartFilters = filters;

  // Font settings saving
  const titleSizeEl = document.getElementById('title-font-size');
  const titleColorEl = document.getElementById('title-font-color');
  const axisTitleSizeEl = document.getElementById('axis-title-font-size');
  const axisTitleColorEl = document.getElementById('axis-title-font-color');
  const axisValueSizeEl = document.getElementById('axis-value-font-size');
  const axisValueColorEl = document.getElementById('axis-value-font-color');
  const legendSizeEl = document.getElementById('legend-font-size');
  const legendColorEl = document.getElementById('legend-font-color');

  if (titleSizeEl) tab.titleFontSize = parseInt(titleSizeEl.value, 10) || 16;
  if (titleColorEl) tab.titleFontColor = titleColorEl.value;
  if (axisTitleSizeEl) tab.axisTitleFontSize = parseInt(axisTitleSizeEl.value, 10) || 13;
  if (axisTitleColorEl) tab.axisTitleFontColor = axisTitleColorEl.value;
  if (axisValueSizeEl) tab.axisValueFontSize = parseInt(axisValueSizeEl.value, 10) || 12;
  if (axisValueColorEl) tab.axisValueFontColor = axisValueColorEl.value;
  if (legendSizeEl) tab.legendFontSize = parseInt(legendSizeEl.value, 10) || 12;
  if (legendColorEl) tab.legendFontColor = legendColorEl.value;
  
  // Annotations
  tab.annotations = serializeAnnotations();
}

function applyChartTabState(tab) {
  if (!tab) return;
  
  // If sheet changed, switch active sheet
  if (tab.sheetName && tab.sheetName !== appState.activeSheetName && appState.sheets[tab.sheetName]) {
    appState.activeSheetName = tab.sheetName;
    appState.activeData = appState.sheets[tab.sheetName];
    DOM.sheetSelect.value = tab.sheetName;
    updateDataGrid();
    updateMappingDropdowns();
  }
  
  // Restore column selects
  if (tab.xCol) DOM.xSelect.value = tab.xCol;
  
  renderYColsUI();
  toggleSecondaryYAxisStyles();
  
  if (tab.gCol !== undefined) {
    DOM.groupSelect.value = tab.gCol;
  }
  
  // Restore palette
  if (tab.selectedPalette) {
    appState.selectedPalette = tab.selectedPalette;
    if (DOM.paletteSelect) {
      DOM.paletteSelect.value = tab.selectedPalette;
    }
    updatePalettePreviewBar();
  }

  if (DOM.palette2Select) {
    DOM.palette2Select.value = tab.palette2 || 'ggplot2';
    updatePalette2PreviewBar();
  }
  
  // Restore chart type
  if (tab.chartType) {
    appState.currentChartType = tab.chartType;
    document.querySelectorAll('.chart-card').forEach(c => {
      if (c.dataset.chart === tab.chartType) {
        c.classList.add('active');
      } else {
        c.classList.remove('active');
      }
    });
  }
  
  DOM.pointSize.value = tab.pointSize;
  DOM.pointSizeVal.textContent = tab.pointSize;
  
  if (DOM.pointSize2) {
    DOM.pointSize2.value = tab.pointSize2 !== undefined ? tab.pointSize2 : 8;
    if (DOM.pointSize2Val) DOM.pointSize2Val.textContent = DOM.pointSize2.value;
  }
  
  const pointShapeEl = document.getElementById('point-shape-select');
  if (pointShapeEl) {
    pointShapeEl.value = tab.pointShape || 'circle';
  }

  const pointShape2El = document.getElementById('point-shape-2-select');
  if (pointShape2El) {
    pointShape2El.value = tab.pointShape2 || 'circle';
  }
  
  DOM.lineWidth.value = tab.lineWidth;
  DOM.lineWidthVal.textContent = tab.lineWidth;

  const xMinInput = document.getElementById('axis-xmin');
  const xMaxInput = document.getElementById('axis-xmax');
  const yMinInput = document.getElementById('axis-ymin');
  const yMaxInput = document.getElementById('axis-ymax');
  const y2MinInput = document.getElementById('axis-y2min');
  const y2MaxInput = document.getElementById('axis-y2max');
  if (xMinInput) xMinInput.value = tab.xMin !== undefined && tab.xMin !== null ? tab.xMin : '';
  if (xMaxInput) xMaxInput.value = tab.xMax !== undefined && tab.xMax !== null ? tab.xMax : '';
  if (yMinInput) yMinInput.value = tab.yMin !== undefined && tab.yMin !== null ? tab.yMin : '';
  if (yMaxInput) yMaxInput.value = tab.yMax !== undefined && tab.yMax !== null ? tab.yMax : '';
  if (y2MinInput) y2MinInput.value = tab.y2Min !== undefined && tab.y2Min !== null ? tab.y2Min : '';
  if (y2MaxInput) y2MaxInput.value = tab.y2Max !== undefined && tab.y2Max !== null ? tab.y2Max : '';
  
  DOM.barPadding.value = tab.barPadding;
  DOM.barPaddingVal.textContent = tab.barPadding + '%';
  
  DOM.boxWidth.value = tab.boxWidth;
  DOM.boxWidthVal.textContent = tab.boxWidth + '%';

  if (tab.plotWidth) {
    DOM.plotWidth.value = tab.plotWidth;
    DOM.plotWidthVal.textContent = tab.plotWidth + ' cm';
  }
  if (tab.plotHeight) {
    DOM.plotHeight.value = tab.plotHeight;
    DOM.plotHeightVal.textContent = tab.plotHeight + ' cm';
  }
  
  document.getElementById('show-points-checkbox').checked = !!tab.showPoints;
  document.getElementById('show-mean-checkbox').checked = !!tab.showMean;
  
  if (tab.errorBarType) {
    document.getElementById('error-bar-select').value = tab.errorBarType;
  }
  
  DOM.fontSelect.value = tab.font || 'Inter';
  DOM.themeSelect.value = tab.theme || 'minimal';
  DOM.gridX.checked = !!tab.gridX;
  DOM.gridY.checked = !!tab.gridY;
  DOM.xAxisShowLabels.checked = tab.xAxisShowLabels !== undefined ? tab.xAxisShowLabels : true;
  DOM.xAxisLabelRotate.value = tab.xAxisLabelRotate !== undefined ? tab.xAxisLabelRotate : 0;
  DOM.xAxisLabelRotateVal.textContent = DOM.xAxisLabelRotate.value + '°';
  
  // Restore size and legend settings
  document.getElementById('legend-position-select').value = tab.legendPosition || 'bottom';
  
  const legDistSlider = document.getElementById('legend-distance-slider');
  const legDistVal = document.getElementById('legend-distance-val');
  if (legDistSlider) {
    legDistSlider.value = tab.legendDistance !== undefined ? tab.legendDistance : 0.8;
    if (legDistVal) legDistVal.textContent = legDistSlider.value + ' cm';
  }
  
  document.getElementById('individual-curves-checkbox').checked = !!tab.individualCurves;
  updateStatsGroupsList();
  
  // Restore marking lines array
  if (!tab.markingLines) {
    tab.markingLines = [];
  }
  
  applyCanvasDimensions();
  renderGuideLinesList();
  
  // Quick Title Editor
  document.getElementById('chart-title-input').value = tab.chartTitle || '';
  document.getElementById('chart-xlabel-input').value = tab.chartXLabel || '';
  document.getElementById('chart-ylabel-input').value = tab.chartYLabel || '';
  const y2LabelInput = document.getElementById('chart-y2label-input');
  if (y2LabelInput) y2LabelInput.value = tab.chartY2Label || '';
  toggleSecondaryYAxisStyles();
  
  // Restore Y-axis customization
  const yScaleEl = document.getElementById('y-axis-scale-type');
  const yFmtEl = document.getElementById('y-axis-num-format');
  const ySplitEl = document.getElementById('y-axis-split-mode');
  if (yScaleEl) yScaleEl.value = tab.yScaleType || 'linear';
  if (yFmtEl) yFmtEl.value = tab.yNumFormat || 'std';
  if (ySplitEl) ySplitEl.value = tab.ySplitMode || '1';
  renderYSplitControls(tab.ySplitMode || '1', tab.ySplitParams);

  // Restore Font style customization
  const titleSizeEl = document.getElementById('title-font-size');
  const titleColorEl = document.getElementById('title-font-color');
  const axisTitleSizeEl = document.getElementById('axis-title-font-size');
  const axisTitleColorEl = document.getElementById('axis-title-font-color');
  const axisValueSizeEl = document.getElementById('axis-value-font-size');
  const axisValueColorEl = document.getElementById('axis-value-font-color');
  const legendSizeEl = document.getElementById('legend-font-size');
  const legendColorEl = document.getElementById('legend-font-color');

  if (titleSizeEl) titleSizeEl.value = tab.titleFontSize !== undefined ? tab.titleFontSize : 16;
  if (titleColorEl) titleColorEl.value = tab.titleFontColor || '#334155';
  if (axisTitleSizeEl) axisTitleSizeEl.value = tab.axisTitleFontSize !== undefined ? tab.axisTitleFontSize : 13;
  if (axisTitleColorEl) axisTitleColorEl.value = tab.axisTitleFontColor || '#334155';
  if (axisValueSizeEl) axisValueSizeEl.value = tab.axisValueFontSize !== undefined ? tab.axisValueFontSize : 12;
  if (axisValueColorEl) axisValueColorEl.value = tab.axisValueFontColor || '#475569';
  if (legendSizeEl) legendSizeEl.value = tab.legendFontSize !== undefined ? tab.legendFontSize : 12;
  if (legendColorEl) legendColorEl.value = tab.legendFontColor || '#475569';

  // Restore tab-specific data filters
  const filtersContainer = document.getElementById('chart-filters-container');
  if (filtersContainer) {
    filtersContainer.innerHTML = '';
    if (tab.chartFilters && tab.chartFilters.length > 0) {
      tab.chartFilters.forEach(f => {
        addChartFilterRow(f.col, f.op, f.val);
      });
    } else {
      // If no filters exist, by default add one empty filter row
      if (appState.activeData) {
        addChartFilterRow();
      }
    }
  }
  
  // Restore Column Mapping labels for active chart type
  updateColumnMappingInputs(tab.chartType || appState.currentChartType);
  
  // Group selection checkboxes
  updateGroupCheckboxes(tab.activeGroups, tab.splitGroups);
  
  // Restore manual styling options
  const manualStyleCheckbox = document.getElementById('manual-style-checkbox');
  if (manualStyleCheckbox) {
    manualStyleCheckbox.checked = !!tab.manualStyleEnabled;
  }
  updateManualStylesList();

  // Restore annotations
  deserializeAnnotations(tab.annotations || []);
  
  // Redraw
  drawChart();
  recommendStatisticalTest();
}

function renderChartTabs() {
  const tabsList = document.getElementById('chart-tabs-list');
  tabsList.innerHTML = '';
  
  appState.savedCharts.forEach((tab, index) => {
    const tabEl = document.createElement('div');
    tabEl.className = `chart-tab ${tab.id === appState.activeChartId ? 'active' : ''}`;
    tabEl.dataset.id = tab.id;
    
    // Label click switches tabs
    const label = document.createElement('span');
    label.textContent = tab.name;
    label.title = 'Double click to rename';
    label.addEventListener('click', () => {
      if (tab.id !== appState.activeChartId) {
        saveActiveTabState();
        appState.activeChartId = tab.id;
        renderChartTabs();
        applyChartTabState(tab);
      }
    });
    
    // Double click to rename
    label.addEventListener('dblclick', () => {
      const newName = prompt('Enter new chart sheet name:', tab.name);
      if (newName && newName.trim() !== '') {
        tab.name = newName.trim();
        renderChartTabs();
      }
    });
    
    tabEl.appendChild(label);
    
    // Close button
    if (appState.savedCharts.length > 1) {
      const closeBtn = document.createElement('button');
      closeBtn.className = 'close-tab-btn';
      closeBtn.innerHTML = '×';
      closeBtn.title = 'Delete chart';
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (confirm(`Are you sure you want to delete "${tab.name}"?`)) {
          deleteChartTab(tab.id);
        }
      });
      tabEl.appendChild(closeBtn);
    }
    
    tabsList.appendChild(tabEl);
  });
}

function deleteChartTab(id) {
  const index = appState.savedCharts.findIndex(c => c.id === id);
  if (index === -1) return;
  
  appState.savedCharts.splice(index, 1);
  
  if (appState.activeChartId === id) {
    const nextActiveTab = appState.savedCharts[Math.max(0, index - 1)];
    appState.activeChartId = nextActiveTab.id;
    applyChartTabState(nextActiveTab);
  }
  
  renderChartTabs();
}

// ==============================================================================
// 9.2 Grouping Filtering checklist UI & Group sub tabs
// ==============================================================================

let currentSplitGroupTab = 'ALL';

function updateGroupCheckboxes(activeGroups = null, splitChecked = false) {
  const gCol = DOM.groupSelect.value;
  const container = document.getElementById('group-options-container');
  const list = document.getElementById('group-checkboxes-list');
  const splitCheckbox = document.getElementById('group-tabs-checkbox');
  
  if (!gCol) {
    container.style.display = 'none';
    list.innerHTML = '';
    splitCheckbox.checked = false;
    document.getElementById('group-tabs-bar').style.display = 'none';
    return;
  }
  
  container.style.display = 'block';
  list.innerHTML = '';
  splitCheckbox.checked = splitChecked;
  
  const rows = appState.activeData ? appState.activeData.rows : [];
  const uniqueGroups = [...new Set(rows.map(r => String(r[gCol])).filter(v => v !== null && v !== 'undefined' && v !== ''))].sort();
  
  // Select All/Deselect All helper
  const allLabel = document.createElement('label');
  allLabel.className = 'checkbox-label';
  allLabel.style.fontWeight = 'bold';
  const allInput = document.createElement('input');
  allInput.type = 'checkbox';
  allLabel.appendChild(allInput);
  const allSpan = document.createElement('span');
  allSpan.textContent = 'Toggle All (全选/全不选)';
  allLabel.appendChild(allSpan);
  list.appendChild(allLabel);

  const checkboxes = [];
  uniqueGroups.forEach(g => {
    const lbl = document.createElement('label');
    lbl.className = 'checkbox-label';
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.className = 'group-filter-checkbox';
    cb.value = g;
    
    const isBlank = (val) => {
      const s = String(val).toLowerCase().trim();
      return s === 'null' || s === 'undefined' || s === '' || s === 'nan';
    };
    
    if (activeGroups === null) {
      cb.checked = !isBlank(g);
    } else {
      cb.checked = activeGroups.includes(g);
    }
    
    cb.addEventListener('change', () => {
      const checkedBoxes = checkboxes.filter(x => x.checked);
      allInput.checked = checkedBoxes.length === checkboxes.length;
      saveActiveTabState();
      drawChart();
    });
    
    checkboxes.push(cb);
    lbl.appendChild(cb);
    const span = document.createElement('span');
    span.textContent = g;
    lbl.appendChild(span);
    list.appendChild(lbl);
  });
  
  // Set initial Toggle All state based on checkboxes
  allInput.checked = checkboxes.length > 0 && checkboxes.every(x => x.checked);
  
  allInput.addEventListener('change', () => {
    checkboxes.forEach(cb => {
      cb.checked = allInput.checked;
    });
    saveActiveTabState();
    drawChart();
  });
}

function renderGroupTabs(groups) {
  const bar = document.getElementById('group-tabs-bar');
  const list = document.getElementById('group-tabs-list');
  const splitCheckbox = document.getElementById('group-tabs-checkbox');
  
  if (!splitCheckbox.checked || groups.length <= 1) {
    bar.style.display = 'none';
    list.innerHTML = '';
    currentSplitGroupTab = 'ALL';
    return;
  }
  
  bar.style.display = 'block';
  list.innerHTML = '';
  
  const allTab = document.createElement('div');
  allTab.className = `group-tab ${currentSplitGroupTab === 'ALL' ? 'active' : ''}`;
  allTab.textContent = 'All Groups (合并图表)';
  allTab.addEventListener('click', () => {
    currentSplitGroupTab = 'ALL';
    renderGroupTabs(groups);
    drawChart();
  });
  list.appendChild(allTab);
  
  groups.forEach(g => {
    const tab = document.createElement('div');
    tab.className = `group-tab ${currentSplitGroupTab === g ? 'active' : ''}`;
    tab.textContent = g;
    tab.addEventListener('click', () => {
      currentSplitGroupTab = g;
      renderGroupTabs(groups);
      drawChart();
    });
    list.appendChild(tab);
  });
}

// ==============================================================================
// 9.3 Statistical Analyzers (Welch t-test, ANOVA, Regression) & Brackets
// ==============================================================================

let lastStatsResults = null;

// Statistical Distributions and Helpers
function chiSquarePValue(chiSq, df) {
  if (chiSq <= 0) return 1.0;
  if (df <= 0) return 1.0;
  if (df === 1) {
    return 2 * (1 - normalCDF(Math.sqrt(chiSq)));
  }
  // Wilson-Hilferty transformation
  const d = 2 / (9 * df);
  const num = Math.pow(chiSq / df, 1/3) - (1 - d);
  const den = Math.sqrt(d);
  const z = num / den;
  return Math.max(0, Math.min(1, 1 - normalCDF(z)));
}

function calculateStudentTTest(valsA, valsB) {
  const nA = valsA.length;
  const nB = valsB.length;
  const meanA = valsA.reduce((a, b) => a + b, 0) / nA;
  const meanB = valsB.reduce((a, b) => a + b, 0) / nB;
  const varA = valsA.reduce((sum, v) => sum + Math.pow(v - meanA, 2), 0) / (nA - 1);
  const varB = valsB.reduce((sum, v) => sum + Math.pow(v - meanB, 2), 0) / (nB - 1);
  const df = nA + nB - 2;
  const pooledVar = ((nA - 1) * varA + (nB - 1) * varB) / df;
  const se = Math.sqrt(pooledVar * (1 / nA + 1 / nB));
  const t = se === 0 ? 0 : (meanA - meanB) / se;
  const p = studentTProbability(t, df);
  return { t, df, p, meanA, meanB, nA, nB };
}

function calculateWelchTTest(valsA, valsB) {
  const nA = valsA.length;
  const nB = valsB.length;
  const meanA = valsA.reduce((a, b) => a + b, 0) / nA;
  const meanB = valsB.reduce((a, b) => a + b, 0) / nB;
  const varA = valsA.reduce((sum, v) => sum + Math.pow(v - meanA, 2), 0) / (nA - 1);
  const varB = valsB.reduce((sum, v) => sum + Math.pow(v - meanB, 2), 0) / (nB - 1);
  const seA = varA / nA;
  const seB = varB / nB;
  const t = (seA + seB === 0) ? 0 : (meanA - meanB) / Math.sqrt(seA + seB);
  const df = Math.pow(seA + seB, 2) / ((Math.pow(seA, 2) / (nA - 1)) + (Math.pow(seB, 2) / (nB - 1)));
  const p = studentTProbability(t, Math.round(df));
  return { t, df, p, meanA, meanB, nA, nB };
}

function calculatePairedTTest(valsA, valsB) {
  const n = Math.min(valsA.length, valsB.length);
  if (n < 2) throw new Error("At least 2 pairs are required for a paired t-test.");
  const diffs = [];
  for (let i = 0; i < n; i++) {
    diffs.push(valsA[i] - valsB[i]);
  }
  const meanDiff = diffs.reduce((a, b) => a + b, 0) / n;
  const varDiff = diffs.reduce((sum, v) => sum + Math.pow(v - meanDiff, 2), 0) / (n - 1);
  const se = Math.sqrt(varDiff / n);
  const t = se === 0 ? 0 : meanDiff / se;
  const df = n - 1;
  const p = studentTProbability(t, df);
  return { t, df, p, meanDiff, n };
}

function calculateMannWhitneyU(valsA, valsB) {
  const nA = valsA.length;
  const nB = valsB.length;
  
  const combined = [];
  valsA.forEach((v, idx) => combined.push({ val: v, group: 'A', idx }));
  valsB.forEach((v, idx) => combined.push({ val: v, group: 'B', idx }));
  
  const sorted = combined.slice().sort((a, b) => a.val - b.val);
  
  let i = 0;
  const tieGroups = [];
  while (i < sorted.length) {
    let j = i + 1;
    while (j < sorted.length && sorted[j].val === sorted[i].val) {
      j++;
    }
    const rank = (i + 1 + j) / 2;
    const tieCount = j - i;
    if (tieCount > 1) {
      tieGroups.push(tieCount);
    }
    for (let k = i; k < j; k++) {
      sorted[k].rank = rank;
    }
    i = j;
  }
  
  let sumRankA = 0;
  sorted.forEach(item => {
    if (item.group === 'A') {
      sumRankA += item.rank;
    }
  });
  
  const U_A = sumRankA - (nA * (nA + 1)) / 2;
  const U_B = nA * nB - U_A;
  const U = Math.min(U_A, U_B);
  
  const N = nA + nB;
  const meanU = (nA * nB) / 2;
  
  const tieSum = tieGroups.reduce((acc, t) => acc + (Math.pow(t, 3) - t), 0);
  let varU;
  if (tieSum > 0) {
    varU = (nA * nB / 12) * ((N + 1) - tieSum / (N * (N - 1)));
  } else {
    varU = (nA * nB * (N + 1)) / 12;
  }
  
  const sdU = Math.sqrt(varU);
  let z = 0;
  if (sdU > 0) {
    z = (Math.abs(U - meanU) - 0.5) / sdU;
  }
  const p = 2 * (1 - normalCDF(z));
  
  return { U, meanU, p, nA, nB, sumRankA };
}

function calculateWelchANOVA(groupsData) {
  const keys = Array.from(groupsData.keys()).sort();
  const k = keys.length;
  if (k < 2) throw new Error("At least 2 groups are required for ANOVA.");
  
  const n = [];
  const means = [];
  const vars = [];
  const w = [];
  let W = 0;
  
  for (let i = 0; i < k; i++) {
    const vals = groupsData.get(keys[i]);
    const ni = vals.length;
    if (ni < 2) throw new Error(`Group "${keys[i]}" must have at least 2 observations.`);
    const mean = vals.reduce((a, b) => a + b, 0) / ni;
    const variance = vals.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / (ni - 1);
    
    n.push(ni);
    means.push(mean);
    vars.push(variance);
    
    const weight = ni / (variance || 0.00001);
    w.push(weight);
    W += weight;
  }
  
  let weightedMean = 0;
  for (let i = 0; i < k; i++) {
    weightedMean += w[i] * means[i];
  }
  weightedMean /= W;
  
  let ssb = 0;
  for (let i = 0; i < k; i++) {
    ssb += w[i] * Math.pow(means[i] - weightedMean, 2);
  }
  
  let lambda = 0;
  for (let i = 0; i < k; i++) {
    lambda += Math.pow(1 - w[i] / W, 2) / (n[i] - 1);
  }
  
  const df1 = k - 1;
  const df2 = (k * k - 1) / (3 * lambda);
  const f = (ssb / (k - 1)) / (1 + (2 * (k - 2) / (k * k - 1)) * lambda);
  const p = fDistributionPValue(f, df1, df2);
  
  return { f, df1, df2, p, keys, n, means, vars };
}

function calculateKruskalWallis(groupsData) {
  const keys = Array.from(groupsData.keys()).sort();
  const k = keys.length;
  
  const combined = [];
  keys.forEach(key => {
    groupsData.get(key).forEach(v => {
      combined.push({ val: v, group: key });
    });
  });
  
  const N = combined.length;
  const sorted = combined.slice().sort((a, b) => a.val - b.val);
  
  let i = 0;
  const tieGroups = [];
  while (i < sorted.length) {
    let j = i + 1;
    while (j < sorted.length && sorted[j].val === sorted[i].val) {
      j++;
    }
    const rank = (i + 1 + j) / 2;
    const tieCount = j - i;
    if (tieCount > 1) {
      tieGroups.push(tieCount);
    }
    for (let k = i; k < j; k++) {
      sorted[k].rank = rank;
    }
    i = j;
  }
  
  const rankSums = {};
  keys.forEach(key => { rankSums[key] = 0; });
  sorted.forEach(item => {
    rankSums[item.group] += item.rank;
  });
  
  let sumSqR_over_n = 0;
  keys.forEach(key => {
    const R = rankSums[key];
    const n = groupsData.get(key).length;
    sumSqR_over_n += (R * R) / n;
  });
  
  const H_raw = (12 / (N * (N + 1))) * sumSqR_over_n - 3 * (N + 1);
  
  const tieSum = tieGroups.reduce((acc, t) => acc + (Math.pow(t, 3) - t), 0);
  let H = H_raw;
  if (tieSum > 0) {
    const C = 1 - tieSum / (Math.pow(N, 3) - N);
    H = H_raw / C;
  }
  
  const df = k - 1;
  const p = chiSquarePValue(H, df);
  
  return { H, df, p, keys, rankSums };
}

function getArrayRanks(arr) {
  const indexed = arr.map((val, idx) => ({ val, idx }));
  const sorted = indexed.slice().sort((a, b) => a.val - b.val);
  let i = 0;
  while (i < sorted.length) {
    let j = i + 1;
    while (j < sorted.length && sorted[j].val === sorted[i].val) {
      j++;
    }
    const rank = (i + 1 + j) / 2;
    for (let k = i; k < j; k++) {
      sorted[k].rank = rank;
    }
    i = j;
  }
  const ranks = new Array(arr.length);
  sorted.forEach(item => {
    ranks[item.idx] = item.rank;
  });
  return ranks;
}

function calculateCorrelation(xVals, yVals, method = 'pearson') {
  const N = xVals.length;
  if (N < 3) throw new Error("At least 3 pairs are required for correlation.");
  
  let finalXVals = xVals;
  let finalYVals = yVals;
  
  if (method === 'spearman') {
    finalXVals = getArrayRanks(xVals);
    finalYVals = getArrayRanks(yVals);
  }
  
  const xMean = finalXVals.reduce((a, b) => a + b, 0) / N;
  const yMean = finalYVals.reduce((a, b) => a + b, 0) / N;
  
  let num = 0;
  let denX = 0;
  let denY = 0;
  for (let i = 0; i < N; i++) {
    const dx = finalXVals[i] - xMean;
    const dy = finalYVals[i] - yMean;
    num += dx * dy;
    denX += dx * dx;
    denY += dy * dy;
  }
  
  const r = (denX !== 0 && denY !== 0) ? num / Math.sqrt(denX * denY) : 0;
  const r2 = r * r;
  const df = N - 2;
  const t = r2 < 1.0 ? r * Math.sqrt(df / (1 - r2)) : 0;
  const p = studentTProbability(t, df);
  
  return { r, r2, t, df, p };
}

function calculateChiSquareContingency(observedTable, uniqueX, uniqueY) {
  const r = observedTable.length;
  const c = observedTable[0].length;
  
  const rowTotals = observedTable.map(row => row.reduce((a, b) => a + b, 0));
  const colTotals = new Array(c).fill(0);
  for (let j = 0; j < c; j++) {
    for (let i = 0; i < r; i++) {
      colTotals[j] += observedTable[i][j];
    }
  }
  
  const N = rowTotals.reduce((a, b) => a + b, 0);
  if (N === 0) throw new Error("Contingency table is empty.");
  
  let chiSq = 0;
  const expectedTable = observedTable.map(() => new Array(c).fill(0));
  for (let i = 0; i < r; i++) {
    for (let j = 0; j < c; j++) {
      const E = (rowTotals[i] * colTotals[j]) / N;
      expectedTable[i][j] = E;
      if (E > 0) {
        chiSq += Math.pow(observedTable[i][j] - E, 2) / E;
      }
    }
  }
  
  const df = (r - 1) * (c - 1);
  const p = chiSquarePValue(chiSq, df);
  
  return { chiSq, df, p, expectedTable, rowTotals, colTotals, N };
}

function recommendStatisticalTest() {
  // Recommendation removed per user request
}

function runStatisticalTestOld() {
  const xCol = DOM.xSelect.value;
  const yCols = getYCols();
  const gCol = DOM.groupSelect.value;
  let rows = getFilteredRows();
  
  if (!xCol || yCols.length === 0 || rows.length === 0) {
    alert('Please load data and map columns first.');
    return;
  }
  
  const yCol = yCols[0];
  const compareCol = gCol || xCol;
  
  // Stats filter evaluation
  const filterCol = document.getElementById('stats-filter-col').value;
  const filterVal = document.getElementById('stats-filter-val').value.trim();
  if (filterCol && filterVal !== '') {
    rows = rows.filter(r => {
      const cellVal = r[filterCol];
      if (cellVal === undefined || cellVal === null) return false;
      return String(cellVal).toLowerCase() === filterVal.toLowerCase();
    });
  }
  
  const method = document.getElementById('stats-method-select').value;
  
  let cleanRows;
  if (method === 'chi_square') {
    cleanRows = rows.filter(r => r[compareCol] !== null && r[compareCol] !== undefined && r[yCol] !== null && r[yCol] !== undefined);
  } else {
    cleanRows = rows.filter(r => r[compareCol] !== null && r[compareCol] !== undefined && r[yCol] !== null && r[yCol] !== undefined && !isNaN(Number(r[yCol])));
  }
  
  if (cleanRows.length < 3) {
    alert('Not enough valid rows to perform statistical analysis (minimum 3).');
    return;
  }
  
  let activeMethod = method;
  if (activeMethod === 'auto') {
    const isXNum = isNumeric(cleanRows.map(r => r[compareCol]));
    if (isXNum) {
      activeMethod = 'linear_reg';
    } else {
      const uniqueCats = [...new Set(cleanRows.map(r => String(r[compareCol])))];
      if (uniqueCats.length === 2) {
        activeMethod = 'welch_t';
      } else if (uniqueCats.length > 2) {
        activeMethod = 'anova_ordinary';
      } else {
        alert('Not enough categories in grouping/X-axis variable to perform analysis.');
        return;
      }
    }
  }
  
  let summary = '';
  lastStatsResults = null;
  
  if (activeMethod === 'student_t' || activeMethod === 'welch_t' || activeMethod === 'paired_t' || activeMethod === 'mann_whitney') {
    const groupData = new Map();
    cleanRows.forEach(r => {
      const cat = String(r[compareCol]);
      const val = Number(r[yCol]);
      if (!groupData.has(cat)) groupData.set(cat, []);
      groupData.get(cat).push(val);
    });
    
    const groups = Array.from(groupData.keys()).sort();
    if (groups.length !== 2) {
      alert(`This test compares exactly 2 groups. Found ${groups.length} groups ("${groups.join(', ')}") in column "${compareCol}".`);
      return;
    }
    
    const grpA = groups[0];
    const grpB = groups[1];
    const valsA = groupData.get(grpA);
    const valsB = groupData.get(grpB);
    
    if (valsA.length < 2 || valsB.length < 2) {
      alert('Both groups must have at least 2 replicates.');
      return;
    }
    
    if (activeMethod === 'student_t') {
      const res = calculateStudentTTest(valsA, valsB);
      summary += `STUDENT'S T-TEST (EQUAL VARIANCE)\n`;
      summary += `-----------------------------------\n`;
      summary += `Group A : ${grpA} (N=${res.nA}, Mean=${res.meanA.toFixed(4)})\n`;
      summary += `Group B : ${grpB} (N=${res.nB}, Mean=${res.meanB.toFixed(4)})\n`;
      summary += `Difference in Means: ${(res.meanA - res.meanB).toFixed(4)}\n`;
      summary += `t-statistic : ${res.t.toFixed(4)}\n`;
      summary += `df          : ${res.df}\n`;
      summary += `p-value     : ${res.p < 0.0001 ? '< 0.0001' : res.p.toFixed(4)}\n`;
      summary += `Significance: ${res.p < 0.05 ? 'Significant (*)' : 'ns (not sig)'}`;
      
      lastStatsResults = {
        type: 'ttest',
        groups: [grpA, grpB],
        means: [res.meanA, res.meanB],
        t: res.t, df: res.df, p: res.p,
        sigSymbol: getPValueSymbol(res.p)
      };
    } else if (activeMethod === 'welch_t') {
      const res = calculateWelchTTest(valsA, valsB);
      summary += `WELCH'S T-TEST (UNEQUAL VARIANCE)\n`;
      summary += `---------------------------------\n`;
      summary += `Group A : ${grpA} (N=${res.nA}, Mean=${res.meanA.toFixed(4)})\n`;
      summary += `Group B : ${grpB} (N=${res.nB}, Mean=${res.meanB.toFixed(4)})\n`;
      summary += `Difference in Means: ${(res.meanA - res.meanB).toFixed(4)}\n`;
      summary += `t-statistic : ${res.t.toFixed(4)}\n`;
      summary += `df (Satterthwaite): ${res.df.toFixed(2)}\n`;
      summary += `p-value     : ${res.p < 0.0001 ? '< 0.0001' : res.p.toFixed(4)}\n`;
      summary += `Significance: ${res.p < 0.05 ? 'Significant (*)' : 'ns (not sig)'}`;
      
      lastStatsResults = {
        type: 'ttest',
        groups: [grpA, grpB],
        means: [res.meanA, res.meanB],
        t: res.t, df: Math.round(res.df), p: res.p,
        sigSymbol: getPValueSymbol(res.p)
      };
    } else if (activeMethod === 'paired_t') {
      try {
        const res = calculatePairedTTest(valsA, valsB);
        const meanA = valsA.reduce((a, b) => a + b, 0) / valsA.length;
        const meanB = valsB.reduce((a, b) => a + b, 0) / valsB.length;
        summary += `PAIRED T-TEST\n`;
        summary += `-------------\n`;
        summary += `Group A : ${grpA} (N=${valsA.length}, Mean=${meanA.toFixed(4)})\n`;
        summary += `Group B : ${grpB} (N=${valsB.length}, Mean=${meanB.toFixed(4)})\n`;
        summary += `Number of pairs: ${res.n}\n`;
        summary += `Mean Difference: ${res.meanDiff.toFixed(4)}\n`;
        summary += `t-statistic    : ${res.t.toFixed(4)}\n`;
        summary += `df             : ${res.df}\n`;
        summary += `p-value        : ${res.p < 0.0001 ? '< 0.0001' : res.p.toFixed(4)}\n`;
        summary += `Significance   : ${res.p < 0.05 ? 'Significant (*)' : 'ns (not sig)'}`;
        
        lastStatsResults = {
          type: 'ttest',
          groups: [grpA, grpB],
          means: [meanA, meanB],
          t: res.t, df: res.df, p: res.p,
          sigSymbol: getPValueSymbol(res.p)
        };
      } catch (err) {
        alert(err.message);
        return;
      }
    } else if (activeMethod === 'mann_whitney') {
      const res = calculateMannWhitneyU(valsA, valsB);
      summary += `MANN-WHITNEY U TEST\n`;
      summary += `-------------------\n`;
      summary += `Group A : ${grpA} (N=${res.nA})\n`;
      summary += `Group B : ${grpB} (N=${res.nB})\n`;
      summary += `U statistic : ${res.U}\n`;
      summary += `Expected U  : ${res.meanU}\n`;
      summary += `p-value     : ${res.p < 0.0001 ? '< 0.0001' : res.p.toFixed(4)}\n`;
      summary += `Significance: ${res.p < 0.05 ? 'Significant (*)' : 'ns (not sig)'}`;
      
      lastStatsResults = {
        type: 'ttest',
        groups: [grpA, grpB],
        means: [valsA.reduce((a, b) => a + b, 0) / valsA.length, valsB.reduce((a, b) => a + b, 0) / valsB.length],
        t: res.U, df: res.nA + res.nB - 2, p: res.p,
        sigSymbol: getPValueSymbol(res.p)
      };
    }
  } else if (activeMethod === 'anova_ordinary' || activeMethod === 'anova_welch' || activeMethod === 'kruskal_wallis') {
    const groupData = new Map();
    cleanRows.forEach(r => {
      const cat = String(r[compareCol]);
      const val = Number(r[yCol]);
      if (!groupData.has(cat)) groupData.set(cat, []);
      groupData.get(cat).push(val);
    });
    
    const groups = Array.from(groupData.keys()).sort();
    if (groups.length < 2) {
      alert(`ANOVA/Kruskal-Wallis requires at least 2 groups. Found ${groups.length} groups in column "${compareCol}".`);
      return;
    }
    
    if (activeMethod === 'anova_ordinary') {
      const K = groups.length;
      let totalN = 0;
      let grandSum = 0;
      
      const groupStats = groups.map(g => {
        const vals = groupData.get(g);
        const n = vals.length;
        const mean = vals.reduce((a, b) => a + b, 0) / n;
        const variance = vals.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / Math.max(1, n - 1);
        totalN += n;
        grandSum += vals.reduce((a, b) => a + b, 0);
        return { name: g, n, mean, variance };
      });
      
      const grandMean = grandSum / totalN;
      
      let ssb = 0;
      let ssw = 0;
      groupStats.forEach(gs => {
        ssb += gs.n * Math.pow(gs.mean - grandMean, 2);
        ssw += (gs.n - 1) * gs.variance;
      });
      
      const dfB = K - 1;
      const dfW = totalN - K;
      const msb = ssb / dfB;
      const msw = ssw / dfW;
      
      const f = msb / msw;
      const p = fDistributionPValue(f, dfB, dfW);
      
      summary += `ONE-WAY ORDINARY ANOVA\n`;
      summary += `----------------------\n`;
      groupStats.forEach(gs => {
        summary += `${gs.name}: N=${gs.n}, Mean=${gs.mean.toFixed(4)}, SD=${Math.sqrt(gs.variance).toFixed(4)}\n`;
      });
      summary += `Grand Mean: ${grandMean.toFixed(4)}\n`;
      summary += `F-statistic: ${f.toFixed(4)}\n`;
      summary += `df (between, within): ${dfB}, ${dfW}\n`;
      summary += `p-value: ${p < 0.0001 ? '< 0.0001' : p.toFixed(4)}\n`;
      summary += `Significance: ${p < 0.05 ? 'Significant (*)' : 'ns (not sig)'}`;
      
      lastStatsResults = {
        type: 'anova',
        groups,
        groupStats,
        f, dfB, dfW, p,
        sigSymbol: getPValueSymbol(p)
      };
    } else if (activeMethod === 'anova_welch') {
      try {
        const res = calculateWelchANOVA(groupData);
        summary += `WELCH'S ANOVA (UNEQUAL VARIANCES)\n`;
        summary += `---------------------------------\n`;
        for (let i = 0; i < res.keys.length; i++) {
          summary += `${res.keys[i]}: N=${res.n[i]}, Mean=${res.means[i].toFixed(4)}, SD=${Math.sqrt(res.vars[i]).toFixed(4)}\n`;
        }
        summary += `Welch F-statistic: ${res.f.toFixed(4)}\n`;
        summary += `df (between, within): ${res.df1}, ${res.df2.toFixed(2)}\n`;
        summary += `p-value: ${res.p < 0.0001 ? '< 0.0001' : res.p.toFixed(4)}\n`;
        summary += `Significance: ${res.p < 0.05 ? 'Significant (*)' : 'ns (not sig)'}`;
        
        lastStatsResults = {
          type: 'anova',
          groups: res.keys,
          groupStats: res.keys.map((k, i) => ({ name: k, n: res.n[i], mean: res.means[i], variance: res.vars[i] })),
          f: res.f, dfB: res.df1, dfW: Math.round(res.df2), p: res.p,
          sigSymbol: getPValueSymbol(res.p)
        };
      } catch (err) {
        alert(err.message);
        return;
      }
    } else if (activeMethod === 'kruskal_wallis') {
      const res = calculateKruskalWallis(groupData);
      summary += `KRUSKAL-WALLIS TEST (NON-PARAMETRIC)\n`;
      summary += `------------------------------------\n`;
      res.keys.forEach(k => {
        const vals = groupData.get(k);
        const R = res.rankSums[k];
        summary += `${k}: N=${vals.length}, Rank Sum=${R.toFixed(1)}, Mean Rank=${(R / vals.length).toFixed(2)}\n`;
      });
      summary += `H statistic (Chi-sq): ${res.H.toFixed(4)}\n`;
      summary += `df                  : ${res.df}\n`;
      summary += `p-value             : ${res.p < 0.0001 ? '< 0.0001' : res.p.toFixed(4)}\n`;
      summary += `Significance        : ${res.p < 0.05 ? 'Significant (*)' : 'ns (not sig)'}`;
      
      lastStatsResults = {
        type: 'anova',
        groups: res.keys,
        groupStats: res.keys.map(k => ({ name: k, n: groupData.get(k).length, mean: groupData.get(k).reduce((a, b) => a + b, 0) / groupData.get(k).length, variance: 1 })),
        f: res.H, dfB: res.df, dfW: cleanRows.length - res.keys.length, p: res.p,
        sigSymbol: getPValueSymbol(res.p)
      };
    }
  } else if (activeMethod === 'pearson' || activeMethod === 'spearman' || activeMethod === 'linear_reg') {
    const xVals = cleanRows.map(r => Number(r[compareCol]));
    const yVals = cleanRows.map(r => Number(r[yCol]));
    if (xVals.some(isNaN) || yVals.some(isNaN)) {
      alert('Both variables must contain numeric data to run correlation/regression.');
      return;
    }
    
    if (activeMethod === 'pearson') {
      try {
        const res = calculateCorrelation(xVals, yVals, 'pearson');
        summary += `PEARSON CORRELATION\n`;
        summary += `-------------------\n`;
        summary += `Variable X : ${compareCol}\n`;
        summary += `Variable Y : ${yCol}\n`;
        summary += `Sample Size (N): ${xVals.length}\n`;
        summary += `Correlation (r): ${res.r.toFixed(4)}\n`;
        summary += `R-squared (R²): ${res.r2.toFixed(4)}\n`;
        summary += `t-statistic: ${res.t.toFixed(4)}\n`;
        summary += `df         : ${res.df}\n`;
        summary += `p-value    : ${res.p < 0.0001 ? '< 0.0001' : res.p.toFixed(4)}\n`;
        summary += `Significance: ${res.p < 0.05 ? 'Significant (*)' : 'ns (not sig)'}`;
        
        lastStatsResults = {
          type: 'regression',
          xCol: compareCol, yCol, N: xVals.length, slope: 0, intercept: 0, r: res.r, r2: res.r2, p: res.p,
          sigSymbol: getPValueSymbol(res.p)
        };
      } catch (err) {
        alert(err.message);
        return;
      }
    } else if (activeMethod === 'spearman') {
      try {
        const res = calculateCorrelation(xVals, yVals, 'spearman');
        summary += `SPEARMAN RANK CORRELATION (NON-PARAMETRIC)\n`;
        summary += `-------------------------------------------\n`;
        summary += `Variable X : ${compareCol}\n`;
        summary += `Variable Y : ${yCol}\n`;
        summary += `Sample Size (N): ${xVals.length}\n`;
        summary += `Spearman r     : ${res.r.toFixed(4)}\n`;
        summary += `t-statistic    : ${res.t.toFixed(4)}\n`;
        summary += `df             : ${res.df}\n`;
        summary += `p-value        : ${res.p < 0.0001 ? '< 0.0001' : res.p.toFixed(4)}\n`;
        summary += `Significance   : ${res.p < 0.05 ? 'Significant (*)' : 'ns (not sig)'}`;
        
        lastStatsResults = {
          type: 'regression',
          xCol: compareCol, yCol, N: xVals.length, slope: 0, intercept: 0, r: res.r, r2: res.r2, p: res.p,
          sigSymbol: getPValueSymbol(res.p)
        };
      } catch (err) {
        alert(err.message);
        return;
      }
    } else if (activeMethod === 'linear_reg') {
      const N = cleanRows.length;
      const xMean = xVals.reduce((a, b) => a + b, 0) / N;
      const yMean = yVals.reduce((a, b) => a + b, 0) / N;
      
      let num = 0;
      let denX = 0;
      let denY = 0;
      for (let i = 0; i < N; i++) {
        const dx = xVals[i] - xMean;
        const dy = yVals[i] - yMean;
        num += dx * dy;
        denX += dx * dx;
        denY += dy * dy;
      }
      
      const slope = denX !== 0 ? num / denX : 0;
      const intercept = yMean - slope * xMean;
      const r = (denX !== 0 && denY !== 0) ? num / Math.sqrt(denX * denY) : 0;
      const r2 = r * r;
      
      const df = N - 2;
      let t = 0;
      let p = 1.0;
      if (r2 < 1.0 && df > 0) {
        t = r * Math.sqrt(df / (1 - r2));
        p = studentTProbability(t, df);
      }
      
      summary += `LINEAR REGRESSION\n`;
      summary += `-----------------\n`;
      summary += `Variable X : ${compareCol}\n`;
      summary += `Variable Y : ${yCol}\n`;
      summary += `Sample Size (N): ${N}\n`;
      summary += `Slope (m)  : ${slope.toFixed(4)}\n`;
      summary += `Intercept(c): ${intercept.toFixed(4)}\n`;
      summary += `Equation   : Y = ${slope.toFixed(4)}*X + ${intercept.toFixed(4)}\n`;
      summary += `Correlation (r): ${r.toFixed(4)}\n`;
      summary += `R-squared (R²): ${r2.toFixed(4)}\n`;
      summary += `t-statistic: ${t.toFixed(4)}\n`;
      summary += `p-value    : ${p < 0.0001 ? '< 0.0001' : p.toFixed(4)}\n`;
      summary += `Significance: ${p < 0.05 ? 'Significant (*)' : 'ns (not sig)'}`;
      
      lastStatsResults = {
        type: 'regression',
        xCol: compareCol, yCol, N, slope, intercept, r, r2, p,
        sigSymbol: getPValueSymbol(p)
      };
    }
  } else if (activeMethod === 'chi_square') {
    const uniqueX = [...new Set(cleanRows.map(r => String(r[compareCol])))].sort();
    const uniqueY = [...new Set(cleanRows.map(r => String(r[yCol])))].sort();
    
    if (uniqueX.length < 2 || uniqueY.length < 2) {
      alert('Both variables must have at least 2 unique categories to perform Chi-square test.');
      return;
    }
    
    const observed = uniqueX.map(() => uniqueY.map(() => 0));
    cleanRows.forEach(r => {
      const xVal = String(r[compareCol]);
      const yVal = String(r[yCol]);
      const ix = uniqueX.indexOf(xVal);
      const iy = uniqueY.indexOf(yVal);
      if (ix !== -1 && iy !== -1) {
        observed[ix][iy]++;
      }
    });
    
    try {
      const res = calculateChiSquareContingency(observed, uniqueX, uniqueY);
      summary += `CHI-SQUARE CONTINGENCY TEST\n`;
      summary += `---------------------------\n`;
      summary += `Variable X : ${compareCol} (${uniqueX.length} categories)\n`;
      summary += `Variable Y : ${yCol} (${uniqueY.length} categories)\n`;
      summary += `Total N    : ${res.N}\n\n`;
      
      summary += `OBSERVED FREQUENCIES:\n`;
      summary += `X \\ Y | ` + uniqueY.join(' | ') + ` | Total\n`;
      for (let i = 0; i < uniqueX.length; i++) {
        summary += `${uniqueX[i]} | ` + observed[i].join(' | ') + ` | ${res.rowTotals[i]}\n`;
      }
      summary += `Total | ` + res.colTotals.join(' | ') + ` | ${res.N}\n\n`;
      
      summary += `EXPECTED FREQUENCIES:\n`;
      for (let i = 0; i < uniqueX.length; i++) {
        summary += `${uniqueX[i]} | ` + res.expectedTable[i].map(v => v.toFixed(2)).join(' | ') + `\n`;
      }
      summary += `\n`;
      
      summary += `Chi-square Statistic: ${res.chiSq.toFixed(4)}\n`;
      summary += `df                  : ${res.df}\n`;
      summary += `p-value             : ${res.p < 0.0001 ? '< 0.0001' : res.p.toFixed(4)}\n`;
      summary += `Significance        : ${res.p < 0.05 ? 'Significant (*)' : 'ns (not sig)'}`;
      
      lastStatsResults = null;
    } catch (err) {
      alert(err.message);
      return;
    }
  }
  
  const panel = document.getElementById('stats-results-panel');
  const summaryText = document.getElementById('stats-summary-text');
  summaryText.textContent = summary;
  panel.style.display = 'block';
}

function getPValueSymbolOld(p) {
  if (p < 0.001) return '***';
  if (p < 0.01) return '**';
  if (p < 0.05) return '*';
  return 'ns';
}

function addSignificanceBarOld() {
  if (!lastStatsResults || !appState.chartInstance) {
    alert('Please run a statistical test first.');
    return;
  }
  
  const tab = getActiveTab();
  if (!tab) return;
  
  const xCol = DOM.xSelect.value;
  const yCols = getYCols();
  const yCol = yCols[0];
  const gCol = DOM.groupSelect.value;
  
  if (lastStatsResults.type === 'ttest') {
    const grpA = lastStatsResults.groups[0];
    const grpB = lastStatsResults.groups[1];
    
    const rows = appState.activeData.rows;
    let idxA, idxB;
    
    if (gCol) {
      const groupsList = [...new Set(rows.map(r => String(r[gCol])).filter(v => v !== null && v !== ''))].sort();
      const gIdxA = groupsList.indexOf(grpA);
      const gIdxB = groupsList.indexOf(grpB);
      if (gIdxA === -1 || gIdxB === -1) {
        alert('Could not locate group categories on the chart.');
        return;
      }
      const totalSeriesCount = yCols.length * groupsList.length;
      const currentSeriesIndexA = yCols.indexOf(yCol) + gIdxA * yCols.length;
      const currentSeriesIndexB = yCols.indexOf(yCol) + gIdxB * yCols.length;
      
      const catIdx = 0;
      let offset = 0.22;
      if (appState.currentChartType === 'bar') {
        offset = 0.65 / totalSeriesCount;
      }
      idxA = catIdx + (currentSeriesIndexA - (totalSeriesCount - 1) / 2) * offset;
      idxB = catIdx + (currentSeriesIndexB - (totalSeriesCount - 1) / 2) * offset;
    } else {
      const xCategories = [...new Set(rows.map(r => String(r[xCol])))];
      idxA = xCategories.indexOf(grpA);
      idxB = xCategories.indexOf(grpB);
    }
    
    if (idxA === -1 || idxB === -1) {
      alert('Could not locate group categories on the chart.');
      return;
    }
    
    const valsA = rows.filter(r => (!gCol && String(r[xCol]) === grpA) || (gCol && String(r[gCol]) === grpA)).map(r => Number(r[yCol])).filter(v => !isNaN(v));
    const valsB = rows.filter(r => (!gCol && String(r[xCol]) === grpB) || (gCol && String(r[gCol]) === grpB)).map(r => Number(r[yCol])).filter(v => !isNaN(v));
    const maxVal = Math.max(...valsA, ...valsB) || 0;
    
    const range = (maxVal === 0) ? 10 : maxVal * 0.1;
    const barYVal = maxVal + range;
    
    const pixelA = appState.chartInstance.convertToPixel({ finder: { seriesIndex: 0 } }, [idxA, barYVal]);
    const pixelB = appState.chartInstance.convertToPixel({ finder: { seriesIndex: 0 } }, [idxB, barYVal]);
    
    if (!pixelA || !pixelB) {
      alert('Failed to calculate chart pixel locations. Make sure the chart is drawn.');
      return;
    }
    
    const bracketId = 'ann_sig_' + Date.now();
    const barColor = '#64748b';
    const yBar = pixelA[1];
    const yTickLow = yBar + 8;
    
    tab.annotations.push({
      id: bracketId + '_line_main',
      type: 'arrow',
      x1: pixelA[0],
      y1: yBar,
      x2: pixelB[0],
      y2: yBar,
      color: barColor,
      strokeWidth: 1.5,
      isSig: true,
      noArrow: true
    });
    
    tab.annotations.push({
      id: bracketId + '_line_left',
      type: 'arrow',
      x1: pixelA[0],
      y1: yBar,
      x2: pixelA[0],
      y2: yTickLow,
      color: barColor,
      strokeWidth: 1.5,
      isSig: true,
      noArrow: true
    });
    
    tab.annotations.push({
      id: bracketId + '_line_right',
      type: 'arrow',
      x1: pixelB[0],
      y1: yBar,
      x2: pixelB[0],
      y2: yTickLow,
      color: barColor,
      strokeWidth: 1.5,
      isSig: true,
      noArrow: true
    });
    
    const xCenter = (pixelA[0] + pixelB[0]) / 2;
    tab.annotations.push({
      id: bracketId + '_text',
      type: 'text',
      x: xCenter - 6,
      y: yBar - 6,
      text: lastStatsResults.sigSymbol,
      color: barColor,
      fontSize: 14,
      isSig: true
    });
    
    drawAnnotations();
    
  } else if (lastStatsResults.type === 'anova') {
    const groupsListStr = lastStatsResults.groups.join(', ');
    const choice = prompt(`ANOVA Group Comparison\nAvailable groups: ${groupsListStr}\n\nEnter the two groups to compare separated by comma (e.g. GroupA,GroupB):`);
    if (!choice) return;
    
    const parts = choice.split(',').map(s => s.trim());
    if (parts.length !== 2) {
      alert('Please enter exactly two valid groups.');
      return;
    }
    
    const grpA = parts[0];
    const grpB = parts[1];
    
    const rows = appState.activeData.rows;
    let idxA, idxB;
    
    if (gCol) {
      const groupsList = [...new Set(rows.map(r => String(r[gCol])).filter(v => v !== null && v !== ''))].sort();
      const gIdxA = groupsList.indexOf(grpA);
      const gIdxB = groupsList.indexOf(grpB);
      if (gIdxA === -1 || gIdxB === -1) {
        alert('Could not locate group categories on the chart.');
        return;
      }
      const totalSeriesCount = yCols.length * groupsList.length;
      const currentSeriesIndexA = yCols.indexOf(yCol) + gIdxA * yCols.length;
      const currentSeriesIndexB = yCols.indexOf(yCol) + gIdxB * yCols.length;
      
      const catIdx = 0;
      let offset = 0.22;
      if (appState.currentChartType === 'bar') {
        offset = 0.65 / totalSeriesCount;
      }
      idxA = catIdx + (currentSeriesIndexA - (totalSeriesCount - 1) / 2) * offset;
      idxB = catIdx + (currentSeriesIndexB - (totalSeriesCount - 1) / 2) * offset;
    } else {
      const xCategories = [...new Set(rows.map(r => String(r[xCol])))];
      idxA = xCategories.indexOf(grpA);
      idxB = xCategories.indexOf(grpB);
    }
    
    if (idxA === -1 || idxB === -1) {
      alert(`Could not find those groups on the chart. Make sure spelling matches.`);
      return;
    }
    
    const valsA = rows.filter(r => (!gCol && String(r[xCol]) === grpA) || (gCol && String(r[gCol]) === grpA)).map(r => Number(r[yCol])).filter(v => !isNaN(v));
    const valsB = rows.filter(r => (!gCol && String(r[xCol]) === grpB) || (gCol && String(r[gCol]) === grpB)).map(r => Number(r[yCol])).filter(v => !isNaN(v));
    const maxVal = Math.max(...valsA, ...valsB) || 0;
    const range = (maxVal === 0) ? 10 : maxVal * 0.15;
    const barYVal = maxVal + range;
    
    const pixelA = appState.chartInstance.convertToPixel({ finder: { seriesIndex: 0 } }, [idxA, barYVal]);
    const pixelB = appState.chartInstance.convertToPixel({ finder: { seriesIndex: 0 } }, [idxB, barYVal]);
    
    if (!pixelA || !pixelB) {
      alert('Failed to calculate pixel locations.');
      return;
    }
    
    const cleanRowsA = rows.filter(r => ((!gCol && String(r[xCol]) === grpA) || (gCol && String(r[gCol]) === grpA)) && r[yCol] !== null && !isNaN(Number(r[yCol]))).map(r => Number(r[yCol]));
    const cleanRowsB = rows.filter(r => ((!gCol && String(r[xCol]) === grpB) || (gCol && String(r[gCol]) === grpB)) && r[yCol] !== null && !isNaN(Number(r[yCol]))).map(r => Number(r[yCol]));
    
    let comparisonSymbol = 'ns';
    if (cleanRowsA.length >= 2 && cleanRowsB.length >= 2) {
      const meanA = cleanRowsA.reduce((a, b) => a + b, 0) / cleanRowsA.length;
      const meanB = cleanRowsB.reduce((a, b) => a + b, 0) / cleanRowsB.length;
      const varA = cleanRowsA.reduce((sum, v) => sum + Math.pow(v - meanA, 2), 0) / (cleanRowsA.length - 1);
      const varB = cleanRowsB.reduce((sum, v) => sum + Math.pow(v - meanB, 2), 0) / (cleanRowsB.length - 1);
      const t = (meanA - meanB) / Math.sqrt(varA/cleanRowsA.length + varB/cleanRowsB.length);
      const df = Math.round(Math.pow(varA/cleanRowsA.length + varB/cleanRowsB.length, 2) / (Math.pow(varA/cleanRowsA.length, 2)/(cleanRowsA.length-1) + Math.pow(varB/cleanRowsB.length, 2)/(cleanRowsB.length-1)));
      const p = studentTProbability(t, df);
      comparisonSymbol = getPValueSymbol(p);
    }
    
    const bracketId = 'ann_sig_' + Date.now();
    const barColor = '#64748b';
    const yBar = pixelA[1];
    const yTickLow = yBar + 8;
    
    tab.annotations.push({
      id: bracketId + '_line_main',
      type: 'arrow',
      x1: pixelA[0],
      y1: yBar,
      x2: pixelB[0],
      y2: yBar,
      color: barColor,
      strokeWidth: 1.5,
      isSig: true,
      noArrow: true
    });
    tab.annotations.push({
      id: bracketId + '_line_left',
      type: 'arrow',
      x1: pixelA[0],
      y1: yBar,
      x2: pixelA[0],
      y2: yTickLow,
      color: barColor,
      strokeWidth: 1.5,
      isSig: true,
      noArrow: true
    });
    tab.annotations.push({
      id: bracketId + '_line_right',
      type: 'arrow',
      x1: pixelB[0],
      y1: yBar,
      x2: pixelB[0],
      y2: yTickLow,
      color: barColor,
      strokeWidth: 1.5,
      isSig: true,
      noArrow: true
    });
    const xCenter = (pixelA[0] + pixelB[0]) / 2;
    tab.annotations.push({
      id: bracketId + '_text',
      type: 'text',
      x: xCenter - 6,
      y: yBar - 6,
      text: comparisonSymbol,
      color: barColor,
      fontSize: 14,
      isSig: true
    });
    
    drawAnnotations();
  }
}

// ==============================================================================
// 9.4 SVG Annotation Layer Overlay Controller
// ==============================================================================

let currentTool = 'select';
let selectedAnnotationId = null;
let isDrawing = false;
let drawStartPoint = { x: 0, y: 0 };
let tempDrawingElement = null;

let dragTarget = null;
let dragStartMouse = { x: 0, y: 0 };
let dragStartAnnPos = {};

function selectTool(toolName) {
  currentTool = toolName;
  document.querySelectorAll('.tool-btn').forEach(btn => {
    if (btn.dataset.tool === toolName) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  
  const layer = document.getElementById('annotation-layer');
  layer.className.baseVal = '';
  
  if (toolName === 'select') {
    layer.classList.add('select-mode');
  } else {
    layer.classList.add('drawing-mode');
  }
}

function setupAnnotationToolbar() {
  document.querySelectorAll('.tool-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      selectTool(btn.dataset.tool);
    });
  });
  
  document.getElementById('btn-delete-annotation').addEventListener('click', () => {
    if (selectedAnnotationId) {
      deleteAnnotation(selectedAnnotationId);
    }
  });
  
  document.getElementById('btn-clear-annotations').addEventListener('click', () => {
    if (confirm('Clear all annotations on this chart?')) {
      const tab = getActiveTab();
      if (tab) {
        tab.annotations = [];
        selectedAnnotationId = null;
        drawAnnotations();
      }
    }
  });
  
  document.getElementById('draw-color-picker').addEventListener('input', (e) => {
    if (selectedAnnotationId) {
      const tab = getActiveTab();
      const ann = tab.annotations.find(a => a.id === selectedAnnotationId);
      if (ann) {
        ann.color = e.target.value;
        if (ann.fillColor && ann.fillColor !== 'none') {
          ann.fillColor = hexToRgba(e.target.value, 0.15);
        }
        drawAnnotations();
      }
    }
  });
  
  const layer = document.getElementById('annotation-layer');
  
  layer.addEventListener('mousedown', (e) => {
    if (currentTool === 'select') {
      if (e.target === layer) {
        selectAnnotation(null);
      }
      return;
    }
    
    const rect = layer.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    isDrawing = true;
    drawStartPoint = { x, y };
    
    const color = document.getElementById('draw-color-picker').value;
    
    if (currentTool === 'text') {
      isDrawing = false;
      const textContent = prompt('Enter text annotation:', 'Text');
      if (textContent && textContent.trim() !== '') {
        const tab = getActiveTab();
        if (tab) {
          const id = 'ann_' + Date.now();
          tab.annotations.push({
            id: id,
            type: 'text',
            x: x,
            y: y,
            text: textContent,
            color: color,
            fontSize: '14'
          });
          selectAnnotation(id);
          drawAnnotations();
        }
      }
      selectTool('select');
    } else if (currentTool === 'arrow') {
      tempDrawingElement = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      tempDrawingElement.setAttribute('x1', x);
      tempDrawingElement.setAttribute('y1', y);
      tempDrawingElement.setAttribute('x2', x);
      tempDrawingElement.setAttribute('y2', y);
      tempDrawingElement.setAttribute('stroke', color);
      tempDrawingElement.setAttribute('stroke-width', '2.5');
      tempDrawingElement.setAttribute('marker-end', 'url(#arrow-head)');
      tempDrawingElement.style.pointerEvents = 'none';
      layer.appendChild(tempDrawingElement);
    } else if (currentTool === 'rect') {
      tempDrawingElement = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      tempDrawingElement.setAttribute('x', x);
      tempDrawingElement.setAttribute('y', y);
      tempDrawingElement.setAttribute('width', '0');
      tempDrawingElement.setAttribute('height', '0');
      tempDrawingElement.setAttribute('stroke', color);
      tempDrawingElement.setAttribute('stroke-width', '2.5');
      tempDrawingElement.setAttribute('fill', hexToRgba(color, 0.15));
      tempDrawingElement.style.pointerEvents = 'none';
      layer.appendChild(tempDrawingElement);
    } else if (currentTool === 'circle') {
      tempDrawingElement = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      tempDrawingElement.setAttribute('cx', x);
      tempDrawingElement.setAttribute('cy', y);
      tempDrawingElement.setAttribute('r', '0');
      tempDrawingElement.setAttribute('stroke', color);
      tempDrawingElement.setAttribute('stroke-width', '2.5');
      tempDrawingElement.setAttribute('fill', hexToRgba(color, 0.15));
      tempDrawingElement.style.pointerEvents = 'none';
      layer.appendChild(tempDrawingElement);
    }
  });
  
  layer.addEventListener('mousemove', (e) => {
    if (dragTarget) {
      const rect = layer.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const dx = mouseX - dragStartMouse.x;
      const dy = mouseY - dragStartMouse.y;
      
      const ann = dragTarget;
      if (ann.type === 'text') {
        ann.x = dragStartAnnPos.x + dx;
        ann.y = dragStartAnnPos.y + dy;
      } else if (ann.type === 'arrow') {
        ann.x1 = dragStartAnnPos.x1 + dx;
        ann.y1 = dragStartAnnPos.y1 + dy;
        ann.x2 = dragStartAnnPos.x2 + dx;
        ann.y2 = dragStartAnnPos.y2 + dy;
      } else if (ann.type === 'rect') {
        ann.x = dragStartAnnPos.x + dx;
        ann.y = dragStartAnnPos.y + dy;
      } else if (ann.type === 'circle') {
        ann.cx = dragStartAnnPos.cx + dx;
        ann.cy = dragStartAnnPos.cy + dy;
      }
      
      drawAnnotations();
      return;
    }
    
    if (!isDrawing || !tempDrawingElement) return;
    
    const rect = layer.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (currentTool === 'arrow') {
      tempDrawingElement.setAttribute('x2', x);
      tempDrawingElement.setAttribute('y2', y);
    } else if (currentTool === 'rect') {
      const rx = Math.min(drawStartPoint.x, x);
      const ry = Math.min(drawStartPoint.y, y);
      const rw = Math.abs(drawStartPoint.x - x);
      const rh = Math.abs(drawStartPoint.y - y);
      tempDrawingElement.setAttribute('x', rx);
      tempDrawingElement.setAttribute('y', ry);
      tempDrawingElement.setAttribute('width', rw);
      tempDrawingElement.setAttribute('height', rh);
    } else if (currentTool === 'circle') {
      const r = Math.sqrt(Math.pow(drawStartPoint.x - x, 2) + Math.pow(drawStartPoint.y - y, 2));
      tempDrawingElement.setAttribute('r', r);
    }
  });
  
  window.addEventListener('mouseup', () => {
    if (dragTarget) {
      dragTarget = null;
      saveActiveTabState();
      return;
    }
    
    if (!isDrawing) return;
    isDrawing = false;
    
    if (tempDrawingElement) {
      const color = document.getElementById('draw-color-picker').value;
      const tab = getActiveTab();
      
      if (tab) {
        const id = 'ann_' + Date.now();
        
        if (currentTool === 'arrow') {
          const x2 = parseFloat(tempDrawingElement.getAttribute('x2'));
          const y2 = parseFloat(tempDrawingElement.getAttribute('y2'));
          if (Math.abs(drawStartPoint.x - x2) > 3 || Math.abs(drawStartPoint.y - y2) > 3) {
            tab.annotations.push({
              id: id,
              type: 'arrow',
              x1: drawStartPoint.x,
              y1: drawStartPoint.y,
              x2: x2,
              y2: y2,
              color: color
            });
            selectAnnotation(id);
          }
        } else if (currentTool === 'rect') {
          const x = parseFloat(tempDrawingElement.getAttribute('x'));
          const y = parseFloat(tempDrawingElement.getAttribute('y'));
          const w = parseFloat(tempDrawingElement.getAttribute('width'));
          const h = parseFloat(tempDrawingElement.getAttribute('height'));
          if (w > 3 && h > 3) {
            tab.annotations.push({
              id: id,
              type: 'rect',
              x: x,
              y: y,
              width: w,
              height: h,
              color: color,
              fillColor: hexToRgba(color, 0.15)
            });
            selectAnnotation(id);
          }
        } else if (currentTool === 'circle') {
          const r = parseFloat(tempDrawingElement.getAttribute('r'));
          if (r > 3) {
            tab.annotations.push({
              id: id,
              type: 'circle',
              cx: drawStartPoint.x,
              cy: drawStartPoint.y,
              r: r,
              color: color,
              fillColor: hexToRgba(color, 0.15)
            });
            selectAnnotation(id);
          }
        }
      }
      
      if (tempDrawingElement.parentNode) {
        tempDrawingElement.parentNode.removeChild(tempDrawingElement);
      }
      tempDrawingElement = null;
      saveActiveTabState();
      drawAnnotations();
      
      selectTool('select');
    }
  });
}

function hexToRgba(hex, alpha) {
  hex = hex.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function drawAnnotations() {
  const svg = document.getElementById('annotation-layer');
  if (!svg) return;
  svg.innerHTML = '';
  
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  defs.innerHTML = `
    <marker id="arrow-head" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="context-stroke" />
    </marker>
  `;
  svg.appendChild(defs);
  
  const tab = getActiveTab();
  if (!tab || !tab.annotations) return;
  
  tab.annotations.forEach(ann => {
    let el;
    const isSelected = selectedAnnotationId === ann.id;
    
    if (ann.type === 'text') {
      el = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      el.setAttribute('x', ann.x);
      el.setAttribute('y', ann.y);
      el.setAttribute('fill', ann.color || '#ef4444');
      el.setAttribute('font-size', ann.fontSize || '14');
      el.textContent = ann.text;
      
      if (isSelected) {
        el.setAttribute('font-weight', 'bold');
        el.setAttribute('text-decoration', 'underline');
      }
      
      el.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        const newText = prompt('Edit text annotation:', ann.text);
        if (newText !== null && newText.trim() !== '') {
          ann.text = newText;
          saveActiveTabState();
          drawAnnotations();
        }
      });
      
    } else if (ann.type === 'arrow') {
      el = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      el.setAttribute('x1', ann.x1);
      el.setAttribute('y1', ann.y1);
      el.setAttribute('x2', ann.x2);
      el.setAttribute('y2', ann.y2);
      el.setAttribute('stroke', ann.color || '#ef4444');
      el.setAttribute('stroke-width', ann.strokeWidth || '2.5');
      if (!ann.noArrow && !ann.isSig) {
        el.setAttribute('marker-end', 'url(#arrow-head)');
      }
      el.className.baseVal = 'annotation-shape';
      
      if (isSelected) {
        el.classList.add('annotation-selected');
      }
      
    } else if (ann.type === 'rect') {
      el = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      el.setAttribute('x', ann.x);
      el.setAttribute('y', ann.y);
      el.setAttribute('width', ann.width);
      el.setAttribute('height', ann.height);
      el.setAttribute('stroke', ann.color || '#ef4444');
      el.setAttribute('stroke-width', '2.5');
      el.setAttribute('fill', ann.fillColor || 'rgba(239, 68, 68, 0.15)');
      el.className.baseVal = 'annotation-shape';
      
      if (isSelected) {
        el.classList.add('annotation-selected');
      }
      
    } else if (ann.type === 'circle') {
      el = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      el.setAttribute('cx', ann.cx);
      el.setAttribute('cy', ann.cy);
      el.setAttribute('r', ann.r);
      el.setAttribute('stroke', ann.color || '#ef4444');
      el.setAttribute('stroke-width', '2.5');
      el.setAttribute('fill', ann.fillColor || 'rgba(239, 68, 68, 0.15)');
      el.className.baseVal = 'annotation-shape';
      
      if (isSelected) {
        el.classList.add('annotation-selected');
      }
    }
    
    if (el) {
      el.dataset.id = ann.id;
      
      el.addEventListener('mousedown', (e) => {
        if (currentTool !== 'select') return;
        e.stopPropagation();
        selectAnnotation(ann.id);
        startDragging(e, ann);
      });
      
      svg.appendChild(el);
    }
  });
}

function startDragging(e, ann) {
  dragTarget = ann;
  const rect = document.getElementById('annotation-layer').getBoundingClientRect();
  dragStartMouse = {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  };
  
  if (ann.type === 'text') {
    dragStartAnnPos = { x: ann.x, y: ann.y };
  } else if (ann.type === 'arrow') {
    dragStartAnnPos = { x1: ann.x1, y1: ann.y1, x2: ann.x2, y2: ann.y2 };
  } else if (ann.type === 'rect') {
    dragStartAnnPos = { x: ann.x, y: ann.y };
  } else if (ann.type === 'circle') {
    dragStartAnnPos = { cx: ann.cx, cy: ann.cy };
  }
}

function selectAnnotation(id) {
  selectedAnnotationId = id;
  if (id) {
    const tab = getActiveTab();
    if (tab) {
      const ann = tab.annotations.find(a => a.id === id);
      if (ann && ann.color) {
        document.getElementById('draw-color-picker').value = ann.color;
      }
    }
  }
  drawAnnotations();
}

function deleteAnnotation(id) {
  const tab = getActiveTab();
  if (tab && tab.annotations) {
    const idx = tab.annotations.findIndex(a => a.id === id);
    if (idx !== -1) {
      tab.annotations.splice(idx, 1);
      selectedAnnotationId = null;
      saveActiveTabState();
      drawAnnotations();
    }
  }
}

function serializeAnnotations() {
  const tab = getActiveTab();
  return tab ? tab.annotations : [];
}

function deserializeAnnotations(annotationsList) {
  const tab = getActiveTab();
  if (tab) {
    tab.annotations = annotationsList;
    selectedAnnotationId = null;
    drawAnnotations();
  }
}

// ==============================================================================
// 10. Publication File Exporters
// ==============================================================================

// Helper to crop canvas to its content bounds, leaving a 15px padding
function cropCanvas(canvas) {
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  
  // Get all pixel data
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;
  
  // Read corner pixel as reference background
  const bgR = data[0];
  const bgG = data[1];
  const bgB = data[2];
  const bgA = data[3];
  
  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;
  let found = false;
  
  const tolerance = 5; // Tolerance for small color differences (anti-aliasing, etc.)
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const a = data[idx + 3];
      
      let isBackground = false;
      if (bgA === 0) {
        // Transparent background
        isBackground = (a === 0);
      } else {
        // Opaque background - check Euclidean distance in RGBA space
        const diffR = Math.abs(r - bgR);
        const diffG = Math.abs(g - bgG);
        const diffB = Math.abs(b - bgB);
        const diffA = Math.abs(a - bgA);
        isBackground = (diffR <= tolerance && diffG <= tolerance && diffB <= tolerance && diffA <= tolerance);
      }
      
      if (!isBackground) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
        found = true;
      }
    }
  }
  
  if (!found) {
    return canvas;
  }
  
  // Add 15px safety padding (corresponds to 30px on 2x high-res canvas)
  const padding = 30;
  minX = Math.max(0, minX - padding);
  minY = Math.max(0, minY - padding);
  maxX = Math.min(width - 1, maxX + padding);
  maxY = Math.min(height - 1, maxY + padding);
  
  const croppedWidth = maxX - minX + 1;
  const croppedHeight = maxY - minY + 1;
  
  const croppedCanvas = document.createElement('canvas');
  croppedCanvas.width = croppedWidth;
  croppedCanvas.height = croppedHeight;
  const croppedCtx = croppedCanvas.getContext('2d');
  
  // Fill background
  croppedCtx.fillStyle = bgA === 0 ? 'rgba(0,0,0,0)' : `rgb(${bgR},${bgG},${bgB})`;
  croppedCtx.fillRect(0, 0, croppedWidth, croppedHeight);
  
  // Draw cropped section
  croppedCtx.drawImage(canvas, minX, minY, croppedWidth, croppedHeight, 0, 0, croppedWidth, croppedHeight);
  
  return croppedCanvas;
}

// Helper to calculate content bounding box for SVG vector export, relative to root ECharts SVG
function getSVGContentBBox(originalSvg, annotationsSvg) {
  const rootRect = originalSvg.getBoundingClientRect();
  
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  let found = false;
  
  // Visual drawing element tags to look for
  const selector = 'path, text, rect, circle, line, polygon, polyline, ellipse, image';
  const elements1 = originalSvg.querySelectorAll(selector);
  const elements2 = annotationsSvg.querySelectorAll(selector);
  const allElements = [...elements1, ...elements2];
  
  allElements.forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    
    // Check if it's the background rect (covers the whole canvas size)
    if (el.tagName.toLowerCase() === 'rect') {
      const isBackground = Math.abs(rect.width - rootRect.width) < 5 && Math.abs(rect.height - rootRect.height) < 5;
      if (isBackground) return;
    }
    
    const left = rect.left - rootRect.left;
    const top = rect.top - rootRect.top;
    const right = rect.right - rootRect.left;
    const bottom = rect.bottom - rootRect.top;
    
    if (left < minX) minX = left;
    if (top < minY) minY = top;
    if (right > maxX) maxX = right;
    if (bottom > maxY) maxY = bottom;
    found = true;
  });
  
  if (!found) {
    return { x: 0, y: 0, width: rootRect.width, height: rootRect.height };
  }
  
  // Add 15px safety padding
  const padding = 15;
  minX = Math.max(0, minX - padding);
  minY = Math.max(0, minY - padding);
  maxX = Math.min(rootRect.width, maxX + padding);
  maxY = Math.min(rootRect.height, maxY + padding);
  
  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY
  };
}

// Generate a combined canvas with ECharts and SVG overlay annotations
function getCombinedCanvas(callback) {
  if (!appState.chartInstance) return;
  
  const echartsDataUrl = appState.chartInstance.getDataURL({
    type: 'png',
    pixelRatio: 2,
    excludeComponents: ['toolbox']
  });
  
  const annotationsSvg = document.getElementById('annotation-layer');
  const width = annotationsSvg.clientWidth;
  const height = annotationsSvg.clientHeight;
  
  let svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">`;
  
  const defs = annotationsSvg.querySelector('defs');
  if (defs) svgString += defs.outerHTML;
  
  const elements = annotationsSvg.querySelectorAll('line, rect, circle, text');
  elements.forEach(el => {
    const clone = el.cloneNode(true);
    clone.classList.remove('annotation-selected');
    svgString += new XMLSerializer().serializeToString(clone);
  });
  svgString += `</svg>`;
  
  const chartImg = new Image();
  const annImg = new Image();
  
  let loadedCount = 0;
  function checkLoaded() {
    loadedCount++;
    if (loadedCount === 2) {
      const canvas = document.createElement('canvas');
      canvas.width = width * 2;
      canvas.height = height * 2;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(chartImg, 0, 0, width * 2, height * 2);
      ctx.drawImage(annImg, 0, 0, width * 2, height * 2);
      
      const croppedCanvas = cropCanvas(canvas);
      callback(croppedCanvas);
    }
  }
  
  chartImg.onload = checkLoaded;
  annImg.onload = checkLoaded;
  
  chartImg.src = echartsDataUrl;
  
  const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  annImg.src = URL.createObjectURL(svgBlob);
}

// Image exports (PNG, JPEG)
function exportImage(type) {
  getCombinedCanvas(canvas => {
    const dataUrl = canvas.toDataURL(type === 'jpeg' ? 'image/jpeg' : 'image/png');
    const link = document.createElement('a');
    link.download = `${appState.activeSheetName || 'chart'}_high_res.${type === 'jpeg' ? 'jpg' : 'png'}`;
    link.href = dataUrl;
    link.click();
  });
}

// SVG vector export (merges annotations overlay and crops content)
function exportSVGFile() {
  if (!appState.chartInstance) return;

  appState.renderer = 'svg';
  drawChart();

  setTimeout(() => {
    const svgEl = DOM.chartCanvas.querySelector('svg');
    if (svgEl) {
      const clonedSvg = svgEl.cloneNode(true);
      const annotationsSvg = document.getElementById('annotation-layer');
      
      const defs = annotationsSvg.querySelector('defs');
      if (defs) {
        clonedSvg.appendChild(defs.cloneNode(true));
      }
      
      const elements = annotationsSvg.querySelectorAll('line, rect, circle, text');
      elements.forEach(el => {
        const clone = el.cloneNode(true);
        clone.classList.remove('annotation-selected');
        clonedSvg.appendChild(clone);
      });
      
      // Calculate crop box relative to original elements
      const bbox = getSVGContentBBox(svgEl, annotationsSvg);
      clonedSvg.setAttribute('viewBox', `${bbox.x} ${bbox.y} ${bbox.width} ${bbox.height}`);
      clonedSvg.setAttribute('width', bbox.width);
      clonedSvg.setAttribute('height', bbox.height);
      
      const svgText = new XMLSerializer().serializeToString(clonedSvg);
      const blob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${appState.activeSheetName || 'chart'}_vector.svg`;
      link.click();
    }
    
    appState.renderer = 'canvas';
    drawChart();
  }, 200);
}

// GraphPad Prism XML Format (.pzfx) Export
function exportPZFXFile() {
  if (!appState.activeData) return;

  const data = appState.activeData;
  const xCol = DOM.xSelect.value;
  const yCols = getYCols();

  if (yCols.length === 0) {
    alert('Please select at least one Y column to export.');
    return;
  }

  const isXNumeric = isNumeric(data.rows.map(r => r[xCol]));
  const xFormat = isXNumeric ? 'numbers' : 'none';
  const tableType = isXNumeric ? 'XY' : 'OneWay';

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<GraphPadPrismFile PrismXMLVersion="5.00">\n`;
  xml += `  <Created>\n`;
  xml += `    <OriginalVersion CreatedByProgram="Plotmaster Visualizer" Version="5.00"/>\n`;
  xml += `  </Created>\n`;
  
  xml += `  <Table ID="Table0" TableType="${tableType}" XFormat="${xFormat}" YFormat="replicates" Replicates="1" Length="${data.rows.length}">\n`;
  xml += `    <Title>${appState.activeSheetName || 'Exported Dataset'}</Title>\n`;

  if (isXNumeric) {
    xml += `    <XColumn Width="120" Decimals="6">\n`;
    xml += `      <Title>${xCol}</Title>\n`;
    xml += `      <Subcolumn>\n`;
    data.rows.forEach(row => {
      const v = row[xCol];
      xml += `        <d>${v !== null && v !== undefined ? v : ''}</d>\n`;
    });
    xml += `      </Subcolumn>\n`;
    xml += `    </XColumn>\n`;
  } else {
    xml += `    <RowTitlesColumn Width="150">\n`;
    xml += `      <Subcolumn>\n`;
    data.rows.forEach(row => {
      const v = row[xCol];
      xml += `        <d>${v !== null && v !== undefined ? v : ''}</d>\n`;
    });
    xml += `      </Subcolumn>\n`;
    xml += `    </RowTitlesColumn>\n`;
  }

  yCols.forEach((yCol, yIdx) => {
    xml += `    <YColumn Width="120" Decimals="6" Subcolumns="1">\n`;
    xml += `      <Title>${yCol}</Title>\n`;
    xml += `      <Subcolumn>\n`;
    data.rows.forEach(row => {
      const v = row[yCol];
      xml += `        <d>${v !== null && v !== undefined ? v : ''}</d>\n`;
    });
    xml += `      </Subcolumn>\n`;
    xml += `    </YColumn>\n`;
  });

  xml += `  </Table>\n`;
  xml += `</GraphPadPrismFile>\n`;

  const blob = new Blob([xml], { type: 'text/xml;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${appState.activeSheetName || 'dataset'}_graphpad_prism.pzfx`;
  link.click();
}

// GraphPad Prism ZIP Format (.prism) Export
function exportPRISMFile() {
  if (!appState.activeData) return;

  const data = appState.activeData;
  const xCol = DOM.xSelect.value;
  const yCols = getYCols();

  if (yCols.length === 0) {
    alert('Please select at least one Y column to export.');
    return;
  }

  const exportHeaders = [xCol, ...yCols];
  let csvText = exportHeaders.join(',') + '\n';
  
  data.rows.forEach(row => {
    const line = exportHeaders.map(h => {
      const val = row[h];
      if (val === null || val === undefined) return '';
      if (typeof val === 'string' && val.includes(',')) return `"${val}"`;
      return val;
    });
    csvText += line.join(',') + '\n';
  });

  const zip = new JSZip();
  zip.file('data/tables/table1.csv', csvText);

  const docJson = {
    version: 1,
    document: {
      info: {
        program: "Plotmaster Visualizer",
        version: "1.0.0"
      },
      tables: [
        {
          id: "table1",
          name: appState.activeSheetName || "Exported Dataset",
          type: isNumeric(data.rows.map(r => r[xCol])) ? "xy" : "grouped",
          csvPath: "data/tables/table1.csv"
        }
      ]
    }
  };

  zip.file('document.json', JSON.stringify(docJson, null, 2));

  zip.generateAsync({ type: 'blob' }).then(content => {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = `${appState.activeSheetName || 'dataset'}_graphpad_prism.prism`;
    link.click();
  }).catch(err => {
    alert('Failed to generate .prism file: ' + err.message);
  });
}

// Copy high-res combined image to clipboard
function copyChartToClipboard() {
  getCombinedCanvas(canvas => {
    canvas.toBlob(blob => {
      navigator.clipboard.write([
        new ClipboardItem({
          'image/png': blob
        })
      ]).then(() => {
        const originalHTML = DOM.copyClipboard.innerHTML;
        DOM.copyClipboard.innerHTML = `<i data-lucide="check" style="width: 14px; height: 14px; display: inline-block; vertical-align: middle;"></i> Copied!`;
        lucide.createIcons();
        setTimeout(() => {
          DOM.copyClipboard.innerHTML = originalHTML;
          lucide.createIcons();
        }, 2000);
      }).catch(err => {
        console.error('Clipboard copy failed:', err);
        alert('Failed to copy graph to clipboard. Please check browser clipboard permissions.');
      });
    }, 'image/png');
  });
}

function updateStatsGroupsList() {
  const xCol = DOM.xSelect ? DOM.xSelect.value : '';
  const gCol = DOM.groupSelect ? DOM.groupSelect.value : '';
  const compareCol = gCol || xCol;
  
  const container = document.getElementById('stats-group-checkboxes');
  const refSelect = document.getElementById('stats-reference-group');
  if (!container || !refSelect) return;
  
  if (!compareCol || !appState.activeData) {
    container.innerHTML = '';
    refSelect.innerHTML = '';
    return;
  }
  
  const rows = appState.activeData.rows;
  const uniqueVals = [...new Set(rows.map(r => String(r[compareCol])).filter(v => v !== null && v !== undefined && v !== ''))].sort();
  
  container.innerHTML = '';
  uniqueVals.forEach(v => {
    const label = document.createElement('label');
    label.className = 'checkbox-label';
    label.style.display = 'flex';
    label.style.alignItems = 'center';
    label.style.gap = '4px';
    label.style.margin = '2px 0';
    
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.className = 'stats-group-checkbox';
    cb.value = v;
    cb.checked = true;
    cb.addEventListener('change', updateStatsReferenceGroupOptions);
    
    const span = document.createElement('span');
    span.textContent = v;
    
    label.appendChild(cb);
    label.appendChild(span);
    container.appendChild(label);
  });
  
  updateStatsReferenceGroupOptions();
}

function updateStatsReferenceGroupOptions() {
  const refSelect = document.getElementById('stats-reference-group');
  if (!refSelect) return;
  const currentRef = refSelect.value;
  refSelect.innerHTML = '';
  
  const checkedCbs = Array.from(document.querySelectorAll('.stats-group-checkbox')).filter(cb => cb.checked);
  checkedCbs.forEach(cb => {
    const opt = document.createElement('option');
    opt.value = cb.value;
    opt.textContent = cb.value;
    refSelect.appendChild(opt);
  });
  
  if (Array.from(refSelect.options).some(o => o.value === currentRef)) {
    refSelect.value = currentRef;
  }
}

function runPairwiseTest(grpA, grpB, method, groupData) {
  const valsA = groupData.get(grpA) || [];
  const valsB = groupData.get(grpB) || [];
  if (valsA.length < 2 || valsB.length < 2) {
    return { p: 1.0, stat: 0, desc: 'N too small (both groups must have >= 2 replicates)' };
  }
  if (method === 'student_t') {
    const res = calculateStudentTTest(valsA, valsB);
    return { p: res.p, stat: res.t, desc: `t=${res.t.toFixed(4)}, df=${res.df}` };
  } else if (method === 'welch_t' || method === 'auto') {
    const res = calculateWelchTTest(valsA, valsB);
    return { p: res.p, stat: res.t, desc: `t=${res.t.toFixed(4)}, df=${res.df.toFixed(2)}` };
  } else if (method === 'paired_t') {
    try {
      const res = calculatePairedTTest(valsA, valsB);
      return { p: res.p, stat: res.t, desc: `t=${res.t.toFixed(4)}, df=${res.df}` };
    } catch (e) {
      return { p: 1.0, stat: 0, desc: `error: ${e.message}` };
    }
  } else if (method === 'mann_whitney') {
    const res = calculateMannWhitneyU(valsA, valsB);
    return { p: res.p, stat: res.U, desc: `U=${res.U}` };
  }
  const res = calculateWelchTTest(valsA, valsB);
  return { p: res.p, stat: res.t, desc: `t=${res.t.toFixed(4)}` };
}

function runStatisticalTest() {
  const xCol = DOM.xSelect.value;
  const yCols = getYCols();
  const gCol = DOM.groupSelect.value;
  let rows = getPlotFilteredRows();
  
  if (!xCol || yCols.length === 0 || rows.length === 0) {
    alert('Please load data and map columns first.');
    return;
  }
  
  const yCol = yCols[0];
  const compareCol = gCol || xCol;
  
  // Stats filter evaluation
  const filterCol = document.getElementById('stats-filter-col').value;
  const filterVal = document.getElementById('stats-filter-val').value.trim();
  if (filterCol && filterVal !== '') {
    rows = rows.filter(r => {
      const cellVal = r[filterCol];
      if (cellVal === undefined || cellVal === null) return false;
      return String(cellVal).toLowerCase() === filterVal.toLowerCase();
    });
  }
  
  const method = document.getElementById('stats-method-select').value;
  
  let cleanRows;
  if (method === 'chi_square') {
    cleanRows = rows.filter(r => r[compareCol] !== null && r[compareCol] !== undefined && r[yCol] !== null && r[yCol] !== undefined);
  } else {
    cleanRows = rows.filter(r => r[compareCol] !== null && r[compareCol] !== undefined && r[yCol] !== null && r[yCol] !== undefined && !isNaN(Number(r[yCol])));
  }
  
  if (cleanRows.length < 3) {
    alert('Not enough valid rows to perform statistical analysis (minimum 3).');
    return;
  }
  
  // Identify which groups to analyze using checkboxes
  const checkedCbs = Array.from(document.querySelectorAll('.stats-group-checkbox')).filter(cb => cb.checked);
  let groupsToAnalyze = checkedCbs.map(cb => cb.value);
  if (groupsToAnalyze.length === 0) {
    groupsToAnalyze = [...new Set(cleanRows.map(r => String(r[compareCol])))].sort();
  }
  
  let summary = '';
  lastStatsResults = null;
  
  if (method === 'pearson' || method === 'spearman' || method === 'linear_reg') {
    const xVals = cleanRows.map(r => Number(r[compareCol]));
    const yVals = cleanRows.map(r => Number(r[yCol]));
    if (xVals.some(isNaN) || yVals.some(isNaN)) {
      alert('Both variables must contain numeric data to run correlation/regression.');
      return;
    }
    
    if (method === 'pearson') {
      try {
        const res = calculateCorrelation(xVals, yVals, 'pearson');
        summary += `PEARSON CORRELATION\n`;
        summary += `-------------------\n`;
        summary += `Variable X : ${compareCol}\n`;
        summary += `Variable Y : ${yCol}\n`;
        summary += `Sample Size (N): ${xVals.length}\n`;
        summary += `Correlation (r): ${res.r.toFixed(4)}\n`;
        summary += `R-squared (R²): ${res.r2.toFixed(4)}\n`;
        summary += `t-statistic: ${res.t.toFixed(4)}\n`;
        summary += `df         : ${res.df}\n`;
        summary += `p-value    : ${res.p < 0.0001 ? '< 0.0001' : res.p.toFixed(4)}\n`;
        summary += `Significance: ${res.p < 0.05 ? 'Significant (*)' : 'ns (not sig)'}`;
        
        lastStatsResults = {
          type: 'regression',
          xCol: compareCol, yCol, N: xVals.length, slope: 0, intercept: 0, r: res.r, r2: res.r2, p: res.p,
          sigSymbol: getPValueSymbol(res.p)
        };
      } catch (err) {
        alert(err.message);
        return;
      }
    } else if (method === 'spearman') {
      try {
        const res = calculateCorrelation(xVals, yVals, 'spearman');
        summary += `SPEARMAN RANK CORRELATION (NON-PARAMETRIC)\n`;
        summary += `-------------------------------------------\n`;
        summary += `Variable X : ${compareCol}\n`;
        summary += `Variable Y : ${yCol}\n`;
        summary += `Sample Size (N): ${xVals.length}\n`;
        summary += `Spearman r     : ${res.r.toFixed(4)}\n`;
        summary += `t-statistic    : ${res.t.toFixed(4)}\n`;
        summary += `df             : ${res.df}\n`;
        summary += `p-value        : ${res.p < 0.0001 ? '< 0.0001' : res.p.toFixed(4)}\n`;
        summary += `Significance   : ${res.p < 0.05 ? 'Significant (*)' : 'ns (not sig)'}`;
        
        lastStatsResults = {
          type: 'regression',
          xCol: compareCol, yCol, N: xVals.length, slope: 0, intercept: 0, r: res.r, r2: res.r2, p: res.p,
          sigSymbol: getPValueSymbol(res.p)
        };
      } catch (err) {
        alert(err.message);
        return;
      }
    } else if (method === 'linear_reg') {
      const N = cleanRows.length;
      const xMean = xVals.reduce((a, b) => a + b, 0) / N;
      const yMean = yVals.reduce((a, b) => a + b, 0) / N;
      
      let num = 0;
      let denX = 0;
      let denY = 0;
      for (let i = 0; i < N; i++) {
        const dx = xVals[i] - xMean;
        const dy = yVals[i] - yMean;
        num += dx * dy;
        denX += dx * dx;
        denY += dy * dy;
      }
      
      const slope = denX !== 0 ? num / denX : 0;
      const intercept = yMean - slope * xMean;
      const r = (denX !== 0 && denY !== 0) ? num / Math.sqrt(denX * denY) : 0;
      const r2 = r * r;
      
      const df = N - 2;
      let t = 0;
      let p = 1.0;
      if (r2 < 1.0 && df > 0) {
        t = r * Math.sqrt(df / (1 - r2));
        p = studentTProbability(t, df);
      }
      
      summary += `LINEAR REGRESSION\n`;
      summary += `-----------------\n`;
      summary += `Variable X : ${compareCol}\n`;
      summary += `Variable Y : ${yCol}\n`;
      summary += `Sample Size (N): ${N}\n`;
      summary += `Slope (m)  : ${slope.toFixed(4)}\n`;
      summary += `Intercept(c): ${intercept.toFixed(4)}\n`;
      summary += `Equation   : Y = ${slope.toFixed(4)}*X + ${intercept.toFixed(4)}\n`;
      summary += `Correlation (r): ${r.toFixed(4)}\n`;
      summary += `R-squared (R²): ${r2.toFixed(4)}\n`;
      summary += `t-statistic: ${t.toFixed(4)}\n`;
      summary += `p-value    : ${p < 0.0001 ? '< 0.0001' : p.toFixed(4)}\n`;
      summary += `Significance: ${p < 0.05 ? 'Significant (*)' : 'ns (not sig)'}`;
      
      lastStatsResults = {
        type: 'regression',
        xCol: compareCol, yCol, N, slope, intercept, r, r2, p,
        sigSymbol: getPValueSymbol(p)
      };
    }
  } else if (method === 'chi_square') {
    const uniqueX = [...new Set(cleanRows.map(r => String(r[compareCol])))].sort();
    const uniqueY = [...new Set(cleanRows.map(r => String(r[yCol])))].sort();
    
    if (uniqueX.length < 2 || uniqueY.length < 2) {
      alert('Both variables must have at least 2 unique categories to perform Chi-square test.');
      return;
    }
    
    const observed = uniqueX.map(() => uniqueY.map(() => 0));
    cleanRows.forEach(r => {
      const xVal = String(r[compareCol]);
      const yVal = String(r[yCol]);
      const ix = uniqueX.indexOf(xVal);
      const iy = uniqueY.indexOf(yVal);
      if (ix !== -1 && iy !== -1) {
        observed[ix][iy]++;
      }
    });
    
    try {
      const res = calculateChiSquareContingency(observed, uniqueX, uniqueY);
      summary += `CHI-SQUARE CONTINGENCY TEST\n`;
      summary += `---------------------------\n`;
      summary += `Variable X : ${compareCol} (${uniqueX.length} categories)\n`;
      summary += `Variable Y : ${yCol} (${uniqueY.length} categories)\n`;
      summary += `Total N    : ${res.N}\n\n`;
      
      summary += `OBSERVED FREQUENCIES:\n`;
      summary += `X \\ Y | ` + uniqueY.join(' | ') + ` | Total\n`;
      for (let i = 0; i < uniqueX.length; i++) {
        summary += `${uniqueX[i]} | ` + observed[i].join(' | ') + ` | ${res.rowTotals[i]}\n`;
      }
      summary += `Total | ` + res.colTotals.join(' | ') + ` | ${res.N}\n\n`;
      
      summary += `EXPECTED FREQUENCIES:\n`;
      for (let i = 0; i < uniqueX.length; i++) {
        summary += `${uniqueX[i]} | ` + res.expectedTable[i].map(v => v.toFixed(2)).join(' | ') + `\n`;
      }
      summary += `\n`;
      
      summary += `Chi-square Statistic: ${res.chiSq.toFixed(4)}\n`;
      summary += `df                  : ${res.df}\n`;
      summary += `p-value             : ${res.p < 0.0001 ? '< 0.0001' : res.p.toFixed(4)}\n`;
      summary += `Significance        : ${res.p < 0.05 ? 'Significant (*)' : 'ns (not sig)'}`;
      
      lastStatsResults = null;
    } catch (err) {
      alert(err.message);
      return;
    }
  } else {
    // Group comparison tests
    if (groupsToAnalyze.length < 2) {
      alert('Please select at least 2 groups to perform analysis.');
      return;
    }
    
    const statsRows = cleanRows.filter(r => groupsToAnalyze.includes(String(r[compareCol])));
    
    const groupData = new Map();
    statsRows.forEach(r => {
      const cat = String(r[compareCol]);
      const val = Number(r[yCol]);
      if (!groupData.has(cat)) groupData.set(cat, []);
      groupData.get(cat).push(val);
    });
    groupsToAnalyze.forEach(g => {
      if (!groupData.has(g)) groupData.set(g, []);
    });
    
    let activeMethod = method;
    if (activeMethod === 'auto') {
      activeMethod = groupsToAnalyze.length === 2 ? 'welch_t' : 'anova_ordinary';
    }
    
    // 1. Calculate overall test results
    if (activeMethod === 'anova_ordinary') {
      const K = groupsToAnalyze.length;
      let totalN = 0;
      let grandSum = 0;
      
      const groupStats = groupsToAnalyze.map(g => {
        const vals = groupData.get(g) || [];
        const n = vals.length;
        const mean = n > 0 ? vals.reduce((a, b) => a + b, 0) / n : 0;
        const variance = n > 1 ? vals.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / (n - 1) : 0;
        totalN += n;
        grandSum += vals.reduce((a, b) => a + b, 0);
        return { name: g, n, mean, variance };
      });
      
      const grandMean = totalN > 0 ? grandSum / totalN : 0;
      
      let ssb = 0;
      let ssw = 0;
      groupStats.forEach(gs => {
        ssb += gs.n * Math.pow(gs.mean - grandMean, 2);
        ssw += (gs.n - 1) * gs.variance;
      });
      
      const dfB = K - 1;
      const dfW = totalN - K;
      const msb = ssb / dfB;
      const msw = dfW > 0 ? ssw / dfW : 0;
      const f = msw > 0 ? msb / msw : 0;
      const p = fDistributionPValue(f, dfB, dfW);
      
      summary += `ONE-WAY ORDINARY ANOVA (总体检验)\n`;
      summary += `-------------------------------\n`;
      groupStats.forEach(gs => {
        summary += `${gs.name}: N=${gs.n}, Mean=${gs.mean.toFixed(4)}, SD=${Math.sqrt(gs.variance).toFixed(4)}\n`;
      });
      summary += `Grand Mean: ${grandMean.toFixed(4)}\n`;
      summary += `F-statistic: ${f.toFixed(4)}\n`;
      summary += `df (between, within): ${dfB}, ${dfW}\n`;
      summary += `p-value: ${p < 0.0001 ? '< 0.0001' : p.toFixed(4)}\n`;
      summary += `Significance: ${p < 0.05 ? 'Significant (*)' : 'ns (not sig)'}\n`;
    } else if (activeMethod === 'anova_welch') {
      try {
        const filteredGroupData = new Map();
        groupsToAnalyze.forEach(g => filteredGroupData.set(g, groupData.get(g) || []));
        const res = calculateWelchANOVA(filteredGroupData);
        summary += `WELCH'S ANOVA (UNEQUAL VARIANCES) (总体检验)\n`;
        summary += `-----------------------------------------\n`;
        for (let i = 0; i < res.keys.length; i++) {
          summary += `${res.keys[i]}: N=${res.n[i]}, Mean=${res.means[i].toFixed(4)}, SD=${Math.sqrt(res.vars[i]).toFixed(4)}\n`;
        }
        summary += `Welch F-statistic: ${res.f.toFixed(4)}\n`;
        summary += `df (between, within): ${res.df1}, ${res.df2.toFixed(2)}\n`;
        summary += `p-value: ${res.p < 0.0001 ? '< 0.0001' : res.p.toFixed(4)}\n`;
        summary += `Significance: ${res.p < 0.05 ? 'Significant (*)' : 'ns (not sig)'}\n`;
      } catch (err) {
        alert(err.message);
        return;
      }
    } else if (activeMethod === 'kruskal_wallis') {
      const filteredGroupData = new Map();
      groupsToAnalyze.forEach(g => filteredGroupData.set(g, groupData.get(g) || []));
      const res = calculateKruskalWallis(filteredGroupData);
      summary += `KRUSKAL-WALLIS TEST (NON-PARAMETRIC) (总体检验)\n`;
      summary += `----------------------------------------------\n`;
      res.keys.forEach(k => {
        const vals = groupData.get(k) || [];
        const R = res.rankSums[k] || 0;
        summary += `${k}: N=${vals.length}, Rank Sum=${R.toFixed(1)}, Mean Rank=${vals.length > 0 ? (R / vals.length).toFixed(2) : 0}\n`;
      });
      summary += `H statistic (Chi-sq): ${res.H.toFixed(4)}\n`;
      summary += `df                  : ${res.df}\n`;
      summary += `p-value             : ${res.p < 0.0001 ? '< 0.0001' : res.p.toFixed(4)}\n`;
      summary += `Significance        : ${res.p < 0.05 ? 'Significant (*)' : 'ns (not sig)'}\n`;
    } else if (groupsToAnalyze.length === 2) {
      const grpA = groupsToAnalyze[0];
      const grpB = groupsToAnalyze[1];
      const valsA = groupData.get(grpA) || [];
      const valsB = groupData.get(grpB) || [];
      
      if (valsA.length < 2 || valsB.length < 2) {
        alert('Both groups must have at least 2 replicates.');
        return;
      }
      
      if (activeMethod === 'student_t') {
        const res = calculateStudentTTest(valsA, valsB);
        summary += `STUDENT'S T-TEST (EQUAL VARIANCE)\n`;
        summary += `-----------------------------------\n`;
        summary += `Group A : ${grpA} (N=${res.nA}, Mean=${res.meanA.toFixed(4)})\n`;
        summary += `Group B : ${grpB} (N=${res.nB}, Mean=${res.meanB.toFixed(4)})\n`;
        summary += `Difference in Means: ${(res.meanA - res.meanB).toFixed(4)}\n`;
        summary += `t-statistic : ${res.t.toFixed(4)}\n`;
        summary += `df          : ${res.df}\n`;
        summary += `p-value     : ${res.p < 0.0001 ? '< 0.0001' : res.p.toFixed(4)}\n`;
        summary += `Significance: ${res.p < 0.05 ? 'Significant (*)' : 'ns (not sig)'}\n`;
      } else if (activeMethod === 'welch_t') {
        const res = calculateWelchTTest(valsA, valsB);
        summary += `WELCH'S T-TEST (UNEQUAL VARIANCE)\n`;
        summary += `---------------------------------\n`;
        summary += `Group A : ${grpA} (N=${res.nA}, Mean=${res.meanA.toFixed(4)})\n`;
        summary += `Group B : ${grpB} (N=${res.nB}, Mean=${res.meanB.toFixed(4)})\n`;
        summary += `Difference in Means: ${(res.meanA - res.meanB).toFixed(4)}\n`;
        summary += `t-statistic : ${res.t.toFixed(4)}\n`;
        summary += `df (Satterthwaite): ${res.df.toFixed(2)}\n`;
        summary += `p-value     : ${res.p < 0.0001 ? '< 0.0001' : res.p.toFixed(4)}\n`;
        summary += `Significance: ${res.p < 0.05 ? 'Significant (*)' : 'ns (not sig)'}\n`;
      } else if (activeMethod === 'paired_t') {
        try {
          const res = calculatePairedTTest(valsA, valsB);
          const meanA = valsA.reduce((a, b) => a + b, 0) / valsA.length;
          const meanB = valsB.reduce((a, b) => a + b, 0) / valsB.length;
          summary += `PAIRED T-TEST\n`;
          summary += `-------------\n`;
          summary += `Group A : ${grpA} (N=${valsA.length}, Mean=${meanA.toFixed(4)})\n`;
          summary += `Group B : ${grpB} (N=${valsB.length}, Mean=${meanB.toFixed(4)})\n`;
          summary += `Number of pairs: ${res.n}\n`;
          summary += `Mean Difference: ${res.meanDiff.toFixed(4)}\n`;
          summary += `t-statistic    : ${res.t.toFixed(4)}\n`;
          summary += `df             : ${res.df}\n`;
          summary += `p-value        : ${res.p < 0.0001 ? '< 0.0001' : res.p.toFixed(4)}\n`;
          summary += `Significance   : ${res.p < 0.05 ? 'Significant (*)' : 'ns (not sig)'}\n`;
        } catch (err) {
          alert(err.message);
          return;
        }
      } else if (activeMethod === 'mann_whitney') {
        const res = calculateMannWhitneyU(valsA, valsB);
        summary += `MANN-WHITNEY U TEST\n`;
        summary += `-------------------\n`;
        summary += `Group A : ${grpA} (N=${res.nA})\n`;
        summary += `Group B : ${grpB} (N=${res.nB})\n`;
        summary += `U statistic : ${res.U}\n`;
        summary += `Expected U  : ${res.meanU}\n`;
        summary += `p-value     : ${res.p < 0.0001 ? '< 0.0001' : res.p.toFixed(4)}\n`;
        summary += `Significance: ${res.p < 0.05 ? 'Significant (*)' : 'ns (not sig)'}\n`;
      }
    }
    
    // 2. Generate pairwise comparisons
    const pairs = [];
    const comparisonType = document.getElementById('stats-comparison-type').value;
    if (comparisonType === 'vs_control') {
      const refGroup = document.getElementById('stats-reference-group').value;
      groupsToAnalyze.forEach(g => {
        if (g !== refGroup) {
          pairs.push([refGroup, g]);
        }
      });
    } else {
      // all_pairs
      for (let i = 0; i < groupsToAnalyze.length; i++) {
        for (let j = i + 1; j < groupsToAnalyze.length; j++) {
          pairs.push([groupsToAnalyze[i], groupsToAnalyze[j]]);
        }
      }
    }
    
    const m = pairs.length;
    const comparisons = [];
    
    let pairwiseMethod = activeMethod;
    if (activeMethod === 'anova_ordinary') pairwiseMethod = 'student_t';
    if (activeMethod === 'anova_welch') pairwiseMethod = 'welch_t';
    if (activeMethod === 'kruskal_wallis') pairwiseMethod = 'mann_whitney';
    
    pairs.forEach(pair => {
      const grpA = pair[0];
      const grpB = pair[1];
      const testRes = runPairwiseTest(grpA, grpB, pairwiseMethod, groupData);
      const pCorrected = Math.min(1.0, testRes.p * m);
      const sigSymbol = getPValueSymbol(pCorrected);
      comparisons.push({
        grpA,
        grpB,
        pUncorrected: testRes.p,
        pCorrected,
        sigSymbol,
        stat: testRes.stat,
        desc: testRes.desc
      });
    });
    
    if (m > 0) {
      summary += `\n`;
      summary += `BONFERRONI MULTIPLE COMPARISONS (多重比较 - Bonferroni 校正)\n`;
      summary += `----------------------------------------------------------\n`;
      summary += `Number of Comparisons (m) = ${m}\n\n`;
      comparisons.forEach((c, idx) => {
        summary += `${idx + 1}. ${c.grpA} vs ${c.grpB}:\n`;
        summary += `   Uncorrected p = ${c.pUncorrected < 0.0001 ? '< 0.0001' : c.pUncorrected.toFixed(4)}\n`;
        summary += `   Corrected p   = ${c.pCorrected < 0.0001 ? '< 0.0001' : c.pCorrected.toFixed(4)} (${c.sigSymbol})\n`;
        summary += `   Test detail   : ${c.desc}\n`;
      });
    }
    
    // Save to lastStatsResults
    lastStatsResults = {
      type: 'anova',
      groups: groupsToAnalyze,
      comparisons: comparisons
    };
    
    // Populate dropdown selector
    const select = document.getElementById('stats-comparison-select');
    if (select) {
      select.innerHTML = '';
      comparisons.forEach((c, idx) => {
        const opt = document.createElement('option');
        opt.value = idx;
        opt.textContent = `${c.grpA} vs ${c.grpB} (p=${c.pCorrected < 0.0001 ? '<0.0001' : c.pCorrected.toFixed(4)}, ${c.sigSymbol})`;
        select.appendChild(opt);
      });
      
      const selectContainer = document.getElementById('stats-comparison-select-container');
      if (selectContainer) {
        selectContainer.style.display = comparisons.length > 0 ? 'flex' : 'none';
      }
    }
  }
  
  const panel = document.getElementById('stats-results-panel');
  const summaryText = document.getElementById('stats-summary-text');
  summaryText.textContent = summary;
  panel.style.display = 'block';
}

function getPValueSymbol(p) {
  if (p < 0.0001) return '****';
  if (p < 0.001) return '***';
  if (p < 0.01) return '**';
  if (p < 0.05) return '*';
  return 'ns';
}

function addSignificanceBar() {
  if (!lastStatsResults || !appState.chartInstance) {
    alert('Please run a statistical test first.');
    return;
  }
  
  const select = document.getElementById('stats-comparison-select');
  if (!select || select.options.length === 0) {
    alert('No comparisons available. Please run a statistical test first.');
    return;
  }
  
  const idx = parseInt(select.value, 10);
  const comp = lastStatsResults.comparisons[idx];
  if (!comp) {
    alert('Selected comparison not found.');
    return;
  }
  
  const grpA = comp.grpA;
  const grpB = comp.grpB;
  const sigSymbol = comp.sigSymbol;
  
  const tab = getActiveTab();
  if (!tab) return;
  
  const xCol = DOM.xSelect.value;
  const yCols = getYCols();
  const yCol = yCols[0];
  const gCol = DOM.groupSelect.value;
  
  const rows = appState.activeData.rows;
  let idxA, idxB;
  
  if (gCol) {
    const groupsList = [...new Set(rows.map(r => String(r[gCol])).filter(v => v !== null && v !== ''))].sort();
    const gIdxA = groupsList.indexOf(grpA);
    const gIdxB = groupsList.indexOf(grpB);
    if (gIdxA === -1 || gIdxB === -1) {
      alert('Could not locate group categories on the chart.');
      return;
    }
    const totalSeriesCount = yCols.length * groupsList.length;
    const currentSeriesIndexA = yCols.indexOf(yCol) + gIdxA * yCols.length;
    const currentSeriesIndexB = yCols.indexOf(yCol) + gIdxB * yCols.length;
    
    const catIdx = 0;
    let offset = 0.22;
    if (appState.currentChartType === 'bar') {
      offset = 0.65 / totalSeriesCount;
    }
    idxA = catIdx + (currentSeriesIndexA - (totalSeriesCount - 1) / 2) * offset;
    idxB = catIdx + (currentSeriesIndexB - (totalSeriesCount - 1) / 2) * offset;
  } else {
    const xCategories = [...new Set(rows.map(r => String(r[xCol])))];
    idxA = xCategories.indexOf(grpA);
    idxB = xCategories.indexOf(grpB);
  }
  
  if (idxA === -1 || idxB === -1) {
    alert('Could not locate group categories on the chart.');
    return;
  }
  
  const valsA = rows.filter(r => (!gCol && String(r[xCol]) === grpA) || (gCol && String(r[gCol]) === grpA)).map(r => Number(r[yCol])).filter(v => !isNaN(v));
  const valsB = rows.filter(r => (!gCol && String(r[xCol]) === grpB) || (gCol && String(r[gCol]) === grpB)).map(r => Number(r[yCol])).filter(v => !isNaN(v));
  const maxVal = Math.max(...valsA, ...valsB) || 0;
  
  // Stagger significance bars if there are already some significance bars
  const sigAnns = tab.annotations.filter(ann => ann.isSig && ann.id.endsWith('_line_main'));
  const staggerFactor = 1 + sigAnns.length * 0.45;
  const range = (maxVal === 0) ? 10 : maxVal * 0.12 * staggerFactor;
  const barYVal = maxVal + range;
  
  const pixelA = appState.chartInstance.convertToPixel({ finder: { seriesIndex: 0 } }, [idxA, barYVal]);
  const pixelB = appState.chartInstance.convertToPixel({ finder: { seriesIndex: 0 } }, [idxB, barYVal]);
  
  if (!pixelA || !pixelB) {
    alert('Failed to calculate chart pixel locations. Make sure the chart is drawn.');
    return;
  }
  
  const bracketId = 'ann_sig_' + Date.now();
  const barColor = '#64748b';
  const yBar = pixelA[1];
  const yTickLow = yBar + 8;
  
  tab.annotations.push({
    id: bracketId + '_line_main',
    type: 'arrow',
    x1: pixelA[0],
    y1: yBar,
    x2: pixelB[0],
    y2: yBar,
    color: barColor,
    strokeWidth: 1.5,
    isSig: true,
    noArrow: true
  });
  
  tab.annotations.push({
    id: bracketId + '_line_left',
    type: 'arrow',
    x1: pixelA[0],
    y1: yBar,
    x2: pixelA[0],
    y2: yTickLow,
    color: barColor,
    strokeWidth: 1.5,
    isSig: true,
    noArrow: true
  });
  
  tab.annotations.push({
    id: bracketId + '_line_right',
    type: 'arrow',
    x1: pixelB[0],
    y1: yBar,
    x2: pixelB[0],
    y2: yTickLow,
    color: barColor,
    strokeWidth: 1.5,
    isSig: true,
    noArrow: true
  });
  
  const xCenter = (pixelA[0] + pixelB[0]) / 2;
  tab.annotations.push({
    id: bracketId + '_text',
    type: 'text',
    x: xCenter - 6,
    y: yBar - 6,
    text: sigSymbol,
    color: barColor,
    fontSize: 14,
    isSig: true
  });
  
  drawAnnotations();
}

// ==============================================================================
// 10. Style Templates & Font Defaults Helpers
// ==============================================================================
const LOCAL_STORAGE_KEY_TEMPLATES = 'plotmaster_style_templates';

function getStoredTemplates() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY_TEMPLATES);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.error('Failed to parse templates from localStorage', e);
    return {};
  }
}

function saveStyleTemplate(name) {
  if (!name || name.trim() === '') {
    alert('Please enter a valid template name.');
    return;
  }
  const templates = getStoredTemplates();
  
  const config = {
    pointSize: parseInt(DOM.pointSize.value) || 8,
    pointShape: document.getElementById('point-shape-select')?.value || 'circle',
    lineWidth: parseInt(DOM.lineWidth.value) || 2,
    barPadding: parseInt(DOM.barPadding.value) || 20,
    boxWidth: parseInt(DOM.boxWidth.value) || 50,
    plotWidth: parseInt(DOM.plotWidth.value) || 15,
    plotHeight: parseInt(DOM.plotHeight.value) || 12,
    showPoints: document.getElementById('show-points-checkbox').checked,
    showMean: document.getElementById('show-mean-checkbox').checked,
    errorBarType: document.getElementById('error-bar-select').value || 'none',
    font: DOM.fontSelect.value || 'Inter',
    theme: DOM.themeSelect.value || 'minimal',
    gridX: DOM.gridX.checked,
    gridY: DOM.gridY.checked,
    legendPosition: document.getElementById('legend-position-select').value || 'bottom',
    legendDistance: document.getElementById('legend-distance-slider') ? parseFloat(document.getElementById('legend-distance-slider').value) : 0.8,
    individualCurves: document.getElementById('individual-curves-checkbox').checked,
    yScaleType: document.getElementById('y-axis-scale-type')?.value || 'linear',
    yNumFormat: document.getElementById('y-axis-num-format')?.value || 'std',
    ySplitMode: document.getElementById('y-axis-split-mode')?.value || '1',
    titleFontSize: parseInt(document.getElementById('title-font-size')?.value) || 16,
    titleFontColor: document.getElementById('title-font-color')?.value || '#334155',
    axisTitleFontSize: parseInt(document.getElementById('axis-title-font-size')?.value) || 13,
    axisTitleFontColor: document.getElementById('axis-title-font-color')?.value || '#334155',
    axisValueFontSize: parseInt(document.getElementById('axis-value-font-size')?.value) || 12,
    axisValueFontColor: document.getElementById('axis-value-font-color')?.value || '#475569',
    legendFontSize: parseInt(document.getElementById('legend-font-size')?.value) || 12,
    legendFontColor: document.getElementById('legend-font-color')?.value || '#475569'
  };

  templates[name] = config;
  localStorage.setItem(LOCAL_STORAGE_KEY_TEMPLATES, JSON.stringify(templates));
  loadStyleTemplatesDropdown();
  document.getElementById('template-name-input').value = '';
  alert(`Template "${name}" saved successfully.`);
}

function loadStyleTemplatesDropdown() {
  const select = document.getElementById('template-select');
  if (!select) return;
  
  select.innerHTML = '<option value="">-- Apply Template --</option>';
  
  const templates = getStoredTemplates();
  Object.keys(templates).forEach(name => {
    const opt = document.createElement('option');
    opt.value = name;
    opt.textContent = name;
    select.appendChild(opt);
  });
}

function applyStyleTemplate(name) {
  if (!name) return;
  const templates = getStoredTemplates();
  const config = templates[name];
  if (!config) return;

  if (config.pointSize !== undefined) {
    DOM.pointSize.value = config.pointSize;
    DOM.pointSizeVal.textContent = config.pointSize;
  }
  if (config.pointShape !== undefined) {
    const el = document.getElementById('point-shape-select');
    if (el) el.value = config.pointShape;
  }
  if (config.lineWidth !== undefined) {
    DOM.lineWidth.value = config.lineWidth;
    DOM.lineWidthVal.textContent = config.lineWidth;
  }
  if (config.barPadding !== undefined) {
    DOM.barPadding.value = config.barPadding;
    DOM.barPaddingVal.textContent = config.barPadding + '%';
  }
  if (config.boxWidth !== undefined) {
    DOM.boxWidth.value = config.boxWidth;
    DOM.boxWidthVal.textContent = config.boxWidth + '%';
  }
  if (config.plotWidth !== undefined) {
    DOM.plotWidth.value = config.plotWidth;
    DOM.plotWidthVal.textContent = config.plotWidth + ' cm';
  }
  if (config.plotHeight !== undefined) {
    DOM.plotHeight.value = config.plotHeight;
    DOM.plotHeightVal.textContent = config.plotHeight + ' cm';
  }
  if (config.showPoints !== undefined) {
    document.getElementById('show-points-checkbox').checked = config.showPoints;
  }
  if (config.showMean !== undefined) {
    document.getElementById('show-mean-checkbox').checked = config.showMean;
  }
  if (config.errorBarType !== undefined) {
    document.getElementById('error-bar-select').value = config.errorBarType;
  }
  if (config.font !== undefined) DOM.fontSelect.value = config.font;
  if (config.theme !== undefined) DOM.themeSelect.value = config.theme;
  if (config.gridX !== undefined) DOM.gridX.checked = config.gridX;
  if (config.gridY !== undefined) DOM.gridY.checked = config.gridY;
  
  if (config.legendPosition !== undefined) {
    document.getElementById('legend-position-select').value = config.legendPosition;
  }
  if (config.legendDistance !== undefined) {
    const slider = document.getElementById('legend-distance-slider');
    const valSpan = document.getElementById('legend-distance-val');
    if (slider) {
      slider.value = config.legendDistance;
      if (valSpan) valSpan.textContent = config.legendDistance + ' cm';
    }
  }
  if (config.individualCurves !== undefined) {
    document.getElementById('individual-curves-checkbox').checked = config.individualCurves;
  }
  if (config.yScaleType !== undefined) {
    const el = document.getElementById('y-axis-scale-type');
    if (el) el.value = config.yScaleType;
  }
  if (config.yNumFormat !== undefined) {
    const el = document.getElementById('y-axis-num-format');
    if (el) el.value = config.yNumFormat;
  }
  if (config.ySplitMode !== undefined) {
    const el = document.getElementById('y-axis-split-mode');
    if (el) {
      el.value = config.ySplitMode;
      renderYSplitControls(config.ySplitMode);
    }
  }
  
  if (config.titleFontSize !== undefined) document.getElementById('title-font-size').value = config.titleFontSize;
  if (config.titleFontColor !== undefined) document.getElementById('title-font-color').value = config.titleFontColor;
  if (config.axisTitleFontSize !== undefined) document.getElementById('axis-title-font-size').value = config.axisTitleFontSize;
  if (config.axisTitleFontColor !== undefined) document.getElementById('axis-title-font-color').value = config.axisTitleFontColor;
  if (config.axisValueFontSize !== undefined) document.getElementById('axis-value-font-size').value = config.axisValueFontSize;
  if (config.axisValueFontColor !== undefined) document.getElementById('axis-value-font-color').value = config.axisValueFontColor;
  if (config.legendFontSize !== undefined) document.getElementById('legend-font-size').value = config.legendFontSize;
  if (config.legendFontColor !== undefined) document.getElementById('legend-font-color').value = config.legendFontColor;

  saveActiveTabState();
  if (appState.activeData) drawChart();
}

function deleteStyleTemplate(name) {
  if (!name) return;
  const templates = getStoredTemplates();
  if (templates[name]) {
    delete templates[name];
    localStorage.setItem(LOCAL_STORAGE_KEY_TEMPLATES, JSON.stringify(templates));
    loadStyleTemplatesDropdown();
    alert(`Template "${name}" deleted successfully.`);
  }
}

function updateManualStylesList() {
  const panel = document.getElementById('manual-styles-panel');
  const checkbox = document.getElementById('manual-style-checkbox');
  if (!panel || !checkbox) return;

  panel.style.display = checkbox.checked ? 'block' : 'none';

  const listContainer = document.getElementById('manual-styles-list');
  if (!listContainer) return;

  const tab = getActiveTab();
  const manualStyles = (tab && tab.manualStyles) ? tab.manualStyles : {};

  const gCol = DOM.groupSelect ? DOM.groupSelect.value : '';
  const yCols = getYCols();
  const y2Cols = getY2Cols();
  const totalCols = [...yCols, ...y2Cols];
  const totalColsCount = totalCols.length;

  let targets = [];
  if (appState.activeData && totalColsCount > 0) {
    if (gCol) {
      const groups = [...new Set(appState.activeData.rows.map(r => String(r[gCol])).filter(g => g !== null && g !== ''))];
      if (totalColsCount > 1) {
        groups.forEach(g => {
          totalCols.forEach(col => {
            targets.push(`${g} (${col})`);
          });
        });
      } else {
        targets = groups;
      }
    } else {
      targets = totalCols;
    }
  }

  listContainer.innerHTML = '';
  if (targets.length === 0) {
    listContainer.innerHTML = '<div style="color: var(--text-muted); text-align: center; padding: 10px;">No groups or columns selected</div>';
    return;
  }

  targets.forEach((target, index) => {
    const saved = manualStyles[target] || { enabled: false, color: getDefaultColorForIdx(index), shape: 'circle' };
    
    const row = document.createElement('div');
    row.className = 'manual-style-row';
    row.dataset.target = target;
    row.style.cssText = 'display: flex; align-items: center; gap: 6px; padding: 4px 0; border-bottom: 1px dashed rgba(255,255,255,0.05);';

    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.className = 'manual-target-enable';
    cb.checked = saved.enabled;
    cb.style.cursor = 'pointer';

    const lbl = document.createElement('span');
    lbl.className = 'manual-target-name';
    lbl.textContent = target;
    lbl.title = target;
    lbl.style.cssText = 'flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--text-primary);';

    const cp = document.createElement('input');
    cp.type = 'color';
    cp.className = 'manual-target-color';
    cp.value = saved.color;
    cp.disabled = !saved.enabled;
    cp.style.cssText = 'border: none; padding: 0; width: 18px; height: 18px; background: none; cursor: pointer;';

    const ss = document.createElement('select');
    ss.className = 'form-select manual-target-shape';
    ss.disabled = !saved.enabled;
    ss.style.cssText = 'font-size: 10px; padding: 2px; height: auto; width: 90px;';
    
    const shapes = [
      { value: 'circle', label: 'Circle (实心圆)' },
      { value: 'circle-hollow', label: 'Circle Hollow (空心)' },
      { value: 'rect', label: 'Square (实心方型)' },
      { value: 'rect-hollow', label: 'Square Hollow (空心)' },
      { value: 'triangle', label: 'Triangle (实心三角)' },
      { value: 'triangle-hollow', label: 'Triangle Hollow (空心)' },
      { value: 'diamond', label: 'Diamond (实心菱形)' },
      { value: 'diamond-hollow', label: 'Diamond Hollow (空心)' }
    ];

    shapes.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s.value;
      opt.textContent = s.label;
      if (s.value === saved.shape) opt.selected = true;
      ss.appendChild(opt);
    });

    cb.addEventListener('change', () => {
      cp.disabled = !cb.checked;
      ss.disabled = !cb.checked;
      saveActiveTabState();
      if (appState.activeData) drawChart();
    });

    cp.addEventListener('input', () => {
      saveActiveTabState();
      if (appState.activeData) drawChart();
    });

    ss.addEventListener('change', () => {
      saveActiveTabState();
      if (appState.activeData) drawChart();
    });

    row.appendChild(cb);
    row.appendChild(lbl);
    row.appendChild(cp);
    row.appendChild(ss);
    listContainer.appendChild(row);
  });
}

function getDefaultColorForIdx(index) {
  const currentPalette = appState.selectedPalette || 'ggplot2';
  const pal = PALETTES[currentPalette] || PALETTES['ggplot2'];
  const colors = (pal && pal.colors) ? pal.colors : ['#3b82f6'];
  return colors[index % colors.length];
}

function getSeriesStyle(seriesName, autoColor, autoShape) {
  const manualStyleCheckbox = document.getElementById('manual-style-checkbox');
  const manualStyleEnabled = manualStyleCheckbox ? manualStyleCheckbox.checked : false;
  const tab = getActiveTab();
  const manualStyles = (tab && tab.manualStyles) ? tab.manualStyles : {};

  if (manualStyleEnabled && manualStyles[seriesName] && manualStyles[seriesName].enabled) {
    return {
      color: manualStyles[seriesName].color,
      shape: manualStyles[seriesName].shape
    };
  }
  return {
    color: autoColor,
    shape: autoShape
  };
}

// ==============================================================================
// 11. Run application
// ==============================================================================
window.onload = function() {
  try {
    init();
  } catch (err) {
    var errDiv = document.getElementById('debug-error-banner');
    if (!errDiv) {
      errDiv = document.createElement('div');
      errDiv.id = 'debug-error-banner';
      errDiv.style.position = 'fixed';
      errDiv.style.top = '0';
      errDiv.style.left = '0';
      errDiv.style.width = '100%';
      errDiv.style.background = '#ef4444';
      errDiv.style.color = '#ffffff';
      errDiv.style.padding = '12px 20px';
      errDiv.style.zIndex = '99999';
      errDiv.style.fontSize = '14px';
      errDiv.style.fontFamily = 'monospace';
      errDiv.style.boxShadow = '0 2px 10px rgba(0,0,0,0.5)';
      errDiv.style.whiteSpace = 'pre-wrap';
      document.documentElement.appendChild(errDiv);
    }
    errDiv.textContent += '\nCaught Error in init(): ' + err.message + '\nStack:\n' + err.stack + '\n';
  }
};
