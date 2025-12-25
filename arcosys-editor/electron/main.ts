import { app, BrowserWindow, ipcMain, dialog, shell } from "electron";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";
import chokidar from "chokidar";

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, "..");

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, "public")
  : RENDERER_DIST;

interface FileNode {
  name: string;
  path: string;
  type: "file" | "directory";
  children?: FileNode[];
}

const IGNORED_DIRS = [
  "node_modules",
  ".git",
  "dist",
  ".next",
  "out",
  "build",
  "env",
  "venv",
  "dist-electron",
];

function readDirRecursively(dirPath: string): FileNode | null {
  const baseName = path.basename(dirPath);
  if (IGNORED_DIRS.includes(baseName)) return null;

  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    const children = entries
      .map((entry) => {
        const fullPath = path.join(dirPath, entry.name);
        if (entry.isDirectory()) {
          return readDirRecursively(fullPath);
        } else {
          return { name: entry.name, path: fullPath, type: "file" as const };
        }
      })
      .filter((child): child is FileNode => child !== null);

    children.sort((a, b) => {
      if (a.type === b.type) return a.name.localeCompare(b.name);
      return a.type === "directory" ? -1 : 1;
    });

    return { name: baseName, path: dirPath, type: "directory", children };
  } catch (error) {
    return null;
  }
}

let watcher: any = null;

const startWatching = (folderPath: string) => {
  if (watcher) {
    watcher.close();
  }

  watcher = chokidar.watch(folderPath, {
    ignored: [
      /(^|[\/\\])\../,
      "**/node_modules/**",
      "**/.git/**",
      "**/dist/**",
      "**/build/**",
    ],
    persistent: true,
    ignoreInitial: true,
  });

  let debounceTimer: NodeJS.Timeout | null = null;
  const notifyChange = () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      win?.webContents.send("fs:changed");
    }, 10);
  };

  watcher
    .on("add", notifyChange)
    .on("change", notifyChange)
    .on("unlink", notifyChange)
    .on("addDir", notifyChange)
    .on("unlinkDir", notifyChange);
};

ipcMain.handle("dialog:openFolder", async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ["openDirectory"],
  });
  if (canceled) {
    return null;
  }
  const folderPath = filePaths[0];
  startWatching(folderPath);
  return readDirRecursively(folderPath);
});

let win: BrowserWindow | null;

function createWindow() {
  win = new BrowserWindow({
    title: "ArcoSys Code Editor",
    width: 1400,
    height: 1000,
    frame: false,
    backgroundColor: "#232A35",
    icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs"),
    },
  });

  // Test active push message to Renderer-process.
  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", new Date().toLocaleString());
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
    win.webContents.openDevTools({ mode: "detach" });
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.handle("fs:createFile", async (_, fullPath) => {
  try {
    fs.writeFileSync(fullPath, "");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle("fs:createFolder", async (_, fullPath) => {
  try {
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle("fs:readFile", async (_, fullPath) => {
  try {
    const content = fs.readFileSync(fullPath, "utf8");
    return { success: true, content };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle("fs:revealInExplorer", async (_, fullPath) => {
  try {
    shell.showItemInFolder(fullPath);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle("fs:delete", async (_, fullPath) => {
  try {
    fs.rmSync(fullPath, { recursive: true, force: true });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle("fs:rename", async (_, oldPath, newPath) => {
  try {
    fs.renameSync(oldPath, newPath);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle("fs:writeFile", async (_, fullPath, content) => {
  try {
    fs.writeFileSync(fullPath, content);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle("fs:copy", async (_, src, dest) => {
  try {
    fs.cpSync(src, dest, { recursive: true });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle("fs:readDirRecursively", async (_, fullPath) => {
  try {
    return readDirRecursively(fullPath);
  } catch (error: any) {
    return null;
  }
});

app.whenReady().then(createWindow);
