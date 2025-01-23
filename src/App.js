"use client";

import { useState, useEffect, useCallback } from "react";

function App() {
  const [rows, setRows] = useState(15);
  const [columns, setColumns] = useState(20);
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [paused, setPaused] = useState(false);
  const [colorDirection, setColorDirection] = useState(1);
  const [curColor, setCurColor] = useState(0);
  const [nextColor, setNextColor] = useState(0);
  const [count, setCount] = useState(0);
  const [speed, setSpeed] = useState(100);

  const colors = [
    { r: 32, g: 247, b: 0 }, // Bright Neon Green
    { r: 3, g: 252, b: 100 }, // Bright Neon Blue
    { r: 28, g: 255, b: 198 },
    { r: 28, g: 81, b: 255 },
    { r: 85, g: 28, b: 255 },
  ];

  // Handle count and color updates
  useEffect(() => {
    setCount((prev) => {
      const newCount = (prev + 1) % 6;

      if (newCount === 0) {
        setCurColor(nextColor);
        setNextColor((nextColor + 1) % colors.length);
      }

      return newCount;
    });
  }, [direction, nextColor, colors.length]);

  // Toggle color direction on count reset
  useEffect(() => {
    if (count === 0) {
      setColorDirection((prev) => (prev === 1 ? -1 : 1));
    }
  }, [count]);

  // Interpolate between colors
  const interpolateColor = useCallback(
    (color1, color2, factor) => ({
      r: Math.round(color1.r + factor * (color2.r - color1.r)),
      g: Math.round(color1.g + factor * (color2.g - color1.g)),
      b: Math.round(color1.b + factor * (color2.b - color1.b)),
    }),
    []
  );

  // Move active index and handle direction
  useEffect(() => {
    if (paused) return;

    const interval = setInterval(() => {
      setActiveIndex((prev) => {
        if (prev === columns - 1 && direction === 1) {
          setDirection(-1);
          return prev - 1;
        } else if (prev === 0 && direction === -1) {
          setDirection(1);
          return prev + 1;
        }
        return prev + direction;
      });
    }, speed);

    return () => clearInterval(interval);
  }, [paused, direction, columns, speed]);

  // Get color for each cell
  const getColor = useCallback(
    (i) => {
      const currentColor = colors[curColor];
      const headPosition = activeIndex + 3 * direction;
      const tailPosition = activeIndex - 2 * direction;
      const totalLength = 6;

      if (
        (direction > 0 && (i < tailPosition || i > headPosition)) ||
        (direction < 0 && (i > tailPosition || i < headPosition))
      ) {
        return "rgb(0, 0, 0)";
      }

      let brightness = 0.4;
      if (i !== activeIndex) {
        brightness = Math.max(
          0,
          direction > 0
            ? 1 - (headPosition - i) / totalLength
            : 1 - (i - headPosition) / totalLength
        );
      }

      if (colorDirection < 0) {
        const isInHeadRange =
          (direction > 0 && i >= headPosition - count && i <= headPosition) ||
          (direction < 0 && i >= headPosition && i <= headPosition + count);
        if (isInHeadRange) {
          const color = interpolateColor({ r: 0, g: 0, b: 0 }, colors[nextColor], brightness);
          return `rgb(${color.r}, ${color.g}, ${color.b})`;
        }
      } else {
        const isInTailRange =
          (direction > 0 && i >= tailPosition && i <= tailPosition + count) ||
          (direction < 0 && i >= tailPosition - count && i <= tailPosition);
        if (isInTailRange) {
          const color = interpolateColor({ r: 0, g: 0, b: 0 }, colors[nextColor], brightness);
          return `rgb(${color.r}, ${color.g}, ${color.b})`;
        }
      }

      const color = interpolateColor({ r: 0, g: 0, b: 0 }, currentColor, brightness);
      return `rgb(${color.r}, ${color.g}, ${color.b})`;
    },
    [activeIndex, direction, curColor, nextColor, colors, interpolateColor, colorDirection, count]
  );

  return (
    <div className="w-full h-screen bg-black flex flex-col items-center justify-center">
      <h1 className="text-neon text-4xl font-bold mb-4 text-white">Dynamic Grid</h1>
      <div className="flex items-center gap-4 mb-6">
        <input
          type="number"
          value={rows}
          onChange={(e) => setRows(Math.max(5, Number.parseInt(e.target.value) || 5))}
          placeholder="Rows"
          className="bg-gray-800 text-white px-4 py-2 rounded-lg focus:outline-none border border-neon focus:ring-4 focus:ring-neon"
        />
        <input
          type="number"
          value={columns}
          onChange={(e) => setColumns(Math.max(5, Number.parseInt(e.target.value) || 5))}
          placeholder="Columns"
          className="bg-gray-800 text-white px-4 py-2 rounded-lg focus:outline-none border border-neon focus:ring-4 focus:ring-neon"
        />
        <button
          onClick={() => setPaused(!paused)}
          className="bg-gray-800 text-white px-4 py-2 rounded-lg focus:outline-none border border-neon hover:scale-105 transition-all"
        >
          {paused ? "Resume" : "Pause"}
        </button>
        <div className="flex items-center">
          <label className="text-white mr-2">Speed:</label>
          <input
            type="range"
            min="50"
            max="500"
            step="10"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="w-24"
          />
          <span className="text-white ml-2">{speed} ms</span>
        </div>
      </div>
      <div className="grid-container bg-gray-900 p-2 rounded-lg shadow-lg overflow-hidden">
        {Array.from({ length: rows }).map((_, j) => (
          <div key={j} className="flex">
            {Array.from({ length: columns }).map((_, i) => (
              <div
                key={i}
                className="h-[30px] w-[30px] border border-gray-700 rounded-sm transition-all duration-150 hover:scale-110 shadow-lg"
                style={{
                  backgroundColor: getColor(i),
                  boxShadow: `0 0 5px ${getColor(i)}, 0 0 5px ${getColor(i)}`,
                }}
              ></div>
            ))}
          </div>
        ))}
      </div>
      <footer className="mt-6 text-white text-sm">
        Made by <span className="text-neon">Jai Soni</span> | Enrollment: <span className="text-neon">21100BTCSE09852</span>
      </footer>
    </div>
  );
}

export default App;
