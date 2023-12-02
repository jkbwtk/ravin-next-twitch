import { createTheme } from '@suid/material';

import style from '#styles/suidTheme.module.scss';
import '#styles/suidTheme.scss';

const convertToPixels = (size: string) => {
  let pixels = 0;

  if (size.endsWith('px')) pixels = parseFloat(size);
  if (size.endsWith('rem')) pixels = parseFloat(size) * convertToPixels(style.baseFontSize);

  return pixels;
};


const theme = createTheme({
  typography: {
    fontFamily: style.fontFamily,
    fontSize: convertToPixels(style.defaultFontSize),
  },
  palette: {
    mode: 'dark',
    common: {
      black: style.backgroundColor,
    },
    primary: {
      main: style.primaryColor,
      contrastText: style.textBrightColor,
    },
    background: {
      default: style.widgetColor,
      paper: style.widgetColor,
    },
    text: {
      primary: style.textColor,
      secondary: style.textBrightColor,
    },
    action: {
      active: style.gray,
      hover: style.borderColor,
      selected: style.yellow,
      focus: style.borderColor,
    },
    divider: style.borderColor,
    error: {
      main: style.primaryColor,
      contrastText: style.textBrightColor,
    },
  },
  shape: {
    borderRadius: convertToPixels(style.borderRadius),
  },
});

export default theme;
