import * as vscode from 'vscode';
import {
  MoveCursorDirection,
  MoveCursorDirections,
} from './move_cursor_direction';
import { GetInputOptions } from './get_input_options';

//* GETTERS
export class VSCX {
  /**
   * The VSCode namespace for the current workspace.
   * A workspace is the collection of one or more folders that are opened in
   * an editor window (instance).
   *
   * Note that it is possible to open an editor *without* a workspace; e.g.
   * when you open VSCode for a single file.
   *
   * *Refer to https://code.visualstudio.com/docs/editor/workspaces for more
   * information on the concept of workspaces.*
   */
  public static get workspace() {
    return vscode.workspace;
  }

  /**
   * The VSCode window namespace.
   *
   * Namespace for dealing with the current window of the editor.
   * That is, visible and active editors as well as UI elements to
   * show messages, selections, and queries for user input.
   */
  public static get window() {
    return vscode.window;
  }

  /**
   * The current active text editor in VSCode, or `undefined` if none
   * are open.
   *
   * The active editor is the one that currently has focus or, when none has
   * focus, the one that has changed input most recently.
   */
  public static get editor() {
    return vscode.window.activeTextEditor;
  }

  /**
   * The current active notebook editor in VSCode, or `undefined` if none
   * are open.
   *
   * The active editor is the one that currently has focus or, when none has
   * focus, the one that has changed input most recently.
   */
  public static get notebook() {
    return vscode.window.activeNotebookEditor;
  }

  /**
   * The VSCode commands namespace.
   * A command is a function with a unique identifier.
   * The function is sometimes also called command handler.
   */
  public static get commands() {
    return vscode.commands;
  }

  /**
   * The document associated with the current active text editor, or
   * `undefined` if none are open.
   *
   * The document will be the same for the entire lifetime of the editor.
   */
  public static get document() {
    return vscode.window.activeTextEditor?.document;
  }

  /**
   * The identifier for the current language associated with the document
   * from the current activate text editor, or none if no editors open.
   */
  public static get currentLanguage() {
    return vscode.window.activeTextEditor?.document.languageId;
  }

  /**
   * The primary selection on the current active text editor.
   *
   * Shorthand for `VSCX.selections[0]`.
   */
  public static get selection() {
    return vscode.window.activeTextEditor?.selection;
  }

  /**
   * The selections in the current active text editor.
   *
   * The primary selection is always at index `0`.
   */
  public static get selections() {
    return vscode.window.activeTextEditor?.selections;
  }

  /**
   * The position of the cursor in the current active text editor.
   *
   * This position might be before or after
   * `selection.anchor`.
   *
   * @return A {@link vscode.Position} of where the cursor is.
   */
  public static get cursorPosition() {
    return vscode.window.activeTextEditor?.selection?.active;
  }

  /**
   * The current line number in the current active text editor, or
   * `undefined` if no open editor.
   *
   * Note that the returned line is not "live", and so will not change if the
   * current line changes.
   *
   * @return The {@link vscode.TextLine} within the range `[0, document.length)`
   */
  public static get currentLine() {
    const position = VSCX.cursorPosition;
    const doc = vscode.window.activeTextEditor?.document;

    return position ? doc?.lineAt(position) : undefined;
  }

  /**
   * Whether or not the current active text editor is set to insert spaces
   * for indentation.
   */
  public static get insertSpaces() {
    return vscode.window.activeTextEditor?.options.insertSpaces as boolean;
  }

  /**
   * Whether or not the current active text editor is set to insert tabs
   * for indentation.
   */
  public static get insertTabs() {
    return !vscode.window.activeTextEditor?.options.insertSpaces as boolean;
  }

  /**
   * The current length of the indent set for the current active text editor,
   * or `undefined` if no editors open.
   */
  public static get indentSize() {
    const editor = vscode.window.activeTextEditor;

    if (editor === undefined) {
      return undefined;
    }

    return editor.options.tabSize as number;
  }

  /**
   * The text to be inserted for indentation set for the current active text
   * editor, or `undefined` if no editors open.
   */
  public static get indentText() {
    const editor = vscode.window.activeTextEditor;

    if (editor === undefined) {
      return undefined;
    }

    return editor?.options.insertSpaces
      ? ' '.repeat(Number(editor.options.tabSize))
      : '\t';
  }

