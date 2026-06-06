export const BOARD_TYPES = [
  {
    id: 'print-200',
    name: '3D Printed Square (200 x 200 mm)',
    widthMm: 200,
    heightMm: 200,
    columns: 5,
    rows: 10,
    description: 'Common square build-plate printable size.'
  },
  {
    id: 'print-240',
    name: '3D Printed Square (240 x 240 mm)',
    widthMm: 240,
    heightMm: 240,
    columns: 6,
    rows: 12,
    description: 'Perfect fit for 256x256mm build plates (like Bambu Lab).'
  },
  {
    id: 'small',
    name: 'IKEA Small (360 x 560 mm)',
    widthMm: 360,
    heightMm: 560,
    columns: 9, 
    rows: 28,   
    description: 'Perfect for small desks or specialized tools.'
  },
  {
    id: 'medium',
    name: 'IKEA Medium (560 x 560 mm)',
    widthMm: 560,
    heightMm: 560,
    columns: 14,
    rows: 28,
    description: 'The standard square board layout.'
  },
  {
    id: 'large',
    name: 'IKEA Large (760 x 560 mm)',
    widthMm: 760,
    heightMm: 560,
    columns: 19,
    rows: 28,
    description: 'Great for a wide variety of tools and bins.'
  }
];

export const ACCESSORY_CATEGORIES = [
  { id: 'bins', name: 'Bins & Trays', icon: 'Inbox' },
  { id: 'hooks', name: 'Hooks & Pegs', icon: 'Hash' },
  { id: 'shelves', name: 'Shelves & Racks', icon: 'Columns' },
  { id: 'holders', name: 'Specialty Holders', icon: 'Wrench' },
  { id: 'custom', name: 'Custom Placeholders', icon: 'Maximize' }
];

