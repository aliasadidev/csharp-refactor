'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import RefactorCommandExecutor from './commands/refactor-namespace-command';


export function activate(context: vscode.ExtensionContext) {

  context.subscriptions.push(
    vscode.commands.registerCommand(
      'csharprefactor.refactorNamespace',
      async (options: RegisterCommandCallbackArgument) => await (new RefactorCommandExecutor()).execute(options.fsPath)
    )
  );

}

interface RegisterCommandCallbackArgument {
  _fsPath: string,
  fsPath: string,
  path: string,
}
