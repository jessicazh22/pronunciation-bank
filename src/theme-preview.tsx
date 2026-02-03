import React, { useState } from 'react';
import { Star, Volume2, Check, X, Trash2, PlayCircle, Plus, Moon, Sun, Type, Layout } from 'lucide-react';

// Font options - Geist Sans family + similar geometric sans + serifs
const fonts = {
  // Geist-like (geometric, modern)
  'geist': { name: 'Geist Sans', value: "'Geist', system-ui, sans-serif", style: 'Vercel-style', category: 'geometric' },
  'inter': { name: 'Inter', value: "'Inter', system-ui, sans-serif", style: 'Clean & Versatile', category: 'geometric' },
  'outfit': { name: 'Outfit', value: "'Outfit', sans-serif", style: 'Sleek Modern', category: 'geometric' },
  'plus-jakarta': { name: 'Plus Jakarta Sans', value: "'Plus Jakarta Sans', sans-serif", style: 'Contemporary', category: 'geometric' },
  'space-grotesk': { name: 'Space Grotesk', value: "'Space Grotesk', sans-serif", style: 'Geometric Tech', category: 'geometric' },
  'manrope': { name: 'Manrope', value: "'Manrope', sans-serif", style: 'Professional', category: 'geometric' },

  // Serif fonts
  'crimson-pro': { name: 'Crimson Pro', value: "'Crimson Pro', Georgia, serif", style: 'Elegant Reading', category: 'serif' },
  'source-serif': { name: 'Source Serif 4', value: "'Source Serif 4', Georgia, serif", style: 'Adobe Classic', category: 'serif' },
  'lora': { name: 'Lora', value: "'Lora', Georgia, serif", style: 'Warm & Balanced', category: 'serif' },
  'merriweather': { name: 'Merriweather', value: "'Merriweather', Georgia, serif", style: 'Screen-optimized', category: 'serif' },
  'playfair': { name: 'Playfair Display', value: "'Playfair Display', Georgia, serif", style: 'High Contrast', category: 'serif' },
  'libre-baskerville': { name: 'Libre Baskerville', value: "'Libre Baskerville', Georgia, serif", style: 'Classic Book', category: 'serif' },
};

// Banner placement options for light themes
const bannerPlacements = {
  'top': { name: 'Top Banner', description: 'Full-width at top' },
  'inline': { name: 'Inline Card', description: 'Card within header' },
  'sidebar': { name: 'Side Panel', description: 'Floating right side' },
  'minimal': { name: 'Minimal Bar', description: 'Subtle bottom bar' },
  'integrated': { name: 'Integrated', description: 'Blends with header' },
};

