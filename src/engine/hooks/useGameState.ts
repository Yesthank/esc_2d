import { useCallback, useReducer } from 'react';
import type { GameConfig, GameState, ModalState, Condition, HotspotAction } from '../types';

type Action =
  | { type: 'MOVE_ROOM'; roomId: string }
  | { type: 'PICKUP_ITEM'; itemId: string }
  | { type: 'REMOVE_ITEM'; itemId: string }
  | { type: 'SET_FLAG'; flagId: string; value: string | boolean }
  | { type: 'SOLVE_PUZZLE'; puzzleId: string }
  | { type: 'OPEN_MODAL'; modal: ModalState }
  | { type: 'CLOSE_MODAL' }
  | { type: 'SHOW_MESSAGE'; text: string }
  | { type: 'DISMISS_MESSAGE' }
  | { type: 'USE_HINT' }
  | { type: 'GAME_CLEAR' }
  | { type: 'GAME_OVER' }
  | { type: 'RESET'; config: GameConfig };

function createInitialState(config: GameConfig): GameState {
  return {
    currentRoom: config.startRoom,
    inventory: [],
    flags: {},
    solvedPuzzles: [],
    visitedRooms: [config.startRoom],
    hintsUsed: 0,
    startTime: Date.now(),
    isCleared: false,
    isFailed: false,
    activeModal: null,
    messageQueue: [],
  };
}

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'MOVE_ROOM':
      return {
        ...state,
        currentRoom: action.roomId,
        visitedRooms: state.visitedRooms.includes(action.roomId)
          ? state.visitedRooms
          : [...state.visitedRooms, action.roomId],
      };
    case 'PICKUP_ITEM':
      if (state.inventory.includes(action.itemId)) return state;
      return { ...state, inventory: [...state.inventory, action.itemId] };
    case 'REMOVE_ITEM':
      return { ...state, inventory: state.inventory.filter(id => id !== action.itemId) };
    case 'SET_FLAG':
      return { ...state, flags: { ...state.flags, [action.flagId]: action.value } };
    case 'SOLVE_PUZZLE':
      if (state.solvedPuzzles.includes(action.puzzleId)) return state;
      return { ...state, solvedPuzzles: [...state.solvedPuzzles, action.puzzleId] };
    case 'OPEN_MODAL':
      return { ...state, activeModal: action.modal };
    case 'CLOSE_MODAL':
      return { ...state, activeModal: null };
    case 'SHOW_MESSAGE':
      return { ...state, messageQueue: [...state.messageQueue, action.text] };
    case 'DISMISS_MESSAGE':
      return { ...state, messageQueue: state.messageQueue.slice(1) };
    case 'USE_HINT':
      return { ...state, hintsUsed: state.hintsUsed + 1 };
    case 'GAME_CLEAR':
      return { ...state, isCleared: true, activeModal: { type: 'game-clear' } };
    case 'GAME_OVER':
      return { ...state, isFailed: true, activeModal: { type: 'game-over' } };
    case 'RESET':
      return createInitialState(action.config);
    default:
      return state;
  }
}

export function checkCondition(condition: Condition, state: GameState): boolean {
  switch (condition.type) {
    case 'flag':
      return state.flags[condition.flagId!] === condition.value;
    case 'not-flag':
      return state.flags[condition.flagId!] !== condition.value;
    case 'item':
      return state.inventory.includes(condition.itemId!);
    case 'not-item':
      return !state.inventory.includes(condition.itemId!);
    case 'and':
      return (condition.conditions ?? []).every(c => checkCondition(c, state));
    case 'or':
      return (condition.conditions ?? []).some(c => checkCondition(c, state));
    default:
      return false;
  }
}

export function useGameState(config: GameConfig) {
  const [state, dispatch] = useReducer(reducer, config, createInitialState);

  const handleAction = useCallback((action: HotspotAction) => {
    switch (action.type) {
      case 'examine':
        dispatch({ type: 'OPEN_MODAL', modal: { type: 'examine', text: action.text, image: action.image } });
        break;
      case 'pickup':
        dispatch({ type: 'PICKUP_ITEM', itemId: action.itemId });
        if (action.text) dispatch({ type: 'SHOW_MESSAGE', text: action.text });
        break;
      case 'puzzle':
        dispatch({ type: 'OPEN_MODAL', modal: { type: 'puzzle', puzzleId: action.puzzleId } });
        break;
      case 'move':
        dispatch({ type: 'MOVE_ROOM', roomId: action.roomId });
        break;
      case 'dialog':
        dispatch({ type: 'OPEN_MODAL', modal: { type: 'dialog', dialogId: action.dialogId } });
        break;
      case 'trigger':
        dispatch({ type: 'SET_FLAG', flagId: action.flagId, value: action.value });
        if (action.text) dispatch({ type: 'SHOW_MESSAGE', text: action.text });
        break;
      case 'use-item':
        if (state.inventory.includes(action.requiredItem)) {
          dispatch({ type: 'REMOVE_ITEM', itemId: action.requiredItem });
          handleAction(action.successAction);
        } else {
          if (action.text) dispatch({ type: 'SHOW_MESSAGE', text: action.text });
        }
        break;
    }
  }, [state.inventory]);

  const checkClear = useCallback(() => {
    if (!state.isCleared && checkCondition(config.clearCondition, state)) {
      dispatch({ type: 'GAME_CLEAR' });
    }
  }, [config.clearCondition, state]);

  return { state, dispatch, handleAction, checkClear };
}