  /**
   * An object containing information about the indentation for the current
   * line of text in the current active text editor, or `undefined` if no
   * editors open.
   *
   * Has the following properties:
   *
   * `list`: A list of all the indents for the current line.
   *
   * `amount`: The number of indents for the current line.
   *
   * `text`: The text for the indent on the current line.
   */
  public static get currentLineIndentation() {
    if (vscode.window.activeTextEditor === undefined) {
      return undefined;
    }

    const currentLine = VSCX.currentLine as vscode.TextLine;
    const firstText = currentLine?.firstNonWhitespaceCharacterIndex;
    const indent = VSCX.indentText as string;

    const foundTabs = currentLine.text
      ?.slice(0, firstText)
      ?.matchAll(new RegExp(indent, 'g'));

    const list = foundTabs ? Array.from(foundTabs).map((t) => t[0]) : [];

    const amount = list ? list.length : 0;

    return { list, amount, text: currentLine.text };
  }

  /**
   * An object that generates the text for indentation for the level of
   * indentation at the current line in the current active text editor, or
   * indentation at any levels offset from the current one. Will return
   * `undefined` if no open text editors.
   *
   * Has the following properties:
   *
   * `currentLevel`: A number representing the current indentation level (based
   *                 from 0).
   *
   * `current`: The text for the current level of indentation.
   *
   * `offset(n)`: A function that generates text from any level of indentation
   *              offset from the current level (`n` can be negative).
   */
  public static get indent() {
    const indentInfo = VSCX.currentLineIndentation;

    if (indentInfo === undefined) {
      return undefined;
    }

    const indent = VSCX.indentText as string;

    const indentData: {
      currentLevel: number;
      current: string;
      offset: (n: number) => string;
    } = {
      currentLevel: indentInfo?.amount,
      current: indentInfo?.text,
      offset(n: number) {
        const level = this.currentLevel + n;
        return level + n <= 0 ? '' : indent?.repeat(level);
      },
    };

    return indentData;
  }
}

//* MESSAGING
export namespace VSCX {
  /**
   * Shorthand for `vscode.window.showInformationMessage`.
   * @param message The message to show.
   * @param items A list of {@link MessageItem}s to be rendered as
   *              actions in the message.
   * @returns A {@link Thenable} that resolves to the selected item or
   *          `undefined` when being dismissed.
   */
  export function info(
    message: string,
    ...items: vscode.MessageItem[]
  ): Thenable<vscode.MessageItem | undefined>;

  /**
   * Shorthand for `vscode.window.showInformationMessage`.
   * @param message The message to show.
   * @param items A list of strings to be rendered as
   *              actions in the message.
   * @returns A {@link Thenable} that resolves to the selected item or
   *          `undefined` when being dismissed.
   */
  export function info(
    message: string,
    ...items: string[]
  ): Thenable<string | undefined>;

  /**
   * Shorthand for `vscode.window.showInformationMessage`.
   * @param message The message to show.
   * @param options A {@link vscode.MessageOptions} object.
   * @param items A list of {@link vscode.MessageItem}s to be rendered as
   *              actions in the message.
   * @returns A {@link Thenable} that resolves to the selected item or
   *          `undefined` when being dismissed.
   */
  export function info(
    message: string,
    options: vscode.MessageOptions,
    ...items: vscode.MessageItem[]
  ): Thenable<vscode.MessageItem | undefined>;

  /**
   * Shorthand for `vscode.window.showInformationMessage`.
   * @param message The message to show.
   * @param options A {@link vscode.MessageOptions} object.
   * @param items A list of strings to be rendered as
   *              actions in the message.
   * @returns A {@link Thenable} that resolves to the selected item or
   *          `undefined` when being dismissed.
   */
  export function info(
    message: string,
    options: vscode.MessageOptions,
    ...items: string[]
  ): Thenable<string | undefined>;

  export function info(message: string, options: any, ...items: any[]) {
    return vscode.window.showInformationMessage(
      message,
      options || {},
      ...items,
    );
  }

