import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { decodePlayerData } from '../utils/draw';
import type { PlayerLinkData } from '../utils/draw';

export default function PlayerPage() {
  const { encoded } = useParams<{ encoded: string }>();
  const [data, setData] = useState<PlayerLinkData | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (!encoded) {
      setNotFound(true);
      return;
    }
    const decoded = decodePlayerData(encoded);
    if (!decoded || !decoded.playerName || !decoded.secretFriend) {
      setNotFound(true);
      return;
    }
    setData(decoded);
  }, [encoded]);

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

  if (!data) {
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

        <p className="player-greeting">¡Hola, <strong>{data.playerName}</strong>!</p>
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
              {data.secretFriend}
              <span className="reveal-emoji">🌟</span>
            </div>
            <p className="reveal-hint">
              ¡Guardá el secreto! 🤫<br />
              Pensá en algo especial para regalarle.
            </p>
          </div>
        )}

        {data.hostName && (
          <p className="game-info">
            Juego organizado por <strong>{data.hostName}</strong>
          </p>
        )}
      </div>
    </div>
  );
}
