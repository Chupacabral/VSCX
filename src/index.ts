import * as vscode from 'vscode';

/**
 * Type describing the possible movement options for the VSCode API built-in
 * command `cursorMove`, used in functions like `VSCX.moveCursor`.
 */
type MoveCursorDirection =
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
 * Type describing options for `VSCX.getInput`.
 * Is generally the same as `vscode.InputBoxOptions`, but with an additional
 * `valueOnCancel` attribute, that allows for a custom value to be returned
 * if the input box is cancelled, instead of only returning undefined.
 */
type GetInputOptions = {
  ignoreFocusOut?: boolean;
  password?: boolean;
  placeHolder?: string;
  prompt?: string;
  title?: string;
  value?: string;
  valueSelection?: [number, number];
  valueOnCancel?: any;
};

/**
 * Module for Visual Studio Code eXpanded library.
 */
export class VSCX {
  // * ATTRIBUTE ACCESSORS
  /**
   * The VSCode workspace.
   */
  public static get workspace() {
    return vscode.workspace;
  }

  /**
   * The VSCode window namespace.
   */
  public static get window() {
    return vscode.window;
  }

  /**
   * The current active text editor in VSCode.
   *
   * May return undefined if no editors are open.
   */
  public static get editor() {
    return VSCX.window.activeTextEditor;
  }

  /**
   * The current active notebook editor in VSCode.
   *
   * May return undefined if no notebooks are open.
   */
  public static get notebook() {
    return VSCX.window.activeNotebookEditor;
  }

  /**
   * The VSCode commands namespace.
   */
  public static get commands() {
    return vscode.commands;
  }

  /**
   * The current VSCode editor document, or `undefined` if document not found.
   */
  public static get document() {
    return VSCX.editor?.document;
  }

  /**
   * The language id for the currently focused file, or `undefined` if
   * not found.
   */
  public static get currentLanguage() {
    return VSCX.editor?.document?.languageId;
  }

  /**
   * Get the current file language id, and see if it matches against a list
   * of given options.
   *
   * @param options An array of language names to match against.
   * @param coalesce An object of language names, and what to convert them to.
   *                 Does not need to have a value for every option, just the
   *                 ones you want coalesced into other values.
   * @returns The matching option, or `null` if not found.
   */
  public static currentLanguageMatch(
    options: string[],
    coalesce?: Record<string, string>,
  ) {
    const language = VSCX.currentLanguage;

    if (!language) {
      return null;
    }

    if (options.includes(language)) {
      if (coalesce && language in coalesce) {
        return coalesce[language];
      } else {
        return language;
      }
    }

    return null;
  }

  /**
   * The primary editor cursor selection, or `undefined` if there is no
   * cursor to get.
   */
  public static get selection() {
    return VSCX.editor?.selection;
  }

  /**
   * The cursor position for the primary editor cursor.
   */
  public static get cursorPosition() {
    return VSCX.selection?.active;
  }

  /**
   * The line of text that the primary editor cursor is at. If the cursor
   * position is not found, this will return `undefined`.
   */
  public static get currentLine() {
    const position = VSCX.cursorPosition;

    return position ? VSCX.document?.lineAt(position) : undefined;
  }

  // * COMPUTATED ACCESSORS
  /**
   * The string of text that matches the text for a single level of
   * indentation based on the current editor settings.
   *
   * Will return spaces if indentation is set to be spaces, otherwise a
   * tab character.
   */
  public static get tabText() {
    const editor = VSCX.editor;

    return editor?.options.insertSpaces
      ? ' '.repeat(Number(editor.options.tabSize))
      : '\t';
  }

  /**
   * Information on the indentation found on the line of text the primary
   * cursor is located on.
   *
   * Returns an object containing a list of all the tabs found, and the
   * amount of tabs found.
   */
  public static get currentLineTabs() {
    const firstText = VSCX.currentLine?.firstNonWhitespaceCharacterIndex;
    const tab = VSCX.tabText;

    const foundTabs = VSCX.currentLine?.text
      ?.slice(0, firstText)
      ?.matchAll(new RegExp(tab, 'g'));

    const list = foundTabs ? Array.from(foundTabs).map((t) => t[0]) : [];

    const amount = list ? list.length : 0;

    return { list, amount };
  }

