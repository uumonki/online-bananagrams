export const MAX_PLAYERS = 5;
export const MIN_PLAYERS = 2;
export const TURN_TIMEOUT_MS = 30000;
export const INACTIVE_TURN_TIMEOUT_MS = 5000;
export const GAME_TIMEOUT_MS = 180000;

export const NICKNAME_REGEX = /^[a-zA-Z0-9]{1,16}$/; // 1-16 characters, alphanumeric

import letterFrequencyTable from './letterFrequencyTable';
export { letterFrequencyTable };
