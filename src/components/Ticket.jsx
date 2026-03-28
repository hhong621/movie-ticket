import React, { useEffect, useRef } from 'react';

export default function Ticket() {
    let bounds;
    const inputRef = useRef();
    const glowRef = useRef();

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
        const distance = Math.sqrt(center.x ** 2 + center.y ** 2);

        inputRef.current.style.transform = `
        scale3d(1.05, 1.05, 1.05)
        rotate3d(
            ${center.y / 100},
            ${-center.x / 100},
            0,
            ${Math.log(distance) * 2}deg
        )
        `;

        glowRef.current.style.backgroundImage = `
        radial-gradient(
            circle at
            ${center.x * 2 + bounds.width / 2}px
            ${center.y * 2 + bounds.height / 2}px,
            #ffffff55,
            #0000000f
        )
        `;
    };

    const removeListener = (e) => {
        inputRef.current.style.transform = '';
        inputRef.current.style.background = '';
    };

    return (
        <div
            ref={inputRef}
            className='ticket'
            onMouseLeave={removeListener}
            onMouseMove={rotateToMouse}
        >
            <div ref={glowRef} className="glow" />
            <div className='ticket-front'></div>
            <div className='ticket-back'></div>
        </div>
    )
}