  /**
   * An object that contains information on the indentation text for
   * every indentation level from 0 to the current level to any afterwards.
   *
   * @returns An object with:
   *
   *          `currentLevel` The amount of indents for the current level
   *
   *          `current` The text making up the current indentation level
   *
   *          `offset(n)` A function that returns the indent at level
   *                      `currentLevel + n`.
   */
  public static get indent() {
    const indentInfo = VSCX.currentLineTabs;
    const tab = VSCX.tabText;

    const indentData: {
      currentLevel: number;
      current: string;
      offset: (n: number) => string;
    } = {
      currentLevel: indentInfo.amount,
      current: indentInfo.list.join(''),
      offset(n: number) {
        const level = this.currentLevel + n;

        return level + n <= 0 ? '' : tab.repeat(level);
      },
    };

    return indentData;
  }

  /**
   * The list of commands registered for VSCode.
   * @param showInternal Whether or not to show internal VSCode commands
   *                     (They start with an underscore).
   * @returns A promise containing a list of strings of all the command names.
   */
  public static async commandList(showInternal: boolean = false) {
    return await vscode.commands.getCommands(showInternal);
  }

  // * VSCODE API FUNCTIONALITY
  /**
   * Checks if the given command names have been registered with VSCode.
   *
   * @param commandNames The names of the commands to test the existence of.
   * @returns A boolean representing if all the command names have been
   *          registered.
   */
  public static async commandExists(...commandNames: string[]) {
    const commandList = await VSCX.commandList();

    // Return whether any command name given is not found in command list.
    return Boolean(commandNames.find((name) => commandList.includes(name)));
  }

  /**
   * Shorthand for `vscode.window.showInformationMessage`.
   * @param message The message to show.
   * @param items A list of items to be rendered as actions in the message.
   * @returns A thenable that resolves to the selected item or `undefined` when
   *          being dismissed.
   */
  public static info(message: string, ...items: string[]) {
    return VSCX.window.showInformationMessage(message, ...items);
  }

  /**
   * Shorthand for `vscode.window.showWarningMessage`.
   * @param message The message to show.
   * @param items A list of items to be rendered as actions in the message.
   * @returns A thenable that resolves to the selected item or `undefined` when
   *          being dismissed.
   */
  public static warn(message: string, ...items: string[]) {
    return VSCX.window.showWarningMessage(message, ...items);
  }

  /**
   * Shorthand for `vscode.window.showErrorMessage`.
   * @param message The message to show.
   * @param items A list of items to be rendered as actions in the message.
   * @returns A thenable that resolves to the selected item or `undefined` when
   *          being dismissed.
   */
  public static error(message: string, ...items: string[]) {
    return VSCX.window.showErrorMessage(message, ...items);
  }

  /**
   * Convenient wrapper around `vscode.window.showInputBox`, with more
   * flexible input and an addition input box option `valueOnCancel` which
   * allows for result to return more than just undefined if the input box
   * is cancelled.
   *
   * @param options Options for the input box (or a string, which will count
   *                as the `options.prompt` text).
   * @returns The value given to the input box, otherwise undefined or whatever
   *          is set for `options.valueOnCancel` (if given).
   */
  public static async getInput(options: GetInputOptions | string) {
    if (typeof options === 'string') {
      return await VSCX.window.showInputBox({ prompt: options });
    } else if (options instanceof Object) {
      const valueOnCancel =
        'valueOnCancel' in options ? options.valueOnCancel : undefined;

      if (valueOnCancel) {
        delete options.valueOnCancel;
      }

      return (await VSCX.window.showInputBox({ ...options })) ?? valueOnCancel;
    } else {
      throw TypeError(
        'VSCX.getInput can only be given a string or an object matching the ' +
          'vscode.InputBoxOptions type.',
      );
    }
  }

  /**
   * Inserts text in the current editor document after the primary cursor
   * position.
   *
   * @param text The text to insert after the cursor.
   */
  public static insertAtCursor(text: string) {
    VSCX.editor?.edit((editBuilder) => {
      editBuilder.insert(VSCX.cursorPosition as vscode.Position, text);
    });
  }

  /**
   * Convenience wrapper over
   * `vscode.commands.executeCommand('cursorMove')`.
   *
   * @param direction The direction to move the cursor. Same options as what
   *                  the builtin command `cursorMove` uses.
   * @param unit      A string for the name of the unit of what to be moving by.
   * @param amount    The amount to move the cursor by.
   * @param select    Whether to select text as the cursor moves.
   * @returns Whatever `moveCommand` is supposed to return; probably `undefined`.
   */
  public static async moveCursor(
    direction: MoveCursorDirection,
    unit: 'line' | 'wrappedLine' | 'character' | 'halfLine',
    amount: number | string = 1,
    select = false,
  ) {
    amount = typeof amount === 'string' ? amount.length : amount;

    return await VSCX.commands.executeCommand('cursorMove', {
      to: direction,
      by: unit,
      ...{ amount, select },
    });
  }

