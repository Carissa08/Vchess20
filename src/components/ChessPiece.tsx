import React from 'react';

const pieces: Record<string, (color: string) => React.ReactElement> = {
  k: (c) => (
    <svg viewBox="0 0 45 45" className="w-full h-full">
      <g fill={c === 'w' ? '#fff' : '#000'} stroke={c === 'w' ? '#000' : '#fff'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22.5 11.63V6" strokeLinejoin="miter" />
        <path d="M20 8h5" strokeLinejoin="miter" />
        <path d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5" fill={c === 'w' ? '#fff' : '#000'} strokeLinecap="butt" strokeLinejoin="miter" />
        <path d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-6.5-13.5-3.5-16 4V17s-5.5-6-11 0c-3 6 5 10 5 10V37z" fill={c === 'w' ? '#fff' : '#000'} />
        <path d="M11.5 30c5.5-3 15.5-3 21 0M11.5 33.5c5.5-3 15.5-3 21 0M11.5 37c5.5-3 15.5-3 21 0" />
      </g>
    </svg>
  ),
  q: (c) => (
    <svg viewBox="0 0 45 45" className="w-full h-full">
      <g fill={c === 'w' ? '#fff' : '#000'} stroke={c === 'w' ? '#000' : '#fff'} strokeWidth="1.5" strokeLinejoin="round">
        <circle cx="6" cy="12" r="2.75" />
        <circle cx="14" cy="9" r="2.75" />
        <circle cx="22.5" cy="8" r="2.75" />
        <circle cx="31" cy="9" r="2.75" />
        <circle cx="39" cy="12" r="2.75" />
        <path d="M9 26c8.5-8.5 15.5-8.5 27 0l2.5-12.5L31 25l-.3-14.1-8.2 13.1-8.2-13.1L14 25 6.5 13.5 9 26z" strokeLinecap="butt" />
        <path d="M9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 1 16.5 1 23 0 0 0 1.5-1 0-2.5 0 0 .5-1.5-1-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0z" />
        <path d="M11 38.5a35 35 1 0 0 23 0" fill="none" strokeLinecap="butt" />
      </g>
    </svg>
  ),
  r: (c) => (
    <svg viewBox="0 0 45 45" className="w-full h-full">
      <g fill={c === 'w' ? '#fff' : '#000'} stroke={c === 'w' ? '#000' : '#fff'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 39h27v-3H9v3zM12 36v-4h21v4H12zM11 14V9h4v2h5V9h5v2h5V9h4v5" strokeLinejoin="miter" />
        <path d="M34 14l-3 3H14l-3-3" />
        <path d="M31 17v12.5H14V17" strokeLinejoin="miter" strokeLinecap="butt" />
        <path d="M31 29.5l1.5 2.5h-20l1.5-2.5" />
        <path d="M11 14h23" fill="none" strokeLinejoin="miter" />
      </g>
    </svg>
  ),
  b: (c) => (
    <svg viewBox="0 0 45 45" className="w-full h-full">
      <g fill={c === 'w' ? '#fff' : '#000'} stroke={c === 'w' ? '#000' : '#fff'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <g fill={c === 'w' ? '#fff' : '#000'} strokeLinecap="butt">
          <path d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.46-13.5-1-3.39 1.46-10.11.03-13.5 1-1.354.49-2.323.47-3-.5 1.354-1.94 3-2 3-2z" />
          <path d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z" />
          <path d="M25 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z" />
        </g>
        <path d="M17.5 26h10M15 30h15m-7.5-14.5v5M20 18h5" strokeLinejoin="miter" />
      </g>
    </svg>
  ),
  n: (c) => (
    <svg viewBox="0 0 45 45" className="w-full h-full">
      <g fill={c === 'w' ? '#fff' : '#000'} stroke={c === 'w' ? '#000' : '#fff'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21" fill={c === 'w' ? '#fff' : '#000'} />
        <path d="M24 18c.38 5.12-5.14 9.56-7 4-1-4.5-6-4.5-5-8.5 2.5-3.5 4.5-2 6.5-3 2-.5 3.5.5 5.5 1 .5 0 2.5 1 2 2z" fill={c === 'w' ? '#fff' : '#000'} />
        <path d="M9.5 25.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0z" fill={c === 'w' ? '#000' : '#fff'} stroke={c === 'w' ? '#000' : '#fff'} />
        <path d="M14.933 15.75a.5 1.5 30 1 1-.866-.5.5 1.5 30 0 1 .866.5z" fill={c === 'w' ? '#000' : '#fff'} stroke={c === 'w' ? '#000' : '#fff'} />
        <path d="M13 30h-6c0 7.5 8.5 10.5 13.5 10.5 5.5 0 13.5-3 13.5-10.5H30" fill={c === 'w' ? '#fff' : '#000'} />
      </g>
    </svg>
  ),
  p: (c) => (
    <svg viewBox="0 0 45 45" className="w-full h-full">
      <path
        d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03C15.41 27.09 13 29.35 13 32c0 1-.34 3.5 1.5 4.5h16c1.84-1 1.5-3.5 1.5-4.5 0-2.65-2.41-4.91-5.41-5.97C28.06 24.84 29 23.03 29 21c0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z"
        fill={c === 'w' ? '#fff' : '#000'}
        stroke={c === 'w' ? '#000' : '#fff'}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  ),
};

interface ChessPieceProps {
  type: string;
  color: string;
  className?: string;
}

export const ChessPiece: React.FC<ChessPieceProps> = ({ type, color, className = '' }) => {
  const render = pieces[type.toLowerCase()];
  if (!render) return null;
  return (
    <div className={`chess-piece select-none ${className}`} style={{ width: '88%', height: '88%' }}>
      {render(color)}
    </div>
  );
};

export default ChessPiece;
