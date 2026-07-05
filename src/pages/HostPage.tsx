import { useState, useRef } from 'react';
import { generateId, drawSecretSanta, saveGame, encodePlayerData } from '../utils/draw';
import type { Participant, Game } from '../types';

const HOST_PARTICIPANT_ID = 'host';

type Step = 'setup' | 'done';

export default function HostPage() {
  const [step, setStep] = useState<Step>('setup');
  const [hostName, setHostName] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [game, setGame] = useState<Game | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [isShuffling, setIsShuffling] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const effectiveHostName = hostName.trim() || 'Anfitrión';
  const hostParticipant: Participant = { id: HOST_PARTICIPANT_ID, name: effectiveHostName };
  const totalParticipants = participants.length + 1; // host always counts
  const canDraw = totalParticipants >= 2;

  function addParticipant() {
    const trimmed = nameInput.trim();
    if (!trimmed) return;
    if (trimmed.toLowerCase() === effectiveHostName.toLowerCase()) {
      setError('Ese nombre es el tuyo. Ya estás en el sorteo como anfitrión.');
      return;
    }
    if (participants.some((p) => p.name.toLowerCase() === trimmed.toLowerCase())) {
      setError('Ya existe un participante con ese nombre.');
      return;
    }
    setParticipants((prev) => [...prev, { id: generateId(), name: trimmed }]);
    setNameInput('');
    setError('');
    inputRef.current?.focus();
  }

  function removeParticipant(id: string) {
    setParticipants((prev) => prev.filter((p) => p.id !== id));
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') addParticipant();
  }

  async function handleDraw() {
    if (totalParticipants < 2) {
      setError('Necesitás al menos 2 participantes para sortear.');
      return;
    }
    setIsShuffling(true);
    await new Promise((r) => setTimeout(r, 1800));

    const allParticipants = [hostParticipant, ...participants];
    const assignments = drawSecretSanta(allParticipants);
    const newGame: Game = {
      id: generateId(),
      hostName: effectiveHostName,
      participants: allParticipants,
      assignments,
      createdAt: new Date().toISOString(),
    };
    saveGame(newGame);
    setGame(newGame);
    setStep('done');
    setIsShuffling(false);
  }

  function getPlayerLink(participantId: string) {
    if (!game) return '';
    const participant = game.participants.find((p) => p.id === participantId);
    if (!participant) return '';
    const assignment = game.assignments.find((a) => a.giverId === participantId);
    const receiver = assignment ? game.participants.find((p) => p.id === assignment.receiverId) : null;
    if (!receiver) return '';
    const encoded = encodePlayerData({
      playerName: participant.name,
      secretFriend: receiver.name,
      hostName: game.hostName,
    });
    const base = window.location.href.replace(/#.*$/, '');
    return `${base}#/jugar/${encoded}`;
  }

  async function copyLink(participantId: string) {
    const link = getPlayerLink(participantId);
    await navigator.clipboard.writeText(link);
    setCopiedId(participantId);
    setTimeout(() => setCopiedId(null), 2000);
  }

  if (step === 'done' && game) {
    return (
      <div className="page-container">
        <div className="stars" aria-hidden="true">
          {Array.from({ length: 30 }).map((_, i) => (
            <span key={i} className="star" style={{ '--i': i } as React.CSSProperties} />
          ))}
        </div>

        <div className="card card--wide animate-fade-up">
          <div className="card__icon">🎉</div>
          <h1 className="card__title">¡Sorteo listo!</h1>
          <p className="card__subtitle">
            Compartí el enlace personal a cada participante.<br />
            Cada uno verá <strong>solo</strong> su amigo invisible.
          </p>

          <div className="links-list">
            {game.participants.map((participant, index) => {
              const isHost = participant.id === HOST_PARTICIPANT_ID;
              return (
                <div
                  key={participant.id}
                  className={`link-item animate-fade-up${isHost ? ' link-item--host' : ''}`}
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  <div className="link-item__name">
                    <span className="link-item__emoji">{isHost ? '👑' : '🎁'}</span>
                    {participant.name}
                    {isHost && <span className="badge badge--host">anfitrión</span>}
                  </div>
                  <button
                    className={`btn btn--copy ${copiedId === participant.id ? 'btn--copied' : ''}`}
                    onClick={() => copyLink(participant.id)}
                    aria-label={`Copiar enlace de ${participant.name}`}
                  >
                    {copiedId === participant.id ? '✅ ¡Copiado!' : '📋 Copiar enlace'}
                  </button>
                </div>
              );
            })}
          </div>

          <p className="hint">
            💡 El link de cada persona es único y secreto. Solo ellos verán su amigo invisible.
          </p>
        </div>
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

      {isShuffling && (
        <div className="shuffle-overlay" aria-live="polite">
          <div className="shuffle-box">
            <div className="gift-spin">🎁</div>
            <p className="shuffle-text">Sorteando...</p>
            <div className="shuffle-dots">
              <span /><span /><span />
            </div>
          </div>
        </div>
      )}

      <div className="card card--wide animate-fade-up">
        <div className="card__icon">🎁</div>
        <h1 className="card__title">Amigo Invisible</h1>
        <p className="card__subtitle">
          Agregá los participantes y hacé el sorteo.<br />
          Cada uno recibirá su propio enlace secreto.
        </p>

        <div className="form-group">
          <label className="form-label" htmlFor="hostName">Tu nombre (anfitrión)</label>
          <input
            id="hostName"
            className="form-input"
            type="text"
            placeholder="Ej: Martín"
            value={hostName}
            onChange={(e) => setHostName(e.target.value)}
          />
        </div>

        <div className="divider" />

        <div className="form-group">
          <label className="form-label" htmlFor="participantName">
            Participantes ({totalParticipants})
          </label>
          <div className="input-row">
            <input
              id="participantName"
              ref={inputRef}
              className="form-input"
              type="text"
              placeholder="Nombre del participante"
              value={nameInput}
              onChange={(e) => {
                setNameInput(e.target.value);
                setError('');
              }}
              onKeyDown={handleKeyDown}
            />
            <button
              className="btn btn--add"
              onClick={addParticipant}
              disabled={!nameInput.trim()}
              aria-label="Agregar participante"
            >
              +
            </button>
          </div>
          {error && <p className="form-error">{error}</p>}
        </div>

        <ul className="participant-list" aria-label="Lista de participantes">
          <li className="participant-item participant-item--host animate-fade-up">
            <span className="participant-avatar">
              {effectiveHostName.charAt(0).toUpperCase()}
            </span>
            <span className="participant-name">
              {effectiveHostName}
              <span className="badge badge--host">anfitrión</span>
            </span>
          </li>
          {participants.map((p, index) => (
            <li
              key={p.id}
              className="participant-item animate-fade-up"
              style={{ animationDelay: `${(index + 1) * 50}ms` }}
            >
              <span className="participant-avatar">
                {p.name.charAt(0).toUpperCase()}
              </span>
              <span className="participant-name">{p.name}</span>
              <button
                className="btn btn--remove"
                onClick={() => removeParticipant(p.id)}
                aria-label={`Quitar a ${p.name}`}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>

        <button
          className="btn btn--primary btn--large"
          onClick={handleDraw}
          disabled={!canDraw || isShuffling}
        >
          <span className="btn__icon">🎲</span>
          ¡Sortear!
        </button>

      </div>
    </div>
  );
}
