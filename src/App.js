import React, { useState } from 'react';
import './App.css';

function App() {
  const [svgElements, setSvgElements] = useState([]); // stores parsed React-friendly SVG elements
  const [regionColors, setRegionColors] = useState({}); // maps element ids to colors
  const [selectedId, setSelectedId] = useState(null);

  // Handle SVG Upload & Parse into React elements
  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.includes('svg')) {
      alert('Please upload a valid SVG file');
      return;
    }

    const text = await file.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'image/svg+xml');

    // Get all shape elements we want to make clickable
    const shapeElements = doc.querySelectorAll('path, rect, circle, polygon');

    const newColors = {};
    const reactElements = Array.from(shapeElements).map((el, index) => {
      const id = el.id || `region-${index}`;
      const fill = el.getAttribute('fill') || '#cccccc';
      newColors[id] = fill;

      // Save the element type & its attributes
      return {
        id,
        type: el.tagName,
        props: {
          ...Object.fromEntries(Array.from(el.attributes).map((a) => [a.name, a.value])),
        },
      };
    });

    setSvgElements(reactElements);
    setRegionColors(newColors);
    setSelectedId(null);
  };

  // Change selected region's color
  const changeColor = (color) => {
    if (!selectedId) return;
    setRegionColors((prev) => ({
      ...prev,
      [selectedId]: color,
    }));
  };

  return (
    <div className="App" style={{ textAlign: 'center', padding: '1rem' }}>
      <h2>SVG Recoloring (React Way)</h2>
      <input type="file" accept=".svg" onChange={handleFileUpload} />

      {/* Render SVG if uploaded */}
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
            const Tag = type; // path, rect, etc.
            return (
              <Tag
                key={id}
                {...props}
                id={id}
                fill={regionColors[id]}
                stroke={selectedId === id ? 'black' : props.stroke}
                strokeWidth={selectedId === id ? 2 : props.strokeWidth}
                style={{ cursor: 'pointer' }}
                onClick={() => setSelectedId(id)}
              />
            );
          })}
        </svg>
      )}

      {/* Color Picker Buttons */}
      {selectedId && (
        <div style={{ marginTop: '1rem' }}>
          <p>Selected: {selectedId}</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
            {['#f87171', '#60a5fa', '#34d399', '#fbbf24', '#a78bfa'].map((color) => (
              <button
                key={color}
                onClick={() => changeColor(color)}
                style={{
                  width: 40,
                  height: 40,
                  backgroundColor: color,
                  border: '1px solid #333',
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
