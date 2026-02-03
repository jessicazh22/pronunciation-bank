import React from 'react';
import { Star, Volume2, Check, X, Trash2 } from 'lucide-react';
import { Word } from '../../types';

interface WordTableProps {
  words: Word[];
  audioSources: Record<string, string>;
  editingNotes: string | null;
  onTogglePriority: (wordId: string) => void;
  onPlayAudio: (word: string, audioUrl: string) => void;
  onRecordPractice: (wordId: string, isCorrect: boolean) => void;
  onDeleteWord: (wordId: string) => void;
  onEditNotes: (wordId: string | null) => void;
  onUpdateNotes: (wordId: string, notes: string) => void;
}

const getAudioSourceLabel = (source: string): string => {
  const labels: Record<string, string> = {
    free_dictionary: 'Free Dict',
    elevenlabs: 'ElevenLabs',
    forvo: 'Forvo',
    voicerss: 'VoiceRSS',
    edge_tts: 'Edge TTS',
    google_tts: 'Google TTS',
    browser_tts: 'Browser',
  };
  return labels[source] || source;
};

const getAudioSourceTitle = (source: string): string => {
  const labels: Record<string, string> = {
    free_dictionary: 'Free Dictionary',
    elevenlabs: 'ElevenLabs',
    forvo: 'Forvo',
    voicerss: 'VoiceRSS',
    edge_tts: 'Edge TTS',
    google_tts: 'Google TTS',
    browser_tts: 'Browser TTS',
  };
  return labels[source] || source;
};

