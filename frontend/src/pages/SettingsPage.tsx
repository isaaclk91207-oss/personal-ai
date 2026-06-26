import { useEffect } from 'react';
import { SettingsCard } from '../components/settings/SettingsCard';
import { SettingsToggle } from '../components/settings/SettingsToggle';
import { SettingsSlider } from '../components/settings/SettingsSlider';
import { DangerZone } from '../components/settings/DangerZone';
import { Dropdown } from '../components/ui/Dropdown';
import { Textarea } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useSettingsStore } from '../store/settingsStore';
import { useChatStore } from '../store/chatStore';
import { useMemoryStore } from '../store/memoryStore';
import { useToastStore } from '../store/toastStore';
import { Save } from 'lucide-react';

const modelOptions = [
  { value: 'gpt-4', label: 'GPT-4 \u2014 Most capable' },
  { value: 'gpt-4-turbo', label: 'GPT-4 Turbo \u2014 Fast & smart' },
  { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo \u2014 Fast & efficient' },
  { value: 'claude-3-opus', label: 'Claude 3 Opus \u2014 Powerful' },
  { value: 'claude-3-sonnet', label: 'Claude 3 Sonnet \u2014 Balanced' },
];

const themeOptions = [
  { value: 'dark', label: 'Dark \u2014 Easy on the eyes' },
  { value: 'light', label: 'Light \u2014 Classic bright' },
];

export function SettingsPage() {
  const settings = useSettingsStore();
  const { clearAll: clearChats } = useChatStore();
  const { clearAll: clearMemories } = useMemoryStore();
  const { addToast } = useToastStore();

  useEffect(() => {
    settings.loadSettings();
  }, []);

  const handleSave = async () => {
    await settings.saveSettings();
    addToast({
      type: 'success',
      title: 'Settings saved',
      message: 'Your preferences have been updated',
    });
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
      <div className="px-6 py-6 border-b border-border-primary">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold text-text-primary">Settings</h1>
          <p className="text-sm text-text-muted mt-1">
            Customize your AI assistant experience
          </p>
        </div>
      </div>

      <div className="flex-1 px-6 py-6">
        <div className="max-w-3xl mx-auto space-y-6">
          <SettingsCard
            title="AI Model"
            description="Choose the AI model that powers your assistant"
          >
            <Dropdown
              label="Model"
              value={settings.model}
              onChange={settings.setModel}
              options={modelOptions}
            />
          </SettingsCard>

          <SettingsCard
            title="Temperature"
            description="Controls randomness in responses. Lower values are more focused, higher values are more creative."
          >
            <SettingsSlider
              label="Response Creativity"
              value={settings.temperature}
              onChange={settings.setTemperature}
              min={0}
              max={2}
              step={0.1}
            />
          </SettingsCard>

          <SettingsCard
            title="System Prompt"
            description="Instructions that define your assistant's behavior and personality"
          >
            <Textarea
              value={settings.systemPrompt}
              onChange={(e) => settings.setSystemPrompt(e.target.value)}
              rows={4}
              placeholder="Enter system prompt..."
            />
          </SettingsCard>

          <SettingsCard
            title="Memory Settings"
            description="Control how your assistant remembers information"
          >
            <SettingsToggle
              label="Enable Memory"
              description="Allow the AI to remember information about you across conversations"
              checked={settings.memoryEnabled}
              onChange={settings.setMemoryEnabled}
            />
            <div className="border-t border-border-primary my-1" />
            <SettingsToggle
              label="Auto-save Memories"
              description="Automatically save important information from conversations"
              checked={settings.autoSaveMemories}
              onChange={settings.setAutoSaveMemories}
            />
          </SettingsCard>

          <SettingsCard
            title="Appearance"
            description="Customize the look and feel of your assistant"
          >
            <Dropdown
              label="Theme"
              value={settings.theme}
              onChange={(val) => settings.setTheme(val as 'dark' | 'light')}
              options={themeOptions}
            />
          </SettingsCard>

          <div className="flex justify-end">
            <Button onClick={handleSave} size="lg" icon={<Save size={18} />}>
              Save Settings
            </Button>
          </div>

          <DangerZone
            onClearChat={async () => {
              await clearChats();
              addToast({ type: 'success', title: 'Chats cleared', message: 'All conversations have been deleted' });
            }}
            onClearMemories={async () => {
              await clearMemories();
              addToast({ type: 'success', title: 'Memories cleared', message: 'AI has forgotten everything' });
            }}
            onReset={() => {
              settings.resetAll();
              addToast({ type: 'success', title: 'Settings reset', message: 'All settings restored to defaults' });
            }}
          />

          <div className="h-8" />
        </div>
      </div>
    </div>
  );
}
