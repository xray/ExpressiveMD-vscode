import * as vscode from 'vscode';
import * as path from 'path';
import { PreviewManager } from '../preview/previewManager';

export function registerSelectPropsFileCommand(previewManager: PreviewManager): vscode.Disposable {
  return vscode.commands.registerCommand(
    'expressivemd.selectPropsFile',
    async () => {
      const preview = previewManager.getActivePreview();
      if (!preview) {
        vscode.window.showWarningMessage('No active ExpressiveMD preview');
        return;
      }

      // Find all JSON files in workspace
      const jsonFiles = await vscode.workspace.findFiles(
        '**/*.json',
        '**/node_modules/**',
        100 // Limit results
      );

      // Build quick pick items
      const items: vscode.QuickPickItem[] = jsonFiles.map((uri) => ({
        label: vscode.workspace.asRelativePath(uri),
        description: uri.fsPath,
        detail: undefined,
      }));

      // Sort by path
      items.sort((a, b) => a.label.localeCompare(b.label));

      // Add browse option at the top
      items.unshift({
        label: '$(file) Browse...',
        description: 'Select a JSON file from disk',
        alwaysShow: true,
      });

      // Add clear option if props file is set
      if (preview.propsFile) {
        items.unshift({
          label: '$(close) Clear props file',
          description: `Currently: ${path.basename(preview.propsFile)}`,
          alwaysShow: true,
        });
      }

      const selected = await vscode.window.showQuickPick(items, {
        placeHolder: 'Select a props file for preview',
        title: 'ExpressiveMD: Select Props File',
        matchOnDescription: true,
      });

      if (!selected) {
        return;
      }

      if (selected.label === '$(close) Clear props file') {
        previewManager.clearPropsFile();
        return;
      }

      if (selected.label === '$(file) Browse...') {
        const result = await vscode.window.showOpenDialog({
          canSelectFiles: true,
          canSelectFolders: false,
          canSelectMany: false,
          filters: { JSON: ['json'] },
          title: 'Select Props File',
        });

        if (result && result[0]) {
          previewManager.setPropsFile(result[0].fsPath);
        }
        return;
      }

      // Selected a file from the list
      if (selected.description) {
        previewManager.setPropsFile(selected.description);
      }
    }
  );
}

export function registerClearPropsFileCommand(previewManager: PreviewManager): vscode.Disposable {
  return vscode.commands.registerCommand(
    'expressivemd.clearPropsFile',
    () => {
      previewManager.clearPropsFile();
    }
  );
}
