import React, { useRef, useState } from 'react';
import { HalftoneCmyk } from '@paper-design/shaders-react';

function canUsePointerHover() {
    return (
        typeof window !== 'undefined' &&
        window.matchMedia('(hover: hover) and (pointer: fine)').matches
    );
}

export default function Ticket({
    showtime,
    initialFlipped = false,
    interactive = true,
}) {
    let bounds;
    const inputRef = useRef();
    const glowRef = useRef();
    const knockoutRef = useRef();
    const [isFlipped, setIsFlipped] = useState(initialFlipped);

    const rotateToMouse = (e) => {
        if (!canUsePointerHover()) return;
        bounds = inputRef.current.getBoundingClientRect();
        const mouseX = e.clientX;
        const mouseY = e.clientY;
        const leftX = mouseX - bounds.x;
        const topY = mouseY - bounds.y;
        const center = {
            x: leftX - bounds.width / 2,
            y: topY - bounds.height / 2,
        };
        const rotateX = (center.y / bounds.height) * -20;
        const rotateTiltY = (center.x / bounds.width) * 20;

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

        const knockoutX = center.x * 2 + bounds.width / 2;
        const knockoutY = center.y * 2 + bounds.height / 2;

        knockoutRef.current.style.backgroundImage = `
        radial-gradient(
            circle at
            ${knockoutX}px
            ${knockoutY}px,
            #ffffff00,
            #ffffffee
        )
        `
    };

    const removeListener = () => {
        if (!canUsePointerHover()) return;
        inputRef.current.style.setProperty('--ticket-rotate-x', '0deg');
        inputRef.current.style.setProperty('--ticket-tilt-y', '0deg');
        inputRef.current.style.setProperty('--ticket-scale', '1');
        glowRef.current.style.backgroundImage = '';
        knockoutRef.current.style.backgroundImage = '';
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
        color1 = '',
        color2 = '',
    } = showtime || {};

    const pointerHandlers = interactive
        ? {
              onMouseLeave: removeListener,
              onMouseMove: rotateToMouse,
              onClick: toggleFlip,
          }
        : {};

    return (
        <div
            ref={inputRef}
            className={`ticket ${isFlipped ? 'flipped' : ''}`}
            {...pointerHandlers}
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
                    <div className='shape-layer holo'></div>
                    <div 
                        className='color-layer holo'
                        style={{
                            background: `linear-gradient(45deg, ${color1} 0%, ${color2} 100%)`
                        }}
                    >
                    </div>
                    <div className='mesh-layer holo'></div>
                    <div className='holo'>
                        <div className='knockout-layer'>
                            <div ref={knockoutRef} className='knockout'/>
                        </div>
                    </div>

                    <div className='details-header'>
                        <label className='theater-name'>{theaterName}</label>
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