  /**
   * Shorthand for `vscode.window.showWarningMessage`.
   * @param message The message to show.
   * @param items A list of {@link vscode.MessageItem}s to be rendered as
   *              actions in the message.
   * @returns A {@link Thenable} that resolves to the selected item or
   *          `undefined` when being dismissed.
   */
  export function warn(
    message: string,
    ...items: vscode.MessageItem[]
  ): Thenable<vscode.MessageItem | undefined>;

  /**
   * Shorthand for `vscode.window.showWarningMessage`.
   * @param message The message to show.
   * @param items A list of strings to be rendered as
   *              actions in the message.
   * @returns A {@link Thenable} that resolves to the selected item or
   *          `undefined` when being dismissed.
   */
  export function warn(
    message: string,
    ...items: string[]
  ): Thenable<string | undefined>;

  /**
   * Shorthand for `vscode.window.showWarningMessage`.
   * @param message The message to show.
   * @param options A {@link vscode.MessageOptions} object.
   * @param items A list of {@link vscode.MessageItem}s to be rendered as
   *              actions in the message.
   * @returns A {@link Thenable} that resolves to the selected item or
   *          `undefined` when being dismissed.
   */
  export function warn(
    message: string,
    options: vscode.MessageOptions,
    ...items: vscode.MessageItem[]
  ): Thenable<vscode.MessageItem | undefined>;

  /**
   * Shorthand for `vscode.window.showWarningMessage`.
   * @param message The message to show.
   * @param options A {@link vscode.MessageOptions} object.
   * @param items A list of strings to be rendered as
   *              actions in the message.
   * @returns A {@link Thenable} that resolves to the selected item or
   *          `undefined` when being dismissed.
   */
  export function warn(
    message: string,
    options: vscode.MessageOptions,
    ...items: string[]
  ): Thenable<string | undefined>;

  export function warn(message: string, options: any, ...items: any[]) {
    return vscode.window.showWarningMessage(message, options || {}, ...items);
  }

  /**
   * Shorthand for `vscode.window.showErrorMessage`.
   * @param message The message to show.
   * @param items A list of {@link vscode.MessageItem}s to be rendered as
   *              actions in the message.
   * @returns A {@link Thenable} that resolves to the selected item or
   *          `undefined` when being dismissed.
   */
  export function error(
    message: string,
    ...items: vscode.MessageItem[]
  ): Thenable<vscode.MessageItem | undefined>;

  /**
   * Shorthand for `vscode.window.showErrorMessage`.
   * @param message The message to show.
   * @param items A list of strings to be rendered as
   *              actions in the message.
   * @returns A {@link Thenable} that resolves to the selected item or
   *          `undefined` when being dismissed.
   */
  export function error(
    message: string,
    ...items: string[]
  ): Thenable<string | undefined>;

  /**
   * Shorthand for `vscode.window.showErrorMessage`.
   * @param message The message to show.
   * @param options A {@link vscode.MessageOptions} object.
   * @param items A list of {@link vscode.MessageItem}s to be rendered as
   *              actions in the message.
   * @returns A {@link Thenable} that resolves to the selected item or
   *          `undefined` when being dismissed.
   */
  export function error(
    message: string,
    options: vscode.MessageOptions,
    ...items: vscode.MessageItem[]
  ): Thenable<vscode.MessageItem | undefined>;

  /**
   * Shorthand for `vscode.window.showErrorMessage`.
   * @param message The message to show.
   * @param options A {@link vscode.MessageOptions} object.
   * @param items A list of strings to be rendered as
   *              actions in the message.
   * @returns A {@link Thenable} that resolves to the selected item or
   *          `undefined` when being dismissed.
   */
  export function error(
    message: string,
    options: vscode.MessageOptions,
    ...items: string[]
  ): Thenable<string | undefined>;

  export function error(message: string, options: any, ...items: any[]) {
    return vscode.window.showErrorMessage(message, options || {}, ...items);
  }

