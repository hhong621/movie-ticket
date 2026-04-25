import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import Ticket from './components/Ticket'
import cocoPoster from './assets/coco-poster.jpg'
import creedPoster from './assets/creed-poster.jpg'
import devilPradaPoster from './assets/devil-wears-prada-poster.jpg'
import dunePoster from './assets/dune-part-two-poster.jpg'
import duneQR from './assets/dune-part-two-qr.png'
import kikisPoster from './assets/kikis-delivery-service-poster.jpg'
import moneyballPoster from './assets/moneyball-poster.jpg'
import moonlightPoster from './assets/moonlight-poster.jpg'
import pastLivesPoster from './assets/past-lives-poster.jpg'
import portraitPoster from './assets/portrait-poster.jpg'
import './App.css'
import { playItemClick, playPop, playUnmutePop } from './sound'

const TICKET_COUNT = 9
const DRAG_THRESHOLD_PX = 5
/** Fraction of usable canvas (minus ticket size) where tickets spawn; wider on small screens. */
const INITIAL_BAND_DESKTOP = 0.5
const INITIAL_BAND_MOBILE = 0.88
/** Viewport min edge (px) at or below this uses the mobile band. */
const INITIAL_BAND_MOBILE_MAX_EDGE = 640

function initialPlacementBand(cw, ch) {
  return Math.min(cw, ch) <= INITIAL_BAND_MOBILE_MAX_EDGE
    ? INITIAL_BAND_MOBILE
    : INITIAL_BAND_DESKTOP
}

const INITIAL_LAYOUT = [
  { xPct: 0.1, yPct: 0.12, rotation: -7.5 },
  { xPct: 0.38, yPct: 0.05, rotation: 4.2 },
  { xPct: 0.68, yPct: 0.15, rotation: -3.8 },
  { xPct: 0.04, yPct: 0.4, rotation: 6.1 },
  { xPct: 0.44, yPct: 0.38, rotation: -5.4 },
  { xPct: 0.7, yPct: 0.42, rotation: 3.6 },
  { xPct: 0.12, yPct: 0.68, rotation: -4.1 },
  { xPct: 0.36, yPct: 0.72, rotation: 7.2 },
  { xPct: 0.64, yPct: 0.65, rotation: -6.3 },
]

function parseCanvasScaleFromComputed(canvas) {
  const raw = getComputedStyle(canvas)
    .getPropertyValue('--ticket-canvas-scale')
    .trim()
  const n = parseFloat(raw)
  return Number.isFinite(n) && n > 0 ? n : 0.4
}

