import * as vscode from 'vscode';
import * as path from 'path';
import { renderEmd } from '../util/emdRunner';
import { marked } from 'marked';

export class EmdPreview implements vscode.Disposable {
  public static readonly viewType = 'expressivemd.preview';

  private readonly _panel: vscode.WebviewPanel;
  private readonly _extensionUri: vscode.Uri;
  private _document: vscode.TextDocument;
  private _propsFile: string | undefined;
  private _showSource = false; // Toggle between rendered HTML and raw markdown
  private _disposables: vscode.Disposable[] = [];

  public static create(
    extensionUri: vscode.Uri,
    document: vscode.TextDocument,
    viewColumn: vscode.ViewColumn
  ): EmdPreview {
    const panel = vscode.window.createWebviewPanel(
      EmdPreview.viewType,
      `Preview: ${path.basename(document.fileName)}`,
      viewColumn,
      {
        enableScripts: true,
        localResourceRoots: [
          vscode.Uri.joinPath(extensionUri, 'media'),
          vscode.Uri.joinPath(extensionUri, 'node_modules', '@vscode', 'codicons', 'dist'),
        ],
        retainContextWhenHidden: true,
      }
    );

    return new EmdPreview(panel, extensionUri, document);
  }

  private constructor(
    panel: vscode.WebviewPanel,
    extensionUri: vscode.Uri,
    document: vscode.TextDocument
  ) {
    this._panel = panel;
    this._extensionUri = extensionUri;
    this._document = document;

    // Set up message handling from webview
    this._panel.webview.onDidReceiveMessage(
      (message) => this._handleMessage(message),
      null,
      this._disposables
    );

    // Initial render
    this._update();
  }

  public get panel(): vscode.WebviewPanel {
    return this._panel;
  }

  public get document(): vscode.TextDocument {
    return this._document;
  }

  public get propsFile(): string | undefined {
    return this._propsFile;
  }

  public setPropsFile(propsPath: string | undefined): void {
    this._propsFile = propsPath;
    this._updateTitle();
    this._update();
  }

  public async refresh(): Promise<void> {
    await this._update();
  }

  public reveal(viewColumn?: vscode.ViewColumn): void {
    this._panel.reveal(viewColumn);
  }

  public dispose(): void {
    this._panel.dispose();
    while (this._disposables.length) {
      const disposable = this._disposables.pop();
      if (disposable) {
        disposable.dispose();
      }
    }
  }

  private _updateTitle(): void {
    const fileName = path.basename(this._document.fileName);
    if (this._propsFile) {
      const propsName = path.basename(this._propsFile);
      this._panel.title = `Preview: ${fileName} (${propsName})`;
    } else {
      this._panel.title = `Preview: ${fileName}`;
    }
  }

  private async _update(): Promise<void> {
    const result = await renderEmd(
      this._document.uri.fsPath,
      this._propsFile
    );

    if (result.success && result.output) {
      if (this._showSource) {
        // Show raw markdown source
        this._panel.webview.html = this._getHtml(
          `<pre class="source-view"><code>${this._escapeHtml(result.output)}</code></pre>`,
          result.output
        );
      } else {
        // Convert markdown to HTML for rendered view
        const html = await marked(result.output);
        this._panel.webview.html = this._getHtml(html, result.output);
      }
    } else {
      this._panel.webview.html = this._getErrorHtml(result.error || 'Unknown error');
    }
  }

  private _handleMessage(message: { type: string; [key: string]: unknown }): void {
    switch (message.type) {
      case 'selectProps':
        vscode.commands.executeCommand('expressivemd.selectPropsFile');
        break;
      case 'refresh':
        this.refresh();
        break;
      case 'toggleSource':
        this._showSource = !this._showSource;
        this._update();
        break;
    }
  }

  private _getHtml(content: string, rawMarkdown?: string): string {
    const webview = this._panel.webview;
    const styleUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'media', 'preview.css')
    );
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'media', 'index.js')
    );
    const codiconsUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'node_modules', '@vscode', 'codicons', 'dist', 'codicon.css')
    );

    const propsLabel = this._propsFile
      ? path.basename(this._propsFile)
      : 'No props';

    const toggleIcon = this._showSource ? 'codicon-preview' : 'codicon-code';
    const toggleTitle = this._showSource ? 'Show Rendered Preview' : 'Show Markdown Source';

    const nonce = this._getNonce();

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}'; img-src ${webview.cspSource} https: data:; font-src ${webview.cspSource};">
  <link href="${codiconsUri}" rel="stylesheet">
  <link href="${styleUri}" rel="stylesheet">
  <title>ExpressiveMD Preview</title>
</head>
<body>
  <div class="toolbar">
    <button id="select-props" title="Select Props File">
      <span class="codicon codicon-json"></span>
      <span class="label">${this._escapeHtml(propsLabel)}</span>
    </button>
    <div class="toolbar-separator"></div>
    <button id="toggle-source" title="${toggleTitle}" class="${this._showSource ? 'active' : ''}">
      <span class="codicon ${toggleIcon}"></span>
    </button>
    <button id="refresh" title="Refresh Preview">
      <span class="codicon codicon-refresh"></span>
    </button>
  </div>
  <div class="content${this._showSource ? ' source-mode' : ''}">
    ${content}
  </div>
  <script nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`;
  }

  private _getErrorHtml(error: string): string {
    const webview = this._panel.webview;
    const styleUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'media', 'preview.css')
    );

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="${styleUri}" rel="stylesheet">
  <title>ExpressiveMD Preview - Error</title>
</head>
<body>
  <div class="error">
    <h2>Error rendering template</h2>
    <pre>${this._escapeHtml(error)}</pre>
  </div>
</body>
</html>`;
  }

  private _getNonce(): string {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }

  private _escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
