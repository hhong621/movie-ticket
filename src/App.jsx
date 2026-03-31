import Ticket from './components/Ticket'
import dunePoster from './assets/dune-part-two-poster.jpg'
import duneQR from './assets/dune-part-two-qr.png'
import './App.css'

function App() {
  const showtime = {
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
  }

  return (
    <>
      <Ticket showtime={showtime} />
    </>
  )
}

export default App
