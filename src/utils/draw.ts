import type { Participant, Assignment, Game } from '../types';

export interface PlayerLinkData {
  playerName: string;
  secretFriend: string;
  hostName: string;
  priceLimit?: string;
}

/** Generates a random ID */
export function generateId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function toUrlSafeBase64(str: string): string {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function fromUrlSafeBase64(str: string): string {
  const padding = (4 - str.length % 4) % 4;
  const padded = str + '='.repeat(padding);
  return atob(padded.replace(/-/g, '+').replace(/_/g, '/'));
}

/** Encodes player assignment data into a URL-safe base64 string */
export function encodePlayerData(data: PlayerLinkData): string {
  return toUrlSafeBase64(encodeURIComponent(JSON.stringify(data)));
}

/** Decodes player assignment data from a URL-safe base64 string */
export function decodePlayerData(encoded: string): PlayerLinkData | null {
  try {
    return JSON.parse(decodeURIComponent(fromUrlSafeBase64(encoded))) as PlayerLinkData;
  } catch {
    return null;
  }
}

/**
 * Creates a derangement (permutation with no fixed points) using the shift method.
 * After a random shuffle, each person i is assigned person (i+1) % n.
 * This guarantees no one is assigned to themselves.
 */
export function drawSecretSanta(participants: Participant[]): Assignment[] {
  if (participants.length < 2) {
    throw new Error('Se necesitan al menos 2 participantes para sortear.');
  }

  // Fisher-Yates shuffle
  const shuffled = [...participants];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  // Shift by 1 → guaranteed derangement
  return shuffled.map((participant, index) => ({
    giverId: participant.id,
    receiverId: shuffled[(index + 1) % shuffled.length].id,
  }));
}

/** Saves a game to localStorage and returns it */
export function saveGame(game: Game): void {
  localStorage.setItem(`game_${game.id}`, JSON.stringify(game));
}

/** Loads a game from localStorage */
export function loadGame(gameId: string): Game | null {
  const raw = localStorage.getItem(`game_${gameId}`);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Game;
  } catch {
    return null;
  }
}

/** Returns the receiver name for a given giver in a game */
export function getAssignment(game: Game, giverId: string): string | null {
  const assignment = game.assignments.find((a) => a.giverId === giverId);
  if (!assignment) return null;
  const receiver = game.participants.find((p) => p.id === assignment.receiverId);
  return receiver?.name ?? null;
}
