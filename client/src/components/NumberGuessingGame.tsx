import React, { useState } from 'react';
import toast from 'react-hot-toast';

interface Guess {
  number: string;
  correct: number; // correct position
  present: number; // correct digit, wrong position
}

interface GameState {
  phase: 'setup' | 'playing' | 'won';
  player1Secret: string;
  player2Secret: string;
  currentPlayer: 1 | 2;
  player1Input: string;
  player2Input: string;
  player1Guesses: Guess[];
  player2Guesses: Guess[];
  winner: 1 | 2 | null;
}

export const NumberGuessingGame: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    phase: 'setup',
    player1Secret: '',
    player2Secret: '',
    currentPlayer: 1,
    player1Input: '',
    player2Input: '',
    player1Guesses: [],
    player2Guesses: [],
    winner: null,
  });

  const validateNumber = (num: string): boolean => {
    return /^\d{4}$/.test(num) && num.length === 4;
  };

  const calculateFeedback = (guess: string, secret: string): Guess => {
    let correct = 0;
    let present = 0;
    const secretArr = secret.split('');
    const guessArr = guess.split('');
    const used = [false, false, false, false];

    // Check correct positions
    for (let i = 0; i < 4; i++) {
      if (guessArr[i] === secretArr[i]) {
        correct++;
        used[i] = true;
      }
    }

    // Check present but wrong position
    for (let i = 0; i < 4; i++) {
      if (guessArr[i] !== secretArr[i]) {
        for (let j = 0; j < 4; j++) {
          if (!used[j] && guessArr[i] === secretArr[j]) {
            present++;
            used[j] = true;
            break;
          }
        }
      }
    }

    return { number: guess, correct, present };
  };

  const startGame = () => {
    if (!validateNumber(gameState.player1Secret)) {
      toast.error('Player 1: Enter a valid 4-digit number');
      return;
    }
    if (!validateNumber(gameState.player2Secret)) {
      toast.error('Player 2: Enter a valid 4-digit number');
      return;
    }
    setGameState((prev) => ({
      ...prev,
      phase: 'playing',
      currentPlayer: 1,
    }));
    toast.success('Game started! Player 1 goes first 🎮');
  };

  const makeGuess = () => {
    const input = gameState.currentPlayer === 1 ? gameState.player1Input : gameState.player2Input;
    
    if (!validateNumber(input)) {
      toast.error('Enter a valid 4-digit number');
      return;
    }

    const secret = gameState.currentPlayer === 1 ? gameState.player2Secret : gameState.player1Secret;
    const feedback = calculateFeedback(input, secret);

    if (feedback.correct === 4) {
      setGameState((prev) => ({
        ...prev,
        phase: 'won',
        winner: prev.currentPlayer,
        ...(prev.currentPlayer === 1
          ? { player1Guesses: [...prev.player1Guesses, feedback] }
          : { player2Guesses: [...prev.player2Guesses, feedback] }),
      }));
      toast.success(`Player ${gameState.currentPlayer} wins! 🎉`);
      return;
    }

    setGameState((prev) => ({
      ...prev,
      ...(prev.currentPlayer === 1
        ? {
            player1Input: '',
            player1Guesses: [...prev.player1Guesses, feedback],
            currentPlayer: 2,
          }
        : {
            player2Input: '',
            player2Guesses: [...prev.player2Guesses, feedback],
            currentPlayer: 1,
          }),
    }));
  };

  const resetGame = () => {
    setGameState({
      phase: 'setup',
      player1Secret: '',
      player2Secret: '',
      currentPlayer: 1,
      player1Input: '',
      player2Input: '',
      player1Guesses: [],
      player2Guesses: [],
      winner: null,
    });
  };

  if (gameState.phase === 'setup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <h1 className="text-5xl font-bold text-center text-white mb-2">🔢 Number Quest</h1>
          <p className="text-center text-purple-200 mb-12">A 2-Player Number Guessing Game</p>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Player 1 Setup */}
            <div className="bg-gradient-to-br from-blue-800 to-blue-900 rounded-xl p-8 border-2 border-blue-500">
              <h2 className="text-2xl font-bold text-white mb-4">👤 Player 1</h2>
              <p className="text-blue-100 mb-4 text-sm">Choose your secret 4-digit number</p>
              <input
                type="password"
                maxLength="4"
                placeholder="••••"
                value={gameState.player1Secret}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  setGameState((prev) => ({ ...prev, player1Secret: val.slice(0, 4) }));
                }}
                className="w-full bg-blue-700 border-2 border-blue-400 rounded-lg px-6 py-4 text-white text-center text-3xl tracking-widest focus:outline-none focus:border-blue-300 transition placeholder-blue-500"
              />
              <p className="text-blue-200 text-xs mt-3">
                {gameState.player1Secret.length}/4 digits entered
              </p>
            </div>

            {/* Player 2 Setup */}
            <div className="bg-gradient-to-br from-pink-800 to-pink-900 rounded-xl p-8 border-2 border-pink-500">
              <h2 className="text-2xl font-bold text-white mb-4">👤 Player 2</h2>
              <p className="text-pink-100 mb-4 text-sm">Choose your secret 4-digit number</p>
              <input
                type="password"
                maxLength="4"
                placeholder="••••"
                value={gameState.player2Secret}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  setGameState((prev) => ({ ...prev, player2Secret: val.slice(0, 4) }));
                }}
                className="w-full bg-pink-700 border-2 border-pink-400 rounded-lg px-6 py-4 text-white text-center text-3xl tracking-widest focus:outline-none focus:border-pink-300 transition placeholder-pink-500"
              />
              <p className="text-pink-200 text-xs mt-3">
                {gameState.player2Secret.length}/4 digits entered
              </p>
            </div>
          </div>

          <button
            onClick={startGame}
            disabled={!validateNumber(gameState.player1Secret) || !validateNumber(gameState.player2Secret)}
            className="w-full mt-8 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-500 disabled:to-gray-600 text-white font-bold py-4 rounded-lg text-lg transition transform hover:scale-105"
          >
            🎮 Start Game
          </button>
        </div>
      </div>
    );
  }

  if (gameState.phase === 'won') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-emerald-900 to-teal-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-8xl mb-6 animate-bounce">🏆</div>
          <h1 className="text-5xl font-bold text-white mb-4">Player {gameState.winner} Wins!</h1>
          <p className="text-green-100 text-xl mb-8">Congratulations! You guessed the number!</p>
          
          <div className="bg-white/10 backdrop-blur rounded-xl p-8 mb-8 max-w-md mx-auto">
            <p className="text-green-200 mb-2">The secret number was:</p>
            <p className="text-5xl font-bold text-yellow-300 tracking-widest mb-4">
              {gameState.winner === 1 ? gameState.player2Secret : gameState.player1Secret}
            </p>
            <p className="text-green-200">Attempts: {gameState.winner === 1 ? gameState.player1Guesses.length : gameState.player2Guesses.length}</p>
          </div>

          <button
            onClick={resetGame}
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-4 px-8 rounded-lg text-lg transition transform hover:scale-105"
          >
            🔄 Play Again
          </button>
        </div>
      </div>
    );
  }

  // Playing phase
  const currentPlayerColor = gameState.currentPlayer === 1 ? 'blue' : 'pink';
  const currentPlayerBg = gameState.currentPlayer === 1 ? 'from-blue-800 to-blue-900' : 'from-pink-800 to-pink-900';
  const opponentSecret = gameState.currentPlayer === 1 ? gameState.player2Secret : gameState.player1Secret;
  const guesses = gameState.currentPlayer === 1 ? gameState.player1Guesses : gameState.player2Guesses;
  const input = gameState.currentPlayer === 1 ? gameState.player1Input : gameState.player2Input;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">🔢 Number Quest</h1>
          <div className={`inline-block bg-gradient-to-r ${currentPlayerBg} px-8 py-3 rounded-full border-2 ${currentPlayerColor === 'blue' ? 'border-blue-400' : 'border-pink-400'}`}>
            <p className="text-white font-bold text-lg">
              {currentPlayerColor === 'blue' ? '👤 Player 1' : '👤 Player 2'}'s Turn
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Player 1 Stats */}
          <div className="bg-blue-900/30 border-2 border-blue-500 rounded-xl p-6">
            <h3 className="text-xl font-bold text-blue-100 mb-4">Player 1 Attempts</h3>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {gameState.player1Guesses.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No attempts yet</p>
              ) : (
                gameState.player1Guesses.map((guess, idx) => (
                  <div key={idx} className="bg-gray-800 rounded-lg p-4 border border-blue-400">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-blue-300 tracking-widest">{guess.number}</span>
                      <div className="flex gap-3">
                        <div className="text-center">
                          <div className="text-lg font-bold text-green-400">🟢 {guess.correct}</div>
                          <p className="text-xs text-gray-400">Right pos</p>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-yellow-400">🟡 {guess.present}</div>
                          <p className="text-xs text-gray-400">Wrong pos</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Player 2 Stats */}
          <div className="bg-pink-900/30 border-2 border-pink-500 rounded-xl p-6">
            <h3 className="text-xl font-bold text-pink-100 mb-4">Player 2 Attempts</h3>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {gameState.player2Guesses.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No attempts yet</p>
              ) : (
                gameState.player2Guesses.map((guess, idx) => (
                  <div key={idx} className="bg-gray-800 rounded-lg p-4 border border-pink-400">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-pink-300 tracking-widest">{guess.number}</span>
                      <div className="flex gap-3">
                        <div className="text-center">
                          <div className="text-lg font-bold text-green-400">🟢 {guess.correct}</div>
                          <p className="text-xs text-gray-400">Right pos</p>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-yellow-400">🟡 {guess.present}</div>
                          <p className="text-xs text-gray-400">Wrong pos</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Input Area */}
        <div className={`mt-8 bg-gradient-to-r ${currentPlayerBg} rounded-xl p-8 border-2 ${currentPlayerColor === 'blue' ? 'border-blue-400' : 'border-pink-400'}`}>
          <p className="text-gray-300 mb-4 text-center">Guess the opponent's number:</p>
          <div className="flex gap-4">
            <input
              type="text"
              maxLength="4"
              placeholder="0000"
              value={input}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '');
                setGameState((prev) =>
                  gameState.currentPlayer === 1
                    ? { ...prev, player1Input: val.slice(0, 4) }
                    : { ...prev, player2Input: val.slice(0, 4) }
                );
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && input.length === 4) makeGuess();
              }}
              className="flex-1 bg-white/20 border-2 border-white/30 rounded-lg px-6 py-4 text-white text-center text-4xl tracking-widest focus:outline-none focus:border-white transition placeholder-white/50"
            />
            <button
              onClick={makeGuess}
              disabled={input.length !== 4}
              className="bg-white/20 hover:bg-white/30 disabled:bg-gray-600 text-white font-bold py-4 px-8 rounded-lg transition border-2 border-white/30 hover:border-white"
            >
              ✓ Guess
            </button>
          </div>
          <p className="text-white/70 text-xs mt-3 text-center">{input.length}/4 digits</p>
        </div>

        {/* Info */}
        <div className="mt-8 bg-white/5 backdrop-blur rounded-xl p-6 border border-white/10">
          <p className="text-gray-300 text-center">
            <span className="text-green-400">🟢 Right Position</span> = Correct digit in correct spot<br/>
            <span className="text-yellow-400">🟡 Wrong Position</span> = Correct digit in wrong spot
          </p>
        </div>
      </div>
    </div>
  );
};

export default NumberGuessingGame;