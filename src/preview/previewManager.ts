import * as vscode from 'vscode';
import { EmdPreview } from './preview';

export class PreviewManager implements vscode.Disposable {
  private readonly _previews = new Map<string, EmdPreview>();
  private readonly _extensionUri: vscode.Uri;
  private readonly _disposables: vscode.Disposable[] = [];
  private _activePreview: EmdPreview | undefined;

  constructor(context: vscode.ExtensionContext) {
    this._extensionUri = context.extensionUri;

    // Watch for document changes
    this._disposables.push(
      vscode.workspace.onDidChangeTextDocument((e) => {
        const config = vscode.workspace.getConfiguration('expressivemd');
        if (config.get<boolean>('preview.autoRefresh', true)) {
          const preview = this._previews.get(e.document.uri.toString());
          if (preview) {
            preview.refresh();
          }
        }
      })
    );

    // Watch for document close
    this._disposables.push(
      vscode.workspace.onDidCloseTextDocument((document) => {
        const key = document.uri.toString();
        const preview = this._previews.get(key);
        if (preview) {
          preview.dispose();
          this._previews.delete(key);
        }
      })
    );

    // Track active preview
    this._disposables.push(
      vscode.window.onDidChangeActiveTextEditor((editor) => {
        if (editor && editor.document.languageId === 'expressivemd') {
          const preview = this._previews.get(editor.document.uri.toString());
          if (preview) {
            this._activePreview = preview;
          }
        }
      })
    );
  }

  public showPreview(uri?: vscode.Uri, sideBySide = false): void {
    const resource = this._getResource(uri);
    if (!resource) {
      vscode.window.showErrorMessage('No ExpressiveMD file to preview');
      return;
    }

    const existingPreview = this._previews.get(resource.toString());
    if (existingPreview) {
      existingPreview.reveal(sideBySide ? vscode.ViewColumn.Beside : vscode.ViewColumn.Active);
      return;
    }

    // Find or open the document
    vscode.workspace.openTextDocument(resource).then((document) => {
      const viewColumn = sideBySide
        ? vscode.ViewColumn.Beside
        : vscode.ViewColumn.Active;

      const preview = EmdPreview.create(this._extensionUri, document, viewColumn);
      this._previews.set(resource.toString(), preview);
      this._activePreview = preview;

      // Clean up when panel is closed
      preview.panel.onDidDispose(() => {
        this._previews.delete(resource.toString());
        if (this._activePreview === preview) {
          this._activePreview = undefined;
        }
      });
    });
  }

  public getActivePreview(): EmdPreview | undefined {
    return this._activePreview;
  }

  public setPropsFile(propsPath: string | undefined): void {
    if (this._activePreview) {
      this._activePreview.setPropsFile(propsPath);
    }
  }

  public clearPropsFile(): void {
    if (this._activePreview) {
      this._activePreview.setPropsFile(undefined);
    }
  }

  public refreshActivePreview(): void {
    if (this._activePreview) {
      this._activePreview.refresh();
    }
  }

  public dispose(): void {
    for (const preview of this._previews.values()) {
      preview.dispose();
    }
    this._previews.clear();

    while (this._disposables.length) {
      const disposable = this._disposables.pop();
      if (disposable) {
        disposable.dispose();
      }
    }
  }

  private _getResource(uri?: vscode.Uri): vscode.Uri | undefined {
    if (uri) {
      return uri;
    }

    const activeEditor = vscode.window.activeTextEditor;
    if (activeEditor && activeEditor.document.languageId === 'expressivemd') {
      return activeEditor.document.uri;
    }

    return undefined;
  }
}