  /**
   * Same as `VSCX.moveCursor` but it automatically moves up.
   *
   * @param unit      A string for the name of the unit of what to be moving by.
   * @param amount    The amount to move the cursor by.
   * @param select    Whether to select text as the cursor moves.
   * @returns Whatever `moveCommand` is supposed to return; probably `undefined`.
   */
  public static async moveCursorUp(
    unit: 'line' | 'wrappedLine' | 'character' | 'halfLine',
    amount: number | string = 1,
    select: boolean = false,
  ) {
    amount = typeof amount === 'string' ? amount.length : amount;

    return await VSCX.moveCursor('up', unit, amount, select);
  }

  /**
   * Same as `VSCX.moveCursor` but it automatically moves down.
   *
   * @param unit      A string for the name of the unit of what to be moving by.
   * @param amount    The amount to move the cursor by.
   * @param select    Whether to select text as the cursor moves.
   * @returns Whatever `moveCommand` is supposed to return; probably `undefined`.
   */
  public static async moveCursorDown(
    unit: 'line' | 'wrappedLine' | 'character' | 'halfLine',
    amount: number | string = 1,
    select = false,
  ) {
    amount = typeof amount === 'string' ? amount.length : amount;

    return await VSCX.moveCursor('down', unit, amount, select);
  }

  /**
   * Same as `VSCX.moveCursor` but it automatically moves left.
   *
   * @param unit      A string for the name of the unit of what to be moving by.
   * @param amount    The amount to move the cursor by.
   * @param select    Whether to select text as the cursor moves.
   * @returns Whatever `moveCommand` is supposed to return; probably `undefined`.
   */
  public async moveCursorLeft(
    unit: 'line' | 'wrappedLine' | 'character' | 'halfLine',
    amount: number | string = 1,
    select = false,
  ) {
    amount = typeof amount === 'string' ? amount.length : amount;

    return await VSCX.moveCursor('left', unit, amount, select);
  }

  /**
   * Same as `VSCX.moveCursor` but it automatically moves right.
   *
   * @param unit      A string for the name of the unit of what to be moving by.
   * @param amount    The amount to move the cursor by.
   * @param select    Whether to select text as the cursor moves.
   * @returns Whatever `moveCommand` is supposed to return; probably `undefined`.
   */
  public static async moveCursorRight(
    unit: 'line' | 'wrappedLine' | 'character' | 'halfLine',
    amount: number | string = 1,
    select = false,
  ) {
    amount = typeof amount === 'string' ? amount.length : amount;

    return await VSCX.moveCursor('right', unit, amount, select);
  }

  /**
   *
   * @param context The VSCode extension context. Used to get the path for a
   *                file relative to the extension directory.
   * @param path    The path to the text file being opened.
   * @param options An object of options for the method. Has the same options
   *                as the vscode API function `vscode.window.showTextDocument`,
   *                but with an additional options:
   *
   *                `absolutePath` lets you to specify if the file path given
   *                is relative or not.
   *
   *                `showFile` lets you specify if the function should also
   *                show the file in a new editor.
   * @returns An object with the opened text file document and the editor
   *          it was opened in (if allowed).
   */
  public static async openTextFile(
    context: vscode.ExtensionContext,
    path: string,
    options: vscode.TextDocumentShowOptions & {
      absolutePath?: boolean;
      showFile?: boolean;
    } = {},
  ) {
    options.showFile = options.showFile ?? true;

    const file = options.absolutePath ? path : context.asAbsolutePath(path);
    const document = await VSCX.workspace.openTextDocument(file);
    let editor;

    if (options.showFile) {
      editor = await vscode.window.showTextDocument(document, options);
    }

    return { document, editor };
  }

