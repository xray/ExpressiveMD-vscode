import * as vscode from 'vscode';
import { PreviewManager } from './preview/previewManager';
import {
  registerShowPreviewCommand,
  registerShowPreviewToSideCommand,
  registerRefreshPreviewCommand,
} from './commands/showPreview';
import {
  registerSelectPropsFileCommand,
  registerClearPropsFileCommand,
} from './commands/selectPropsFile';
import { checkEmdAvailable } from './util/emdRunner';

export async function activate(context: vscode.ExtensionContext) {
  console.log('ExpressiveMD extension is now active');

  // Check if emd is available
  const emdAvailable = await checkEmdAvailable();
  if (!emdAvailable) {
    vscode.window.showWarningMessage(
      'ExpressiveMD: The "emd" command was not found. Preview functionality requires the emd CLI to be installed. ' +
      'Install it or set the path in settings (expressivemd.emdPath).',
      'Open Settings'
    ).then((selection) => {
      if (selection === 'Open Settings') {
        vscode.commands.executeCommand('workbench.action.openSettings', 'expressivemd.emdPath');
      }
    });
  }

  // Create preview manager
  const previewManager = new PreviewManager(context);
  context.subscriptions.push(previewManager);

  // Register commands
  context.subscriptions.push(
    registerShowPreviewCommand(previewManager),
    registerShowPreviewToSideCommand(previewManager),
    registerRefreshPreviewCommand(previewManager),
    registerSelectPropsFileCommand(previewManager),
    registerClearPropsFileCommand(previewManager)
  );
}

export function deactivate() {
  console.log('ExpressiveMD extension is now deactivated');
}
