import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, Trash2, Download, RotateCcw, 
  HelpCircle, Grid, Info, Sparkles, Inbox, 
  Hash, Columns, Wrench, Maximize, FileText, CheckCircle,
  ZoomIn, ZoomOut, Move, Gamepad2, Headphones, Zap, Keyboard, HelpCircle as HookIcon
} from 'lucide-react';
import { BOARD_TYPES, ACCESSORY_CATEGORIES, ACCESSORIES } from './constants';

const getClearanceMm = (item) => {
  let below = (item.occupantBelowRows || 0) * 20;
  let above = (item.occupantAboveRows || 0) * 20;
  let side = (item.occupantSideCols || 0) * 40;

  // Refined precise millimeter clearances (non-grid aligned) for specific visual types
  if (item.id.startsWith('print-controller')) {
    below = 30;
    above = 20;
    side = 36; // Xbox/PS5 controller width is 152mm. Mount is 80mm. Extra is 72mm -> 36mm on each side.
  } else if (item.id.startsWith('print-steam-controller')) {
    below = 50;
    above = 20;
    side = 39.5; // Steam controller width is 159mm. Mount is 80mm. Extra is 79mm -> 39.5mm on each side.
  } else if (item.id.startsWith('print-headphones')) {
    below = 150;
    above = 10;
    side = 60; // Headset width is 160mm. Hanger is 40mm. Extra is 120mm -> 60mm on each side.
  } else if (item.id.startsWith('print-keyboard')) {
    below = 10;
    above = 90;
    side = 100; // TKL keyboard is 320mm. Mount is 120mm. Extra is 200mm -> 100mm on each side.
  } else if (item.id.startsWith('print-appletv')) {
    below = 0;
    above = 0;
    side = -13.5; // Apple TV is 93mm. Mount is 120mm. (120-93)/2 = 13.5mm inset.
  } else if (item.id.startsWith('print-eero')) {
    below = 0;
    above = 0;
    side = -10.5; // Eero 6 is 99mm. Mount is 120mm. (120-99)/2 = 10.5mm inset.
  } else if (item.id.startsWith('print-steamdeck-dock')) {
    below = 10;
    above = 70; // Steam Deck is 117mm high. Screen extends 70mm above cradle.
    side = 89; // Steam Deck is 298mm wide. Mount is 120mm. (298-120)/2 = 89mm on each side.
  }

  return { below, above, side };
};

