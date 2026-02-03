import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { usePronunciationBank } from './usePronunciationBank';
import {
  StatsDisplay,
  PracticeBanner,
  AddWordInput,
  WordTable,
  HelpSection,
} from './components';
import UserSelector from '../components/UserSelector';
import PracticeSession from '../practice-session';
import { useTheme } from '../theme/ThemeContext';

const PronunciationBank: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const {
    // State
    currentUserId,
    isLockedUser,
    words,
    isLoading,
    isAdding,
    newWord,
    showSuggestions,
    filteredSuggestions,
    editingNotes,
    audioSources,
    isPracticing,
    practiceWords,
    stats,
    eligibleWordsCount,
    sessionNumber,

    // Actions
    setNewWord,
    setShowSuggestions,
    setEditingNotes,
    handleUserSelect,
    addWord,
    deleteWord,
    updateNotes,
    togglePriority,
    playAudio,
    recordPractice,
    startPracticeSession,
    handlePracticeComplete,
    exitPractice,
  } = usePronunciationBank();

  // Loading state
  if (isLoading || !currentUserId) {
    return (
      <div className="min-h-screen bg-theme flex items-center justify-center">
        <div className="text-theme-muted">Loading...</div>
      </div>
    );
  }

  // Practice session
  if (isPracticing && practiceWords.length > 0) {
    return (
      <PracticeSession
        words={practiceWords}
        onComplete={handlePracticeComplete}
        onExit={exitPractice}
        onAnswerWord={recordPractice}
      />
    );
  }

  // Main view
  return (
    <div className="min-h-screen bg-theme pb-24">
      {/* Header */}
      <div className="bg-theme-card border-b border-theme shadow-sm">
        <div className="max-w-7xl mx-auto px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-semibold text-theme">Pronunciation Bank</h1>
              <p className="text-theme-muted mt-2 leading-relaxed">
                Track words using spaced repetition
              </p>
            </div>
            <div className="flex items-center gap-6">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2.5 rounded-xl bg-theme-accent hover:bg-theme-primary-light transition-all"
                title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
              >
                {theme === 'light' ? (
                  <Moon className="w-5 h-5 text-theme-muted" />
                ) : (
                  <Sun className="w-5 h-5 text-theme-warning" />
                )}
              </button>

              {!isLockedUser && (
                <UserSelector
                  currentUserId={currentUserId}
                  onUserSelect={handleUserSelect}
                />
              )}
              <StatsDisplay stats={stats} />
            </div>
          </div>

          {/* Add Word Input */}
          <AddWordInput
            value={newWord}
            onChange={setNewWord}
            onAdd={addWord}
            suggestions={filteredSuggestions}
            showSuggestions={showSuggestions}
            onShowSuggestions={setShowSuggestions}
            isAdding={isAdding}
          />
        </div>
      </div>

      {/* Table */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        <WordTable
          words={words}
          audioSources={audioSources}
          editingNotes={editingNotes}
          onTogglePriority={togglePriority}
          onPlayAudio={playAudio}
          onRecordPractice={recordPractice}
          onDeleteWord={deleteWord}
          onEditNotes={setEditingNotes}
          onUpdateNotes={updateNotes}
        />

        {/* Help Text */}
        <HelpSection />
      </div>

      {/* Practice Banner - Fixed at bottom */}
      {words.length > 0 && (
        <PracticeBanner
          eligibleWordsCount={eligibleWordsCount}
          sessionNumber={sessionNumber}
          onStartPractice={startPracticeSession}
        />
      )}
    </div>
  );
};

export default PronunciationBank;
