import React, { useEffect, useRef, useState } from 'react';
import './styles.css';


const themes = [
  {
    name: 'Neon',
    preview: [
      { bg: 'var(--dark-bg)', color: 'var(--neon-pink)', symbol: '✖️' },
      { bg: 'var(--dark-bg)', color: 'var(--neon-cyan)', symbol: '⭕' },
    ],
    gradient: 'linear-gradient(135deg, #ff2a6d, #05d9e8, #d300c5)'
  },
  {
    name: 'Nature',
    preview: [
      { bg: 'var(--nature-beige)', color: 'var(--nature-green)', symbol: '🌲' },
      { bg: 'var(--nature-beige)', color: 'var(--nature-red)', symbol: '🍎' },
    ],
    gradient: 'linear-gradient(135deg, #f5f5dc, #2e8b57, #d22b2b)'
  },
  {
    name: 'Retro',
    preview: [
      { bg: 'var(--retro-dark)', color: 'var(--retro-pink)', symbol: '🕹️' },
      { bg: 'var(--retro-dark)', color: 'var(--retro-yellow)', symbol: '🎮' },
    ],
    gradient: 'linear-gradient(135deg, #ff9ff3, #feca57, #1dd1a1)'
  }
];

const confettiEmojis = ['✨', '🎉', '🥳', '😺', '😎', '🦄', '🌈', '🍕', '🍀', '🎈', '⭐', '⚡', '💡', '🔥', '🧠', '👾', '💎', '🕹️', '🎮', '🏆'];

function Confetti() {
  const [pieces, setPieces] = useState([]);

  useEffect(() => {
    const newPieces = Array.from({ length: 40 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      duration: 2 + Math.random() * 2,
      delay: Math.random() * 2,
      emoji: confettiEmojis[Math.floor(Math.random() * confettiEmojis.length)]
    }));
    setPieces(newPieces);
  }, []);

  return (
    <div className="confetti">
      {pieces.map(piece => (
        <span
          key={piece.id}
          className="confetti-emoji"
          style={{
            left: `${piece.left}%`,
            animationDuration: `${piece.duration}s`,
            animationDelay: `${piece.delay}s`
          }}
        >{piece.emoji}</span>
      ))}
    </div>
  );
}

function ThemeCarousel() {
  const [idx, setIdx] = useState(0);
  const timeout = useRef(null);

  useEffect(() => {
    timeout.current = setTimeout(() => setIdx((i) => (i + 1) % themes.length), 2500);
    return () => clearTimeout(timeout.current);
  }, [idx]);

  const theme = themes[idx];
  return (
    <div className="theme-carousel" style={{ background: theme.gradient }}>
      <div className="theme-preview-title">Theme Preview: <b>{theme.name}</b></div>
      <div className="theme-preview-row">
        {theme.preview.map((p, i) => (
          <div
            key={i}
            className="theme-preview-cell"
            style={{ background: p.bg, color: p.color }}
          >
            <span style={{ fontSize: 36 }}>{p.symbol}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AboutSection() {
  const [showEasterEgg, setShowEasterEgg] = useState(false);
  return (
    <div className="about-section">
      <h2>About This Game</h2>
      <p>
        Hi! This is a simple Tic-Tac-Toe game you can play with a friend or against the computer. You can pick different themes and use your keyboard or mouse. Made just for fun by <b><a href="https://github.com/muffakiribnhamid">Muffakir</a></b> for <a href="https://hackclub.com">Hackclub</a>.
      </p>
      <button className="egg-btn" onClick={() => setShowEasterEgg(e => !e)}>
        {showEasterEgg ? "Hide Secret" : "Show Secret"}
      </button>
      {showEasterEgg && (
        <div className="easter-egg">
          <span role="img" aria-label="cat">🐱</span> Fun fact: The first computer game ever made was Tic-Tac-Toe in 1952!
        </div>
      )}
    </div>
  );
}

function HowToPlaySection() {
  const [showTips, setShowTips] = useState(false);
  return (
    <div className="howto-section">
      <h2>How to Play</h2>
      <ol>
        <li>Pick a theme and game mode.</li>
        <li>Click a square or use the arrow keys and Enter/Space to make a move.</li>
        <li>Get three in a row to win.</li>
        <li>You can play against a friend or the computer.</li>
      </ol>
      <button className="tips-btn" onClick={() => setShowTips(t => !t)}>
        {showTips ? "Hide Tips" : "Show Tips"}
      </button>
      {showTips && (
        <ul className="pro-tips">
          <li>You can undo your last move if you want.</li>
          <li>Change the theme whenever you like.</li>
          <li>The game works with keyboard and mouse.</li>
          <li>Your scores are saved until you reset them.</li>
        </ul>
      )}
    </div>
  );
}

function Footer() {
  const [showThanks, setShowThanks] = useState(false);
  return (
    <div className="welcome-footer">
      Made by Muffakir for Hackclub
      <button className="thanks-btn" onClick={() => setShowThanks(t => !t)}>
        {showThanks ? "Hide Thanks" : "Say Thanks!"}
      </button>
      {showThanks && (
        <div className="thanks-message">
          Thanks for checking out this game!
        </div>
      )}
    </div>
  );
}

export default function WelcomeScreen({ onPlay }) {
  // For fun: hidden Konami code easter egg
  const [konami, setKonami] = useState([]);
  const [showKonami, setShowKonami] = useState(false);
  const KCODE = [
    'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
    'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'
  ];
  useEffect(() => {
    const handler = (e) => {
      setKonami(k => {
        const next = [...k, e.key].slice(-KCODE.length);
        if (JSON.stringify(next) === JSON.stringify(KCODE)) {
          setShowKonami(true);
        }
        return next;
      });
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className="welcome-fullscreen">
      <Confetti />
      <div className="welcome-content">
        <h1 className="welcome-title">Tic-Tac-Toe</h1>
        <ThemeCarousel />
        <AboutSection />
        <HowToPlaySection />
        <button className="welcome-play-btn" onClick={onPlay}>Play</button>
        {showKonami && (
          <div className="konami-egg">
            <span role="img" aria-label="unicorn" style={{ fontSize: 48 }}>🦄</span>
            <div>You found the Konami Code! Unlimited luck to you!</div>
          </div>
        )}
        <Footer />
      </div>
    </div>
  );
}
