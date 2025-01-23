

import { useState, useEffect, useCallback } from "react"

function App() {
  const [rows, setRows] = useState(15)
  const [columns, setColumns] = useState(20)
  const [activeIndex, setActiveIndex] = useState(0)
  const [direction, setDirection] = useState(1)
  const [paused, setPaused] = useState(false) // Pause state
  const [colorDirection, setColorDirection] = useState(1) // Direction of color transition
  const [curColor, setCurColor] = useState(0)
  const [nextColor, setNextColor] = useState(0)
  const [count, setCount] = useState(0)
  const [speed, setSpeed] = useState(100) // Initial speed in milliseconds

  const colors = [
    { r: 32, g: 247, b: 0 }, // Bright Neon Green
    { r: 3, g: 252, b: 100 }, // Bright Neon Blue
    { r: 28, g: 255, b: 198 },
    { r: 28, g: 81, b: 255 }, // Bright Neon Purple
    { r: 85, g: 28, b: 255 },
  ]

  useEffect(() => {
    setCount((prev) => {
      const newCount = (prev + 1) % 6 // Increment count and reset after 5
      if (newCount === 5 && nextColor === 1) {
        setCurColor(2)
        setNextColor(2)
      }
      if (newCount === 0) {
        if (nextColor === colors.length - 1) {
          setCurColor(0)
          setNextColor(0)
        } else {

          setCurColor(nextColor)

          setNextColor((nextColor + 1) % colors.length)
        }
      }

      return newCount
    })
  }, [direction])

  useEffect(() => {
    if (count === 0) {
      setColorDirection((prev) => {
        // Only toggle direction after the first complete iteration
        if (curColor !== 0 || nextColor !== 1) {
          return prev === 1 ? -1 : 1
        }
        return prev
      })
    }
  }, [count, curColor, nextColor])

  const interpolateColor = useCallback((color1, color2, factor) => {
    return {
      r: Math.round(color1.r + factor * (color2.r - color1.r)),
      g: Math.round(color1.g + factor * (color2.g - color1.g)),
      b: Math.round(color1.b + factor * (color2.b - color1.b)),
    }
  }, [])

  useEffect(() => {
    if (paused) return // Pause movement
    const interval = setInterval(() => {
      setActiveIndex((prev) => {
        if (prev === columns - 1 && direction === 1) {
          setDirection(-1)
          return prev
        } else if (prev === 0 && direction === -1) {
          setDirection(1)
          return prev
        }
        return prev + direction
      })
    }, speed)

    return () => clearInterval(interval)
  }, [direction, columns, paused])

  const getColor = useCallback(
    (i) => {
      const currentColor = colors[curColor]
      const headPosition = activeIndex + 3 * direction
      const tailPosition = activeIndex - 2 * direction
      const totalLength = 6 // Total length of the colored part (5 + 1)

      if (
        (direction > 0 && (i < tailPosition || i > headPosition)) ||
        (direction < 0 && (i > tailPosition || i < headPosition))
      ) {
        return "rgb(0, 0, 0)" // Black for cells outside the snake
      }

      // Ensure the head is always bright
      let brightness = 0.4
      if (i !== activeIndex) {
        if (direction > 0) {
          brightness = Math.max(0, 1 - (headPosition - i) / totalLength)
        } else {
          brightness = Math.max(0, 1 - (i - headPosition) / totalLength)
        }
      }

      if (colorDirection < 0) {
        if (direction > 0) {
          if (i >= headPosition - count && i <= headPosition) {
            const color = interpolateColor({ r: 0, g: 0, b: 0 }, colors[nextColor], brightness)
            return `rgb(${color.r}, ${color.g}, ${color.b})`
          }
        } else {
          if (i >= headPosition && i <= headPosition + count) {
            const color = interpolateColor({ r: 0, g: 0, b: 0 }, colors[nextColor], brightness)
            return `rgb(${color.r}, ${color.g}, ${color.b})`
          }
        }
      } else {
        if (direction > 0) {
          if (i >= tailPosition && i <= tailPosition + count) {
            const color = interpolateColor({ r: 0, g: 0, b: 0 }, colors[nextColor], brightness)
            return `rgb(${color.r}, ${color.g}, ${color.b})`
          }
        } else {
          if (i >= tailPosition - count && i <= tailPosition) {
            const color = interpolateColor({ r: 0, g: 0, b: 0 }, colors[nextColor], brightness)
            return `rgb(${color.r}, ${color.g}, ${color.b})`
          }
        }
      }

      const color = interpolateColor({ r: 0, g: 0, b: 0 }, currentColor, brightness)
      return `rgb(${color.r}, ${color.g}, ${color.b})`
    },
    [activeIndex, direction, interpolateColor, colorDirection],
  )

  return (
    <div className="w-full h-screen bg-black flex flex-col items-center justify-center">
      <h1 className="text-neon text-4xl font-bold mb-4 text-white">Dynamic Grid (FOG-2)</h1>
      <div className="flex items-center gap-4 mb-6">
        <input
          type="number"
          value={rows}
          onChange={(e) => setRows(Math.max(5, Number.parseInt(e.target.value) || 5))} // Minimum rows: 5
          placeholder="Rows"
          className="bg-gray-800 text-white px-4 py-2 rounded-lg focus:outline-none border border-neon focus:ring-4 focus:ring-neon"
        />
        <input
          type="number"
          value={columns}
          onChange={(e) => setColumns(Math.max(5, Number.parseInt(e.target.value) || 5))} // Minimum columns: 5
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
            min="50" // Minimum speed
            max="500" // Maximum speed
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
        Made by <span className="text-neon">Jai Soni</span> | Enrollment:{" "}
        <span className="text-neon">21100BTCSE09852</span>
      </footer>
    </div>
  )
}

export default App

// ${i === activeIndex ? 'h-[40px] w-[40px]' : ''}

