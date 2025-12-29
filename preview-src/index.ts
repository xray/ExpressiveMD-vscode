// Webview script for ExpressiveMD preview

declare function acquireVsCodeApi(): {
  postMessage(message: unknown): void;
  getState(): unknown;
  setState(state: unknown): void;
};

(function () {
  const vscode = acquireVsCodeApi();

  // Handle toolbar button clicks
  document.addEventListener('DOMContentLoaded', () => {
    const selectPropsBtn = document.getElementById('select-props');
    if (selectPropsBtn) {
      selectPropsBtn.addEventListener('click', () => {
        vscode.postMessage({ type: 'selectProps' });
      });
    }

    const refreshBtn = document.getElementById('refresh');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        vscode.postMessage({ type: 'refresh' });
      });
    }

    const toggleSourceBtn = document.getElementById('toggle-source');
    if (toggleSourceBtn) {
      toggleSourceBtn.addEventListener('click', () => {
        vscode.postMessage({ type: 'toggleSource' });
      });
    }
  });

  // Handle links - open in VS Code or browser
  document.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;
    const link = target.closest('a');

    if (link && link.href) {
      event.preventDefault();
      vscode.postMessage({
        type: 'openLink',
        href: link.href,
      });
    }
  });

  // Handle messages from extension
  window.addEventListener('message', (event) => {
    const message = event.data;

    switch (message.type) {
      case 'updateContent':
        const content = document.querySelector('.content');
        if (content && message.html) {
          content.innerHTML = message.html;
        }
        break;
    }
  });
})();
