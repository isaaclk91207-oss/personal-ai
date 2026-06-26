import { AlertTriangle, Trash2, RotateCcw, MessageSquare } from 'lucide-react';
import { SettingsCard } from './SettingsCard';
import { Button } from '../ui/Button';
import { Dialog } from '../ui/Dialog';
import { useState } from 'react';

interface DangerZoneProps {
  onClearChat: () => void;
  onClearMemories: () => void;
  onReset: () => void;
}

export function DangerZone({ onClearChat, onClearMemories, onReset }: DangerZoneProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogAction, setDialogAction] = useState<() => void>(() => {});
  const [dialogTitle, setDialogTitle] = useState('');
  const [dialogMessage, setDialogMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const confirmAction = (action: () => void, title: string, message: string) => {
    setDialogAction(() => action);
    setDialogTitle(title);
    setDialogMessage(message);
    setDialogOpen(true);
  };

  const handleConfirm = async () => {
    setLoading(true);
    await Promise.resolve(dialogAction());
    setLoading(false);
    setDialogOpen(false);
  };

  return (
    <>
      <SettingsCard
        title="Danger Zone"
        description="Irreversible actions that affect your assistant"
        className="border-error/20"
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 rounded-xl bg-error/5 border border-error/10">
            <div className="flex items-start gap-3">
              <MessageSquare size={18} className="text-error flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-text-primary">Clear All Chats</p>
                <p className="text-xs text-text-muted mt-0.5">Remove all conversation history</p>
              </div>
            </div>
            <Button
              variant="danger"
              size="sm"
              onClick={() =>
                confirmAction(
                  onClearChat,
                  'Clear all conversations?',
                  'This will permanently delete all your chat history. This action cannot be undone.'
                )
              }
            >
              <Trash2 size={14} />
              Clear
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-error/5 border border-error/10">
            <div className="flex items-start gap-3">
              <AlertTriangle size={18} className="text-error flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-text-primary">Clear All Memories</p>
                <p className="text-xs text-text-muted mt-0.5">Remove everything the AI remembers about you</p>
              </div>
            </div>
            <Button
              variant="danger"
              size="sm"
              onClick={() =>
                confirmAction(
                  onClearMemories,
                  'Clear all memories?',
                  'The AI will forget everything it knows about you. This action cannot be undone.'
                )
              }
            >
              <Trash2 size={14} />
              Clear
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-error/5 border border-error/10">
            <div className="flex items-start gap-3">
              <RotateCcw size={18} className="text-error flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-text-primary">Reset Assistant</p>
                <p className="text-xs text-text-muted mt-0.5">Reset all settings to their defaults</p>
              </div>
            </div>
            <Button
              variant="danger"
              size="sm"
              onClick={() =>
                confirmAction(
                  onReset,
                  'Reset assistant?',
                  'All settings will be restored to their defaults. Your chats and memories will be preserved.'
                )
              }
            >
              <RotateCcw size={14} />
              Reset
            </Button>
          </div>
        </div>
      </SettingsCard>

      <Dialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onConfirm={handleConfirm}
        title={dialogTitle}
        message={dialogMessage}
        confirmLabel="Yes, proceed"
        variant="danger"
        loading={loading}
      />
    </>
  );
}