export const ACCESSORIES = [
  // Bins
  {
    id: 'bin-small',
    name: 'Skadis Container (Small)',
    category: 'bins',
    widthMm: 75,
    heightMm: 80,
    depthMm: 85,
    occupantDepthMm: 15,
    colsOccupied: 2,
    rowsOccupied: 4,
    occupantBelowRows: 0,
    occupantAboveRows: 1,
    occupantSideCols: 0,
    color: 'var(--color-accent-teal)',
    description: 'Standard container for pencils, tools, or scrap.',
    sku: '203.207.98',
    visualType: 'bin-small'
  },
  {
    id: 'bin-medium',
    name: 'Skadis Container (Medium)',
    category: 'bins',
    widthMm: 120,
    heightMm: 80,
    depthMm: 85,
    occupantDepthMm: 15,
    colsOccupied: 3,
    rowsOccupied: 4,
    occupantBelowRows: 0,
    occupantAboveRows: 1,
    occupantSideCols: 0,
    color: 'var(--color-accent-teal-dark)',
    description: 'Wider container for scissors, rulers, and tools.',
    sku: '803.208.04',
    visualType: 'bin-medium'
  },
  {
    id: 'tray-long',
    name: 'Skadis Long Tray',
    category: 'bins',
    widthMm: 220,
    heightMm: 40,
    depthMm: 90,
    occupantDepthMm: 20,
    colsOccupied: 6,
    rowsOccupied: 2,
    occupantBelowRows: 0,
    occupantAboveRows: 2,
    occupantSideCols: 0,
    color: 'var(--color-accent-blue)',
    description: 'Long shallow tray for dynamic tools and screws.',
    sku: '003.207.99',
    visualType: 'tray'
  },
  
  // Hooks
  {
    id: 'hook-single',
    name: 'Single Hook (Short)',
    category: 'hooks',
    widthMm: 20,
    heightMm: 30,
    depthMm: 25,
    occupantDepthMm: 20,
    colsOccupied: 1,
    rowsOccupied: 2,
    occupantBelowRows: 4, // keys/cables hang down 80mm
    occupantAboveRows: 0,
    occupantSideCols: 0,
    color: 'var(--color-accent-purple)',
    description: 'Short hook for keys, cables, or single tools.',
    sku: '203.208.02',
    visualType: 'hook-short'
  },
  {
    id: 'hook-long',
    name: 'Long Hook',
    category: 'hooks',
    widthMm: 20,
    heightMm: 30,
    depthMm: 95,
    occupantDepthMm: 40,
    colsOccupied: 1,
    rowsOccupied: 2,
    occupantBelowRows: 6, // larger items hang down 120mm
    occupantAboveRows: 0,
    occupantSideCols: 1, // cords/bags are wider than hook
    color: 'var(--color-accent-purple-light)',
    description: 'Long straight hook for headphones or spools.',
    sku: '503.208.05',
    visualType: 'hook-long'
  },
  {
    id: 'hook-double',
    name: 'Double Hook',
    category: 'hooks',
    widthMm: 50,
    heightMm: 30,
    depthMm: 95,
    occupantDepthMm: 30,
    colsOccupied: 2,
    rowsOccupied: 2,
    occupantBelowRows: 8, // tools like hammers/pliers hang down 160mm
    occupantAboveRows: 0,
    occupantSideCols: 0,
    color: 'var(--color-accent-indigo)',
    description: 'Double pronged hook for hammers, pliers, or levels.',
    sku: '803.208.09',
    visualType: 'hook-double'
  },
  
  // Shelves
  {
    id: 'shelf-wood',
    name: 'Skadis Shelf',
    category: 'shelves',
    widthMm: 280,
    heightMm: 20,
    depthMm: 90,
    occupantDepthMm: 60,
    colsOccupied: 7,
    rowsOccupied: 2,
    occupantBelowRows: 0,
    occupantAboveRows: 6, // bottles/cans sitting on top up to 120mm
    occupantSideCols: 0,
    color: 'var(--color-accent-orange)',
    description: 'A wood-style shelf to display paint, figurines, or models.',
    sku: '003.207.99',
    visualType: 'shelf'
  },
  
  // Specialty Holders
  {
    id: 'holder-roll',
    name: 'Roll Holder',
    category: 'holders',
    widthMm: 280,
    heightMm: 50,
    depthMm: 100,
    occupantDepthMm: 45,
    colsOccupied: 7,
    rowsOccupied: 3,
    occupantBelowRows: 3, // paper/spools hang down 60mm
    occupantAboveRows: 3, // extends above mount by 60mm
    occupantSideCols: 0,
    color: 'var(--color-accent-pink)',
    description: 'Roll holder for tape, ribbon, or wrapping paper.',
    sku: '703.208.04',
    visualType: 'roll'
  },
  {
    id: 'holder-letter',
    name: 'Letter Holder',
    category: 'holders',
    widthMm: 150,
    heightMm: 200,
    depthMm: 20,
    occupantDepthMm: 15,
    colsOccupied: 4,
    rowsOccupied: 10,
    occupantBelowRows: 0,
    occupantAboveRows: 3, // folders sticking out top
    occupantSideCols: 0,
    color: 'var(--color-accent-rose)',
    description: 'Elastic cord rack for files, notes, or build plates.',
    sku: '403.208.11',
    visualType: 'letter'
  },
  {
    id: 'holder-clips',
    name: 'Skadis Clips (x2)',
    category: 'holders',
    widthMm: 20,
    heightMm: 80,
    depthMm: 20,
    occupantDepthMm: 10,
    colsOccupied: 1,
    rowsOccupied: 4,
    occupantBelowRows: 5, // papers hang below clip by 100mm
    occupantAboveRows: 0,
    occupantSideCols: 1.5, // standard letter width
    color: 'var(--color-accent-yellow)',
    description: 'Clips to hold papers, checklists, or reference photos.',
    sku: '003.208.03',
    visualType: 'clips'
  },
  // 3D Printed Specialty Mounts
  {
    id: 'print-controller',
    name: 'Game Controller Mount',
    category: 'holders',
    widthMm: 80,
    heightMm: 60,
    depthMm: 75,
    occupantDepthMm: 65,
    colsOccupied: 2,
    rowsOccupied: 3,
    occupantBelowRows: 1.5, // grips hang below mount by 30mm
    occupantAboveRows: 1.0, // top of controller extends above by 20mm
    occupantSideCols: 1.0, // standard Xbox/PS5 controller width (152mm) extends 1 col each side
    color: '#3b82f6',
    description: 'Ergonomic hanger for Xbox, PS5, or Switch Pro controllers.',
    visualType: 'controller'
  },
  {
    id: 'print-steam-controller',
    name: 'Steam Controller Mount',
    category: 'holders',
    widthMm: 80,
    heightMm: 60,
    depthMm: 75,
    occupantDepthMm: 65,
    colsOccupied: 2,
    rowsOccupied: 3,
    occupantBelowRows: 2.5, // Steam controller grips hang lower (50mm below)
    occupantAboveRows: 1.0, // top extends 20mm above
    occupantSideCols: 1.0, // Steam controller is 159mm wide (4 cols footprint)
    color: '#1e40af',
    description: 'Custom cradled hanger designed specifically for the Steam Controller.',
    visualType: 'controller'
  },
  {
    id: 'print-headphones',
    name: 'Headphone Hanger',
    category: 'holders',
    widthMm: 40,
    heightMm: 60,
    depthMm: 80,
    occupantDepthMm: 70,
    colsOccupied: 1,
    rowsOccupied: 3,
    occupantBelowRows: 7.5, // standard headset hangs down ~150mm below top band
    occupantAboveRows: 0.5, // headband padding extends slightly above
    occupantSideCols: 1.5, // headset width extends 60mm on each side (total 160mm)
    color: '#8b5cf6',
    description: 'Curved hanger for overhead headphones.',
    visualType: 'headphones'
  },
  {
    id: 'print-powerstrip',
    name: 'Power Strip Holder',
    category: 'holders',
    widthMm: 160,
    heightMm: 40,
    depthMm: 45,
    occupantDepthMm: 20,
    colsOccupied: 4,
    rowsOccupied: 2,
    occupantBelowRows: 0.5, // plugs / cords exit
    occupantAboveRows: 0.5,
    occupantSideCols: 0.5,
    color: '#10b981',
    description: 'Clamps to mount standard power strips to the board.',
    visualType: 'powerstrip'
  },
  {
    id: 'print-keyboard',
    name: 'Keyboard Wall Mount (x2)',
    category: 'holders',
    widthMm: 120,
    heightMm: 40,
    depthMm: 35,
    occupantDepthMm: 45,
    colsOccupied: 3,
    rowsOccupied: 2,
    occupantBelowRows: 0.5,
    occupantAboveRows: 4.5, // vertical keyboard height (TKL is ~130mm / 6.5 rows)
    occupantSideCols: 2.5, // TKL keyboard is ~320mm / 8 cols wide (extends 2.5 cols each side)
    color: '#f59e0b',
    description: 'Dual shelf system to display custom mechanical keyboards.',
    visualType: 'keyboard'
  },
  {
    id: 'print-appletv',
    name: 'Apple TV 4K Mount',
    category: 'holders',
    widthMm: 93,
    heightMm: 93,
    depthMm: 35,
    occupantDepthMm: 5,
    colsOccupied: 3, // 120mm mount width
    rowsOccupied: 5, // 100mm mount height
    occupantBelowRows: 0,
    occupantAboveRows: 0.5, // slots slightly out top
    occupantSideCols: 0,
    color: '#475569',
    description: 'Wall mount slot to slide Apple TV 4K behind monitors or TVs.',
    visualType: 'blueprint-item'
  },
  {
    id: 'print-eero',
    name: 'Eero 6 Router Mount',
    category: 'holders',
    widthMm: 100,
    heightMm: 100,
    depthMm: 65,
    occupantDepthMm: 10,
    colsOccupied: 3, // 120mm mount width
    rowsOccupied: 5, // 100mm mount height
    occupantBelowRows: 0.5,
    occupantAboveRows: 0.5,
    occupantSideCols: 0.5, // standard eero unit is 99mm wide
    color: '#e2e8f0',
    description: 'Pegboard cradle bracket for Eero 6/6+ WiFi routers.',
    visualType: 'blueprint-item'
  },
  {
    id: 'print-steamdeck-dock',
    name: 'Steam Deck Dock Mount',
    category: 'holders',
    widthMm: 120,
    heightMm: 60,
    depthMm: 80,
    occupantDepthMm: 25,
    colsOccupied: 3, // 120mm mount width
    rowsOccupied: 3, // 60mm mount height
    occupantBelowRows: 0.5,
    occupantAboveRows: 3.5, // Steam Deck extends 70mm above
    occupantSideCols: 2.2, // Steam Deck is 298mm wide (extends 89mm left/right)
    color: '#0f172a',
    description: 'Cradle for the official Steam Deck dock, supporting the console horizontally.',
    visualType: 'blueprint-item'
  }
];
