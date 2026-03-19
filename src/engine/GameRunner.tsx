import { useState, useEffect, useCallback } from 'react';
import type { GameConfig, Puzzle, Dialog } from './types';
import { useGameState, checkCondition } from './hooks/useGameState';
import { useTimer } from './hooks/useTimer';
import { Room } from './components/Room';
import { Inventory } from './components/Inventory';
import { HUD } from './components/HUD';
import { PuzzleModal } from './components/PuzzleModal';
import { ExamineModal } from './components/ExamineModal';
import { MessageBox } from './components/MessageBox';
import { DialogModal } from './components/DialogModal';
import { GameClearModal } from './components/GameClearModal';
import './GameRunner.css';

interface Props {
  config: GameConfig;
  onExit: () => void;
}

export function GameRunner({ config, onExit }: Props) {
  const { state, dispatch, handleAction, checkClear } = useGameState(config);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [hintIndex, setHintIndex] = useState(0);
  const [activeDialog, setActiveDialog] = useState<Dialog | null>(null);

  const timer = useTimer(
    config.timeLimit,
    () => dispatch({ type: 'GAME_OVER' })
  );

  useEffect(() => {
    if (config.timeLimit > 0) timer.start();
  }, []);

  useEffect(() => {
    checkClear();
  }, [state.flags, state.inventory, state.solvedPuzzles]);

  useEffect(() => {
    if (state.isCleared || state.isFailed) timer.pause();
  }, [state.isCleared, state.isFailed]);

  const currentRoom = config.rooms.find(r => r.id === state.currentRoom)!;

  // 대화 열기
  const openDialog = useCallback((dialogId: string) => {
    const dialog = config.dialogs?.find(d => d.id === dialogId);
    if (dialog) setActiveDialog(dialog);
  }, [config.dialogs]);

  // 대화 완료
  const handleDialogComplete = useCallback((dialog: Dialog) => {
    // 대화 중 플래그 설정
    dialog.lines.forEach(line => {
      if (line.setFlag) {
        dispatch({ type: 'SET_FLAG', flagId: line.setFlag.flagId, value: line.setFlag.value });
      }
    });
    setActiveDialog(null);
  }, [dispatch]);

  // 방향 탐색
  const handleNavigate = useCallback((roomId: string) => {
    dispatch({ type: 'MOVE_ROOM', roomId });
  }, [dispatch]);

  const handlePuzzleSolve = useCallback((puzzleId: string) => {
    const puzzle = config.puzzles.find(p => p.id === puzzleId);
    if (!puzzle) return;

    dispatch({ type: 'SOLVE_PUZZLE', puzzleId });
    dispatch({ type: 'CLOSE_MODAL' });

    if (puzzle.solvedFlag) {
      dispatch({ type: 'SET_FLAG', flagId: puzzle.solvedFlag, value: true });
    }

    if (puzzle.reward) {
      if (puzzle.reward.itemId) {
        dispatch({ type: 'PICKUP_ITEM', itemId: puzzle.reward.itemId });
      }
      if (puzzle.reward.flagId) {
        dispatch({ type: 'SET_FLAG', flagId: puzzle.reward.flagId, value: puzzle.reward.flagValue ?? true });
      }
      // 보상 대화가 있으면 대화로, 아니면 메시지로
      if (puzzle.reward.text) {
        dispatch({ type: 'SHOW_MESSAGE', text: puzzle.reward.text });
      }
    }
  }, [config.puzzles, dispatch]);

  // dialog 타입 액션 처리
  const handleHotspotAction = useCallback((action: Parameters<typeof handleAction>[0]) => {
    if (action.type === 'dialog') {
      openDialog(action.dialogId);
    } else {
      handleAction(action);
    }
  }, [handleAction, openDialog]);

  const handleHint = useCallback(() => {
    const hints = config.hints?.filter(h =>
      !h.visibleWhen || checkCondition(h.visibleWhen, state)
    ) ?? [];
    if (hints.length === 0) {
      dispatch({ type: 'SHOW_MESSAGE', text: '현재 사용 가능한 힌트가 없습니다.' });
      return;
    }
    const currentHint = hints[0];
    const step = Math.min(hintIndex, currentHint.steps.length - 1);
    dispatch({ type: 'SHOW_MESSAGE', text: `💡 힌트: ${currentHint.steps[step]}` });
    dispatch({ type: 'USE_HINT' });
    setHintIndex(prev => prev + 1);
  }, [config.hints, state, hintIndex, dispatch]);

  const handleRestart = () => {
    dispatch({ type: 'RESET', config });
    timer.reset();
    if (config.timeLimit > 0) timer.start();
    setSelectedItem(null);
    setHintIndex(0);
    setActiveDialog(null);
  };

  const elapsed = Math.floor((Date.now() - state.startTime) / 1000);

  return (
    <div className="game-runner">
      <div className="game-runner__main">
        <HUD
          roomName={currentRoom.name}
          timer={config.timeLimit > 0 ? timer.formatted : undefined}
          onHint={config.hints && config.hints.length > 0 ? handleHint : undefined}
        />
        <Room
          room={currentRoom}
          state={state}
          onHotspotClick={handleHotspotAction}
          onShowMessage={(text) => dispatch({ type: 'SHOW_MESSAGE', text })}
          onNavigate={handleNavigate}
          onDialog={openDialog}
          selectedItem={selectedItem}
        />
      </div>

      <Inventory
        items={config.items}
        ownedIds={state.inventory}
        selectedItem={selectedItem}
        onSelectItem={setSelectedItem}
        onExamine={(itemId) => {
          const item = config.items.find(i => i.id === itemId);
          if (item) {
            dispatch({
              type: 'OPEN_MODAL',
              modal: { type: 'examine', text: item.description ?? item.name, image: item.icon },
            });
          }
        }}
      />

      {/* 대화 모달 (최우선) */}
      {activeDialog && (
        <DialogModal dialog={activeDialog} onComplete={handleDialogComplete} />
      )}

      {/* 메시지 박스 */}
      {!activeDialog && state.messageQueue.length > 0 && (
        <MessageBox
          text={state.messageQueue[0]}
          onDismiss={() => dispatch({ type: 'DISMISS_MESSAGE' })}
        />
      )}

      {/* 조사 모달 */}
      {state.activeModal?.type === 'examine' && (
        <ExamineModal
          text={state.activeModal.text}
          image={state.activeModal.image}
          onClose={() => dispatch({ type: 'CLOSE_MODAL' })}
        />
      )}

      {/* 퍼즐 모달 */}
      {state.activeModal?.type === 'puzzle' && (() => {
        const puzzleId = (state.activeModal as { type: 'puzzle'; puzzleId: string }).puzzleId;
        const puzzle = config.puzzles.find(p => p.id === puzzleId) as Puzzle | undefined;
        if (!puzzle) return null;
        if (state.solvedPuzzles.includes(puzzle.id)) {
          return (
            <ExamineModal
              text="이미 풀었던 퍼즐입니다."
              onClose={() => dispatch({ type: 'CLOSE_MODAL' })}
            />
          );
        }
        return (
          <PuzzleModal
            puzzle={puzzle}
            onSolve={handlePuzzleSolve}
            onClose={() => dispatch({ type: 'CLOSE_MODAL' })}
          />
        );
      })()}

      {/* 클리어 */}
      {state.activeModal?.type === 'game-clear' && (
        <GameClearModal
          title={config.title}
          message={config.clearMessage}
          elapsed={elapsed}
          hintsUsed={state.hintsUsed}
          onRestart={handleRestart}
          onLobby={onExit}
        />
      )}

      {/* 게임 오버 */}
      {state.activeModal?.type === 'game-over' && (
        <div className="modal-overlay">
          <div className="modal game-clear">
            <div className="game-clear__icon">⏰</div>
            <h2 className="game-clear__title">시간 초과!</h2>
            <p className="game-clear__subtitle">{config.title}</p>
            <div className="game-clear__actions">
              <button className="game-clear__btn game-clear__btn--retry" onClick={handleRestart}>다시 도전</button>
              <button className="game-clear__btn game-clear__btn--lobby" onClick={onExit}>로비로</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