function App() {
  const [selectedIndex, setSelectedIndex] = useState(null)
  const [positions, setPositions] = useState(null)
  const [draggingIndex, setDraggingIndex] = useState(null)
  const [pressedIndex, setPressedIndex] = useState(null)
  const [hoveredIndex, setHoveredIndex] = useState(null)
  const [soundMuted, setSoundMuted] = useState(false)
  const [isDark, setIsDark] = useState(false)

  const canvasRef = useRef(null)
  const layoutSizeRef = useRef(null)
  const dragStateRef = useRef(null)

  useEffect(() => {
    if (selectedIndex === null) return
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setSelectedIndex(null)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [selectedIndex])

  useEffect(() => {
    if (isDark) {
      document.documentElement.dataset.theme = 'dark'
    } else {
      delete document.documentElement.dataset.theme
    }
  }, [isDark])

  const measureCanvas = (canvas) => {
    const scale = parseCanvasScaleFromComputed(canvas)
    const itemW = 320 * scale
    const itemH = 480 * scale
    return {
      scale,
      itemW,
      itemH,
      cw: canvas.clientWidth,
      ch: canvas.clientHeight,
    }
  }

  useLayoutEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const updateLayout = () => {
      const next = measureCanvas(canvas)
      const old = layoutSizeRef.current
      layoutSizeRef.current = next

      setPositions((prev) => {
        if (!prev) {
          const ux = Math.max(0, next.cw - next.itemW)
          const uy = Math.max(0, next.ch - next.itemH)
          const band = initialPlacementBand(next.cw, next.ch)
          const bandStart = (1 - band) / 2
          const bx = bandStart * ux
          const by = bandStart * uy
          const bw = band * ux
          const bh = band * uy
          return INITIAL_LAYOUT.map((L, i) => ({
            x: bx + L.xPct * bw,
            y: by + L.yPct * bh,
            rotation: L.rotation,
            z: i,
          }))
        }
        if (!old) return prev
        const denomW = old.cw - old.itemW
        const denomH = old.ch - old.itemH
        const wRatio = denomW > 0.5 ? (next.cw - next.itemW) / denomW : 1
        const hRatio = denomH > 0.5 ? (next.ch - next.itemH) / denomH : 1
        return prev.map((p) => ({
          ...p,
          x: p.x * wRatio,
          y: p.y * hRatio,
        }))
      })
    }

    const ro = new ResizeObserver(() => {
      updateLayout()
    })
    ro.observe(canvas)
    updateLayout()

    return () => {
      ro.disconnect()
    }
  }, [])

  const bumpZ = (index) => {
    setPositions((prev) => {
      if (!prev) return prev
      const nextZ = Math.max(0, ...prev.map((p) => p.z)) + 1
      const next = prev.slice()
      next[index] = { ...next[index], z: nextZ }
      return next
    })
  }

  const handlePointerDown = (e, i) => {
    if (e.button !== 0) return
    e.currentTarget.setPointerCapture(e.pointerId)
    if (!positions) return
    playItemClick(soundMuted)
    setPressedIndex(i)
    const p = positions[i]
    dragStateRef.current = {
      index: i,
      startX: e.clientX,
      startY: e.clientY,
      origX: p.x,
      origY: p.y,
      moved: false,
    }
  }

  const handlePointerMove = (e) => {
    const d = dragStateRef.current
    if (!d) return
    const dx = e.clientX - d.startX
    const dy = e.clientY - d.startY
    if (!d.moved && Math.hypot(dx, dy) > DRAG_THRESHOLD_PX) {
      d.moved = true
      setDraggingIndex(d.index)
      bumpZ(d.index)
    }
    if (d.moved) {
      setPositions((prev) => {
        if (!prev) return prev
        const next = prev.slice()
        const cur = next[d.index]
        next[d.index] = {
          ...cur,
          x: d.origX + dx,
          y: d.origY + dy,
        }
        return next
      })
    }
  }

  const finishPointer = (e, i) => {
    if (e.button === 0) {
      playItemClick(soundMuted)
    }
    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId)
      }
    } catch {
      // ignore
    }
    const d = dragStateRef.current
    dragStateRef.current = null
    setPressedIndex(null)
    setDraggingIndex(null)
    if (d && !d.moved) {
      setSelectedIndex(i)
    }
  }

  const handlePointerUp = (e, i) => {
    finishPointer(e, i)
  }

  const handlePointerCancel = (e, i) => {
    finishPointer(e, i)
  }

  const showtime = [
    {
      movieImg: cocoPoster,
      movieTitle: 'Coco',
      theaterName: 'Vista Theatre',
      dayOfWeek: 'Wed',
      date: 'Nov 22, 2017',
      time: '7:30 PM',
      audNumber: '2',
      seatNumber: 'J5',
      qrCodeImg: duneQR,
      qrCodeStr: 'APCMWOS',
      color1: '#F85509',
      color2: '#ffffff',
      color3: '#0973C0',
    },
    {
      movieImg: creedPoster,
      movieTitle: 'Creed',
      theaterName: 'Vista Theatre',
      dayOfWeek: 'Wed',
      date: 'Nov 25, 2015',
      time: '9:00 PM',
      audNumber: '1',
      seatNumber: 'D9',
      qrCodeImg: duneQR,
      qrCodeStr: 'MCNWGDT',
      color1: '#555555',
      color2: '#ffffff',
      color3: '#555555',
    },
    {
      movieImg: devilPradaPoster,
      movieTitle: 'The Devil Wears Prada',
      theaterName: 'Vista Theatre',
      dayOfWeek: 'Fri',
      date: 'June 30, 2006',
      time: '8:00 PM',
      audNumber: '3',
      seatNumber: 'I8',
      qrCodeImg: duneQR,
      qrCodeStr: 'QNVOSWP',
      color1: '#EF4401',
      color2: '#ffffff',
      color3: '#666666',
    },
    {
      movieImg: dunePoster,
      movieTitle: 'Dune: Part Two',
      theaterName: 'Vista Theatre',
      dayOfWeek: 'Fri',
      date: 'Mar 1, 2024',
      time: '10:00 PM',
      audNumber: '7',
      seatNumber: 'H11',
      qrCodeImg: duneQR,
      qrCodeStr: 'WRXBNRL',
      color1: '#F09926',
      color2: '#ffffff',
      color3: '#421D25',
    },
    {
      movieImg: kikisPoster,
      movieTitle: "Kiki's Delivery Service",
      theaterName: 'Vista Theatre',
      dayOfWeek: 'Thu',
      date: 'Dec 20, 1990',
      time: '5:15 PM',
      audNumber: '2',
      seatNumber: 'D6',
      qrCodeImg: duneQR,
      qrCodeStr: 'RMYXSAF',
      color1: '#188A6F',
      color2: '#ffffff',
      color3: '#3651A2',
    },
    {
      movieImg: moneyballPoster,
      movieTitle: 'Moneyball',
      theaterName: 'Vista Theatre',
      dayOfWeek: 'Fri',
      date: 'Sep 23, 2011',
      time: '9:00 PM',
      audNumber: '4',
      seatNumber: 'G12',
      qrCodeImg: duneQR,
      qrCodeStr: 'CWMXPOV',
      color1: '#003831',
      color2: '#ffffff',
      color3: '#9e750e',
    },
    {
      movieImg: moonlightPoster,
      movieTitle: 'Moonlight',
      theaterName: 'Vista Theatre',
      dayOfWeek: 'Fri',
      date: 'Oct 21, 2016',
      time: '10:30 PM',
      audNumber: '8',
      seatNumber: 'E13',
      qrCodeImg: duneQR,
      qrCodeStr: 'TBXFPWA',
      color1: '#6A76A6',
      color2: '#ffffff',
      color3: '#00FFF7',
    },
    {
      movieImg: pastLivesPoster,
      movieTitle: 'Past Lives',
      theaterName: 'Vista Theatre',
      dayOfWeek: 'Fri',
      date: 'June 2, 2023',
      time: '8:15 PM',
      audNumber: '5',
      seatNumber: 'F7',
      qrCodeImg: duneQR,
      qrCodeStr: 'APMCNWO',
      color1: '#737979',
      color2: '#ffffff',
      color3: '#405264',
    },
    {
      movieImg: portraitPoster,
      movieTitle: 'Portrait of a Lady on Fire',
      theaterName: 'Vista Theatre',
      dayOfWeek: 'Fri',
      date: 'Feb 14, 2020',
      time: '10:00 PM',
      audNumber: '1',
      seatNumber: 'C10',
      qrCodeImg: duneQR,
      qrCodeStr: 'VOPKLSF',
      color1: '#482B1B',
      color2: '#ffffff',
      color3: '#BE6A22',
    },
  ]

  const handleSoundToggle = () => {
    setSoundMuted((m) => {
      if (m) playUnmutePop()
      return !m
    })
  }

  const handleThemeToggle = () => {
    setIsDark((d) => !d)
  }

  return (
    <div className="ticket-app">
      <div className="ticket-app-chrome">
        <button
          type="button"
          className="ticket-chrome-btn ticket-theme-toggle"
          onClick={handleThemeToggle}
          onPointerUp={(e) => {
            if (e.button === 0) playPop(soundMuted)
          }}
          aria-pressed={isDark}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          <span
            className="material-symbols-rounded ticket-chrome-btn__icon"
            aria-hidden="true"
          >
            {isDark ? 'dark_mode' : 'light_mode'}
          </span>
        </button>
        <button
          type="button"
          className="ticket-chrome-btn ticket-sound-toggle"
          onClick={handleSoundToggle}
          aria-pressed={soundMuted}
          aria-label={soundMuted ? 'Unmute sounds' : 'Mute sounds'}
        >
          <span
            className="material-symbols-rounded ticket-chrome-btn__icon"
            aria-hidden="true"
          >
            {soundMuted ? 'no_sound' : 'volume_up'}
          </span>
        </button>
      </div>
      <div className="ticket-canvas" ref={canvasRef}>
        {Array.from({ length: TICKET_COUNT }, (_, i) => {
          const p = positions?.[i]
          if (!p) {
            return null
          }
          const rotationToNormal =
            hoveredIndex === i || pressedIndex === i || draggingIndex === i
          const rDeg = rotationToNormal ? 0 : p.rotation
          return (
            <button
              key={i}
              type="button"
              className={`ticket-canvas-item${
                pressedIndex === i ? ' is-pressed' : ''
              }${draggingIndex === i ? ' is-dragging' : ''}`}
              aria-label={`Open ticket ${i + 1}`}
              style={{
                left: p.x,
                top: p.y,
                zIndex: p.z,
                ['--r']: `${rDeg}deg`,
              }}
              onPointerEnter={() => setHoveredIndex(i)}
              onPointerLeave={() =>
                setHoveredIndex((h) => (h === i ? null : h))
              }
              onPointerDown={(e) => handlePointerDown(e, i)}
              onPointerMove={handlePointerMove}
              onPointerUp={(e) => handlePointerUp(e, i)}
              onPointerCancel={(e) => handlePointerCancel(e, i)}
            >
              <span className="ticket-canvas-scale">
                <Ticket
                  showtime={showtime[i]}
                  initialFlipped
                  interactive={false}
                />
              </span>
            </button>
          )
        })}
      </div>

      {selectedIndex !== null ? (
        <div className="ticket-modal" role="dialog" aria-modal="true">
          <div
            className="ticket-modal-scrim"
            onClick={() => setSelectedIndex(null)}
            aria-hidden="true"
          />
          <div
            className="ticket-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <Ticket
              key={selectedIndex}
              showtime={showtime[selectedIndex]}
              soundMuted={soundMuted}
            />
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default App