const WordTable: React.FC<WordTableProps> = ({
  words,
  audioSources,
  editingNotes,
  onTogglePriority,
  onPlayAudio,
  onRecordPractice,
  onDeleteWord,
  onEditNotes,
  onUpdateNotes,
}) => {
  if (words.length === 0) {
    return (
      <div className="bg-theme-card rounded-xl border border-theme p-16 text-center shadow-sm">
        <p className="text-theme-muted text-lg leading-relaxed">
          No words yet. Add your first word above!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-theme-card rounded-xl border border-theme overflow-hidden shadow-md">
      <table className="w-full">
        <thead className="bg-theme-accent border-b border-theme">
          <tr>
            <th
              className="px-4 py-4 text-left text-xs font-semibold text-theme-muted uppercase tracking-wider w-12"
              title="Priority"
            >
              <Star className="w-4 h-4" />
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-theme-muted uppercase tracking-wider">
              Word
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-theme-muted uppercase tracking-wider">
              Pronunciation
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-theme-muted uppercase tracking-wider w-12">
              Audio
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-theme-muted uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-theme-muted uppercase tracking-wider">
              Streak
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-theme-muted uppercase tracking-wider">
              Notes
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-theme-muted uppercase tracking-wider">
              Practice
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-theme-muted uppercase tracking-wider w-12"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--color-border)]">
          {words.map((word) => {
            const audioSource = audioSources[word.word.toLowerCase()];
            const hasAudio = word.audioUrl && word.audioUrl !== '';

            return (
              <tr key={word.id} className="hover:bg-theme-accent transition-colors">
                {/* Priority */}
                <td className="px-4 py-5">
                  <button
                    onClick={() => onTogglePriority(word.id)}
                    className={`p-2 rounded-lg transition-all ${
                      word.priority
                        ? 'text-theme-warning'
                        : 'text-theme-muted opacity-40 hover:opacity-70'
                    }`}
                    title={word.priority ? 'Remove priority' : 'Mark as priority'}
                  >
                    <Star className={`w-5 h-5 ${word.priority ? 'fill-current' : ''}`} />
                  </button>
                </td>

                {/* Word */}
                <td className="px-6 py-5">
                  <div className="text-lg font-semibold text-theme">{word.word}</div>
                </td>

                {/* Pronunciation */}
                <td className="px-6 py-5">
                  <div className="space-y-1.5">
                    <div
                      className="text-lg font-medium text-theme"
                      style={{ fontFamily: 'Georgia, serif' }}
                      title="IPA phonetic notation"
                    >
                      {word.phonetic}
                    </div>
                    <div className="font-mono text-theme-muted" title="Stress pattern (CAPS = stressed)">
                      {word.pattern}
                    </div>
                  </div>
                </td>

                {/* Audio */}
                <td className="px-6 py-5">
                  <div className="flex flex-col items-start gap-0.5">
                    <button
                      onClick={() => onPlayAudio(word.word, word.audioUrl)}
                      className={`p-2.5 rounded-xl transition-all shadow-sm hover:shadow-md ${
                        hasAudio
                          ? 'bg-theme-primary-light text-theme-primary hover:opacity-80'
                          : 'bg-theme-accent text-theme-muted opacity-50 cursor-not-allowed'
                      }`}
                      title={
                        hasAudio
                          ? audioSource
                            ? `Play (source: ${getAudioSourceTitle(audioSource)})`
                            : 'Play audio'
                          : 'No audio available - try refreshing'
                      }
                      disabled={!hasAudio}
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                    {hasAudio && audioSource && (
                      <span
                        className="text-[10px] text-theme-muted font-medium"
                        title="Where this word's audio came from"
                      >
                        {getAudioSourceLabel(audioSource)}
                      </span>
                    )}
                  </div>
                </td>

                {/* Status */}
                <td className="px-6 py-5">
                  <span
                    className={`inline-flex items-center px-4 py-2 rounded-full text-xs font-semibold border shadow-sm ${
                      word.status === 'learning'
                        ? 'bg-theme-error-light text-theme-error border-[var(--color-error)]'
                        : word.status === 'reviewing'
                        ? 'bg-theme-warning-light text-theme-warning border-[var(--color-warning)]'
                        : 'bg-theme-success-light text-theme-success border-[var(--color-success)]'
                    }`}
                  >
                    {word.status}
                  </span>
                </td>

                {/* Streak */}
                <td className="px-6 py-5">
                  <div className="font-semibold text-theme">{word.correctStreak} correct</div>
                  <div className="text-sm text-theme-muted mt-1">{word.practiceCount} total</div>
                </td>

                {/* Notes */}
                <td className="px-6 py-5">
                  {editingNotes === word.id ? (
                    <input
                      type="text"
                      defaultValue={word.notes}
                      onBlur={(e) => onUpdateNotes(word.id, e.target.value)}
                      onKeyPress={(e) =>
                        e.key === 'Enter' && onUpdateNotes(word.id, (e.target as HTMLInputElement).value)
                      }
                      autoFocus
                      className="w-full px-3 py-2 border border-[var(--color-primary)] rounded-lg bg-theme text-theme focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)]"
                      placeholder="Add notes..."
                    />
                  ) : (
                    <div
                      onClick={() => onEditNotes(word.id)}
                      className="text-theme-muted cursor-pointer hover:text-theme min-h-[20px] leading-relaxed"
                    >
                      {word.notes || <span className="opacity-50 italic">Click to add notes...</span>}
                    </div>
                  )}
                </td>

                {/* Practice */}
                <td className="px-6 py-5">
                  <div className="flex gap-2">
                    <button
                      onClick={() => onRecordPractice(word.id, true)}
                      className="p-2 bg-theme-success-light text-theme-success rounded-lg hover:opacity-80 transition-all shadow-sm"
                      title="Correct"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onRecordPractice(word.id, false)}
                      className="p-2 bg-theme-error-light text-theme-error rounded-lg hover:opacity-80 transition-all shadow-sm"
                      title="Incorrect"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </td>

                {/* Actions */}
                <td className="px-6 py-5">
                  <button
                    onClick={() => onDeleteWord(word.id)}
                    className="p-2 text-theme-muted hover:text-theme-error hover:bg-theme-error-light rounded-lg transition-all"
                    title="Delete word"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default WordTable;
