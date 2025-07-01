import { useState } from 'react';
import './App.css';
import TicTacToe from './components/TicTacToe';
import WelcomeScreen from './components/WelcomeScreen';

function App() {
  const [showGame, setShowGame] = useState(false);

  return (
    <>
      {showGame ? <TicTacToe /> : <WelcomeScreen onPlay={() => setShowGame(true)} />}
    </>
  );
}

export default App;