export default function App() {
  const [selectedBoard, setSelectedBoard] = useState(BOARD_TYPES[1]); // Default to IKEA Medium
  const [boardCols, setBoardCols] = useState(1);
  const [boardRows, setBoardRows] = useState(1);
  const [placedItems, setPlacedItems] = useState([]);
  
  // Drag and drop states
  const [draggedType, setDraggedType] = useState(null);       
  const [draggedPlacedId, setDraggedPlacedId] = useState(null); 
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 }); 

  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showGridGuide, setShowGridGuide] = useState(true);
  
  // Interactive zoom & pan
  const [scale, setScale] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isPanning, setIsPanning] = useState(false);
  const [startPanX, setStartPanX] = useState(0);
  const [startPanY, setStartPanY] = useState(0);

  const [showHelp, setShowHelp] = useState(false);
  const [isCollisionWarning, setIsCollisionWarning] = useState(false);
  const [showDepthMap, setShowDepthMap] = useState(false);
  const [activeTab, setActiveTab] = useState('checklist');
  const [showOccupantClearance, setShowOccupantClearance] = useState(true);

  // Custom Form state
  const [customWidth, setCustomWidth] = useState(3);
  const [customHeight, setCustomHeight] = useState(3);
  const [customColor, setCustomColor] = useState('#64748b'); // Sleek slate gray default
  const [customName, setCustomName] = useState('Custom Box');

  const boardRef = useRef(null);
  const canvasContainerRef = useRef(null);

  const totalCols = selectedBoard.columns * boardCols;
  const totalRows = selectedBoard.rows * boardRows;

  // Setup auto-scale to fit
  useEffect(() => {
    if (boardRef.current && canvasContainerRef.current) {
      const boardWidth = totalCols * 40; 
      const containerWidth = canvasContainerRef.current.clientWidth - 48;
      const calcScale = Math.min(containerWidth / boardWidth, 1.1);
      setScale(calcScale);
      setPanX(0);
      setPanY(0);
    }
  }, [selectedBoard, boardCols, boardRows]);

  // Scroll wheel zoom handler
  useEffect(() => {
    const container = canvasContainerRef.current;
    if (!container) return;

    const handleWheel = (e) => {
      e.preventDefault();
      const zoomFactor = 0.08;
      const direction = e.deltaY < 0 ? 1 : -1;
      setScale(prev => Math.max(0.3, Math.min(2.5, prev + direction * zoomFactor)));
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, []);

  // Viewport Panning
  const handleMouseDown = (e) => {
    if (e.target.closest('.accessory-item') || e.target.closest('button') || e.target.closest('select') || e.target.closest('input')) return;
    setIsPanning(true);
    setStartPanX(e.clientX - panX);
    setStartPanY(e.clientY - panY);
  };

  const handleMouseMove = (e) => {
    if (!isPanning) return;
    setPanX(e.clientX - startPanX);
    setPanY(e.clientY - startPanY);
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleZoom = (factor) => {
    setScale(prev => Math.max(0.3, Math.min(2.5, prev + factor)));
  };

  const resetZoomPan = () => {
    if (boardRef.current && canvasContainerRef.current) {
      const boardWidth = totalCols * 40; 
      const containerWidth = canvasContainerRef.current.clientWidth - 48;
      setScale(Math.min(containerWidth / boardWidth, 1.1));
      setPanX(0);
      setPanY(0);
    }
  };

  // Drag and Drop (Library)
  const handleLibraryDragStart = (e, accessory) => {
    setDraggedType(accessory);
    setDraggedPlacedId(null);
    e.dataTransfer.setData('text/plain', JSON.stringify(accessory));
    e.dataTransfer.effectAllowed = 'copy';
  };

  // Drag and Drop (Rearranging Placed Items)
  const handlePlacedDragStart = (e, placedItem) => {
    setDraggedPlacedId(placedItem.id);
    setDraggedType(placedItem); 

    const rect = e.currentTarget.getBoundingClientRect();
    const offsetX = (e.clientX - rect.left) / scale;
    const offsetY = (e.clientY - rect.top) / scale;
    setDragOffset({ x: offsetX, y: offsetY });

    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (!draggedType) return;

    const rect = boardRef.current.getBoundingClientRect();
    let xPx = e.clientX - rect.left;
    let yPx = e.clientY - rect.top;

    if (draggedPlacedId) {
      xPx = xPx - (dragOffset.x * scale);
      yPx = yPx - (dragOffset.y * scale);
    }

    const gridX = Math.round(xPx / (40 * scale));
    const gridY = Math.round(yPx / (20 * scale));

    if (draggedPlacedId) {
      rearrangeItem(draggedPlacedId, gridX, gridY);
    } else {
      placeItem(draggedType, gridX, gridY);
    }
  };

  const placeItem = (itemTemplate, col, row) => {
    const rightBoundary = col + itemTemplate.colsOccupied;
    const bottomBoundary = row + itemTemplate.rowsOccupied;

    if (col < 0 || row < 0 || rightBoundary > totalCols || bottomBoundary > totalRows) {
      setIsCollisionWarning(true);
      setTimeout(() => setIsCollisionWarning(false), 2000);
      return; 
    }

    const newItem = {
      ...itemTemplate,
      id: `${itemTemplate.id}-${Date.now()}`,
      gridX: col,
      gridY: row
    };

    setPlacedItems(prev => {
      const collides = prev.some(existing => 
        newItem.gridX < existing.gridX + existing.colsOccupied &&
        newItem.gridX + newItem.colsOccupied > existing.gridX &&
        newItem.gridY < existing.gridY + existing.rowsOccupied &&
        newItem.gridY + newItem.rowsOccupied > existing.gridY
      );

      if (collides) {
        setIsCollisionWarning(true);
        setTimeout(() => setIsCollisionWarning(false), 2000);
      }

      return collides ? prev : [...prev, newItem];
    });
    setDraggedType(null);
  };

  const rearrangeItem = (itemId, col, row) => {
    const itemTemplate = placedItems.find(i => i.id === itemId);
    if (!itemTemplate) return;

    const rightBoundary = col + itemTemplate.colsOccupied;
    const bottomBoundary = row + itemTemplate.rowsOccupied;

    if (col < 0 || row < 0 || rightBoundary > totalCols || bottomBoundary > totalRows) {
      setIsCollisionWarning(true);
      setTimeout(() => setIsCollisionWarning(false), 2000);
      return; 
    }

    setPlacedItems(prev => {
      const otherItems = prev.filter(i => i.id !== itemId);
      const collides = otherItems.some(existing => 
        col < existing.gridX + existing.colsOccupied &&
        col + itemTemplate.colsOccupied > existing.gridX &&
        row < existing.gridY + existing.rowsOccupied &&
        row + itemTemplate.rowsOccupied > existing.gridY
      );

      if (collides) {
        setIsCollisionWarning(true);
        setTimeout(() => setIsCollisionWarning(false), 2000);
        return prev; 
      }

      return prev.map(item => item.id === itemId ? { ...item, gridX: col, gridY: row } : item);
    });

    setDraggedType(null);
    setDraggedPlacedId(null);
  };

  const removeItem = (itemId) => {
    setPlacedItems(prev => prev.filter(i => i.id !== itemId));
  };

  const clearBoard = () => {
    if (window.confirm("Are you sure you want to clear the entire layout?")) {
      setPlacedItems([]);
    }
  };

  const handleCreateCustom = () => {
    const customAccessory = {
      id: `custom-${Date.now()}`,
      name: customName || 'Custom Box',
      category: 'custom',
      widthMm: customWidth * 20,
      heightMm: customHeight * 20,
      depthMm: 50,
      colsOccupied: parseInt(customWidth),
      rowsOccupied: parseInt(customHeight),
      color: customColor,
      description: 'User created parametric container.',
      visualType: 'blueprint-item'
    };
    placeItem(customAccessory, 0, 0);
  };

  const getShoppingList = () => {
    const listMap = {};
    placedItems.forEach(item => {
      const templateId = item.id.split('-')[0] + (item.id.split('-')[1] ? '-' + item.id.split('-')[1] : '');
      const key = item.sku || templateId || 'custom-3d-print';
      if (!listMap[key]) {
        listMap[key] = {
          key: key,
          name: item.name,
          sku: item.sku || 'Needs 3D Printing',
          count: 0,
          color: item.color,
          isCustom: !item.sku
        };
      }
      listMap[key].count += 1;
    });
    return Object.values(listMap);
  };

  const handleExport = () => {
    const dataStr = JSON.stringify({
      board: selectedBoard.id,
      boardCols,
      boardRows,
      items: placedItems.map(({ id, name, category, colsOccupied, rowsOccupied, color, gridX, gridY, sku }) => ({
        name, category, colsOccupied, rowsOccupied, color, gridX, gridY, sku
      }))
    }, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', 'skadis-layout-grid.json');
    linkElement.click();
  };

  // Render individual tiled boards side-by-side
  const renderBoardGrid = () => {
    const boardPanels = [];
    for (let r = 0; r < boardRows; r++) {
      for (let c = 0; c < boardCols; c++) {
        const boardWidth = selectedBoard.columns * 40;
        const boardHeight = selectedBoard.rows * 20;

        boardPanels.push(
          <div 
            key={`board-tile-${r}-${c}`}
            className="absolute rounded-xl border border-slate-700/60 shadow-lg pointer-events-none"
            style={{
              left: `${c * boardWidth}px`,
              top: `${r * boardHeight}px`,
              width: `${boardWidth}px`,
              height: `${boardHeight}px`,
              backgroundColor: 'var(--color-pegboard-bg)',
              backgroundImage: showGridGuide 
                ? 'linear-gradient(rgba(20, 184, 166, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(20, 184, 166, 0.1) 1px, transparent 1px)' 
                : 'none',
              backgroundSize: '40px 20px'
            }}
          >
            {(boardCols > 1 || boardRows > 1) && (
              <span className="absolute top-2 left-3 text-[9px] bg-slate-950/60 text-slate-400 px-2 py-0.5 rounded border border-slate-800">
                Board {r * boardCols + c + 1} ({selectedBoard.widthMm}x{selectedBoard.heightMm}mm)
              </span>
            )}
            
            {renderHolesForTile()}
          </div>
        );
      }
    }
    return boardPanels;
  };

  const renderHolesForTile = () => {
    const holes = [];
    for (let r = 0; r < selectedBoard.rows; r++) {
      const isStaggeredRow = r % 2 === 1;
      const colsInRow = isStaggeredRow ? selectedBoard.columns - 1 : selectedBoard.columns;
      
      for (let c = 0; c < colsInRow; c++) {
        const leftOffset = isStaggeredRow ? (c * 40) + 20 : c * 40;
        const topOffset = r * 20;

        holes.push(
          <div 
            key={`hole-${r}-${c}`}
            className="absolute rounded-full"
            style={{
              left: `${leftOffset + 17.5}px`, 
              top: `${topOffset + 4.5}px`,
              width: '5px',
              height: '11px',
              backgroundColor: 'var(--color-pegboard-hole)',
              boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.8), 0 1px 0 rgba(255,255,255,0.05)'
            }}
          />
        );
      }
    }
    return holes;
  };

  const getCategoryIcon = (catId) => {
    switch (catId) {
      case 'bins': return <Inbox size={14} />;
      case 'hooks': return <Hash size={14} />;
      case 'shelves': return <Columns size={14} />;
      case 'holders': return <Wrench size={14} />;
      default: return <Maximize size={14} />;
    }
  };

  // Architectural technical blueprint visual line-art styles
  const renderAccessoryVisual = (item) => {
    const iconClass = "text-teal-400/90 stroke-[1.5] w-7 h-7";

    switch (item.visualType) {
      case 'controller':
        return (
          <div className="flex-grow flex flex-col items-center justify-center relative mt-1 border-t border-teal-500/10 pt-1.5">
            <Gamepad2 className={iconClass} />
            <span className="text-[7.5px] text-teal-400/50 uppercase tracking-widest mt-1">Controller</span>
          </div>
        );
      case 'headphones':
        return (
          <div className="flex-grow flex flex-col items-center justify-center relative mt-1 border-t border-teal-500/10 pt-1.5">
            <Headphones className={iconClass} />
            <span className="text-[7.5px] text-teal-400/50 uppercase tracking-widest mt-1">Headset</span>
          </div>
        );
      case 'powerstrip':
        return (
          <div className="flex-grow flex flex-col items-center justify-center relative mt-1 border-t border-teal-500/10 pt-1.5">
            <Zap className={iconClass} />
            <span className="text-[7.5px] text-teal-400/50 uppercase tracking-widest mt-1">Power strip</span>
          </div>
        );
      case 'keyboard':
        return (
          <div className="flex-grow flex flex-col items-center justify-center relative mt-1 border-t border-teal-500/10 pt-1.5">
            <Keyboard className={iconClass} />
            <span className="text-[7.5px] text-teal-400/50 uppercase tracking-widest mt-1">Keyboard</span>
          </div>
        );
      case 'bin-small':
      case 'bin-medium':
      case 'tray':
        return (
          <div className="flex-grow flex flex-col justify-between border-t border-teal-500/10 mt-1 p-1">
            <div className="flex-grow bg-teal-950/20 rounded border border-dashed border-teal-500/20 flex flex-col items-center justify-center">
              <Inbox className="text-teal-500/60 w-5 h-5 stroke-[1.5]" />
              <span className="text-[7px] text-teal-500/40 uppercase tracking-wider mt-0.5">Bin Chamber</span>
            </div>
          </div>
        );
      case 'hook-short':
      case 'hook-long':
      case 'hook-double':
        return (
          <div className="flex-grow flex flex-col items-center justify-center relative mt-1 border-t border-teal-500/10 pt-1.5">
            <Hash className={iconClass} />
            <span className="text-[7.5px] text-teal-400/50 uppercase tracking-widest mt-1">Hook Prong</span>
          </div>
        );
      case 'shelf':
        return (
          <div className="flex-grow flex flex-col justify-end border-t border-teal-500/10 mt-1">
            <div className="h-4 bg-teal-950/40 border border-teal-500/20 rounded flex items-center justify-center">
              <span className="text-[7px] text-teal-400/50 uppercase tracking-wider">Shelf Plate</span>
            </div>
          </div>
        );
      case 'roll':
        return (
          <div className="flex-grow flex flex-col items-center justify-center relative mt-1 border-t border-teal-500/10 pt-1.5">
            <Columns className={iconClass} />
            <span className="text-[7.5px] text-teal-400/50 uppercase tracking-widest mt-1">Spool bar</span>
          </div>
        );
      case 'letter':
        return (
          <div className="flex-grow flex flex-col items-center justify-center relative mt-1 border-t border-teal-500/10 pt-1.5">
            <FileText className={iconClass} />
            <span className="text-[7.5px] text-teal-400/50 uppercase tracking-widest mt-1">Document Rack</span>
          </div>
        );
      case 'clips':
        return (
          <div className="flex-grow flex flex-col items-center justify-center relative mt-1 border-t border-teal-500/10 pt-1.5">
            <CheckCircle className={iconClass} />
            <span className="text-[7.5px] text-teal-400/50 uppercase tracking-widest mt-1">Paper Clip</span>
          </div>
        );
      default:
        return (
          <div className="flex-grow flex items-center justify-center opacity-30">
            <HookIcon size={18} className="text-teal-400/60" />
          </div>
        );
    }
  };

  const filteredAccessories = ACCESSORIES.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex-grow flex flex-col p-4 md:p-8 max-w-7xl mx-auto w-full gap-6">
      
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-teal-400 to-indigo-500 flex items-center justify-center text-2xl shadow-lg">
            🛠️
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-teal-400 to-indigo-400 bg-clip-text text-transparent">
              Skadis Pegboard Layout Planner
            </h1>
            <p className="text-sm text-gray-400">
              Drag, arrange, and snap your pegboard organization setup physically to scale.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button 
            onClick={() => setShowHelp(!showHelp)}
            className="flex items-center gap-1.5 px-4 py-2 text-sm rounded-xl border border-gray-800 bg-gray-900/50 hover:bg-gray-800 text-gray-300 hover:text-white transition-all duration-200"
          >
            <HelpCircle size={16} /> Help
          </button>
          <button 
            onClick={clearBoard}
            className="flex items-center gap-1.5 px-4 py-2 text-sm rounded-xl border border-red-950/40 bg-red-950/20 hover:bg-red-950/30 text-red-400 hover:text-red-300 transition-all duration-200"
          >
            <RotateCcw size={16} /> Reset
          </button>
          <button 
            onClick={handleExport}
            className="flex items-center gap-1.5 px-4 py-2 text-sm rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-medium shadow-lg shadow-teal-900/20 hover:shadow-teal-900/30 transition-all duration-200"
          >
            <Download size={16} /> Export JSON
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-grow grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Side: Drag & Drop Library */}
        <aside className="lg:col-span-4 flex flex-col gap-6">
          <div className="glass-panel p-5 rounded-2xl flex flex-col gap-4 shadow-lg">
            <h2 className="text-xs font-semibold tracking-wider uppercase text-teal-400 flex items-center gap-1.5">
              <Grid size={14} /> 1. Board Configuration
            </h2>
            
            {/* Board Selector */}
            <div className="grid grid-cols-1 gap-1.5">
              <label className="text-[10px] text-gray-400 block">Select Board Size</label>
              <select
                value={selectedBoard.id}
                onChange={(e) => {
                  const newBoard = BOARD_TYPES.find(b => b.id === e.target.value);
                  if (placedItems.length === 0 || window.confirm("Switching boards will reset your layout. Continue?")) {
                    setSelectedBoard(newBoard);
                    setPlacedItems([]);
                  }
                }}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-teal-500 cursor-pointer text-gray-200"
              >
                {BOARD_TYPES.map(board => (
                  <option key={board.id} value={board.id}>{board.name}</option>
                ))}
              </select>
            </div>

            {/* Tile Settings */}
            <div className="border-t border-gray-800/60 pt-3.5 mt-1">
              <span className="text-[10px] text-gray-400 block mb-2">Wall Grid Tiling (Add multiple boards)</span>
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="text-[9px] text-gray-500 block mb-1">Columns (Horizontal)</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="6" 
                    value={boardCols} 
                    onChange={e => {
                      const val = parseInt(e.target.value) || 1;
                      setBoardCols(val);
                    }}
                    className="w-full bg-gray-950 border border-gray-800 rounded-lg px-2 py-1.5 text-xs text-center focus:outline-none focus:border-teal-500 text-gray-200" 
                  />
                </div>
                <div>
                  <label className="text-[9px] text-gray-500 block mb-1">Rows (Vertical)</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="4" 
                    value={boardRows} 
                    onChange={e => {
                      const val = parseInt(e.target.value) || 1;
                      setBoardRows(val);
                    }}
                    className="w-full bg-gray-950 border border-gray-800 rounded-lg px-2 py-1.5 text-xs text-center focus:outline-none focus:border-teal-500 text-gray-200" 
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 border-t border-gray-800/60 pt-3.5 mt-1">
              <label className="text-xs text-gray-400 flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox"
                  checked={showGridGuide}
                  onChange={() => setShowGridGuide(!showGridGuide)}
                  className="w-4 h-4 rounded accent-teal-500 cursor-pointer"
                />
                Show Grid Lines
              </label>
              <label className="text-xs text-gray-400 flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox"
                  checked={showOccupantClearance}
                  onChange={() => setShowOccupantClearance(!showOccupantClearance)}
                  className="w-4 h-4 rounded accent-indigo-500 cursor-pointer"
                />
                Show Hanging Clearance (Item footprint)
              </label>
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl flex-grow flex flex-col gap-4 shadow-lg min-h-[350px]">
            <h2 className="text-xs font-semibold tracking-wider uppercase text-indigo-400 flex items-center gap-1.5">
              <Inbox size={14} /> 2. Accessory Library
            </h2>
            
            {/* Search */}
            <input 
              type="text" 
              placeholder="Search accessory catalog..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-950/60 border border-gray-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 text-gray-100 placeholder-gray-500 transition-all duration-200"
            />

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setActiveCategory('all')}
                className={`px-3 py-1.5 text-xs rounded-lg transition-all duration-200 ${
                  activeCategory === 'all' 
                    ? 'bg-gray-800 text-white font-medium border border-gray-700' 
                    : 'bg-gray-900/30 border border-gray-800/50 text-gray-400 hover:text-gray-200'
                }`}
              >
                All
              </button>
              {ACCESSORY_CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-all duration-200 ${
                    activeCategory === cat.id 
                      ? 'bg-gray-800 text-white font-medium border border-gray-700' 
                      : 'bg-gray-900/30 border border-gray-800/50 text-gray-400 hover:text-gray-200'
                  }`}
                >
                  {getCategoryIcon(cat.id)}
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Drag Items List */}
            <div className="flex-grow overflow-y-auto max-h-[280px] flex flex-col gap-2.5 pr-1">
              {filteredAccessories.length > 0 ? (
                filteredAccessories.map(item => (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={(e) => handleLibraryDragStart(e, item)}
                    className="flex items-center justify-between p-3.5 bg-gray-900/40 hover:bg-gray-900/70 border border-gray-800 rounded-xl cursor-grab active:cursor-grabbing hover:border-teal-500/50 transition-all duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-3.5 h-3.5 rounded-md flex-shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <div>
                        <h4 className="text-xs font-semibold text-gray-200">{item.name}</h4>
                        <span className="text-[10px] text-gray-400 block mt-0.5">
                          {item.colsOccupied}x{item.rowsOccupied} grid blocks ({item.widthMm}x{item.heightMm}mm)
                        </span>
                      </div>
                    </div>
                    <span className="text-[9px] bg-gray-850/50 text-slate-400 px-2 py-0.5 rounded-full border border-gray-800">
                      {item.category}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-center text-xs text-gray-500 mt-4">No accessories match the filter.</p>
              )}
            </div>

            {/* Custom Parametric Tool Creator */}
            <div className="border-t border-gray-800/60 pt-4 mt-2">
              <h3 className="text-xs font-semibold text-gray-300 mb-2.5 flex items-center gap-1.5">
                <Sparkles size={14} className="text-pink-400" /> Create Custom Placeholder
              </h3>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div>
                  <label className="text-[10px] text-gray-400 block mb-1">Width (cols)</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="10" 
                    value={customWidth} 
                    onChange={e => setCustomWidth(e.target.value)}
                    className="w-full bg-gray-950/60 border border-gray-800 rounded-lg px-2.5 py-1.5 text-xs text-center focus:outline-none focus:border-teal-500 text-gray-200" 
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-400 block mb-1">Height (rows)</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="20" 
                    value={customHeight} 
                    onChange={e => setCustomHeight(e.target.value)}
                    className="w-full bg-gray-950/60 border border-gray-800 rounded-lg px-2.5 py-1.5 text-xs text-center focus:outline-none focus:border-teal-500 text-gray-200" 
                  />
                </div>
              </div>
              <button
                onClick={handleCreateCustom}
                className="w-full flex items-center justify-center gap-1.5 px-3.5 py-2.5 text-xs rounded-xl bg-pink-700/30 hover:bg-pink-700/40 border border-pink-900/50 text-pink-300 transition-all duration-200 font-semibold shadow-lg shadow-pink-950/10"
              >
                <Plus size={14} /> Add Custom Shape
              </button>
            </div>
          </div>
        </aside>

        {/* Center/Right: Interactive Canvas & Setup Specs */}
        <main className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Help Panel Popup */}
          {showHelp && (
            <div className="glass-panel p-5 bg-teal-950/20 border-teal-800/40 rounded-2xl flex items-start gap-4 shadow-md">
              <Info size={24} className="text-teal-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-teal-300">How to use the layout planner</h3>
                <ul className="list-disc list-inside text-xs text-gray-300 mt-1.5 space-y-1.5">
                  <li>Choose your board size and configure tiling in Section 1.</li>
                  <li>Use **mouse drag** on the grey background to **pan** the viewport.</li>
                  <li>Use the Zoom Controls (+/-) or **scroll wheel** over the canvas area to **zoom** in/out.</li>
                  <li>Drag accessories from the library and drop them onto the board.</li>
                  <li>**Rearrange:** Click and drag any item already on the board to move it to a new location.</li>
                  <li>Click the trash icon on any placed item to delete it from the board.</li>
                </ul>
              </div>
            </div>
          )}

          {/* Grid Canvas */}
          <div 
            ref={canvasContainerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className={`glass-panel p-4 rounded-2xl flex-grow flex items-center justify-center overflow-hidden bg-gray-950/70 relative min-h-[500px] shadow-inner select-none ${
              isPanning ? 'cursor-grabbing' : 'cursor-grab'
            }`}
          >
            {/* Canvas overlay toolbar (Zoom, Pan reset, Depth Map) */}
            <div className="absolute bottom-4 right-4 flex items-center gap-1.5 bg-gray-900/90 border border-gray-800 rounded-xl p-1 shadow-lg backdrop-blur z-20">
              <button 
                onClick={() => setShowDepthMap(!showDepthMap)}
                className={`px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 text-xs font-semibold border ${
                  showDepthMap 
                    ? 'bg-teal-500/10 text-teal-400 border-teal-500/30' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-800 border-transparent'
                }`}
                title="Toggle 3D Depth Clearance Projections"
              >
                <Maximize size={14} className={showDepthMap ? "rotate-45" : ""} />
                <span>3D Depth Map</span>
              </button>
              <div className="h-4 w-px bg-gray-800" />
              <button 
                onClick={() => handleZoom(0.1)}
                className="p-1.5 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
                title="Zoom In"
              >
                <ZoomIn size={16} />
              </button>
              <button 
                onClick={() => handleZoom(-0.1)}
                className="p-1.5 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
                title="Zoom Out"
              >
                <ZoomOut size={16} />
              </button>
              <button 
                onClick={resetZoomPan}
                className="p-1.5 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
                title="Reset View"
              >
                <Move size={16} />
              </button>
              <span className="text-[10px] text-gray-500 font-medium px-2 border-l border-gray-850">
                {Math.round(scale * 100)}%
              </span>
            </div>

            {isCollisionWarning && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2.5 bg-red-950/90 border border-red-800 text-red-200 text-xs rounded-full shadow-lg z-50 animate-bounce backdrop-blur">
                ⚠️ Out of board bounds or overlaps!
              </div>
            )}

            {/* Transform Wrapper */}
            <div 
              style={{ 
                transform: `translate(${panX}px, ${panY}px) scale(${scale})`, 
                transformOrigin: 'center center' 
              }}
              className="transition-transform duration-75 ease-out"
            >
              {/* Pegboard representation wrapper */}
              <div 
                ref={boardRef}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="relative overflow-visible"
                style={{
                  width: `${totalCols * 40}px`,
                  height: `${totalRows * 20}px`
                }}
              >
                {/* Tiled boards layer */}
                {renderBoardGrid()}

                {/* Placed Accessories Layer */}
                <div className="absolute inset-0 pointer-events-auto z-10">
                  {/* Render 2D Occupant Clearance Envelopes First (in background) */}
                  {showOccupantClearance && placedItems.map(item => {
                    const { below, above, side } = getClearanceMm(item);
                    const clearanceX = item.gridX * 40 - side;
                    const clearanceY = item.gridY * 20 - above;
                    const clearanceWidth = item.colsOccupied * 40 + side * 2;
                    const clearanceHeight = item.rowsOccupied * 20 + above + below;

                    return (
                      <div
                        key={`clearance-${item.id}`}
                        className="absolute rounded-xl pointer-events-none transition-all duration-200 border border-dashed flex flex-col justify-end p-2"
                        style={{
                          left: `${clearanceX + 2}px`,
                          top: `${clearanceY + 2}px`,
                          width: `${clearanceWidth - 4}px`,
                          height: `${clearanceHeight - 4}px`,
                          borderColor: 'rgba(99, 102, 241, 0.4)',
                          backgroundColor: 'rgba(99, 102, 241, 0.04)',
                          boxShadow: 'inset 0 0 12px rgba(99, 102, 241, 0.05)',
                        }}
                      >
                        <div className="w-full text-center text-[7.5px] font-semibold text-indigo-400/50 uppercase tracking-widest leading-none font-mono">
                          {item.name.replace('Skadis', '').replace('Mount', '').replace('Hanger', '').trim()} footprint
                        </div>
                      </div>
                    );
                  })}

                  {/* Render Accessory Mounts */}
                  {placedItems.map(item => {
                    const width = item.colsOccupied * 40;
                    const height = item.rowsOccupied * 20;
                    const x = item.gridX * 40;
                    const y = item.gridY * 20;

                    return (
                      <div
                        key={item.id}
                        draggable
                        onDragStart={(e) => handlePlacedDragStart(e, item)}
                        className={`accessory-item group absolute rounded-xl p-3 flex flex-col justify-between cursor-grab pointer-events-auto transition-all duration-200 ${
                          showDepthMap ? 'border-2' : ''
                        }`}
                        style={{
                          left: `${x + 2}px`,
                          top: `${y + 2}px`,
                          width: `${width - 4}px`,
                          height: `${height - 4}px`,
                          // Technical Blueprint Theme: Translucent teal/slate board layout
                          backgroundColor: showDepthMap
                            ? (item.depthMm + (item.occupantDepthMm || 0)) > 110 
                              ? 'rgba(244, 63, 94, 0.08)' 
                              : (item.depthMm + (item.occupantDepthMm || 0)) > 60 
                              ? 'rgba(245, 158, 11, 0.08)' 
                              : 'rgba(20, 184, 166, 0.08)'
                            : 'rgba(20, 184, 166, 0.12)',
                          borderColor: showDepthMap
                            ? (item.depthMm + (item.occupantDepthMm || 0)) > 110 
                              ? 'rgba(244, 63, 94, 0.8)' 
                              : (item.depthMm + (item.occupantDepthMm || 0)) > 60 
                              ? 'rgba(245, 158, 11, 0.8)' 
                              : 'rgba(20, 184, 166, 0.8)'
                            : 'rgba(20, 184, 166, 0.6)',
                          boxShadow: showDepthMap
                            ? `${Math.min(15, (item.depthMm + (item.occupantDepthMm || 0)) * 0.12)}px ${Math.min(15, (item.depthMm + (item.occupantDepthMm || 0)) * 0.12)}px 0px ${
                                (item.depthMm + (item.occupantDepthMm || 0)) > 110 
                                  ? 'rgba(244, 63, 94, 0.2)' 
                                  : (item.depthMm + (item.occupantDepthMm || 0)) > 60 
                                  ? 'rgba(245, 158, 11, 0.2)' 
                                  : 'rgba(20, 184, 166, 0.2)'
                              }`
                            : '0 8px 16px -4px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
                        }}
                      >
                        {/* Always visible absolute delete button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            removeItem(item.id);
                          }}
                          onMouseDown={(e) => e.stopPropagation()} // Prevent card drag trigger
                          onDragStart={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                          className="absolute -top-1.5 -left-1.5 p-1 bg-gray-950/90 border border-gray-800 text-gray-400 hover:text-red-400 hover:bg-red-950/20 hover:border-red-900/40 rounded-lg shadow-md transition-all duration-150 z-30 cursor-pointer"
                          title="Remove accessory"
                        >
                          <Trash2 size={11} />
                        </button>

                        {showDepthMap && (
                          <div 
                            className="absolute -top-2 -right-2 font-bold text-[8.5px] px-1.5 py-0.5 rounded shadow-md z-30 font-mono"
                            style={{
                              backgroundColor: (item.depthMm + (item.occupantDepthMm || 0)) > 110 
                                ? '#f43f5e' 
                                : (item.depthMm + (item.occupantDepthMm || 0)) > 60 
                                ? '#f59e0b' 
                                : '#14b8a6',
                              color: '#020617'
                            }}
                          >
                            {item.depthMm + (item.occupantDepthMm || 0)}mm
                          </div>
                        )}
                        <div className="flex items-start justify-between gap-1.5 overflow-hidden">
                          <span className={`text-[10px] font-bold leading-tight truncate ${
                            showDepthMap
                              ? (item.depthMm + (item.occupantDepthMm || 0)) > 110
                                ? 'text-rose-300'
                                : (item.depthMm + (item.occupantDepthMm || 0)) > 60
                                ? 'text-amber-300'
                                : 'text-teal-300'
                              : 'text-teal-300'
                          }`}>
                            {item.name}
                          </span>
                        </div>

                        {/* Visual representations helper render */}
                        {renderAccessoryVisual(item)}

                        <span className="text-[8px] font-mono text-teal-500/80 block mt-1 leading-none text-right">
                          {item.colsOccupied}x{item.rowsOccupied}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Shopping / Build Checklist with 3D Clearance Tabs */}
          <div className="glass-panel p-6 rounded-2xl shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-800 pb-4 mb-4 gap-3">
              <h2 className="text-xs font-semibold tracking-wider uppercase text-orange-400 flex items-center gap-1.5 font-mono">
                <FileText size={14} /> 3. Layout Specifications & Analysis
              </h2>
              <div className="flex bg-gray-950 p-0.5 rounded-xl border border-gray-800">
                <button
                  onClick={() => setActiveTab('checklist')}
                  className={`px-3 py-1.5 text-xs rounded-lg transition-all font-medium ${
                    activeTab === 'checklist'
                      ? 'bg-gray-900 text-teal-400 border border-gray-850 shadow font-semibold'
                      : 'text-gray-450 hover:text-gray-200'
                  }`}
                >
                  Shopping List
                </button>
                <button
                  onClick={() => setActiveTab('clearance')}
                  className={`px-3 py-1.5 text-xs rounded-lg transition-all font-medium flex items-center gap-1.5 ${
                    activeTab === 'clearance'
                      ? 'bg-gray-900 text-teal-400 border border-gray-850 shadow font-semibold'
                      : 'text-gray-450 hover:text-gray-200'
                  }`}
                >
                  <Maximize size={12} className="rotate-45" /> 3D Clearance Space
                </button>
              </div>
            </div>

            {activeTab === 'checklist' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-2">
                  <span className="text-xs text-gray-450 font-medium">Accessories Checklist:</span>
                  {placedItems.length > 0 ? (
                    <div className="flex flex-col gap-2 max-h-[240px] overflow-y-auto pr-1">
                      {getShoppingList().map(item => (
                        <div 
                          key={item.key}
                          className="flex items-center justify-between p-3 bg-gray-900/40 border border-gray-800 rounded-xl text-xs"
                        >
                          <div className="flex items-center gap-2.5">
                            <span 
                              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                              style={{ backgroundColor: item.color }}
                            />
                            <span className="font-semibold text-gray-200">{item.name}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            {item.isCustom ? (
                              <span className="text-[9px] bg-pink-950/40 border border-pink-900/40 text-pink-400 px-2 py-0.5 rounded-full font-medium">
                                3D Print
                              </span>
                            ) : (
                              <span className="text-[9px] bg-gray-800/60 text-gray-400 px-2 py-0.5 rounded-full font-medium">
                                SKU: {item.sku}
                              </span>
                            )}
                            <span className="font-bold text-teal-400 text-sm">x{item.count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 border border-dashed border-gray-800 rounded-xl">
                      <p className="text-xs text-gray-500">No accessories placed yet.</p>
                    </div>
                  )}
                </div>

                <div className="bg-gray-900/30 rounded-xl border border-gray-850 p-4.5 text-xs flex flex-col justify-between gap-4">
                  <div className="space-y-2.5 text-gray-300">
                    <p className="flex justify-between">
                      <span>Wall Configuration:</span>
                      <span className="font-bold text-gray-100">{boardCols} x {boardRows} tiled pegboards</span>
                    </p>
                    <p className="flex justify-between">
                      <span>Total Wall Dimensions:</span>
                      <span className="font-bold text-teal-400">{selectedBoard.widthMm * boardCols} x {selectedBoard.heightMm * boardRows} mm</span>
                    </p>
                    <p className="flex justify-between">
                      <span>Total Placed Items:</span>
                      <span className="font-bold text-gray-100">{placedItems.length}</span>
                    </p>
                    <p className="flex justify-between">
                      <span>Pegboard Area Utilized:</span>
                      <span className="font-bold text-gray-100">
                        {placedItems.length > 0 ? Math.round(
                          (placedItems.reduce((acc, curr) => acc + (curr.colsOccupied * curr.rowsOccupied), 0) / 
                          (totalCols * totalRows)) * 100
                        ) : 0}%
                      </span>
                    </p>
                  </div>
                  <div className="border-t border-gray-800/80 pt-3 text-[10px] text-gray-400 flex items-center gap-2">
                    <CheckCircle size={14} className="text-teal-500" />
                    <span>Wall layout fits exactly on a {selectedBoard.widthMm * boardCols}x{selectedBoard.heightMm * boardRows}mm space.</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 3D Space Metrics */}
                <div className="flex flex-col gap-4">
                  <div>
                    <h3 className="text-xs font-semibold text-gray-200 mb-1">3D Wall Clearance & Depth Profile</h3>
                    <p className="text-[11px] text-gray-400 leading-relaxed">
                      IKEA Skadis pegboards sit <strong className="text-teal-400">20mm</strong> off the wall on mounting brackets. Below is the estimated 3D clearance space required from the wall surface to the front of mounted items.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3.5">
                    <div className="bg-gray-900/40 border border-gray-800/80 p-3 rounded-xl flex flex-col justify-between">
                      <span className="text-[9px] text-gray-400 block mb-1">Max Protrusion Depth</span>
                      <span className="text-lg font-bold text-teal-400">
                        {placedItems.length > 0
                          ? Math.max(...placedItems.map(item => item.depthMm + (item.occupantDepthMm || 0))) + 20
                          : 20} mm
                      </span>
                      <span className="text-[8.5px] text-gray-500 block mt-1 leading-tight">Includes 20mm bracket offset</span>
                    </div>

                    <div className="bg-gray-900/40 border border-gray-800/80 p-3 rounded-xl flex flex-col justify-between">
                      <span className="text-[9px] text-gray-400 block mb-1">Deepest Obstruction</span>
                      <span className="text-xs font-bold text-gray-250 truncate block mt-1">
                        {placedItems.length > 0
                          ? [...placedItems].sort((a, b) => (b.depthMm + (b.occupantDepthMm || 0)) - (a.depthMm + (a.occupantDepthMm || 0)))[0].name
                          : 'None placed'}
                      </span>
                      <span className="text-[8.5px] text-slate-500 block mt-1 leading-tight">Occupies most 3D space</span>
                    </div>
                  </div>

                  {placedItems.length > 0 && Math.max(...placedItems.map(item => item.depthMm + (item.occupantDepthMm || 0))) > 100 && (
                    <div className="p-3 bg-amber-950/20 border border-amber-900/35 text-amber-400 rounded-xl text-[11px] leading-relaxed flex gap-2">
                      <Info size={14} className="flex-shrink-0 mt-0.5" />
                      <span>
                        <strong>Clearance Alert:</strong> Some items protrude over 120mm from the wall. Ensure there's adequate front clearance if mounted behind monitors, keyboard trays, or chairs.
                      </span>
                    </div>
                  )}

                  <div className="p-3.5 bg-gray-950 rounded-xl border border-gray-850 text-[10.5px] text-gray-400 space-y-2">
                    <div className="flex justify-between">
                      <span>Pegboard Thickness:</span>
                      <span className="text-gray-200">5 mm</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Wall Mounting Offset:</span>
                      <span className="text-gray-200">20 mm</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg. Accessory Depth:</span>
                      <span className="text-gray-200">
                        {placedItems.length > 0
                          ? Math.round(placedItems.reduce((acc, curr) => acc + curr.depthMm, 0) / placedItems.length)
                          : 0} mm
                      </span>
                    </div>
                  </div>
                </div>

                {/* Depth breakdown list */}
                <div className="flex flex-col gap-3">
                  <h3 className="text-xs font-semibold text-gray-200 flex items-center justify-between font-mono">
                    <span>Individual Accessory Envelope Profiles</span>
                    <span className="text-[9px] text-slate-500">Wall Offset → Accessory → Occupant load</span>
                  </h3>
                  
                  {placedItems.length > 0 ? (
                    <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-1">
                      {placedItems.map((item, idx) => {
                        const totalDepth = item.depthMm + (item.occupantDepthMm || 0) + 20; // total from wall
                        const maxLimit = 180; // max width reference scale
                        const bracketWidth = (20 / maxLimit) * 100;
                        const accWidth = (item.depthMm / maxLimit) * 100;
                        const occWidth = ((item.occupantDepthMm || 0) / maxLimit) * 100;

                        return (
                          <div key={`${item.id}-clearance-${idx}`} className="flex flex-col gap-1 bg-gray-900/30 border border-gray-850 p-2.5 rounded-xl text-[11px]">
                            <div className="flex justify-between font-medium">
                              <span className="text-gray-300 truncate max-w-[180px]">{item.name}</span>
                              <span className="text-teal-400 font-mono font-semibold">{totalDepth} mm</span>
                            </div>
                            
                            {/* Graphic Bar */}
                            <div className="h-5 w-full bg-gray-950 rounded border border-gray-850 overflow-hidden flex relative items-center">
                              {/* Wall bracket space (20mm) */}
                              <div className="h-full bg-slate-850 border-r border-slate-750/30" style={{ width: `${bracketWidth}%` }} />
                              {/* Accessory depth */}
                              <div 
                                className="h-full bg-teal-500/10 border-l border-r border-teal-500/40" 
                                style={{ width: `${accWidth}%` }} 
                              />
                              {/* Occupant depth */}
                              {item.occupantDepthMm > 0 && (
                                <div 
                                  className="h-full bg-indigo-500/15 border-l border-dashed border-indigo-500/35" 
                                  style={{ width: `${occWidth}%` }} 
                                />
                              )}
                              
                              <div className="absolute inset-0 flex justify-between px-2 items-center pointer-events-none text-[8px] font-mono text-gray-500">
                                <span>wall</span>
                                <span>{totalDepth}mm</span>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[8.5px] text-gray-500 font-medium font-mono">
                              <span className="flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-slate-800 rounded-full" /> Bracket: 20mm
                              </span>
                              <span className="flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-teal-500/40 rounded-full" /> Mount: {item.depthMm}mm
                              </span>
                              {item.occupantDepthMm > 0 && (
                                <span className="flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 bg-indigo-500/40 rounded-full" /> Item on top: ~{item.occupantDepthMm}mm
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-10 border border-dashed border-gray-800 rounded-xl">
                      <p className="text-xs text-gray-500">No accessories placed to estimate.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
