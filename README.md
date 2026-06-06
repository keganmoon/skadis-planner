# 🛠️ IKEA Skadis Pegboard Layout Planner

A visual, scale-accurate 2D layout planning web application for organizing tools, electronics, and custom 3D-printed mounts on IKEA Skadis pegboards. Built with **React 19, Vite, and Tailwind CSS**.

---

## ✨ Key Features

*   **📏 Real-world Scaling & Snapping**: Emulates the exact physics of the IKEA Skadis system (alternating rows spaced at $20\text{mm}$, columns at $40\text{mm}$, with staggered peg offset rows). Dragged items snap perfectly to valid hole positions.
*   **🌌 2D Hanging Clearance Envelopes (Item Footprints)**: Visualizes the actual space that items (like headphones, cables, controllers, or keyboards) occupy on the pegboard, preventing you from placing items where things hang down. Clearances are calculated to precise millimeter specs rather than grid increments.
*   **🚨 Heatmap-Style 3D Depth Map**: Toggle to view 3D wall protrusion clearances (including the standard $20\text{mm}$ IKEA wall brackets offset). Items are color-coded by protrusion levels (teal for low profile, amber for medium, rose for high protrusion).
*   **📐 Wall Grid Tiling**: Tile multiple pegboards side-by-side or stacked vertically to model your entire desk or wall configuration. Calculates total dimensions automatically.
*   **🛒 Shopping List & Build Checklist**: Generates a grouped checklist of IKEA SKUs and automatically tags 3D-printable brackets (needs 3D printing vs. store-bought).
*   **💾 JSON Export/Import**: Export your completed layout to a lightweight `.json` configuration file to save or share.
*   **🛠️ Parametric Custom Placeholders**: Create custom container elements in columns/rows increments for items not in the catalog.
*   **🔍 Pan & Zoom Navigation**: Smooth mouse drag panning and mouse scroll-wheel zooming (from $30\%$ to $250\%$) for high-density boards.

---

## 📦 Built-In Catalog Accessories

*   **Standard IKEA Skadis Accessories**:
    *   Containers/Bins (Small, Medium, Long Tray)
    *   Hooks (Short, Long, Double)
    *   Shelves (Wooden Plate Shelf)
    *   Specialty Mounts (Roll Holder, Letter Holder, Clips)
*   **3D Printed Specialty mounts**:
    *   🎮 **Steam Controller Mount** (accurate $159\text{mm}$ width envelope, vertical clearance, and grip hang offsets)
    *   🎮 **Standard Controller Mount** (Xbox / PS5 / Switch Pro size envelope)
    *   🎮 **Steam Deck Dock Mount** (fits official dock and console horizontally with $298\text{mm}$ scale width envelope)
    *    **Apple TV 4K Mount** (cradle slot fitting $93\text{mm} \times 93\text{mm}$ device centered)
    *   📶 **Eero 6 Router Mount** (cradle fitting standard $99\text{mm}$ wide Eero 6 unit)
    *   🎧 **Headphone Hanger** (precise curved headset clearance envelope)
    *   ⚡ **Power Strip Holder** (cable margins and plug offsets)
    *   ⌨️ **Mechanical Keyboard Display Mount** (supports up to TKL $320\text{mm}$ wide display profiles)

---

## 🚀 Getting Started

### Local Development

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/yourusername/skadis-planner.git
    cd skadis-planner
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Start the development server**:
    ```bash
    npm run dev
    ```
    Open `http://localhost:5173/` in your browser.

4.  **Build for production**:
    ```bash
    npm run build
    ```

---

## 🐳 Self-Deployment

Since the application compiles to a static bundle, it can be deployed anywhere with zero server-side requirements.

### Option 1: Static Hosting (GitHub Pages / Vercel / Netlify)
Simply connect this repository to **Vercel** or **Netlify** with:
*   **Build Command**: `npm run build`
*   **Publish Directory**: `dist`

### Option 2: Docker Self-Hosting
You can host the compiled static assets using a lightweight Nginx container.

1. Create a `Dockerfile` in the root directory:
```dockerfile
# Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

2. Build and run the image:
```bash
docker build -t skadis-planner .
docker run -d -p 8080:80 skadis-planner
```
Open `http://localhost:8080/` to use your planner.

---

## 📂 Project Structure

```
skadis-planner/
├── src/
│   ├── assets/        # Global icons and assets
│   ├── App.jsx        # Main React logic, canvas, and layout rendering
│   ├── index.css      # Core styles and custom variables
│   ├── constants.js   # Catalog definitions and physical clearance values
│   └── main.jsx       # App initialization
├── public/            # Public static assets
├── index.html         # Main entry point
└── tailwind.config.js # CSS Framework configurations
```

---

## 📜 Customization & Adding Accessories
To add your own custom accessories or 3D prints, open src/constants.js and add an object to the `ACCESSORIES` array:
```javascript
{
  id: 'print-mytool',
  name: 'My Custom Holder',
  category: 'holders',
  widthMm: 80,
  heightMm: 60,
  depthMm: 50,
  occupantDepthMm: 15, // extra thickness of items in it
  colsOccupied: 2,     // grid column width snapped
  rowsOccupied: 3,     // grid row height snapped
  color: '#ff0000',
  description: 'A custom tool mount.',
  visualType: 'blueprint-item'
}
```
If you need millimetric clearance boundaries, map the ID in `getClearanceMm` inside src/App.jsx.

---

## 🤝 License
MIT License. Feel free to use, modify, and self-host!