// Theme definitions
const themes = {
  // ===== LIGHT THEMES =====

  // Airtable-inspired
  'light-airtable': {
    name: 'Airtable',
    mode: 'light',
    description: 'Clean productivity app style',
    colors: {
      bg: '#f5f5f5',
      bgCard: '#ffffff',
      bgAccent: '#f0f0f0',
      border: '#e0e0e0',
      text: '#1d1d1d',
      textMuted: '#666666',
      primary: '#2d7ff9',
      primaryHover: '#1a6fe8',
      primaryLight: '#e8f1fd',
      success: '#20c933',
      successLight: '#d4edda',
      error: '#f82b60',
      errorLight: '#fde8ed',
      warning: '#ff9500',
      warningLight: '#fff3e0',
      banner: 'linear-gradient(135deg, #2d7ff9 0%, #18bfff 100%)',
    },
  },

  // Notion-inspired
  'light-notion': {
    name: 'Notion',
    mode: 'light',
    description: 'Minimal & content-focused',
    colors: {
      bg: '#ffffff',
      bgCard: '#ffffff',
      bgAccent: '#f7f6f3',
      border: '#e9e9e7',
      text: '#37352f',
      textMuted: '#9b9a97',
      primary: '#2eaadc',
      primaryHover: '#0b8ec0',
      primaryLight: '#e7f3f8',
      success: '#4dab9a',
      successLight: '#dbedea',
      error: '#e03e3e',
      errorLight: '#fbe9e9',
      warning: '#dfab01',
      warningLight: '#fbf3db',
      banner: 'linear-gradient(135deg, #37352f 0%, #5c5c5c 100%)',
    },
  },

  // Linear-inspired
  'light-linear': {
    name: 'Linear',
    mode: 'light',
    description: 'Modern issue tracker style',
    colors: {
      bg: '#f9fafb',
      bgCard: '#ffffff',
      bgAccent: '#f3f4f6',
      border: '#e5e7eb',
      text: '#111827',
      textMuted: '#6b7280',
      primary: '#5e6ad2',
      primaryHover: '#4f5bc4',
      primaryLight: '#eef0fb',
      success: '#26b5ce',
      successLight: '#e0f7fa',
      error: '#eb5757',
      errorLight: '#fdecec',
      warning: '#f2c94c',
      warningLight: '#fef9e7',
      banner: 'linear-gradient(135deg, #5e6ad2 0%, #8b5cf6 100%)',
    },
  },

  // VS Code Light+ inspired
  'light-vscode': {
    name: 'VS Code Light+',
    mode: 'light',
    description: 'Classic code editor light',
    colors: {
      bg: '#f3f3f3',
      bgCard: '#ffffff',
      bgAccent: '#e8e8e8',
      border: '#d4d4d4',
      text: '#1e1e1e',
      textMuted: '#6e7681',
      primary: '#0078d4',
      primaryHover: '#106ebe',
      primaryLight: '#cce5ff',
      success: '#28a745',
      successLight: '#d4edda',
      error: '#d73a49',
      errorLight: '#ffeef0',
      warning: '#e36209',
      warningLight: '#fff5e6',
      banner: 'linear-gradient(135deg, #0078d4 0%, #00a2ed 100%)',
    },
  },

  // GitHub Light
  'light-github': {
    name: 'GitHub Light',
    mode: 'light',
    description: 'GitHub interface colors',
    colors: {
      bg: '#f6f8fa',
      bgCard: '#ffffff',
      bgAccent: '#f0f3f6',
      border: '#d0d7de',
      text: '#24292f',
      textMuted: '#656d76',
      primary: '#0969da',
      primaryHover: '#0860c7',
      primaryLight: '#ddf4ff',
      success: '#1a7f37',
      successLight: '#dafbe1',
      error: '#cf222e',
      errorLight: '#ffebe9',
      warning: '#9a6700',
      warningLight: '#fff8c5',
      banner: 'linear-gradient(135deg, #24292f 0%, #424a53 100%)',
    },
  },

  // Solarized Light
  'light-solarized': {
    name: 'Solarized Light',
    mode: 'light',
    description: 'Eye-friendly warm tones',
    colors: {
      bg: '#fdf6e3',
      bgCard: '#fdf6e3',
      bgAccent: '#eee8d5',
      border: '#d3cbb7',
      text: '#073642',
      textMuted: '#586e75',
      primary: '#268bd2',
      primaryHover: '#1a6fb0',
      primaryLight: '#d5e9f5',
      success: '#859900',
      successLight: '#e8f0cc',
      error: '#dc322f',
      errorLight: '#f8e0df',
      warning: '#b58900',
      warningLight: '#f5eacc',
      banner: 'linear-gradient(135deg, #268bd2 0%, #2aa198 100%)',
    },
  },

  // ===== DARK THEMES =====

  // One Dark Pro (VS Code popular theme)
  'dark-one-dark': {
    name: 'One Dark Pro',
    mode: 'dark',
    description: 'Popular VS Code theme',
    colors: {
      bg: '#282c34',
      bgCard: '#2c313a',
      bgAccent: '#3a3f4b',
      border: '#4b5263',
      text: '#abb2bf',
      textMuted: '#7f848e',
      primary: '#61afef',
      primaryHover: '#4d9fe0',
      primaryLight: '#2d4a5e',
      success: '#98c379',
      successLight: '#2a3a2a',
      error: '#e06c75',
      errorLight: '#3d2a2d',
      warning: '#e5c07b',
      warningLight: '#3d3629',
      banner: 'linear-gradient(135deg, #3a3f4b 0%, #4b5263 100%)',
    },
  },

  // Dracula
  'dark-dracula': {
    name: 'Dracula',
    mode: 'dark',
    description: 'Famous purple-accented dark',
    colors: {
      bg: '#282a36',
      bgCard: '#2e303e',
      bgAccent: '#3c3f51',
      border: '#44475a',
      text: '#f8f8f2',
      textMuted: '#a9abbe',
      primary: '#bd93f9',
      primaryHover: '#a87bf0',
      primaryLight: '#3d3466',
      success: '#50fa7b',
      successLight: '#264034',
      error: '#ff5555',
      errorLight: '#4d2828',
      warning: '#f1fa8c',
      warningLight: '#3d3d26',
      banner: 'linear-gradient(135deg, #44475a 0%, #6272a4 100%)',
    },
  },

  // Tokyo Night
  'dark-tokyo': {
    name: 'Tokyo Night',
    mode: 'dark',
    description: 'Soft Japanese night vibes',
    colors: {
      bg: '#1a1b26',
      bgCard: '#1f2335',
      bgAccent: '#292e42',
      border: '#3b4261',
      text: '#c0caf5',
      textMuted: '#7982a9',
      primary: '#7aa2f7',
      primaryHover: '#6992e0',
      primaryLight: '#2a3a5a',
      success: '#9ece6a',
      successLight: '#2a3a28',
      error: '#f7768e',
      errorLight: '#3d2833',
      warning: '#e0af68',
      warningLight: '#3d3526',
      banner: 'linear-gradient(135deg, #292e42 0%, #3b4261 100%)',
    },
  },

  // GitHub Dark Dimmed (has good contrast)
  'dark-github-dimmed': {
    name: 'GitHub Dimmed',
    mode: 'dark',
    description: 'Softer dark with good contrast',
    colors: {
      bg: '#22272e',
      bgCard: '#2d333b',
      bgAccent: '#373e47',
      border: '#444c56',
      text: '#adbac7',
      textMuted: '#768390',
      primary: '#539bf5',
      primaryHover: '#4184e4',
      primaryLight: '#2a3f54',
      success: '#57ab5a',
      successLight: '#28352a',
      error: '#e5534b',
      errorLight: '#3d2c2a',
      warning: '#c69026',
      warningLight: '#3d3524',
      banner: 'linear-gradient(135deg, #373e47 0%, #444c56 100%)',
    },
  },

  // Nord
  'dark-nord': {
    name: 'Nord',
    mode: 'dark',
    description: 'Arctic, bluish palette',
    colors: {
      bg: '#2e3440',
      bgCard: '#3b4252',
      bgAccent: '#434c5e',
      border: '#4c566a',
      text: '#eceff4',
      textMuted: '#a5b1c2',
      primary: '#88c0d0',
      primaryHover: '#7ab3c3',
      primaryLight: '#2e4249',
      success: '#a3be8c',
      successLight: '#343d33',
      error: '#bf616a',
      errorLight: '#3d3035',
      warning: '#ebcb8b',
      warningLight: '#3d3a30',
      banner: 'linear-gradient(135deg, #434c5e 0%, #4c566a 100%)',
    },
  },

  // Catppuccin Mocha
  'dark-catppuccin': {
    name: 'Catppuccin Mocha',
    mode: 'dark',
    description: 'Soothing pastel dark theme',
    colors: {
      bg: '#1e1e2e',
      bgCard: '#27273a',
      bgAccent: '#313244',
      border: '#45475a',
      text: '#cdd6f4',
      textMuted: '#9399b2',
      primary: '#89b4fa',
      primaryHover: '#74a8f7',
      primaryLight: '#2a3550',
      success: '#a6e3a1',
      successLight: '#2a3d2e',
      error: '#f38ba8',
      errorLight: '#3d2a35',
      warning: '#f9e2af',
      warningLight: '#3d3828',
      banner: 'linear-gradient(135deg, #313244 0%, #45475a 100%)',
    },
  },

  // Material Palenight
  'dark-palenight': {
    name: 'Material Palenight',
    mode: 'dark',
    description: 'Purple-tinted material',
    colors: {
      bg: '#292d3e',
      bgCard: '#2f3344',
      bgAccent: '#3a3f54',
      border: '#4a4f64',
      text: '#d4d4dc',
      textMuted: '#8c8fa3',
      primary: '#82aaff',
      primaryHover: '#6e9bef',
      primaryLight: '#2a3752',
      success: '#c3e88d',
      successLight: '#2f3a2a',
      error: '#f07178',
      errorLight: '#3d2a2d',
      warning: '#ffcb6b',
      warningLight: '#3d3626',
      banner: 'linear-gradient(135deg, #3a3f54 0%, #4a4f64 100%)',
    },
  },

  // Ayu Dark
  'dark-ayu': {
    name: 'Ayu Dark',
    mode: 'dark',
    description: 'Warm dark with orange accents',
    colors: {
      bg: '#0a0e14',
      bgCard: '#0d1219',
      bgAccent: '#1a1f29',
      border: '#2a303c',
      text: '#bfbdb6',
      textMuted: '#6c7380',
      primary: '#ffb454',
      primaryHover: '#f0a742',
      primaryLight: '#3d3020',
      success: '#aad94c',
      successLight: '#2a3520',
      error: '#f07178',
      errorLight: '#3d2328',
      warning: '#ffb454',
      warningLight: '#3d3020',
      banner: 'linear-gradient(135deg, #1a1f29 0%, #2a303c 100%)',
    },
  },
};

