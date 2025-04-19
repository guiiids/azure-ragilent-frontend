import defaultTheme from './defaultTheme';
import tailwindTheme from './tailwindTheme';
import bootstrapTheme from './bootstrapTheme';

// Export all themes
export const themes = {
  default: defaultTheme,
  tailwind: tailwindTheme,
  bootstrap: bootstrapTheme
};

// Export theme names for the theme switcher
export const themeNames = Object.keys(themes);

// Get a theme by name
export const getTheme = (themeName) => {
  return themes[themeName] || themes.default;
};

export default themes;
