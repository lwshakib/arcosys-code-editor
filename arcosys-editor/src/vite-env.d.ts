/// <reference types="vite/client" />

interface IpcRenderer {
  invoke(channel: string, ...args: any[]): Promise<any>;
  send(channel: string, ...args: any[]): void;
  on(channel: string, func: (...args: any[]) => void): () => void;
  off(channel: string, func: (...args: any[]) => void): void;
}

interface Window {
  ipcRenderer: IpcRenderer;
}
