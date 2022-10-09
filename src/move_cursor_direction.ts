/**
 * Type describing the possible movement options for the VSCode API built-in
 * command `cursorMove`, used in functions like `VSCX.moveCursor`.
 */
export type MoveCursorDirection =
  | 'left'
  | 'right'
  | 'up'
  | 'down'
  | 'prevBlankLine'
  | 'nextBlankLine'
  | 'wrappedLineStart'
  | 'wrappedLineEnd'
  | 'wrappedLineColumnCenter'
  | 'wrappedLineFirstNonWhitespaceCharacter'
  | 'wrappedLineLastNonWhitespaceCharacter'
  | 'viewPortTop'
  | 'viewPortCenter'
  | 'viewPortBottom'
  | 'viewPortIfOutside';

/**
 * Enum of all the possible movement options described within
 * {@link MoveCursorDirection}
 * so that the string values do not need to be typed.
 */
export enum MoveCursorDirections {
  Left = 'left',
  Right = 'right',
  Up = 'up',
  Down = 'down',
  PrevBlankLine = 'prevBlankLine',
  NextBlankLine = 'nextBlankLine',
  WrappedLineStart = 'wrappedLineStart',
  WrappedLineColumnCenter = 'wrappedLineColumnCenter',
  WrappedLineEnd = 'wrappedLineEnd',
  WrappedLineFirstNonWhitespaceCharacter = 'wrappedLineFirstNonWhitespaceCharacter',
  WrappedLineLastNonWhitespaceCharacter = 'wrappedLineLastNonWhitespaceCharacter',
  ViewPortTop = 'viewPortTop',
  ViewPortCenter = 'viewPortCenter',
  ViewPortBottom = 'viewPortBottom',
  ViewPortIfOutside = 'viewPortIfOutside',
}