type ThemeKey = keyof typeof themes;
type FontKey = keyof typeof fonts;
type BannerPlacement = keyof typeof bannerPlacements;

const ThemePreview: React.FC = () => {
  const [currentTheme, setCurrentTheme] = useState<ThemeKey>('light-airtable');
  const [currentFont, setCurrentFont] = useState<FontKey>('geist');
  const [showFontPanel, setShowFontPanel] = useState(false);
  const [bannerPlacement, setBannerPlacement] = useState<BannerPlacement>('inline');

  const theme = themes[currentTheme];
  const font = fonts[currentFont];
  const isLightTheme = theme.mode === 'light';

  const mockWords = [
    { id: '1', word: 'pronunciation', phonetic: '/prəˌnʌnsiˈeɪʃən/', pattern: 'pro-NUN-see-AY-shun', status: 'learning', priority: true, streak: 2 },
    { id: '2', word: 'comfortable', phonetic: '/ˈkʌmftəbəl/', pattern: 'KUMF-tuh-bul', status: 'reviewing', priority: false, streak: 4 },
    { id: '3', word: 'entrepreneur', phonetic: '/ˌɒntrəprəˈnɜːr/', pattern: 'on-truh-pruh-NUR', status: 'mastered', priority: false, streak: 6 },
  ];

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'learning':
        return { bg: theme.colors.errorLight, text: theme.colors.error, border: theme.colors.error };
      case 'reviewing':
        return { bg: theme.colors.warningLight, text: theme.colors.warning, border: theme.colors.warning };
      case 'mastered':
        return { bg: theme.colors.successLight, text: theme.colors.success, border: theme.colors.success };
      default:
        return { bg: theme.colors.bgAccent, text: theme.colors.textMuted, border: theme.colors.border };
    }
  };

  const lightThemes = Object.entries(themes).filter(([_, t]) => t.mode === 'light');
  const darkThemes = Object.entries(themes).filter(([_, t]) => t.mode === 'dark');
  const geometricFonts = Object.entries(fonts).filter(([_, f]) => f.category === 'geometric');
  const serifFonts = Object.entries(fonts).filter(([_, f]) => f.category === 'serif');

  // Render practice banner based on placement
  const renderPracticeBanner = () => {
    // For dark themes, always show top banner
    if (!isLightTheme) {
      return (
        <div style={{
          background: theme.colors.banner,
          color: '#fff',
          padding: '1.5rem 2rem',
          paddingLeft: '260px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: '48px',
                height: '48px',
                backgroundColor: 'rgba(255,255,255,0.2)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <PlayCircle size={28} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Daily Practice</h2>
                <p style={{ fontSize: '0.875rem', opacity: 0.9, margin: '0.25rem 0 0' }}>12 words ready • Session #5</p>
              </div>
            </div>
            <button style={{
              padding: '0.875rem 1.5rem',
              backgroundColor: '#fff',
              color: theme.colors.primary,
              border: 'none',
              borderRadius: '12px',
              fontWeight: 700,
              fontSize: '1rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              fontFamily: font.value,
            }}>
              <PlayCircle size={20} />
              Start Practice
            </button>
          </div>
        </div>
      );
    }

    // Light theme banner placements
    switch (bannerPlacement) {
      case 'top':
        return (
          <div style={{
            background: theme.colors.banner,
            color: '#fff',
            padding: '1.5rem 2rem',
            paddingLeft: '260px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <PlayCircle size={28} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Daily Practice</h2>
                  <p style={{ fontSize: '0.875rem', opacity: 0.9, margin: '0.25rem 0 0' }}>12 words ready • Session #5</p>
                </div>
              </div>
              <button style={{
                padding: '0.875rem 1.5rem',
                backgroundColor: '#fff',
                color: theme.colors.primary,
                border: 'none',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '1rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                fontFamily: font.value,
              }}>
                <PlayCircle size={20} />
                Start Practice
              </button>
            </div>
          </div>
        );

      case 'inline':
        // Returns null - banner is rendered inside header
        return null;

      case 'sidebar':
        // Returns null - banner is rendered as floating sidebar
        return null;

      case 'minimal':
        // Returns null - banner is rendered at bottom
        return null;

      case 'integrated':
        // Returns null - banner is part of header
        return null;

      default:
        return null;
    }
  };

  // Inline card banner (inside header)
  const renderInlineBanner = () => {
    if (!isLightTheme || bannerPlacement !== 'inline') return null;

    return (
      <div style={{
        marginTop: '1.5rem',
        padding: '1.25rem 1.5rem',
        backgroundColor: theme.colors.primaryLight,
        border: `1px solid ${theme.colors.primary}20`,
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '44px',
            height: '44px',
            backgroundColor: theme.colors.primary,
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
          }}>
            <PlayCircle size={24} />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '1rem', color: theme.colors.text }}>Daily Practice Ready</div>
            <div style={{ fontSize: '0.875rem', color: theme.colors.textMuted }}>12 words • ~5 min session</div>
          </div>
        </div>
        <button style={{
          padding: '0.75rem 1.25rem',
          backgroundColor: theme.colors.primary,
          color: '#fff',
          border: 'none',
          borderRadius: '10px',
          fontWeight: 600,
          fontSize: '0.9rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontFamily: font.value,
        }}>
          <PlayCircle size={18} />
          Start
        </button>
      </div>
    );
  };

  // Sidebar floating banner
  const renderSidebarBanner = () => {
    if (!isLightTheme || bannerPlacement !== 'sidebar') return null;

    return (
      <div style={{
        position: 'fixed',
        bottom: '2rem',
        right: '260px',
        width: '280px',
        padding: '1.25rem',
        backgroundColor: theme.colors.bgCard,
        border: `1px solid ${theme.colors.border}`,
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        zIndex: 40,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <div style={{
            width: '40px',
            height: '40px',
            background: theme.colors.banner,
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
          }}>
            <PlayCircle size={22} />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Practice Time</div>
            <div style={{ fontSize: '0.8rem', color: theme.colors.textMuted }}>12 words ready</div>
          </div>
        </div>
        <button style={{
          width: '100%',
          padding: '0.75rem',
          background: theme.colors.banner,
          color: '#fff',
          border: 'none',
          borderRadius: '10px',
          fontWeight: 600,
          fontSize: '0.9rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          fontFamily: font.value,
        }}>
          <PlayCircle size={18} />
          Start Practice
        </button>
      </div>
    );
  };

  // Minimal bottom bar
  const renderMinimalBar = () => {
    if (!isLightTheme || bannerPlacement !== 'minimal') return null;

    return (
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: '240px',
        right: 0,
        padding: '0.75rem 2rem',
        backgroundColor: theme.colors.bgCard,
        borderTop: `1px solid ${theme.colors.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1.5rem',
        zIndex: 40,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: theme.colors.textMuted, fontSize: '0.9rem' }}>
          <PlayCircle size={18} color={theme.colors.primary} />
          <span><strong style={{ color: theme.colors.text }}>12 words</strong> ready for practice</span>
        </div>
        <button style={{
          padding: '0.5rem 1rem',
          backgroundColor: theme.colors.primary,
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          fontWeight: 600,
          fontSize: '0.85rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          fontFamily: font.value,
        }}>
          Start Session
        </button>
      </div>
    );
  };

  // Integrated with header (button only, stats include practice info)
  const renderIntegratedBanner = () => {
    // This is handled in the header section
    return null;
  };

  return (
    <div style={{ fontFamily: font.value, backgroundColor: theme.colors.bg, minHeight: '100vh', color: theme.colors.text, paddingBottom: bannerPlacement === 'minimal' && isLightTheme ? '60px' : 0 }}>
      {/* Google Fonts */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700&family=IBM+Plex+Sans:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=Libre+Baskerville:wght@400;700&family=Lora:wght@400;500;600;700&family=Manrope:wght@400;500;600;700&family=Merriweather:wght@400;700&family=Outfit:wght@400;500;600;700&family=Playfair+Display:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Source+Sans+3:wght@400;500;600;700&family=Source+Serif+4:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* Theme Selector - Left Panel */}
      <div style={{
        position: 'fixed',
        top: '1rem',
        left: '1rem',
        zIndex: 50,
        backgroundColor: theme.colors.bgCard,
        padding: '1rem',
        borderRadius: '12px',
        border: `1px solid ${theme.colors.border}`,
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        maxWidth: '220px',
        maxHeight: 'calc(100vh - 2rem)',
        overflowY: 'auto',
      }}>
        {/* Light Themes */}
        <div style={{ fontSize: '0.7rem', fontWeight: 600, marginBottom: '0.5rem', color: theme.colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <Sun size={12} /> Light Themes
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '1rem' }}>
          {lightThemes.map(([key, t]) => (
            <button
              key={key}
              onClick={() => setCurrentTheme(key as ThemeKey)}
              style={{
                padding: '0.4rem 0.6rem',
                borderRadius: '6px',
                border: currentTheme === key ? `2px solid ${theme.colors.primary}` : `1px solid ${theme.colors.border}`,
                backgroundColor: currentTheme === key ? theme.colors.primaryLight : 'transparent',
                color: theme.colors.text,
                cursor: 'pointer',
                textAlign: 'left',
                fontSize: '0.8rem',
              }}
            >
              <div style={{ fontWeight: 500 }}>{t.name}</div>
              <div style={{ fontSize: '0.65rem', color: theme.colors.textMuted }}>{t.description}</div>
            </button>
          ))}
        </div>

        {/* Banner Placement (Light themes only) */}
        {isLightTheme && (
          <>
            <div style={{ fontSize: '0.7rem', fontWeight: 600, marginBottom: '0.5rem', color: theme.colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Layout size={12} /> Banner Style
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '1rem' }}>
              {Object.entries(bannerPlacements).map(([key, p]) => (
                <button
                  key={key}
                  onClick={() => setBannerPlacement(key as BannerPlacement)}
                  style={{
                    padding: '0.4rem 0.6rem',
                    borderRadius: '6px',
                    border: bannerPlacement === key ? `2px solid ${theme.colors.primary}` : `1px solid ${theme.colors.border}`,
                    backgroundColor: bannerPlacement === key ? theme.colors.primaryLight : 'transparent',
                    color: theme.colors.text,
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontSize: '0.8rem',
                  }}
                >
                  <div style={{ fontWeight: 500 }}>{p.name}</div>
                  <div style={{ fontSize: '0.65rem', color: theme.colors.textMuted }}>{p.description}</div>
                </button>
              ))}
            </div>
          </>
        )}

        {/* Dark Themes */}
        <div style={{ fontSize: '0.7rem', fontWeight: 600, marginBottom: '0.5rem', color: theme.colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <Moon size={12} /> Dark Themes
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {darkThemes.map(([key, t]) => (
            <button
              key={key}
              onClick={() => setCurrentTheme(key as ThemeKey)}
              style={{
                padding: '0.4rem 0.6rem',
                borderRadius: '6px',
                border: currentTheme === key ? `2px solid ${theme.colors.primary}` : `1px solid ${theme.colors.border}`,
                backgroundColor: currentTheme === key ? theme.colors.primaryLight : 'transparent',
                color: theme.colors.text,
                cursor: 'pointer',
                textAlign: 'left',
                fontSize: '0.8rem',
              }}
            >
              <div style={{ fontWeight: 500 }}>{t.name}</div>
              <div style={{ fontSize: '0.65rem', color: theme.colors.textMuted }}>{t.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Font Selector - Right Panel */}
      <div style={{
        position: 'fixed',
        top: '1rem',
        right: '1rem',
        zIndex: 50,
        backgroundColor: theme.colors.bgCard,
        padding: '1rem',
        borderRadius: '12px',
        border: `1px solid ${theme.colors.border}`,
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        maxWidth: '220px',
        maxHeight: 'calc(100vh - 2rem)',
        overflowY: 'auto',
      }}>
        <button
          onClick={() => setShowFontPanel(!showFontPanel)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'none',
            border: 'none',
            color: theme.colors.text,
            cursor: 'pointer',
            fontSize: '0.8rem',
            fontWeight: 600,
            padding: 0,
            width: '100%',
            justifyContent: 'space-between'
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Type size={14} /> {font.name}
          </span>
          <span style={{ fontSize: '0.65rem', color: theme.colors.textMuted }}>{showFontPanel ? '▲' : '▼'}</span>
        </button>

        {showFontPanel && (
          <div style={{ marginTop: '0.75rem' }}>
            {/* Geometric/Sans fonts */}
            <div style={{ fontSize: '0.65rem', fontWeight: 600, marginBottom: '0.4rem', color: theme.colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Sans-Serif (Geist-like)
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '0.75rem' }}>
              {geometricFonts.map(([key, f]) => (
                <button
                  key={key}
                  onClick={() => setCurrentFont(key as FontKey)}
                  style={{
                    padding: '0.4rem 0.6rem',
                    borderRadius: '6px',
                    border: currentFont === key ? `2px solid ${theme.colors.primary}` : `1px solid ${theme.colors.border}`,
                    backgroundColor: currentFont === key ? theme.colors.primaryLight : 'transparent',
                    color: theme.colors.text,
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontSize: '0.8rem',
                    fontFamily: f.value,
                  }}
                >
                  <div style={{ fontWeight: 500 }}>{f.name}</div>
                  <div style={{ fontSize: '0.65rem', color: theme.colors.textMuted }}>{f.style}</div>
                </button>
              ))}
            </div>

            {/* Serif fonts */}
            <div style={{ fontSize: '0.65rem', fontWeight: 600, marginBottom: '0.4rem', color: theme.colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Serif Fonts
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              {serifFonts.map(([key, f]) => (
                <button
                  key={key}
                  onClick={() => setCurrentFont(key as FontKey)}
                  style={{
                    padding: '0.4rem 0.6rem',
                    borderRadius: '6px',
                    border: currentFont === key ? `2px solid ${theme.colors.primary}` : `1px solid ${theme.colors.border}`,
                    backgroundColor: currentFont === key ? theme.colors.primaryLight : 'transparent',
                    color: theme.colors.text,
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontSize: '0.8rem',
                    fontFamily: f.value,
                  }}
                >
                  <div style={{ fontWeight: 500 }}>{f.name}</div>
                  <div style={{ fontSize: '0.65rem', color: theme.colors.textMuted }}>{f.style}</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Practice Banner (Top style) */}
      {renderPracticeBanner()}

      {/* Sidebar Banner */}
      {renderSidebarBanner()}

      {/* Minimal Bottom Bar */}
      {renderMinimalBar()}

      {/* Header */}
      <div style={{ backgroundColor: theme.colors.bgCard, borderBottom: `1px solid ${theme.colors.border}`, paddingLeft: '260px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 600, margin: 0 }}>Pronunciation Bank</h1>
                <p style={{ color: theme.colors.textMuted, marginTop: '0.5rem' }}>Track words using spaced repetition</p>
              </div>
              {/* Integrated banner button */}
              {isLightTheme && bannerPlacement === 'integrated' && (
                <button style={{
                  padding: '0.75rem 1.25rem',
                  background: theme.colors.banner,
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontFamily: font.value,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                }}>
                  <PlayCircle size={18} />
                  Practice (12)
                </button>
              )}
            </div>
            <div style={{ display: 'flex', gap: '2rem' }}>
              {[
                { label: 'Learning', count: 8, color: theme.colors.error },
                { label: 'Reviewing', count: 12, color: theme.colors.warning },
                { label: 'Mastered', count: 24, color: theme.colors.success },
              ].map(stat => (
                <div key={stat.label} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.875rem', fontWeight: 700, color: stat.color }}>{stat.count}</div>
                  <div style={{ fontSize: '0.875rem', color: theme.colors.textMuted }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Inline Banner */}
          {renderInlineBanner()}

          {/* Add Word Input */}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: isLightTheme && bannerPlacement === 'inline' ? '1.5rem' : 0 }}>
            <input
              type="text"
              placeholder="Type a word and press Enter..."
              style={{
                flex: 1,
                padding: '0.875rem 1.25rem',
                border: `1px solid ${theme.colors.border}`,
                borderRadius: '12px',
                backgroundColor: theme.colors.bg,
                color: theme.colors.text,
                fontSize: '1rem',
                outline: 'none',
                fontFamily: font.value,
              }}
            />
            <button style={{
              padding: '0.875rem 1.5rem',
              backgroundColor: theme.colors.primary,
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontFamily: font.value,
            }}>
              <Plus size={20} />
              Add
            </button>
          </div>
        </div>
      </div>

      {/* Word Table */}
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem', paddingLeft: 'calc(260px + 2rem)' }}>
        <div style={{
          backgroundColor: theme.colors.bgCard,
          borderRadius: '16px',
          border: `1px solid ${theme.colors.border}`,
          overflow: 'hidden',
          boxShadow: theme.mode === 'dark' ? '0 4px 12px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.05)'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: theme.colors.bgAccent }}>
                {['', 'Word', 'Pronunciation', 'Audio', 'Status', 'Streak', 'Practice', ''].map((header, i) => (
                  <th key={i} style={{
                    padding: '1rem',
                    textAlign: 'left',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: theme.colors.textMuted,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    borderBottom: `1px solid ${theme.colors.border}`
                  }}>
                    {header === '' && i === 0 ? <Star size={16} /> : header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mockWords.map((word, index) => {
                const statusStyle = getStatusStyle(word.status);
                return (
                  <tr key={word.id} style={{ borderBottom: index < mockWords.length - 1 ? `1px solid ${theme.colors.border}` : 'none' }}>
                    <td style={{ padding: '1.25rem 1rem' }}>
                      <Star
                        size={20}
                        fill={word.priority ? theme.colors.warning : 'none'}
                        color={word.priority ? theme.colors.warning : theme.colors.border}
                        style={{ cursor: 'pointer' }}
                      />
                    </td>
                    <td style={{ padding: '1.25rem 1rem', fontWeight: 600, fontSize: '1.125rem' }}>
                      {word.word}
                    </td>
                    <td style={{ padding: '1.25rem 1rem' }}>
                      <div style={{ fontFamily: 'Georgia, serif', fontSize: '1.125rem' }}>{word.phonetic}</div>
                      <div style={{ fontFamily: 'monospace', color: theme.colors.textMuted, fontSize: '0.875rem', marginTop: '0.25rem' }}>{word.pattern}</div>
                    </td>
                    <td style={{ padding: '1.25rem 1rem' }}>
                      <button style={{
                        padding: '0.625rem',
                        backgroundColor: theme.colors.primaryLight,
                        color: theme.colors.primary,
                        border: 'none',
                        borderRadius: '10px',
                        cursor: 'pointer',
                      }}>
                        <Volume2 size={18} />
                      </button>
                    </td>
                    <td style={{ padding: '1.25rem 1rem' }}>
                      <span style={{
                        padding: '0.375rem 0.875rem',
                        backgroundColor: statusStyle.bg,
                        color: statusStyle.text,
                        border: `1px solid ${statusStyle.border}`,
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                      }}>
                        {word.status}
                      </span>
                    </td>
                    <td style={{ padding: '1.25rem 1rem' }}>
                      <div style={{ fontWeight: 600 }}>{word.streak} correct</div>
                    </td>
                    <td style={{ padding: '1.25rem 1rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button style={{
                          padding: '0.5rem',
                          backgroundColor: theme.colors.successLight,
                          color: theme.colors.success,
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                        }}>
                          <Check size={16} />
                        </button>
                        <button style={{
                          padding: '0.5rem',
                          backgroundColor: theme.colors.errorLight,
                          color: theme.colors.error,
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                        }}>
                          <X size={16} />
                        </button>
                      </div>
                    </td>
                    <td style={{ padding: '1.25rem 1rem' }}>
                      <button style={{
                        padding: '0.5rem',
                        backgroundColor: 'transparent',
                        color: theme.colors.textMuted,
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                      }}>
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Current Selection Info */}
        <div style={{
          marginTop: '2rem',
          padding: '1.25rem',
          backgroundColor: theme.colors.bgCard,
          borderRadius: '12px',
          border: `1px solid ${theme.colors.border}`,
          display: 'flex',
          gap: '2rem',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ fontSize: '0.7rem', color: theme.colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Theme</div>
            <div style={{ fontWeight: 600 }}>{theme.name}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', color: theme.colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Font</div>
            <div style={{ fontWeight: 600 }}>{font.name}</div>
          </div>
          {isLightTheme && (
            <div>
              <div style={{ fontSize: '0.7rem', color: theme.colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Banner</div>
              <div style={{ fontWeight: 600 }}>{bannerPlacements[bannerPlacement].name}</div>
            </div>
          )}
          <div>
            <div style={{ fontSize: '0.7rem', color: theme.colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Primary Color</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '16px', height: '16px', backgroundColor: theme.colors.primary, borderRadius: '4px' }} />
              <span style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>{theme.colors.primary}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemePreview;