  /**
   * The object type used in {@link VSCX.temporaryMessage}'s `updateMessage`
   * function.
   *
   * Contains the following properties:
   *
   * `tick`: A string representing the number of the current update tick.
   *
   * `percentage`: A string representing the number of the percentage of the
   *               progress bar (e.g. "97" for 97%).
   *
   * `ms`: An object representing the passage of milliseconds with the following
   *       properties:
   *
   *  - `passed`: A string representing the number of millseconds passed
   *              displaying the temporary message.
   *
   *  - `left`:   A string representing the number of milliseconds the
   *              temporary message is scheduled to remain displayed.
   *
   * `seconds`: An object representing the passage of seconds with the
   *            following properties:
   *
   *  - `passed`: A string representing the number of seconds passed
   *              displaying the temporary message.
   *
   *  - `left`:   A string representing the number of seconds the
   *              temporary message is scheduled to remain displayed.
   */
  export type TemporaryMessageUpdate = {
    tick: string;
    percentage: string;
    ms: { passed: string; left: string };
    seconds: { passed: string; left: string };
  };

  /**
   * Creates a message that stays up for a specified amount of time, with a
   * progress bar in the message denoting the remaining time before the message
   * disappears.
   *
   * *Note that VS Code does not allow timed information messages, and that this
   * is actually a customized progress notification to mimick one. This is not
   * the same as an informational message.*
   *
   * @param message The message to display
   * @param time The amount of time (in milliseconds) to display the message
   * @param options An options object for the temporary message with the
   *                following properties:
   *
   *                `ticks`: The number of ticks to use to update the progress
   *                         bar.
   *
   *                    default: 100
   *
   *                `updateMessage`: A function that takes a
   *                                 {@link TemporaryMessageUpdate} object and
   *                                 generates a secondary message updated
   *                                 every tick.
   *
   *                    default: undefined
   *
   *                `endLength`: The amount of time (in milliseconds) to
   *                             display the progress as 100%. Ticks will
   *                             run in `time` - `endLength` time.
   *
   *                    default: 300
   *
   *                 `cancellable`: Whether to display a "cancel" button that
   *                                allows the user to close the message early.
   *
   *                    default: false
   *
   * @returns The {@link Thenable} returned from the message.
   */
  export function temporaryMessage(
    message: string,
    time: number,
    {
      // Default 100 ticks allows for relatively smooth progress bar animation,
      // and also 100 is very natural due to a tick per percent.
      ticks = 100,
      // Default updateMessage function is effectively a nop for no message.
      updateMessage = (_) => '',
      // Default endlength is 300 to allow for natural flow of the progress
      // bar with a slight, but visible moment where it is at 100% at the
      // very end.
      endLength = 300,
      // Default cancellable is false because the "cancel" button looks odd
      // for something that is mimicking a normal informational message.
      cancellable = false,
    }: {
      ticks?: number;
      updateMessage?: (update: TemporaryMessageUpdate) => any;
      endLength: number;
      cancellable?: boolean;
    } = {
      ticks: 100,
      updateMessage: (_) => '',
      endLength: 300,
      cancellable: false,
    },
  ) {
    updateMessage = updateMessage ?? ((_) => '');
    let tickLoop: number = -1;

    const output = vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: message,
        cancellable,
      },
      async (progress, token) => {
        // Set bar to 0% at start, to ensure default animation will not play.
        progress.report({ increment: 0 });

        let percentage = 0;
        let tick = 0;
        const msLeft = () => time - time * (percentage / 100);
        let currentMSLeft = time;

        // Set interval to update progress the amount specified with ticks.
        tickLoop = setInterval(() => {
          tick++;
          percentage = percentage >= 100 ? 100 : percentage + 100 / ticks;

          // Get snapshot of milliseconds left.
          currentMSLeft = msLeft();

          progress.report({
            increment: 100 / ticks,
            // Convert to string to allow for any possible update data.
            message: updateMessage({
              tick: tick.toString(),
              percentage: percentage.toString(),
              ms: {
                passed: (time - currentMSLeft).toFixed(0),
                left: currentMSLeft.toFixed(0),
              },
              seconds: {
                passed: ((time - currentMSLeft) / 1000).toFixed(2),
                left: (currentMSLeft / 1000).toFixed(2),
              },
            }).toString(),
          });
        }, (time - endLength) / ticks);

        // Set progress to 100% for whatever the specified end length is.
        if (endLength > 0) {
          setTimeout(() => {
            progress.report({ increment: 100 });
            percentage = 100;
          }, time - endLength);
        }

        // Wait for the specified time so the message stays up.
        await new Promise((r) => setTimeout(r, time));
      },
    );

    // Remove the tick interval when done.
    clearInterval(tickLoop);

    return output;
  }
}