  /**
   * Opens a preview window with the contents of a markdown file.
   *
   * Note that this will not work if the included VSCode Markdown extension
   * isn't working.
   *
   * @param context The VSCode extension context. Used to get the path for a
   *                file relative to the extension directory.
   * @param path    The path of the markdown file to preview.
   * @param options An options object with attribute `absolutePath` which
   *                lets you to specify if the file path given is relative or
   *                not.
   */
  public static async previewMarkdownFile(
    context: vscode.ExtensionContext,
    path: string,
    options: { absolutePath?: boolean } = {},
  ) {
    const file = options.absolutePath ? path : context.asAbsolutePath(path);
    const fileURI = vscode.Uri.file(file);

    await vscode.commands.executeCommand('markdown.showPreview', fileURI);
  }

  // * DATA UTILS
  /**
   * Utility function that converts text to camelCase. Useful for anything that
   * messes with the code in a document.
   *
   * @param text The text to convert to camelCase.
   * @param keepOuterUnderscores Whether or not to keep/remove any leading or
   *                             trailing underscores from the text.
   * @returns The text, converted to camelCase with any separators
   *          (anything not a letter or number) removed.
   */
  public static camelize(text: string, keepOuterUnderscores: boolean = false) {
    let [startUnderscores, endUnderscores] = ['', ''];

    if (keepOuterUnderscores) {
      const underStart = text.match(/^_+/);
      const underEnd = text.match(/_+$/);

      if (underStart) {
        startUnderscores = underStart[0];
      }
      if (underEnd) {
        endUnderscores = underEnd[0];
      }
    }

    const words = text
      .trim()
      .split(/[^a-zA-Z0-9]+/)
      .filter((w) => w);
    const firstWord = words[0].toLowerCase();

    const otherWords = words.slice(1).map((w) => {
      return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
    });

    return startUnderscores + firstWord + otherWords.join('') + endUnderscores;
  }

  /**
   * Utility function that converts text to PascalCase. Useful for anything that
   * messes with the code in a document.
   *
   * @param text The text to convert to PascalCase.
   * @param keepOuterUnderscores Whether or not to keep/remove any leading or
   *                             trailing underscores from the text.
   * @returns The text, converted to PascalCase with any separators
   *          (anything not a letter or number) removed.
   */
  public static pascalize(text: string, keepOuterUnderscores: boolean = false) {
    let [startUnderscores, endUnderscores] = ['', ''];

    if (keepOuterUnderscores) {
      const underStart = text.match(/^_+/);
      const underEnd = text.match(/_+$/);

      if (underStart) {
        startUnderscores = underStart[0];
      }
      if (underEnd) {
        endUnderscores = underEnd[0];
      }
    }

    const words = text
      .trim()
      .split(/[^a-zA-Z0-9]+/)
      .filter((w) => w)
      .map((w) => {
        return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
      });

    return startUnderscores + words.join('') + endUnderscores;
  }

  /**
   * Utility function that chops text up so that it fits within the specified
   * character line length. Can also supply a prefix to apply to every line
   * and whether to return an array of all the lines or return a string of
   * all the lines.
   *
   * @param text The text to work with.
   * @param limit The line length limit in characters.
   * @param options An (optional) options obect with:
   *
   *                `options.prefix` string to specify some text to put at
   *                the start of each line (counts towards the limit).
   *
   *                `options.asArray` boolean to specify if an array of all
   *                the lines should be returned.
   *
   * @returns The text chopped into multiple lines within the length limit,
   *          either as a string or an array.
   */
  public static withinCharLimit(
    text: string,
    limit: number,
    { prefix, asArray } = { prefix: '', asArray: false },
  ) {
    const lines = [];
    let currentLine = prefix;

    for (const word of text.split(/\s+/)) {
      if (currentLine.length + word.length > limit) {
        lines.push(currentLine.trimEnd());
        currentLine = prefix;
      } else {
        currentLine += word + ' ';
      }
    }

    if (currentLine) {
      lines.push(currentLine.trimEnd());
    }

    return asArray ? lines : lines.join('\n');
  }

  /**
   * Utility function that is like `VSCX.withinCharLimit`, but the limit is
   * set to 80, since that is a common line length limit to condense lines
   * of code within.
   *
   * @param text The text to work with.
   * @param options An (optional) options obect with:
   *
   *                `options.prefix` string to specify some text to put at
   *                the start of each line (counts towards the limit).
   *
   *                `options.asArray` boolean to specify if an array of all
   *                the lines should be returned.
   *
   * @returns The text chopped into multiple lines within 80 characters,
   *          either as a string or an array.
   */
  public static within80Chars(
    text: string,
    { prefix, asArray } = { prefix: '', asArray: false },
  ) {
    return VSCX.withinCharLimit(text, 80, { prefix, asArray });
  }
}
