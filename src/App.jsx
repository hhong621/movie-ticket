import { useEffect, useState } from 'react'
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
import twilightPoster from './assets/twilight-poster.jpg'
import './App.css'

const GRID_SLOTS = 9

function App() {
  const [selectedIndex, setSelectedIndex] = useState(null)

  useEffect(() => {
    if (selectedIndex === null) return
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setSelectedIndex(null)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [selectedIndex])

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
      color1: '#199AD3',
      color2: '#F7459B',
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
      color1: '#ffffff',
      color2: '#000000',
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
      color1: '#571D1C',
      color2: '#CB2032',
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
      color1: '#CB662E',
      color2: '#FAAB34',
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
      color1: '#77BB88',
      color2: '#447FBB',
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
      color1: '#485D70',
      color2: '#8BA355',
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
      color1: '#00FFF5',
      color2: '#A0CFFB',
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
      color1: '#BDB3A9',
      color2: '#526174',
    },
    {
      movieImg: twilightPoster,
      movieTitle: 'Twilight',
      theaterName: 'Vista Theatre',
      dayOfWeek: 'Fri',
      date: 'Nov 21, 2008',
      time: '10:00 PM',
      audNumber: '1',
      seatNumber: 'C10',
      qrCodeImg: duneQR,
      qrCodeStr: 'VOPKLSF',
      color1: '#84AAAB',
      color2: '#000000',
    }
  ]

  return (
    <div className="ticket-app">
      <div className="ticket-grid">
        {Array.from({ length: GRID_SLOTS }, (_, i) => (
          <button
            key={i}
            type="button"
            className="ticket-grid-cell"
            aria-label={`Open ticket ${i + 1}`}
            onClick={() => setSelectedIndex(i)}
          >
            <span className="ticket-grid-scale">
              <Ticket
                showtime={showtime[i]}
                initialFlipped
                interactive={false}
              />
            </span>
          </button>
        ))}
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
            <Ticket key={selectedIndex} showtime={showtime[selectedIndex]} />
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default App
