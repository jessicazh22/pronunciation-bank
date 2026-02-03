import React from 'react';
import { Plus } from 'lucide-react';

interface AddWordInputProps {
  value: string;
  onChange: (value: string) => void;
  onAdd: (word?: string) => void;
  suggestions: string[];
  showSuggestions: boolean;
  onShowSuggestions: (show: boolean) => void;
  isAdding: boolean;
}

const AddWordInput: React.FC<AddWordInputProps> = ({
  value,
  onChange,
  onAdd,
  suggestions,
  showSuggestions,
  onShowSuggestions,
  isAdding,
}) => {
  return (
    <div className="relative">
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && onAdd()}
            onFocus={() => value && onShowSuggestions(true)}
            onBlur={() => setTimeout(() => onShowSuggestions(false), 200)}
            placeholder="Type a word and press Enter..."
            className="w-full px-5 py-3 border border-theme rounded-xl bg-theme text-theme focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)] transition-all shadow-sm"
            disabled={isAdding}
          />

          {/* Autocomplete Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-2 bg-theme-card border border-theme rounded-xl shadow-lg max-h-60 overflow-y-auto">
              {suggestions.map((word, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    onChange(word);
                    onAdd(word);
                  }}
                  className="w-full px-5 py-3 text-left hover:bg-theme-primary-light transition-colors text-theme font-medium"
                >
                  {word}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => onAdd()}
          disabled={!value.trim() || isAdding}
          className="px-8 py-3 bg-theme-primary text-white rounded-xl hover:bg-theme-primary-hover disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm hover:shadow-md transition-all font-medium"
        >
          <Plus className="w-5 h-5" />
          {isAdding ? 'Adding...' : 'Add'}
        </button>
      </div>
    </div>
  );
};

export default AddWordInput;
