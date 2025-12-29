import { spawn } from 'child_process';
import * as vscode from 'vscode';

export interface RenderResult {
  success: boolean;
  output?: string;
  error?: string;
}

/**
 * Renders an ExpressiveMD template using the emd CLI
 */
export async function renderEmd(
  templatePath: string,
  propsPath?: string
): Promise<RenderResult> {
  const config = vscode.workspace.getConfiguration('expressivemd');
  const emdPath = config.get<string>('emdPath', 'emd');

  const args = ['build', templatePath];
  if (propsPath) {
    args.push('--props', propsPath);
  }

  return new Promise((resolve) => {
    const proc = spawn(emdPath, args, {
      cwd: vscode.workspace.workspaceFolders?.[0]?.uri.fsPath,
    });

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (data: Buffer) => {
      stdout += data.toString();
    });

    proc.stderr.on('data', (data: Buffer) => {
      stderr += data.toString();
    });

    proc.on('error', (err) => {
      resolve({
        success: false,
        error: `Failed to run emd: ${err.message}. Make sure 'emd' is installed and in your PATH, or set expressivemd.emdPath in settings.`,
      });
    });

    proc.on('close', (code) => {
      if (code === 0) {
        resolve({ success: true, output: stdout });
      } else {
        resolve({ success: false, error: stderr || `emd exited with code ${code}` });
      }
    });
  });
}

/**
 * Checks if the emd binary is available
 */
export async function checkEmdAvailable(): Promise<boolean> {
  const config = vscode.workspace.getConfiguration('expressivemd');
  const emdPath = config.get<string>('emdPath', 'emd');

  return new Promise((resolve) => {
    const proc = spawn(emdPath, ['--version']);
    proc.on('error', () => resolve(false));
    proc.on('close', (code) => resolve(code === 0));
  });
}
