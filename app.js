// ==============================================================================
//                         PLOTMASTER - APPLICATION LOGIC
// ==============================================================================

// 1. Academic & Scientific Color Palettes Definition (10 Palettes x 15 Colors)
const PALETTES = {
  nature: {
    name: 'Nature Publishing Group',
    colors: ['#203764', '#ED7D31', '#8FAADC', '#70AD47', '#1F4E79', '#A5A5A5', '#8EA9DB', '#D9E1F2', '#2F5597', '#5B9BD5', '#4472C4', '#264478', '#3C64B1', '#305496', '#8FAADC']
  },
  science: {
    name: 'Science Journal',
    colors: ['#0A2C5C', '#D1EDF2', '#325A9B', '#AB4040', '#6688C3', '#0E4D64', '#99B2DC', '#24809C', '#CCD7F0', '#5BB0C5', '#731F1F', '#98D3DF', '#D27676', '#E7A9A9', '#F6D4D4']
  },
  lancet: {
    name: 'The Lancet',
    colors: ['#C00000', '#002060', '#E06666', '#1F4E78', '#F2B2B2', '#2F5597', '#F9D9D9', '#8EA9DB', '#008000', '#7030A0', '#38761D', '#8E7CC3', '#55A630', '#C27BA0', '#80ED99']
  },
  nejm: {
    name: 'New England Journal of Medicine',
    colors: ['#1E3F66', '#A63A3A', '#2E5B88', '#C26B6B', '#528AAE', '#DFACAC', '#BCD2EE', '#F4DCDC', '#E6EEF8', '#1E6B38', '#7E1919', '#388E50', '#5EAF75', '#99D4A7', '#D1EED8']
  },
  jama: {
    name: 'JAMA (Amer. Medical Assoc.)',
    colors: ['#000000', '#D00000', '#333333', '#F0803C', '#666666', '#F4D35E', '#999999', '#3F88C5', '#CCCCCC', '#007E8A', '#1C3144', '#7209B7', '#A2A7A5', '#4CC9F0', '#335C67']
  },
  cell: {
    name: 'Cell Press',
    colors: ['#800000', '#004D40', '#B30000', '#00796B', '#E60000', '#009688', '#FF3333', '#4DB6AC', '#FF8080', '#80CBC4', '#1A237E', '#283593', '#3F51B5', '#7986CB', '#9FA8DA']
  },
  ggplot2: {
    name: 'Classic ggplot2',
    colors: ['#F8766D', '#00BFC4', '#D39200', '#619CFF', '#93AA00', '#D890F0', '#00BA38', '#FF62BC', '#E7872B', '#00B4F0', '#B79F00', '#B783FF', '#5EB300', '#00C19F', '#F375F3']
  },
  warm: {
    name: 'Warm Academic',
    colors: ['#A32D22', '#FAD291', '#D25E4B', '#8C5333', '#ECA289', '#BC8161', '#FAD6C6', '#DEC1AE', '#D96B27', '#8A1538', '#F29E53', '#C43D60', '#E2849A', '#F7D0D8', '#A36B22']
  },
  cool: {
    name: 'Cool Academic',
    colors: ['#0B4F6C', '#54C6BE', '#01BAEF', '#82D8D3', '#8A89C7', '#EBF8F7', '#B4B8C5', '#1D2D44', '#FBFBFF', '#3E5C76', '#183A37', '#748CAB', '#048A81', '#A3BCF9', '#D0DBF9']
  },
  retro: {
    name: 'Retro Academic',
    colors: ['#4E6151', '#CD3700', '#7F9F7F', '#FF4500', '#B8C7B8', '#FFA07A', '#DCE3DC', '#4A708B', '#8B5A2B', '#6CA6CD', '#CD5C5C', '#B0E2FF', '#8B2500', '#D2B48C', '#F4A460']
  }
};

