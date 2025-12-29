import * as vscode from 'vscode';
import { PreviewManager } from '../preview/previewManager';

export function registerShowPreviewCommand(previewManager: PreviewManager): vscode.Disposable {
  return vscode.commands.registerCommand(
    'expressivemd.showPreview',
    (uri?: vscode.Uri) => {
      previewManager.showPreview(uri, false);
    }
  );
}

export function registerShowPreviewToSideCommand(previewManager: PreviewManager): vscode.Disposable {
  return vscode.commands.registerCommand(
    'expressivemd.showPreviewToSide',
    (uri?: vscode.Uri) => {
      previewManager.showPreview(uri, true);
    }
  );
}

export function registerRefreshPreviewCommand(previewManager: PreviewManager): vscode.Disposable {
  return vscode.commands.registerCommand(
    'expressivemd.refreshPreview',
    () => {
      previewManager.refreshActivePreview();
    }
  );
}
