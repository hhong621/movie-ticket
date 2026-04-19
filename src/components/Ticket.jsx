import React, { useCallback, useMemo, useRef, useState } from 'react';
import { HalftoneCmyk } from '@paper-design/shaders-react';
import {
    applyTicketHoloCssVars,
    buildLayerABBackground,
    buildLayerCBackground,
} from '../holoSettings';
import { mergeShowtimeIntoSettings } from '../ticketHoloSettings';
import './TicketHolo.css';

function canUsePointerHover() {
    return (
        typeof window !== 'undefined' &&
        window.matchMedia('(hover: hover) and (pointer: fine)').matches
    );
}

function blendMode(mode) {
    return mode === 'normal' ? 'normal' : mode;
}

export default function Ticket({
    showtime,
    initialFlipped = false,
    interactive = true,
}) {
    let bounds;
    const inputRef = useRef();
    const glowRef = useRef();
    const holoRef = useRef(null);
    const [isFlipped, setIsFlipped] = useState(initialFlipped);
    const [holoPointer, setHoloPointer] = useState({ mx: 0.5, my: 0.5 });
    const [holoHovered, setHoloHovered] = useState(false);

    const holoSettings = useMemo(
        () => mergeShowtimeIntoSettings(showtime),
        [showtime],
    );

    const holoMove = useCallback(
        (e) => {
            if (!holoSettings.global.pointerTracking) return;
            const el = holoRef.current;
            if (!el) return;
            const r = el.getBoundingClientRect();
            const mx = (e.clientX - r.left) / r.width;
            const my = (e.clientY - r.top) / r.height;
            setHoloPointer({
                mx: Math.min(1, Math.max(0, mx)),
                my: Math.min(1, Math.max(0, my)),
            });
        },
        [holoSettings.global.pointerTracking],
    );

    const holoEnter = useCallback(() => setHoloHovered(true), []);

    const holoLeave = useCallback(() => {
        setHoloHovered(false);
        setHoloPointer({ mx: 0.5, my: 0.5 });
    }, []);

    const holoWrapStyle = useMemo(
        () => applyTicketHoloCssVars(holoSettings.global, holoPointer),
        [holoSettings.global, holoPointer],
    );

    const bgA = useMemo(
        () =>
            buildLayerABBackground(
                holoPointer.mx,
                holoPointer.my,
                holoSettings.layerA,
            ),
        [holoPointer.mx, holoPointer.my, holoSettings.layerA],
    );
    const bgB = useMemo(
        () =>
            buildLayerABBackground(
                holoPointer.mx,
                holoPointer.my,
                holoSettings.layerB,
            ),
        [holoPointer.mx, holoPointer.my, holoSettings.layerB],
    );
    const bgC = useMemo(
        () =>
            buildLayerCBackground(
                holoPointer.mx,
                holoPointer.my,
                holoSettings.layerC,
            ),
        [holoPointer.mx, holoPointer.my, holoSettings.layerC],
    );

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
    };

    const removeListener = () => {
        if (!canUsePointerHover()) return;
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

    const handleTicketMouseMove = (e) => {
        if (interactive) rotateToMouse(e);
        holoMove(e);
    };

    const handleTicketMouseLeave = () => {
        if (interactive) removeListener();
        holoLeave();
    };

    return (
        <div
            ref={inputRef}
            className={`ticket ${isFlipped ? 'flipped' : ''}`}
            onMouseEnter={holoEnter}
            onMouseLeave={handleTicketMouseLeave}
            onMouseMove={handleTicketMouseMove}
            {...(interactive ? { onClick: toggleFlip } : {})}
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
                    <div
                        ref={holoRef}
                        className='ticket-holo'
                        style={holoWrapStyle}
                    >
                        <div className='ticket-holo__base' aria-hidden />
                        {holoSettings.layerA.enabled ? (
                            <div
                                className={`ticket-holo__layer ticket-holo__layer--a${holoSettings.layerA.animateHue ? ' ticket-holo__layer--hue' : ''}`}
                                style={{
                                    '--holo-hue-dur': `${holoSettings.layerA.animationDurationMs}ms`,
                                    opacity: holoHovered
                                        ? holoSettings.layerA.opacity
                                        : 0,
                                    backgroundImage: bgA,
                                    mixBlendMode: blendMode(
                                        holoSettings.layerA.mixBlendMode,
                                    ),
                                }}
                                aria-hidden
                            />
                        ) : null}
                        {holoSettings.layerB.enabled ? (
                            <div
                                className={`ticket-holo__layer ticket-holo__layer--b${holoSettings.layerB.animateHue ? ' ticket-holo__layer--hue' : ''}`}
                                style={{
                                    '--holo-hue-dur': `${holoSettings.layerB.animationDurationMs}ms`,
                                    opacity: holoHovered
                                        ? holoSettings.layerB.opacity
                                        : 0,
                                    backgroundImage: bgB,
                                    mixBlendMode: blendMode(
                                        holoSettings.layerB.mixBlendMode,
                                    ),
                                }}
                                aria-hidden
                            />
                        ) : null}
                        {holoSettings.layerC.enabled ? (
                            <div
                                className='ticket-holo__layer ticket-holo__layer--c'
                                style={{
                                    opacity: holoHovered
                                        ? holoSettings.layerC.opacity
                                        : 0,
                                    backgroundImage: bgC,
                                    mixBlendMode: blendMode(
                                        holoSettings.layerC.mixBlendMode,
                                    ),
                                }}
                                aria-hidden
                            />
                        ) : null}
                    </div>

                    <div className='ticket-content__foreground'>
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
            </div>
            <div className='ticket-face ticket-back'>
                {movieImg ? (
                    <img src={movieImg} alt="Movie Poster" className='movie-poster' />
                ) : null}
            </div>
        </div>
    )
}
