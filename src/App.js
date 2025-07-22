import React, { useState } from 'react';
import './App.css';

function App() {
  const [svgElements, setSvgElements] = useState([]);
  const [regionColors, setRegionColors] = useState({});
  const [originalColors, setOriginalColors] = useState({});
  const [selectedColor, setSelectedColor] = useState(null);

  // ✅ Parse uploaded SVG into React-friendly elements
  const handleSVGUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.includes('svg')) {
      alert('Please upload a valid SVG file');
      return;
    }

    const text = await file.text();
    parseSVGString(text);
  };

  const parseSVGString = (svgString) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgString, 'image/svg+xml');
    const shapeElements = doc.querySelectorAll('path, rect, circle, polygon');

    const newRegionColors = {};
    const newOriginalColors = {};

    const reactElements = Array.from(shapeElements).map((el, index) => {
      const id = el.id || `region-${index}`;
      const fill = el.getAttribute('fill') || '#cccccc';

      newRegionColors[id] = fill;   // current colors
      newOriginalColors[id] = fill; // ✅ store original color permanently

      return {
        id,
        type: el.tagName,
        props: {
          ...Object.fromEntries(Array.from(el.attributes).map((a) => [a.name, a.value])),
        },
      };
    });

    setSvgElements(reactElements);
    setRegionColors(newRegionColors);
    setOriginalColors(newOriginalColors);
    setSelectedColor(null);
  };

  // ✅ When clicking a region, group by original color
  const handleRegionClick = (id) => {
    setSelectedColor(originalColors[id]);
  };

  // ✅ Change all regions that originally shared the selected color
  const changeColor = (newColor) => {
    if (!selectedColor) return;

    setRegionColors((prev) => {
      const updated = { ...prev };
      Object.keys(prev).forEach((regionId) => {
        if (originalColors[regionId] === selectedColor) {
          updated[regionId] = newColor;
        }
      });
      return updated;
    });

    setSelectedColor(null); // reset after change
  };

  return (
    <div className="App" style={{ textAlign: 'center', padding: '1rem' }}>
      <h2>SVG Recoloring (Grouped by Original Color)</h2>

      {/* File Upload */}
      <input type="file" accept=".svg" onChange={handleSVGUpload} />

      {/* Render SVG */}
      {svgElements.length > 0 && (
        <svg
          viewBox="0 0 300 300"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            border: '1px solid #ccc',
            marginTop: '1rem',
            width: 300,
            height: 300,
          }}
        >
          {svgElements.map(({ id, type, props }) => {
            const Tag = type;
            const currentColor = regionColors[id];
            return (
              <Tag
                key={id}
                {...props}
                id={id}
                fill={currentColor}
                stroke={selectedColor === originalColors[id] ? 'black' : props.stroke}
                strokeWidth={selectedColor === originalColors[id] ? 2 : props.strokeWidth}
                style={{ cursor: 'pointer' }}
                onClick={() => handleRegionClick(id)}
              />
            );
          })}
        </svg>
      )}

      {/* Color Picker Buttons */}
      {selectedColor && (
        <div style={{ marginTop: '1rem' }}>
          <p>Selected original color: {selectedColor}</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
            {['#f87171', '#60a5fa', '#34d399', '#fbbf24', '#a78bfa'].map((color) => (
              <button
                key={color}
                onClick={() => changeColor(color)}
                style={{
                  width: 40,
                  height: 40,
                  backgroundColor: color,
                  border:
                    selectedColor === color ? '2px solid black' : '1px solid #333',
                  cursor: 'pointer',
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