// * QUICKPICK
export namespace VSCX {
  function _strToQP(text: string) {
    // Allow special syntax to easily create a separator with string item.
    // Any string of "----- TEXT" becomes a separator with a label of
    // TEXT.
    if (text.startsWith('-----')) {
      return {
        label: text.slice(0, 5).trimStart(),
        kind: 'SEP',
      };
    }

    // Lambda to split text into two parts, as String.split does not actually
    // return the rest of the string in the last part.
    const split = (s: string, pattern: string) => {
      let parts = s.split(pattern);

      if (parts.length > 2) {
        parts = [parts[0], parts.slice(1).join(pattern)];
      }

      return parts;
    };

    let [label, description, detail] = ['', '', '', ''];

    const firstSplit = split(text, '::');

    label = firstSplit[0];

    if (firstSplit.length > 1) {
      description = firstSplit[1];
      text = firstSplit[1];
    } else {
      text = firstSplit[0];
    }

    const secondSplit = split(text, '??');

    if (secondSplit.length > 1) {
      if (description !== '') {
        description = secondSplit[0];
      }

      detail = secondSplit[1];
    }

    return {
      alwaysShow: true,
      label: label.trim(),
      description: description.trim(),
      detail: detail.trim(),
    };
  }

  /**
   * Utility function over {@link vscode.window.showQuickPick}, which shows
   * a popup menu list of choice to select from.
   *
   * Similar in structure, but allows for mixing strings and
   * {@link vscode.QuickPickItem} items, with the strings being automatically
   * converted into quick pick items.
   *
   * Additionally, the method has the convenience of having any string item
   * in the format of "`----- TEXT`" being converted into a separator quick
   * pick item with any text being set as the label for the separator.
   *
   * @param items The items to use as choices in the menu.
   * @param options The options for the quick pick menu itself.
   * @param token A {@link vscode.CancellationToken} to signify if the
   *              menu is cancelled.
   *
   * @returns A promise that resolves to the selected item or `undefined`.
   */
  export function quickpick(
    items: (string | vscode.QuickPickItem)[],
    options: vscode.QuickPickOptions = {
      canPickMany: false,
      ignoreFocusOut: false,
      matchOnDescription: false,
      matchOnDetail: false,
    },
    token?: vscode.CancellationToken,
  ) {
    // Convert all string items to a QuickPickItem version.
    items = items.map((item) => {
      if (typeof item !== 'string') {
        return item;
      }

      return _strToQP(item) as vscode.QuickPickItem;
    });

    return vscode.window.showQuickPick(
      items as vscode.QuickPickItem[],
      options,
      token,
    );
  }
}

// * COMMANDS
export namespace VSCX {
  /**
   * The list of commands registered for VSCode.
   * @param showInternal Whether or not to show internal VSCode commands
   *                     (They start with an underscore).
   * @returns A promise containing a list of strings of all the command names.
   */
  export async function commandList(showInternal: boolean = false) {
    return await vscode.commands.getCommands(showInternal);
  }

  /**
   * Checks if the given command names have been registered with VSCode.
   *
   * @param commandNames The names of the commands to test the existence of.
   * @returns A boolean representing if all the command names have been
   *          registered.
   */
  export async function commandExists(...commandNames: string[]) {
    const commands = await VSCX.commandList();

    // Return whether any command name given is not found in command list.
    return Boolean(commandNames.find((name) => commands.includes(name)));
  }
}

