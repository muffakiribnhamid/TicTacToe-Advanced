import { useState, useEffect, useRef } from 'react';
import './styles.css';
import moveSound from '../sounds/move.mp3';
import winSound from '../sounds/win.mp3';
import drawSound from '../sounds/draw.mp3';

const BOARD_SIZE = 3;
const KEY_MAP = {
  ArrowUp: -3,
  ArrowDown: 3,
  ArrowLeft: -1,
  ArrowRight: 1,
};

const THEMES = {
  neon: {
    xColor: 'var(--neon-pink)',
    oColor: 'var(--neon-cyan)',
    bg: 'var(--dark-bg)',
    text: 'var(--neon-purple)'
  },
  nature: {
    xColor: 'var(--nature-red)',
    oColor: 'var(--nature-green)',
    bg: 'var(--nature-beige)',
    text: 'var(--nature-brown)'
  },
  retro: {
    xColor: 'var(--retro-yellow)',
    oColor: 'var(--retro-blue)',
    bg: 'var(--retro-pink)',
    text: 'var(--retro-dark)'
  }
};

const initialScores = { x: 0, o: 0, ties: 0 };

const TicTacToe = () => {
  const moveAudio = useRef();
  const winAudio = useRef();
  const drawAudio = useRef();
  const [muted, setMuted] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [board, setBoard] = useState(() => {
    const saved = localStorage.getItem('ttt-board');
    return saved ? JSON.parse(saved) : Array(9).fill(null);
  });
  const [isXNext, setIsXNext] = useState(() => {
    const saved = localStorage.getItem('ttt-xnext');
    return saved ? JSON.parse(saved) : true;
  });
  const [gameHistory, setGameHistory] = useState([]);
  const [scores, setScores] = useState(() => {
    const saved = localStorage.getItem('ttt-scores');
    return saved ? JSON.parse(saved) : initialScores;
  });
  const [gameMode, setGameMode] = useState(() => localStorage.getItem('ttt-mode') || 'pvp');
  const [theme, setTheme] = useState(() => localStorage.getItem('ttt-theme') || 'neon');
  const [winner, setWinner] = useState(null);
  const [winningLine, setWinningLine] = useState([]);
  const [focused, setFocused] = useState(0);
  const boardRef = useRef();

  // Persist board, turn, scores, theme, mode
  useEffect(() => { localStorage.setItem('ttt-board', JSON.stringify(board)); }, [board]);
  useEffect(() => { localStorage.setItem('ttt-xnext', JSON.stringify(isXNext)); }, [isXNext]);
  useEffect(() => { localStorage.setItem('ttt-scores', JSON.stringify(scores)); }, [scores]);
  useEffect(() => { localStorage.setItem('ttt-theme', theme); }, [theme]);
  useEffect(() => { localStorage.setItem('ttt-mode', gameMode); }, [gameMode]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e) => {
      if (!boardRef.current) return;
      if (Object.keys(KEY_MAP).includes(e.key)) {
        setFocused((prev) => {
          let next = prev + KEY_MAP[e.key];
          if (e.key === 'ArrowLeft' && prev % 3 === 0) return prev;
          if (e.key === 'ArrowRight' && prev % 3 === 2) return prev;
          if (next < 0 || next > 8) return prev;
          return next;
        });
      } else if (e.key === 'Enter' || e.key === ' ') {
        handleSquareClick(focused);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
    // eslint-disable-next-line
  }, [focused, board, winner, isXNext]);

  // Animated background
  useEffect(() => {
    document.body.style.background =
      theme === 'neon' ? 'linear-gradient(135deg, #0f0f1a 0%, #23234e 100%)' :
      theme === 'nature' ? 'linear-gradient(135deg, #f5f5dc 0%, #a8e063 100%)' :
      'linear-gradient(135deg, #ff9ff3 0%, #1dd1a1 100%)';
    return () => { document.body.style.background = ''; };
  }, [theme]);

  const calculateWinner = (squares) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];

    for (let line of lines) {
      const [a, b, c] = line;
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        setWinningLine(line);
        return squares[a];
      }
    }
    return null;
  };

  const makeAiMove = () => {
    if (winner || !board.includes(null)) return;
    const emptyIndices = board.map((square, index) => square === null ? index : null).filter(val => val !== null);
    if (emptyIndices.length > 0) {
      const randomIndex = Math.floor(Math.random() * emptyIndices.length);
      handleSquareClick(emptyIndices[randomIndex]);
    }
  };

  useEffect(() => {
    if (gameMode === 'ai' && !isXNext && !winner) {
      const timer = setTimeout(makeAiMove, 500);
      return () => clearTimeout(timer);
    }
  }, [isXNext, winner, gameMode, winner, board]);

  const handleSquareClick = (index) => {
    if (board[index] || winner) return;
    setHasInteracted(true);
    const newBoard = [...board];
    newBoard[index] = isXNext ? 'X' : 'O';
    setGameHistory([...gameHistory, [...board]]);
    setBoard(newBoard);
    const gameWinner = calculateWinner(newBoard);
    if (gameWinner) {
      setWinner(gameWinner);
      setScores((prev) => ({
        ...prev,
        [gameWinner.toLowerCase()]: prev[gameWinner.toLowerCase()] + 1
      }));
    } else if (!newBoard.includes(null)) {
      setScores((prev) => ({ ...prev, ties: prev.ties + 1 }));
    }
    setIsXNext(!isXNext);
    setFocused(index);
  };

  // Play sounds on move, win, draw
  useEffect(() => {
    if (!hasInteracted || muted) return;
    if (moveAudio.current && gameHistory.length > 0 && !winner) {
      moveAudio.current.currentTime = 0;
      moveAudio.current.play();
    }
    if (winAudio.current && winner && winner !== 'draw') {
      winAudio.current.currentTime = 0;
      winAudio.current.play();
    }
    if (drawAudio.current && winner === 'draw') {
      drawAudio.current.currentTime = 0;
      drawAudio.current.play();
    }
  }, [board, winner, muted, hasInteracted, gameHistory.length]);


  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setWinner(null);
    setWinningLine([]);
    setIsXNext(true);
    setFocused(0);
  };

  const restartAll = () => {
    setScores(initialScores);
    setTheme('neon');
    setGameMode('pvp');
    resetGame();
    localStorage.clear();
  };


  const undoMove = () => {
    if (gameHistory.length === 0) return;
    const previousBoard = gameHistory[gameHistory.length - 1];
    setBoard(previousBoard);
    setGameHistory(gameHistory.slice(0, -1));
    setIsXNext(!isXNext);
    setWinner(null);
    setWinningLine([]);
    setFocused(previousBoard.findIndex((v, i) => v === null && board[i] !== null) || 0);
  };


  const renderSquare = (index) => {
    const isWinningSquare = winningLine.includes(index);
    const currentTheme = THEMES[theme];
    const isFocused = focused === index;
    return (
      <button
        className={`square ${isWinningSquare ? 'winning' : ''} ${isFocused ? 'focused' : ''}`}
        ref={isFocused ? boardRef : undefined}
        onClick={() => handleSquareClick(index)}
        tabIndex={isFocused ? 0 : -1}
        aria-label={`Cell ${index + 1}`}
        style={{
          color: board[index] === 'X' ? currentTheme.xColor : currentTheme.oColor,
          textShadow: isWinningSquare ? `0 0 10px ${board[index] === 'X' ? currentTheme.xColor : currentTheme.oColor}` : 'none',
          outline: isFocused ? `2.5px solid ${currentTheme.oColor}` : 'none',
          background: isWinningSquare ? '#fff2' : isFocused ? '#fff1' : 'transparent',
          transition: 'background 0.2s, outline 0.2s',
        }}
      >
        {board[index]}
      </button>
    );
  };


  const getStatusMessage = () => {
    if (winner) return `Winner: ${winner}`;
    if (!board.includes(null)) return 'Game ended in a tie!';
    return `Next player: ${isXNext ? 'X' : 'O'}`;
  };

  return (
    <div className="fullscreen-ttt-bg">
      <div className="game-container">
        <audio ref={moveAudio} src={moveSound} preload="auto" />
        <audio ref={winAudio} src={winSound} preload="auto" />
        <audio ref={drawAudio} src={drawSound} preload="auto" />
        <div className="theme-selector">
          <button onClick={() => setTheme('neon')} className={theme === 'neon' ? 'active' : ''}>Neon</button>
          <button onClick={() => setTheme('nature')} className={theme === 'nature' ? 'active' : ''}>Nature</button>
          <button onClick={() => setTheme('retro')} className={theme === 'retro' ? 'active' : ''}>Retro</button>
          <button className="mute-btn" onClick={() => setMuted((m) => !m)} aria-label={muted ? "Unmute" : "Mute"}>
            {muted ? "🔇" : "🔊"}
          </button>
        </div>
        <div className="game-mode">
          <button onClick={() => { setGameMode('pvp'); resetGame(); }} className={gameMode === 'pvp' ? 'active' : ''}>
            Player vs Player
          </button>
          <button onClick={() => { setGameMode('ai'); resetGame(); }} className={gameMode === 'ai' ? 'active' : ''}>
            Player vs AI
          </button>
        </div>
        <div className="status" style={{ color: THEMES[theme].text }}>
          {getStatusMessage()}
        </div>
        <div className="board" tabIndex={0} aria-label="Tic Tac Toe Board">
          {Array(9).fill(null).map((_, index) => (
            <div key={index} className="board-square">
              {renderSquare(index)}
            </div>
          ))}
        </div>
        <div className="controls">
          <button onClick={undoMove} disabled={gameHistory.length === 0}>Undo</button>
          <button onClick={resetGame}>Reset</button>
          <button onClick={restartAll} style={{marginLeft:'10px'}}>Restart All</button>
        </div>
        <div className="scoreboard" style={{ color: THEMES[theme].text }}>
          <div>X: {scores.x}</div>
          <div>O: {scores.o}</div>
          <div>Ties: {scores.ties}</div>
        </div>
      </div>
    </div>
  );
};

export default TicTacToe;