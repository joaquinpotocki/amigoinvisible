import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { loadGame, getAssignment } from '../utils/draw';
import type { Game } from '../types';

export default function PlayerPage() {
  const { gameId, playerId } = useParams<{ gameId: string; playerId: string }>();
  const [game, setGame] = useState<Game | null>(null);
  const [playerName, setPlayerName] = useState<string>('');
  const [secretFriend, setSecretFriend] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (!gameId || !playerId) {
      setNotFound(true);
      return;
    }
    const loadedGame = loadGame(gameId);
    if (!loadedGame) {
      setNotFound(true);
      return;
    }
    setGame(loadedGame);

    const participant = loadedGame.participants.find((p) => p.id === playerId);
    if (!participant) {
      setNotFound(true);
      return;
    }
    setPlayerName(participant.name);

    const friend = getAssignment(loadedGame, playerId);
    setSecretFriend(friend);
  }, [gameId, playerId]);

  function handleReveal() {
    setRevealed(true);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 4000);
  }

  if (notFound) {
    return (
      <div className="page-container">
        <div className="stars" aria-hidden="true">
          {Array.from({ length: 30 }).map((_, i) => (
            <span key={i} className="star" style={{ '--i': i } as React.CSSProperties} />
          ))}
        </div>
        <div className="card animate-fade-up">
          <div className="card__icon">😕</div>
          <h1 className="card__title">Enlace inválido</h1>
          <p className="card__subtitle">
            No encontramos este juego. Pedile al anfitrión que te reenvíe el enlace.
          </p>
          <Link to="/" className="btn btn--primary btn--large">
            Crear un juego nuevo
          </Link>
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="page-container">
        <div className="loading-spinner" aria-label="Cargando..." />
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="stars" aria-hidden="true">
        {Array.from({ length: 30 }).map((_, i) => (
          <span key={i} className="star" style={{ '--i': i } as React.CSSProperties} />
        ))}
      </div>

      {showConfetti && (
        <div className="confetti-container" aria-hidden="true">
          {Array.from({ length: 50 }).map((_, i) => (
            <span
              key={i}
              className="confetti-piece"
              style={{
                '--cx': `${Math.random() * 100}vw`,
                '--cy': `-${Math.random() * 20 + 10}px`,
                '--cr': `${Math.random() * 360}deg`,
                '--cd': `${Math.random() * 3}s`,
                '--cc': `hsl(${Math.random() * 360}, 80%, 60%)`,
              } as React.CSSProperties}
            />
          ))}
        </div>
      )}

      <div className="card animate-fade-up">
        <div className="card__icon">🎁</div>

        <p className="player-greeting">¡Hola, <strong>{playerName}</strong>!</p>
        <h1 className="card__title">Amigo Invisible</h1>
        <p className="card__subtitle">
          Tu amigo invisible ha sido sorteado.<br />
          ¿Estás listo para descubrirlo?
        </p>

        {!revealed ? (
          <button
            className="btn btn--primary btn--large btn--reveal"
            onClick={handleReveal}
            aria-label="Revelar mi amigo invisible"
          >
            <span className="btn__icon reveal-gift">🎁</span>
            ¡Revelar mi amigo invisible!
          </button>
        ) : (
          <div className="reveal-result animate-pop">
            <p className="reveal-label">Tu amigo invisible es…</p>
            <div className="reveal-name">
              <span className="reveal-emoji">🌟</span>
              {secretFriend}
              <span className="reveal-emoji">🌟</span>
            </div>
            <p className="reveal-hint">
              ¡Guardá el secreto! 🤫<br />
              Pensá en algo especial para regalarle.
            </p>
          </div>
        )}

        {game.hostName && (
          <p className="game-info">
            Juego organizado por <strong>{game.hostName}</strong>
          </p>
        )}
      </div>
    </div>
  );
}