export namespace VSCX {
  // * ATTRIBUTE ACCESSORS
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
  export function currentLanguageMatch(
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

  // * VSCODE API FUNCTIONALITY

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
  export async function getInput(options: GetInputOptions | string) {
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
  export function insertAtCursor(text: string) {
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
  export async function moveCursor(
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
  export async function moveCursorUp(
    unit: 'line' | 'wrappedLine' | 'character' | 'halfLine',
    amount: number | string = 1,
    select: boolean = false,
  ) {
    amount = typeof amount === 'string' ? amount.length : amount;

    return await VSCX.moveCursor(MoveCursorDirections.Up, unit, amount, select);
  }

  /**
   * Same as `VSCX.moveCursor` but it automatically moves down.
   *
   * @param unit      A string for the name of the unit of what to be moving by.
   * @param amount    The amount to move the cursor by.
   * @param select    Whether to select text as the cursor moves.
   * @returns Whatever `moveCommand` is supposed to return; probably `undefined`.
   */
  export async function moveCursorDown(
    unit: 'line' | 'wrappedLine' | 'character' | 'halfLine',
    amount: number | string = 1,
    select = false,
  ) {
    amount = typeof amount === 'string' ? amount.length : amount;

    return await VSCX.moveCursor(
      MoveCursorDirections.Down,
      unit,
      amount,
      select,
    );
  }

  /**
   * Same as `VSCX.moveCursor` but it automatically moves left.
   *
   * @param unit      A string for the name of the unit of what to be moving by.
   * @param amount    The amount to move the cursor by.
   * @param select    Whether to select text as the cursor moves.
   * @returns Whatever `moveCommand` is supposed to return; probably `undefined`.
   */
  export async function moveCursorLeft(
    unit: 'line' | 'wrappedLine' | 'character' | 'halfLine',
    amount: number | string = 1,
    select = false,
  ) {
    amount = typeof amount === 'string' ? amount.length : amount;

    return await VSCX.moveCursor(
      MoveCursorDirections.Left,
      unit,
      amount,
      select,
    );
  }

  /**
   * Same as `VSCX.moveCursor` but it automatically moves right.
   *
   * @param unit      A string for the name of the unit of what to be moving by.
   * @param amount    The amount to move the cursor by.
   * @param select    Whether to select text as the cursor moves.
   * @returns Whatever `moveCommand` is supposed to return; probably `undefined`.
   */
  export async function moveCursorRight(
    unit: 'line' | 'wrappedLine' | 'character' | 'halfLine',
    amount: number | string = 1,
    select = false,
  ) {
    amount = typeof amount === 'string' ? amount.length : amount;

    return await VSCX.moveCursor(
      MoveCursorDirections.Right,
      unit,
      amount,
      select,
    );
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
   *
   *                `showBeside` lets you specify if the text file should be
   *                open in a new editor pane beside the current one.
   * @returns An object with the opened text file document and the editor
   *          it was opened in (if allowed).
   */
  export async function openTextFile(
    context: vscode.ExtensionContext,
    path: string,
    options: vscode.TextDocumentShowOptions & {
      absolutePath?: boolean;
      showFile?: boolean;
      viewBeside?: boolean;
    } = {},
  ) {
    options.showFile = options.showFile ?? true;
    options.viewColumn = options.viewBeside
      ? vscode.ViewColumn.Beside
      : options.viewColumn;

    const file = options.absolutePath ? path : context.asAbsolutePath(path);
    const document = await VSCX.workspace.openTextDocument(file);
    let editor;

    if (options.showFile) {
      editor = await vscode.window.showTextDocument(document, options);
    }

    return { document, editor };
  }

  // TODO: Make functions using vscode.workspace.fs
  //     | Such as readFile, writeFile, copyFile, deleteFile, makeDirectory,
  //     | readDirectory, renameFile, etc.

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
  export async function previewMarkdownFile(
    context: vscode.ExtensionContext,
    path: string,
    options: { absolutePath?: boolean } = {},
  ) {
    const file = options.absolutePath ? path : context.asAbsolutePath(path);
    const fileURI = vscode.Uri.file(file);
    let previewSuccess = true;

    try {
      await vscode.commands.executeCommand('markdown.showPreview', fileURI);
    } catch (markdownPreviewError: unknown) {
      previewSuccess = false;
    }

    return previewSuccess;
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
  export function camelize(
    text: string,
    keepOuterUnderscores: boolean = false,
  ) {
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
  export function pascalize(
    text: string,
    keepOuterUnderscores: boolean = false,
  ) {
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
  export function withinCharLimit(
    text: string,
    limit: number,
    { prefix, asArray } = { prefix: '', asArray: false },
  ) {
    const lines: string[] = [];
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
  export function within80Chars(
    text: string,
    { prefix, asArray } = { prefix: '', asArray: false },
  ) {
    return VSCX.withinCharLimit(text, 80, { prefix, asArray });
  }
}
