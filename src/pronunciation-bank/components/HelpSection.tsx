import React from 'react';

const HelpSection: React.FC = () => {
  return (
    <div className="mt-8 bg-theme-primary-light border border-theme rounded-xl p-6 shadow-sm">
      <h3 className="font-semibold text-theme mb-3">How it works:</h3>
      <ul className="text-theme-muted space-y-2 leading-relaxed">
        <li>
          <strong className="text-theme">Learning:</strong> Practice daily. Get 3 correct in a row to move to Reviewing
        </li>
        <li>
          <strong className="text-theme">Reviewing:</strong> Practice every 3-7 days. Get 5 correct in a row to Master
        </li>
        <li>
          <strong className="text-theme">Mastered:</strong> Review every 2 weeks to maintain
        </li>
        <li>
          <strong className="text-theme">Pronunciation:</strong> Shows IPA phonetics with stress pattern below (CAPS = stressed syllables)
        </li>
        <li>
          <strong className="text-theme">Autocomplete:</strong> Start typing to see word suggestions from our dictionary
        </li>
        <li>
          <strong className="text-theme">Real Data:</strong> Phonetics and audio are pulled from actual dictionary API
        </li>
      </ul>
    </div>
  );
};

export default HelpSection;
