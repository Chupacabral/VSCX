/**
 * Type describing options for `VSCX.getInput`.
 *
 * Is generally the same as `vscode.InputBoxOptions`, but with an additional
 * `valueOnCancel` attribute, that allows for a custom value to be returned
 * if the input box is cancelled, instead of only returning undefined.
 */
export type GetInputOptions = {
  ignoreFocusOut?: boolean;
  password?: boolean;
  placeHolder?: string;
  prompt?: string;
  title?: string;
  value?: string;
  valueSelection?: [number, number];
  valueOnCancel?: any;
};