// 2. Global State Management
let appState = {
  activeFile: null,
  activeFileName: '',
  sheets: {},            // Map of sheetName -> { headers: [], rows: [] }
  activeSheetName: '',
  activeData: null,      // Reference to the active sheet's { headers: [], rows: [] }
  currentChartType: 'scatter',
  selectedPalette: 'nature',
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
  DOM.ySelect = document.getElementById('y-axis-select');
  DOM.groupSelect = document.getElementById('group-select');
  DOM.mappingSection = document.getElementById('mapping-section');
  DOM.plotSection = document.getElementById('plot-section');
  DOM.chartTypeGrid = document.getElementById('chart-type-grid');
  DOM.paletteSelect = document.getElementById('palette-select');
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
}

// Render the palette choices in the sidebar dropdown
function renderPalettePicker() {
  if (!DOM.paletteSelect) return;
  DOM.paletteSelect.innerHTML = '';
  Object.keys(PALETTES).forEach(key => {
    const pal = PALETTES[key];
    const opt = document.createElement('option');
    opt.value = key;
    opt.textContent = pal.name;
    if (appState.selectedPalette === key) {
      opt.selected = true;
    }
    DOM.paletteSelect.appendChild(opt);
  });
  updatePalettePreviewBar();
}

function updatePalettePreviewBar() {
  const previewBar = document.getElementById('palette-preview-bar');
  if (!previewBar) return;
  previewBar.innerHTML = '';
  const key = appState.selectedPalette || 'nature';
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
    if (appState.activeData) drawChart();
  });

  // Controls triggers
  [DOM.xSelect, DOM.ySelect, DOM.groupSelect].forEach(select => {
    select.addEventListener('change', () => {
      if (select === DOM.groupSelect) {
        updateGroupCheckboxes();
      }
      saveActiveTabState();
      recommendStatisticalTest();
      if (appState.activeData) drawChart();
    });
  });

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
    DOM.plotWidthVal.textContent = e.target.value + '%';
    saveActiveTabState();
    if (appState.activeData) drawChart();
  });

  DOM.plotHeight.addEventListener('input', (e) => {
    DOM.plotHeightVal.textContent = e.target.value + '%';
    saveActiveTabState();
    if (appState.activeData) drawChart();
  });

  DOM.paletteSelect.addEventListener('change', (e) => {
    appState.selectedPalette = e.target.value;
    updatePalettePreviewBar();
    saveActiveTabState();
    if (appState.activeData) drawChart();
  });

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
  
  // Size mode change triggers resizing & state save
  document.getElementById('size-mode-select').addEventListener('change', () => {
    saveActiveTabState();
    applyCanvasDimensions();
    if (appState.chartInstance) appState.chartInstance.resize();
    alignSvgLayer();
  });

  // Absolute dimensions input triggers resizing & state save
  ['abs-width-input', 'abs-height-input'].forEach(id => {
    document.getElementById(id).addEventListener('input', () => {
      saveActiveTabState();
      applyCanvasDimensions();
      if (appState.chartInstance) appState.chartInstance.resize();
      alignSvgLayer();
    });
  });

  // Legend position change triggers chart redraw
  document.getElementById('legend-position-select').addEventListener('change', () => {
    saveActiveTabState();
    if (appState.activeData) drawChart();
  });

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
  DOM.themeSelect.addEventListener('change', () => { saveActiveTabState(); if (appState.activeData) drawChart(); });
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
  ['chart-title-input', 'chart-xlabel-input', 'chart-ylabel-input'].forEach(id => {
    document.getElementById(id).addEventListener('input', () => {
      saveActiveTabState();
      drawChart();
    });
  });
  
  // Stats buttons
  document.getElementById('btn-run-stats').addEventListener('click', runStatisticalTest);
  document.getElementById('btn-add-sig-bar').addEventListener('click', addSignificanceBar);
  
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
  DOM.ySelect.innerHTML = '';
  DOM.groupSelect.innerHTML = '<option value="">-- No Grouping --</option>';

  headers.forEach((h, index) => {
    const optX = document.createElement('option');
    optX.value = h;
    optX.textContent = h;
    DOM.xSelect.appendChild(optX);

    const optY = document.createElement('option');
    optY.value = h;
    optY.textContent = h;
    DOM.ySelect.appendChild(optY);

    const optG = document.createElement('option');
    optG.value = h;
    optG.textContent = h;
    DOM.groupSelect.appendChild(optG);
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

  // Sensible default selections
  if (headers.length > 0) DOM.xSelect.value = headers[0];
  if (headers.length > 1) {
    DOM.ySelect.value = headers[1];
  } else if (headers.length > 0) {
    DOM.ySelect.value = headers[0];
  }

  updateStatsFilterValues();
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

function applyCanvasDimensions() {
  const sizeModeSelect = document.getElementById('size-mode-select');
  if (!sizeModeSelect) return;
  const sizeMode = sizeModeSelect.value;
  const canvas = DOM.chartCanvas;
  const svgLayer = document.getElementById('annotation-layer');
  const absoluteInputs = document.getElementById('absolute-size-inputs');
  const wrapper = canvas.parentElement;
  
  if (sizeMode === 'absolute') {
    if (absoluteInputs) absoluteInputs.style.display = 'grid';
    const cmW = parseFloat(document.getElementById('abs-width-input').value) || 15;
    const cmH = parseFloat(document.getElementById('abs-height-input').value) || 12;
    
    const pxW = Math.round(cmW * 37.8);
    const pxH = Math.round(cmH * 37.8);
    
    canvas.style.position = 'relative';
    canvas.style.width = pxW + 'px';
    canvas.style.height = pxH + 'px';
    canvas.style.flex = 'none';
    canvas.style.margin = 'auto';
    
    svgLayer.style.position = 'absolute';
    svgLayer.style.width = pxW + 'px';
    svgLayer.style.height = pxH + 'px';
    
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
  } else {
    if (absoluteInputs) absoluteInputs.style.display = 'none';
    canvas.style.position = 'relative';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.flex = '1';
    canvas.style.margin = '0';
    
    svgLayer.style.position = 'absolute';
    svgLayer.style.width = '100%';
    svgLayer.style.height = '100%';
    svgLayer.style.left = '0px';
    svgLayer.style.top = '0px';
    
    if (wrapper) {
      wrapper.style.display = 'flex';
      wrapper.style.alignItems = '';
      wrapper.style.justifyContent = '';
      wrapper.style.overflow = '';
    }
  }
}

function alignSvgLayer() {
  const sizeModeSelect = document.getElementById('size-mode-select');
  if (sizeModeSelect && sizeModeSelect.value === 'absolute') {
    const canvas = DOM.chartCanvas;
    const svgLayer = document.getElementById('annotation-layer');
    if (canvas && svgLayer) {
      svgLayer.style.left = canvas.offsetLeft + 'px';
      svgLayer.style.top = canvas.offsetTop + 'px';
    }
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
  const selectedYOptions = Array.from(DOM.ySelect.selectedOptions);
  const yCols = selectedYOptions.map(opt => opt.value);
  
  if (yCols.length === 0) return;

  const gCol = DOM.groupSelect.value;

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
  let axisLineStyle = { lineStyle: { color: '#64748b' } };
  let backgroundColor = '#ffffff';

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

  const plotWidth = DOM.plotWidth ? parseInt(DOM.plotWidth.value) : 75;
  const plotHeight = DOM.plotHeight ? parseInt(DOM.plotHeight.value) : 65;

  const legendData = [];
  const legendPos = document.getElementById('legend-position-select').value;
  let legendConfig = {
    show: legendPos !== 'hide',
    textStyle: textStyle
  };
  if (legendPos === 'bottom') {
    legendConfig.bottom = 10;
    legendConfig.left = 'center';
    legendConfig.orient = 'horizontal';
  } else if (legendPos === 'top') {
    legendConfig.top = 10;
    legendConfig.left = 'center';
    legendConfig.orient = 'horizontal';
  } else if (legendPos === 'left') {
    legendConfig.left = 10;
    legendConfig.top = 'center';
    legendConfig.orient = 'vertical';
  } else if (legendPos === 'right') {
    legendConfig.right = 10;
    legendConfig.top = 'center';
    legendConfig.orient = 'vertical';
  }

  // Common ECharts Option templates
  let option = {
    backgroundColor: backgroundColor,
    color: paletteColors,
    tooltip: { trigger: 'axis' },
    legend: legendConfig,
    grid: {
      left: 'center',
      top: 'center',
      width: plotWidth + '%',
      height: plotHeight + '%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      name: chartXLabel || xCol,
      nameLocation: 'middle',
      nameGap: 30,
      axisLabel: textStyle,
      nameTextStyle: { ...textStyle, fontWeight: 'bold' },
      axisLine: axisLineStyle,
      axisTick: axisLineStyle,
      splitLine: {
        show: DOM.gridX.checked,
        lineStyle: gridLineStyle.lineStyle
      }
    },
    yAxis: {
      type: 'value',
      name: chartYLabel || yCols.join(' / '),
      nameLocation: 'middle',
      nameGap: 45,
      axisLabel: textStyle,
      nameTextStyle: { ...textStyle, fontWeight: 'bold' },
      axisLine: axisLineStyle,
      axisTick: axisLineStyle,
      splitLine: {
        show: DOM.gridY.checked,
        lineStyle: gridLineStyle.lineStyle
      }
    },
    series: []
  };

  if (chartTitle) {
    option.title = {
      text: chartTitle,
      left: 'center',
      top: 15,
      textStyle: { ...textStyle, fontSize: 16, fontWeight: 'bold' }
    };
  }

  // Get active configurations
  const pointSize = parseInt(DOM.pointSize.value);
  const lineWidth = parseInt(DOM.lineWidth.value);
  const barPadding = parseInt(DOM.barPadding.value);
  const boxWidthPercent = parseInt(DOM.boxWidth.value);
  
  // Group selection checklist filtering
  const rows = getFilteredRows();
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

  const type = appState.currentChartType;
  const errorBarType = document.getElementById('error-bar-select').value;

  // Box / Violin options panel visibility
  const boxViolinOptions = document.getElementById('box-violin-options');
  if (type === 'box' || type === 'violin') {
    boxViolinOptions.style.display = 'block';
  } else {
    boxViolinOptions.style.display = 'none';
  }

  if (type === 'scatter') {
    // Scatter Plot mapping
    yCols.forEach((yCol, yIdx) => {
      groups.forEach((g, gIdx) => {
        const seriesName = gCol ? `${yCol} (${g})` : yCol;
        const color = paletteColors[(yIdx + gIdx * yCols.length) % paletteColors.length];
        
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
        option.series.push({
          name: seriesName,
          type: 'scatter',
          symbolSize: pointSize,
          opacity: 0.8,
          itemStyle: { color: color },
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
            data: errorData,
            itemStyle: { color: color },
            z: 5,
            tooltip: { show: false }
          });
        }
      });
    });

  } else if (type === 'line') {
    // Line Plot mapping (shows means connected by lines + error bars)
    yCols.forEach((yCol, yIdx) => {
      groups.forEach((g, gIdx) => {
        const seriesName = gCol ? `${yCol} (${g})` : yCol;
        const color = paletteColors[(yIdx + gIdx * yCols.length) % paletteColors.length];
        
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
              option.series.push({
                name: seriesName, // same name for unified legend toggle
                type: 'line',
                lineStyle: { width: Math.max(1, lineWidth - 1), opacity: 0.6 },
                symbol: 'circle',
                symbolSize: Math.max(3, pointSize - 2),
                itemStyle: { color: color },
                data: curveData
              });
            }
          }
        } else {
          option.series.push({
            name: seriesName,
            type: 'line',
            lineStyle: { width: lineWidth },
            symbol: 'circle',
            symbolSize: pointSize,
            itemStyle: { color: color },
            data: lineData
          });

          if (errorBarType !== 'none' && errorData.length > 0) {
            option.series.push({
              name: `${seriesName} Error`,
              type: 'custom',
              renderItem: renderErrorBarItem,
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

          option.series.push({
            name: `${seriesName} (Scatter)`,
            type: 'scatter',
            symbolSize: Math.max(4, pointSize - 2),
            itemStyle: { color: color, opacity: 0.7 },
            data: scatterData,
            z: 6,
            tooltip: { show: false }
          });
        }
      });
    });

  } else if (type === 'bar') {
    // Bar Plot mapping
    const xCategories = [...new Set(plotRows.map(r => String(r[xCol])))];
    option.xAxis.data = xCategories;

    yCols.forEach((yCol, yIdx) => {
      groups.forEach((g, gIdx) => {
        const seriesName = gCol ? `${yCol} (${g})` : yCol;
        const color = paletteColors[(yIdx + gIdx * yCols.length) % paletteColors.length];
        
        legendData.push(seriesName);
        const showPoints = document.getElementById('show-points-checkbox').checked;
        const barData = [];
        const errorData = [];
        const scatterData = [];
        
        xCategories.forEach((cat, catIdx) => {
          const matchRows = plotRows.filter(r => String(r[xCol]) === cat && (!gCol || String(r[gCol]) === g));
          const vals = matchRows.map(r => Number(r[yCol])).filter(v => !isNaN(v) && v !== null);
          const stats = getErrorBarStats(vals, errorBarType);
          
          barData.push(parseFloat(stats.mean.toFixed(4)));
          
          const totalSeriesCount = yCols.length * groups.length;
          const currentSeriesIndex = yIdx + gIdx * yCols.length;
          let center = catIdx;
          if (totalSeriesCount > 1) {
            const barWidthOffset = 0.65 / totalSeriesCount;
            center = catIdx + (currentSeriesIndex - (totalSeriesCount - 1) / 2) * barWidthOffset;
          }

          if (errorBarType !== 'none' && vals.length > 0) {
            errorData.push([center, parseFloat(stats.high.toFixed(4)), parseFloat(stats.low.toFixed(4))]);
          }

          if (showPoints) {
            vals.forEach(v => {
              const jitter = (Math.random() - 0.5) * 0.08;
              scatterData.push([center + jitter, v]);
            });
          }
        });

        option.series.push({
          name: seriesName,
          type: 'bar',
          barGap: `${barPadding}%`,
          itemStyle: { color: color },
          data: barData
        });

        if (errorBarType !== 'none' && errorData.length > 0) {
          option.series.push({
            name: `${seriesName} Error`,
            type: 'custom',
            renderItem: renderErrorBarItem,
            data: errorData,
            itemStyle: { color: color },
            z: 5,
            tooltip: { show: false }
          });
        }

        if (showPoints && scatterData.length > 0) {
          option.series.push({
            name: `${seriesName} (Scatter)`,
            type: 'scatter',
            symbolSize: Math.max(4, pointSize - 2),
            itemStyle: { color: color, opacity: 0.65, borderColor: '#ffffff', borderWidth: 0.5 },
            data: scatterData,
            z: 6,
            tooltip: { show: false }
          });
        }
      });
    });

  } else if (type === 'box') {
    // Boxplot calculations
    const xCategories = [...new Set(plotRows.map(r => String(r[xCol])))];
    option.xAxis.data = xCategories;
    
    yCols.forEach((yCol, yIdx) => {
      groups.forEach((g, gIdx) => {
        const seriesName = gCol ? `${yCol} (${g})` : yCol;
        const color = paletteColors[(yIdx + gIdx * yCols.length) % paletteColors.length];
        
        // Calculate box stats per category
        const boxData = xCategories.map(cat => {
          const vals = plotRows
            .filter(r => String(r[xCol]) === cat && (!gCol || String(r[gCol]) === g))
            .map(r => Number(r[yCol]))
            .filter(v => !isNaN(v));
          return calculateBoxplotStats(vals);
        });

        legendData.push(seriesName);
        option.series.push({
          name: seriesName,
          type: 'boxplot',
          boxWidth: `${boxWidthPercent}%`,
          itemStyle: { borderColor: color, color: hexToRgba(color, 0.4) },
          data: boxData
        });
      });
    });

    // Box Overlay (Jitter Points & Mean markers)
    const showPoints = document.getElementById('show-points-checkbox').checked;
    const showMean = document.getElementById('show-mean-checkbox').checked;
    
    if (showPoints || showMean) {
      yCols.forEach((yCol, yIdx) => {
        groups.forEach((g, gIdx) => {
          const seriesName = gCol ? `${yCol} (${g})` : yCol;
          const color = paletteColors[(yIdx + gIdx * yCols.length) % paletteColors.length];
          
          const jitterData = [];
          const meanData = [];
          
          xCategories.forEach((cat, catIdx) => {
            const vals = plotRows
              .filter(r => String(r[xCol]) === cat && (!gCol || String(r[gCol]) === g))
              .map(r => Number(r[yCol]))
              .filter(v => !isNaN(v) && v !== null);
              
            if (vals.length === 0) return;
            
            const totalSeriesCount = yCols.length * groups.length;
            const currentSeriesIndex = yIdx + gIdx * yCols.length;
            let center = catIdx;
            if (totalSeriesCount > 1) {
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
            option.series.push({
              name: `${seriesName} (Scatter)`,
              type: 'scatter',
              symbolSize: Math.max(4, pointSize - 2),
              itemStyle: { color: color, opacity: 0.5 },
              data: jitterData,
              tooltip: { show: false }
            });
          }
          
          if (showMean && meanData.length > 0) {
            option.series.push({
              name: `${seriesName} (Mean)`,
              type: 'scatter',
              symbol: 'diamond',
              symbolSize: pointSize + 3,
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
    }

  } else if (type === 'violin') {
    const xCategories = [...new Set(plotRows.map(r => String(r[xCol])))];
    option.xAxis.data = xCategories;
    
    yCols.forEach((yCol, yIdx) => {
      groups.forEach((g, gIdx) => {
        const seriesName = gCol ? `${yCol} (${g})` : yCol;
        const color = paletteColors[(yIdx + gIdx * yCols.length) % paletteColors.length];
        
        legendData.push(seriesName);
        xCategories.forEach((cat, catIdx) => {
          const vals = plotRows
            .filter(r => String(r[xCol]) === cat && (!gCol || String(r[gCol]) === g))
            .map(r => Number(r[yCol]))
            .filter(v => !isNaN(v));

          if (vals.length < 2) return; // Need at least 2 points for density (lowered from 3)

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
          const scale = 0.4 / Math.max(1, yCols.length * groups.length); // auto scale spacing

          const totalSeriesCount = yCols.length * groups.length;
          const currentSeriesIndex = yIdx + gIdx * yCols.length;
          let center = catIdx;
          if (totalSeriesCount > 1) {
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

    // Violin Overlay (Jitter Points & Mean markers)
    const showPoints = document.getElementById('show-points-checkbox').checked;
    const showMean = document.getElementById('show-mean-checkbox').checked;
    
    if (showPoints || showMean) {
      yCols.forEach((yCol, yIdx) => {
        groups.forEach((g, gIdx) => {
          const seriesName = gCol ? `${yCol} (${g})` : yCol;
          const color = paletteColors[(yIdx + gIdx * yCols.length) % paletteColors.length];
          
          const jitterData = [];
          const meanData = [];
          
          xCategories.forEach((cat, catIdx) => {
            const vals = plotRows
              .filter(r => String(r[xCol]) === cat && (!gCol || String(r[gCol]) === g))
              .map(r => Number(r[yCol]))
              .filter(v => !isNaN(v) && v !== null);
              
            if (vals.length === 0) return;
            
            const totalSeriesCount = yCols.length * groups.length;
            const currentSeriesIndex = yIdx + gIdx * yCols.length;
            let center = catIdx;
            if (totalSeriesCount > 1) {
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
            option.series.push({
              name: `${seriesName} (Scatter)`,
              type: 'scatter',
              symbolSize: Math.max(4, pointSize - 2),
              itemStyle: { color: color, opacity: 0.5 },
              data: jitterData,
              tooltip: { show: false }
            });
          }
          
          if (showMean && meanData.length > 0) {
            option.series.push({
              name: `${seriesName} (Mean)`,
              type: 'scatter',
              symbol: 'diamond',
              symbolSize: pointSize + 3,
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
    yCols.forEach((yCol, yIdx) => {
      groups.forEach((g, gIdx) => {
        const seriesName = gCol ? `${yCol} (${g})` : yCol;
        const color = paletteColors[(yIdx + gIdx * yCols.length) % paletteColors.length];
        
        const seriesData = plotRows
          .filter(r => !gCol || String(r[gCol]) === g)
          .map(r => [r[xCol], r[yCol]])
          .filter(pt => pt[0] !== null && pt[1] !== null);

        option.xAxis.type = isNumeric(seriesData.map(d => d[0])) ? 'value' : 'category';

        if (option.xAxis.type === 'value') {
          seriesData.sort((a, b) => a[0] - b[0]);
        }

        legendData.push(seriesName);
        option.series.push({
          name: seriesName,
          type: 'line',
          lineStyle: { width: lineWidth },
          symbol: 'circle',
          symbolSize: pointSize,
          itemStyle: { color: color },
          areaStyle: { opacity: 0.35, color: hexToRgba(color, 0.3) },
          data: seriesData
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
      const item = {
        name: ml.label || '',
        lineStyle: {
          color: ml.color,
          type: ml.style,
          width: ml.width
        },
        label: {
          show: true,
          position: isY ? 'end' : 'start',
          formatter: ml.label ? `${ml.label}: {c}` : '{c}'
        },
        symbol: ['none', symbolType]
      };
      
      if (isY) {
        item.yAxis = ml.value;
      } else {
        item.xAxis = ml.value;
      }
      
      markLineData.push(item);
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
  
  var style = api.style({
    stroke: api.visual('color') || '#000000',
    fill: 'none',
    lineWidth: 1.5
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
    chartType: appState.currentChartType || 'scatter',
    xCol: DOM.xSelect.value || '',
    yCols: Array.from(DOM.ySelect.selectedOptions).map(o => o.value) || [],
    gCol: DOM.groupSelect.value || '',
    selectedPalette: appState.selectedPalette || 'nature',
    
    // Style settings
    pointSize: parseInt(DOM.pointSize.value) || 8,
    lineWidth: parseInt(DOM.lineWidth.value) || 2,
    barPadding: parseInt(DOM.barPadding.value) || 20,
    boxWidth: parseInt(DOM.boxWidth.value) || 50,
    plotWidth: parseInt(DOM.plotWidth.value) || 75,
    plotHeight: parseInt(DOM.plotHeight.value) || 65,
    showPoints: document.getElementById('show-points-checkbox').checked,
    showMean: document.getElementById('show-mean-checkbox').checked,
    errorBarType: document.getElementById('error-bar-select').value || 'none',
    font: DOM.fontSelect.value || 'Inter',
    theme: DOM.themeSelect.value || 'minimal',
    gridX: DOM.gridX.checked,
    gridY: DOM.gridY.checked,
    
    // Size and legend settings
    legendPosition: document.getElementById('legend-position-select').value || 'bottom',
    sizeMode: document.getElementById('size-mode-select').value || 'responsive',
    absWidth: parseFloat(document.getElementById('abs-width-input').value) || 15,
    absHeight: parseFloat(document.getElementById('abs-height-input').value) || 12,
    individualCurves: document.getElementById('individual-curves-checkbox').checked,
    markingLines: [],
    
    // Filter settings
    activeGroups: [], // empty means all
    splitGroups: false,
    
    // Text titles
    chartTitle: '',
    chartXLabel: '',
    chartYLabel: '',
    
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
  tab.yCols = Array.from(DOM.ySelect.selectedOptions).map(o => o.value);
  tab.gCol = DOM.groupSelect.value;
  tab.selectedPalette = appState.selectedPalette;
  
  // Style settings
  tab.pointSize = parseInt(DOM.pointSize.value);
  tab.lineWidth = parseInt(DOM.lineWidth.value);
  tab.barPadding = parseInt(DOM.barPadding.value);
  tab.boxWidth = parseInt(DOM.boxWidth.value);
  tab.plotWidth = parseInt(DOM.plotWidth.value);
  tab.plotHeight = parseInt(DOM.plotHeight.value);
  tab.showPoints = document.getElementById('show-points-checkbox').checked;
  tab.showMean = document.getElementById('show-mean-checkbox').checked;
  tab.errorBarType = document.getElementById('error-bar-select').value;
  tab.font = DOM.fontSelect.value;
  tab.theme = DOM.themeSelect.value;
  tab.gridX = DOM.gridX.checked;
  tab.gridY = DOM.gridY.checked;
  
  // Size and legend settings
  tab.legendPosition = document.getElementById('legend-position-select').value;
  tab.sizeMode = document.getElementById('size-mode-select').value;
  tab.absWidth = parseFloat(document.getElementById('abs-width-input').value) || 15;
  tab.absHeight = parseFloat(document.getElementById('abs-height-input').value) || 12;
  tab.individualCurves = document.getElementById('individual-curves-checkbox').checked;
  if (!tab.markingLines) tab.markingLines = [];
  
  // Group selection
  const checkboxes = document.querySelectorAll('.group-filter-checkbox');
  if (checkboxes.length > 0) {
    tab.activeGroups = Array.from(checkboxes).filter(cb => cb.checked).map(cb => cb.value);
  } else {
    tab.activeGroups = [];
  }
  tab.splitGroups = document.getElementById('group-tabs-checkbox').checked;
  
  // Quick Title Editor
  tab.chartTitle = document.getElementById('chart-title-input').value;
  tab.chartXLabel = document.getElementById('chart-xlabel-input').value;
  tab.chartYLabel = document.getElementById('chart-ylabel-input').value;
  
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
  
  if (tab.yCols && tab.yCols.length > 0) {
    Array.from(DOM.ySelect.options).forEach(opt => {
      opt.selected = tab.yCols.includes(opt.value);
    });
  }
  
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
  
  // Restore style settings
  DOM.pointSize.value = tab.pointSize;
  DOM.pointSizeVal.textContent = tab.pointSize;
  
  DOM.lineWidth.value = tab.lineWidth;
  DOM.lineWidthVal.textContent = tab.lineWidth;
  
  DOM.barPadding.value = tab.barPadding;
  DOM.barPaddingVal.textContent = tab.barPadding + '%';
  
  DOM.boxWidth.value = tab.boxWidth;
  DOM.boxWidthVal.textContent = tab.boxWidth + '%';

  if (tab.plotWidth) {
    DOM.plotWidth.value = tab.plotWidth;
    DOM.plotWidthVal.textContent = tab.plotWidth + '%';
  }
  if (tab.plotHeight) {
    DOM.plotHeight.value = tab.plotHeight;
    DOM.plotHeightVal.textContent = tab.plotHeight + '%';
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
  
  // Restore size and legend settings
  document.getElementById('legend-position-select').value = tab.legendPosition || 'bottom';
  document.getElementById('size-mode-select').value = tab.sizeMode || 'responsive';
  document.getElementById('abs-width-input').value = tab.absWidth || 15;
  document.getElementById('abs-height-input').value = tab.absHeight || 12;
  document.getElementById('individual-curves-checkbox').checked = !!tab.individualCurves;
  
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
  
  // Group selection checkboxes
  updateGroupCheckboxes(tab.activeGroups, tab.splitGroups);
  
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

function updateGroupCheckboxes(activeGroups = [], splitChecked = false) {
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
  allInput.checked = activeGroups.length === 0 || activeGroups.length === uniqueGroups.length;
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
    cb.checked = activeGroups.length === 0 || activeGroups.length === uniqueGroups.length || activeGroups.includes(g);
    
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

function runStatisticalTest() {
  const xCol = DOM.xSelect.value;
  const yCols = Array.from(DOM.ySelect.selectedOptions).map(o => o.value);
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

function getPValueSymbol(p) {
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
  
  const tab = getActiveTab();
  if (!tab) return;
  
  const xCol = DOM.xSelect.value;
  const yCols = Array.from(DOM.ySelect.selectedOptions).map(o => o.value);
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
      
      callback(canvas);
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

// SVG vector export (merges annotations overlay)
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
  const selectedYOptions = Array.from(DOM.ySelect.selectedOptions);
  const yCols = selectedYOptions.map(opt => opt.value);

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
  const selectedYOptions = Array.from(DOM.ySelect.selectedOptions);
  const yCols = selectedYOptions.map(opt => opt.value);

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
