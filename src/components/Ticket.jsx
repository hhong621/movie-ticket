import React, { useRef, useState } from 'react';
import { HalftoneCmyk } from '@paper-design/shaders-react';

export default function Ticket({ showtime }) {
    let bounds;
    const inputRef = useRef();
    const glowRef = useRef();
    const [isFlipped, setIsFlipped] = useState(false);

    const rotateToMouse = (e) => {
        bounds = inputRef.current.getBoundingClientRect();
        const mouseX = e.clientX;
        const mouseY = e.clientY;
        const leftX = mouseX - bounds.x;
        const topY = mouseY - bounds.y;
        const center = {
            x: leftX - bounds.width / 2,
            y: topY - bounds.height / 2,
        };
        const rotateX = (center.y / bounds.height) * -16;
        const rotateTiltY = (center.x / bounds.width) * 16;

        inputRef.current.style.setProperty('--ticket-rotate-x', `${rotateX}deg`);
        inputRef.current.style.setProperty('--ticket-tilt-y', `${rotateTiltY}deg`);
        inputRef.current.style.setProperty('--ticket-scale', '1.05');

        const glowX = center.x * 2 + bounds.width / 2;
        const glowY = center.y * 2 + bounds.height / 2;
        const adjustedGlowX = isFlipped ? bounds.width - glowX : glowX;

        glowRef.current.style.backgroundImage = `
        radial-gradient(
            circle at
            ${adjustedGlowX}px
            ${glowY}px,
            #ffffff55,
            #0000000f
        )
        `;
    };

    const removeListener = () => {
        inputRef.current.style.setProperty('--ticket-rotate-x', '0deg');
        inputRef.current.style.setProperty('--ticket-tilt-y', '0deg');
        inputRef.current.style.setProperty('--ticket-scale', '1');
        glowRef.current.style.backgroundImage = '';
    };

    const toggleFlip = () => {
        setIsFlipped((prev) => !prev);
    };

    const {
        movieImg = '',
        movieTitle = '',
        theaterName = '',
        dayOfWeek = '',
        date = '',
        time = '',
        audNumber = '',
        seatNumber = '',
        qrCodeImg = '',
        qrCodeStr = '',
    } = showtime || {};

    return (
        <div
            ref={inputRef}
            className={`ticket ${isFlipped ? 'flipped' : ''}`}
            onMouseLeave={removeListener}
            onMouseMove={rotateToMouse}
            onClick={toggleFlip}
        >
            <div ref={glowRef} className="glow" />
            <div className='ticket-face ticket-front'>
                <HalftoneCmyk
                    width={320}
                    height={480}
                    image={movieImg}
                    colorBack="#fbfaf4"
                    colorC="#00b3ff"
                    colorM="#fc4f9d"
                    colorY="#ffd900"
                    colorK="#231f20"
                    size={0.5}
                    gridNoise={0.2}
                    type="ink"
                    softness={1}
                    contrast={1}
                    floodC={0.15}
                    floodM={0}
                    floodY={0}
                    floodK={0}
                    gainC={0.3}
                    gainM={0}
                    gainY={0.2}
                    gainK={0}
                    grainMixer={0}
                    grainOverlay={0}
                    grainSize={0.5}
                    fit="cover"
                />
                <div className='qr-container'>
                    {qrCodeImg ? (
                        <img src={qrCodeImg} alt="QR Code" className='qr-code' />
                    ) : null}
                    <label className='qr-string'>{qrCodeStr}</label>
                </div>
                <div className='ticket-content'>
                    <div className='details-header'>
                        <label>{theaterName}</label>
                        <h2>{movieTitle}</h2>
                    </div>
                    
                    <div className='details-row'>
                        <div className='details-item'>
                            <label>DATE</label>
                            <p>{dayOfWeek}<br></br>{date}</p>
                        </div>

                        <div className='details-item'>
                            <label>TIME</label>
                            <p>{time}</p>
                        </div>
                    </div>

                    <div className='details-row'>
                        <div className='details-item'>
                            <label>AUDITORIUM</label>
                            <h3>{audNumber}</h3>
                        </div>

                        <div className='details-item'>
                            <label>SEAT</label>
                            <h3>{seatNumber}</h3>
                        </div>
                    </div>
                </div>
            </div>
            <div className='ticket-face ticket-back'>
                {movieImg ? (
                    <img src={movieImg} alt="Movie Poster" className='movie-poster' />
                ) : null}
            </div>
        </div>
    )
}