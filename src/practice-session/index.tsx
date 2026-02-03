import React, { useState, useEffect, useRef } from 'react';
import { Volume2, Check, X, SkipForward, ArrowLeft, Gauge, Mic, Square, Play } from 'lucide-react';
import { BROWSER_TTS_MARKER } from '../services/audio-fetcher';
import { Word, PracticeResult } from '../types';

interface PracticeSessionProps {
  words: Word[];
  onComplete: (results: PracticeResult[]) => void;
  onExit: () => void;
  onAnswerWord?: (wordId: string, isCorrect: boolean) => void;
}

const PracticeSession: React.FC<PracticeSessionProps> = ({ words, onComplete, onExit, onAnswerWord }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<PracticeResult[]>([]);
  const [showingResult, setShowingResult] = useState(false);
  const [lastAnswer, setLastAnswer] = useState<boolean | null>(null);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);

  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [isPlayingRecording, setIsPlayingRecording] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const speechSynthRef = useRef<SpeechSynthesisUtterance | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordingAudioRef = useRef<HTMLAudioElement | null>(null);

  const currentWord = words[currentIndex];
  const progress = ((currentIndex + 1) / words.length) * 100;

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (sessionComplete || showingResult) return;

      if (e.key === '1' || e.key === 'y' || e.key === 'Y') {
        handleAnswer(true);
      } else if (e.key === '2' || e.key === 'n' || e.key === 'N') {
        handleAnswer(false);
      } else if (e.key === '3' || e.key === 's' || e.key === 'S') {
        handleSkip();
      } else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        playAudio();
      } else if (e.key === 'r' || e.key === 'R') {
        if (isRecording) {
          stopRecording();
        } else if (recordedAudioUrl) {
          clearRecording();
          setTimeout(startRecording, 100);
        } else {
          startRecording();
        }
      } else if (e.key === 'p' || e.key === 'P') {
        if (recordedAudioUrl) {
          playRecording();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentIndex, sessionComplete, showingResult, isRecording, recordedAudioUrl]);

  useEffect(() => {
    stopAudio();
    clearRecording();
  }, [currentIndex]);

  useEffect(() => {
    return () => {
      stopAudio();
      stopRecordingPlayback();
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    if (speechSynthRef.current) {
      window.speechSynthesis.cancel();
      speechSynthRef.current = null;
    }
    setIsPlaying(false);
  };

  const playAudio = () => {
    stopAudio();

    const useUrl = currentWord.audioUrl && !currentWord.audioUrl.startsWith('tts:') && currentWord.audioUrl !== BROWSER_TTS_MARKER && !currentWord.audioUrl.startsWith('browser-tts');
    if (useUrl) {
      const audio = new Audio(currentWord.audioUrl);
      audio.playbackRate = playbackSpeed;
      audioRef.current = audio;

      audio.onplay = () => setIsPlaying(true);
      audio.onended = () => setIsPlaying(false);
      audio.onerror = () => setIsPlaying(false);

      audio.play().catch(err => {
        console.error('Audio playback failed:', err);
        setIsPlaying(false);
        playTextToSpeech();
      });
    } else {
      playTextToSpeech();
    }
  };

  const playTextToSpeech = () => {
    if (!window.speechSynthesis) return;

    const utterance = new SpeechSynthesisUtterance(currentWord.word);
    utterance.rate = playbackSpeed;
    utterance.lang = 'en-US';
    speechSynthRef.current = utterance;

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
  };

  const cycleSpeed = () => {
    setPlaybackSpeed(prev => {
      if (prev === 1) return 0.75;
      if (prev === 0.75) return 0.5;
      return 1;
    });
  };

  // Recording functions
  const startRecording = async () => {
    try {
      // Request mic with low latency settings
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          latency: 0
        }
      });

      // Use a format with lower latency if available
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      recordedChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        setRecordedAudioUrl(url);
        stream.getTracks().forEach(track => track.stop());
      };

      // Start with small timeslice to reduce buffering
      mediaRecorder.start(100);
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording:', err);
      alert('Could not access microphone. Please allow microphone access and try again.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const playRecording = () => {
    if (!recordedAudioUrl) return;

    stopRecordingPlayback();
    const audio = new Audio(recordedAudioUrl);
    recordingAudioRef.current = audio;

    audio.onplay = () => setIsPlayingRecording(true);
    audio.onended = () => setIsPlayingRecording(false);
    audio.onerror = () => setIsPlayingRecording(false);

    audio.play().catch(err => {
      console.error('Recording playback failed:', err);
      setIsPlayingRecording(false);
    });
  };

  const stopRecordingPlayback = () => {
    if (recordingAudioRef.current) {
      recordingAudioRef.current.pause();
      recordingAudioRef.current.currentTime = 0;
      recordingAudioRef.current = null;
    }
    setIsPlayingRecording(false);
  };

  const clearRecording = () => {
    stopRecordingPlayback();
    if (recordedAudioUrl) {
      URL.revokeObjectURL(recordedAudioUrl);
    }
    setRecordedAudioUrl(null);
  };


  const handleAnswer = (isCorrect: boolean) => {
    if (showingResult) return;

    setLastAnswer(isCorrect);
    setShowingResult(true);

    const result: PracticeResult = {
      wordId: currentWord.id,
      word: currentWord.word,
      isCorrect
    };

    setResults(prev => [...prev, result]);

    // Save progress immediately so it persists even if user exits mid-session
    if (onAnswerWord) {
      onAnswerWord(currentWord.id, isCorrect);
    }

    setTimeout(() => {
      moveToNext();
    }, 800);
  };

  const handleSkip = () => {
    if (showingResult) return;
    moveToNext();
  };

  const moveToNext = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setShowingResult(false);
      setLastAnswer(null);
    } else {
      setSessionComplete(true);
    }
  };

  const handleComplete = () => {
    onComplete(results);
  };

  if (sessionComplete) {
    const correctCount = results.filter(r => r.isCorrect).length;
    const incorrectCount = results.filter(r => r.isCorrect === false).length;
    const skippedCount = words.length - results.length;
    const accuracy = results.length > 0 ? Math.round((correctCount / results.length) * 100) : 0;

    return (
      <div className="fixed inset-0 bg-theme flex items-center justify-center z-50">
        <div className="max-w-2xl w-full mx-8 bg-theme-card rounded-2xl shadow-2xl p-12 border border-theme">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-theme-success-light rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-theme-success" />
            </div>
            <h2 className="text-3xl font-bold text-theme mb-2">Session Complete!</h2>
            <p className="text-theme-muted">Great work on your practice session</p>
          </div>

          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="bg-theme-success-light rounded-xl p-6 text-center border border-[var(--color-success)]">
              <div className="text-4xl font-bold text-theme-success mb-2">{correctCount}</div>
              <div className="text-theme-success font-medium">Correct</div>
            </div>
            <div className="bg-theme-error-light rounded-xl p-6 text-center border border-[var(--color-error)]">
              <div className="text-4xl font-bold text-theme-error mb-2">{incorrectCount}</div>
              <div className="text-theme-error font-medium">Incorrect</div>
            </div>
            <div className="bg-theme-accent rounded-xl p-6 text-center border border-theme">
              <div className="text-4xl font-bold text-theme-muted mb-2">{accuracy}%</div>
              <div className="text-theme-muted font-medium">Accuracy</div>
            </div>
          </div>

          {skippedCount > 0 && (
            <div className="bg-theme-warning-light border border-[var(--color-warning)] rounded-xl p-4 mb-6 text-center">
              <p className="text-theme-warning">
                <strong>{skippedCount}</strong> word{skippedCount > 1 ? 's' : ''} skipped
              </p>
            </div>
          )}

          {results.length > 0 && (
            <div className="mb-8 max-h-48 overflow-y-auto bg-theme-accent rounded-xl p-4 border border-theme">
              <h3 className="font-semibold text-theme mb-3">Session Review:</h3>
              <div className="space-y-2">
                {results.map((result, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <span className="text-theme font-medium">{result.word}</span>
                    <span className={`font-semibold ${result.isCorrect ? 'text-theme-success' : 'text-theme-error'}`}>
                      {result.isCorrect ? '✓ Correct' : '✗ Incorrect'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={handleComplete}
            className="w-full py-4 bg-theme-primary text-white rounded-xl hover:bg-theme-primary-hover transition-all font-semibold text-lg shadow-lg hover:shadow-xl"
          >
            Finish Session
          </button>
        </div>
      </div>
    );
  }

  if (!currentWord) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-theme flex flex-col z-50">
      {/* Header */}
      <div className="bg-theme-card border-b border-theme shadow-sm">
        <div className="max-w-4xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={onExit}
              className="flex items-center gap-2 text-theme-muted hover:text-theme transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Exit Practice</span>
            </button>
            <div className="text-theme-muted font-medium">
              {currentIndex + 1} / {words.length}
            </div>
          </div>
          <div className="w-full bg-theme-accent rounded-full h-2 overflow-hidden">
            <div
              className="bg-theme-primary h-full transition-all duration-300 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-8">
          <div className="max-w-4xl w-full mx-auto">
            {/* Status Badge */}
            <div className="flex justify-center mb-6">
              <span className={`px-6 py-2 rounded-full text-sm font-semibold border shadow-sm ${
                currentWord.status === 'learning' ? 'bg-theme-error-light text-theme-error border-[var(--color-error)]' :
                currentWord.status === 'reviewing' ? 'bg-theme-warning-light text-theme-warning border-[var(--color-warning)]' :
                'bg-theme-success-light text-theme-success border-[var(--color-success)]'
              }`}>
                {currentWord.status}
              </span>
            </div>

            {/* Word Card */}
            <div className={`bg-theme-card rounded-3xl shadow-2xl p-12 text-center border-2 transition-all duration-300 ${
              showingResult
                ? lastAnswer
                  ? 'border-[var(--color-success)] bg-theme-success-light'
                  : 'border-[var(--color-error)] bg-theme-error-light'
                : 'border-theme'
            }`}>
              <h1 className="text-6xl font-bold text-theme mb-10">
                {currentWord.word}
              </h1>

              <div className="space-y-4 mb-10">
                <div className="text-3xl text-theme" style={{ fontFamily: 'Georgia, serif' }}>
                  {currentWord.phonetic}
                </div>
                <div className="font-mono text-2xl text-theme-muted">
                  {currentWord.pattern}
                </div>
              </div>

              {currentWord.notes && (
                <div className="bg-theme-warning-light border border-[var(--color-warning)] rounded-xl p-4 mb-8 mx-8">
                  <p className="text-theme-warning italic">{currentWord.notes}</p>
                </div>
              )}

              {/* Audio Controls */}
              <div className="flex items-center justify-center gap-4 mb-4">
                <button
                  onClick={playAudio}
                  disabled={isPlaying}
                  className={`px-8 py-4 rounded-2xl transition-all flex items-center gap-3 font-semibold text-lg shadow-lg hover:shadow-xl ${
                    isPlaying
                      ? 'bg-theme-primary-light text-theme-primary cursor-not-allowed'
                      : 'bg-theme-primary-light text-theme-primary hover:opacity-80'
                  }`}
                >
                  <Volume2 className={`w-6 h-6 ${isPlaying ? 'animate-pulse' : ''}`} />
                  {isPlaying ? 'Playing...' : 'Play Pronunciation'}
                </button>

                <button
                  onClick={cycleSpeed}
                  className="px-6 py-4 bg-theme-accent text-theme-muted rounded-2xl hover:opacity-80 transition-all flex items-center gap-2 font-semibold text-lg shadow-lg hover:shadow-xl"
                  title="Change playback speed"
                >
                  <Gauge className="w-5 h-5" />
                  <span>{playbackSpeed}x</span>
                </button>
              </div>

              {/* Recording Controls */}
              <div className="flex items-center justify-center gap-3 mb-8">
                {!isRecording ? (
                  <button
                    onClick={recordedAudioUrl ? clearRecording : startRecording}
                    className={`px-6 py-3 rounded-xl transition-all flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl ${
                      recordedAudioUrl
                        ? 'bg-theme-accent text-theme-muted hover:opacity-80'
                        : 'bg-theme-error-light text-theme-error hover:opacity-80'
                    }`}
                    title={recordedAudioUrl ? "Record again" : "Record yourself (R)"}
                  >
                    <Mic className="w-5 h-5" />
                    {recordedAudioUrl ? 'Record Again' : 'Record'}
                  </button>
                ) : (
                  <button
                    onClick={stopRecording}
                    className="px-6 py-3 rounded-xl transition-all flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl bg-theme-error text-white hover:opacity-80 animate-pulse"
                    title="Stop recording (R)"
                  >
                    <Square className="w-5 h-5" />
                    Stop
                  </button>
                )}

                {recordedAudioUrl && (
                  <button
                    onClick={playRecording}
                    disabled={isPlayingRecording}
                    className={`px-6 py-3 rounded-xl transition-all flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl ${
                      isPlayingRecording
                        ? 'bg-theme-primary-light text-theme-primary cursor-not-allowed'
                        : 'bg-theme-primary-light text-theme-primary hover:opacity-80'
                    }`}
                    title="Play your recording (P)"
                  >
                    <Play className={`w-5 h-5 ${isPlayingRecording ? 'animate-pulse' : ''}`} />
                    {isPlayingRecording ? 'Playing...' : 'Play Mine'}
                  </button>
                )}
              </div>

              {/* Streak Info */}
              <div className="flex items-center justify-center gap-8 text-theme-muted">
                <div>
                  <span className="font-bold text-2xl text-theme">{currentWord.correctStreak}</span>
                  <span className="ml-2">correct streak</span>
                </div>
                <div className="w-px h-8 bg-theme-accent" />
                <div>
                  <span className="font-bold text-2xl text-theme">{currentWord.practiceCount}</span>
                  <span className="ml-2">total practices</span>
                </div>
              </div>
            </div>

            {/* Action Buttons - Inside scrollable area */}
            <div className="mt-8 flex items-center justify-center gap-4">
              <button
                onClick={() => handleAnswer(false)}
                disabled={showingResult}
                className="flex-1 py-5 bg-theme-error text-white rounded-2xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all font-bold text-xl"
              >
                <X className="w-7 h-7" />
                <span>Incorrect</span>
                <span className="text-white/60 text-base font-normal ml-1">(2)</span>
              </button>

              <button
                onClick={handleSkip}
                disabled={showingResult}
                className="py-5 px-8 bg-theme-accent text-theme-muted rounded-2xl hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all font-bold text-lg"
              >
                <SkipForward className="w-6 h-6" />
                <span className="text-theme-muted/60 text-base font-normal">(3)</span>
              </button>

              <button
                onClick={() => handleAnswer(true)}
                disabled={showingResult}
                className="flex-1 py-5 bg-theme-success text-white rounded-2xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all font-bold text-xl"
              >
                <Check className="w-7 h-7" />
                <span>Correct</span>
                <span className="text-white/60 text-base font-normal ml-1">(1)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PracticeSession;
