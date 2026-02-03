import PronunciationBank from './pronunciation-bank';
import ThemePreview from './theme-preview';
import { ThemeProvider } from './theme/ThemeContext';

// Toggle this to preview themes
const PREVIEW_THEMES = false;

function App() {
  if (PREVIEW_THEMES) {
    return <ThemePreview />;
  }

  return (
    <ThemeProvider>
      <PronunciationBank />
    </ThemeProvider>
  );
}

export default App;
