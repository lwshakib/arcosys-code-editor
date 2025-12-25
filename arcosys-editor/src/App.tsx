import { useState, useRef, useCallback, useEffect } from "react";
import {
  VscChevronLeft,
  VscChevronRight,
  VscChromeMinimize,
  VscChromeMaximize,
  VscChromeClose,
  VscSymbolColor,
  VscSearch,
  VscAccount,
  VscSettingsGear,
} from "react-icons/vsc";
import { ActivityBar } from "./components/ActivityBar";
import { SidePanel, type FileNode } from "./components/SidePanel";
import { EditorArea } from "./components/EditorArea";
import { RightSidebar } from "./components/RightSidebar";

function App() {
  const [openFiles, setOpenFiles] = useState<FileNode[]>([]);
  const [activeFile, setActiveFile] = useState<FileNode | null>(null);
  const [fileContents, setFileContents] = useState<{ [path: string]: string }>(
    {}
  );

  // Resizable panel state
  const [sidePanelWidth, setSidePanelWidth] = useState(256); // 256px = w-64
  const [rightSidebarWidth, setRightSidebarWidth] = useState(320); // 320px = w-80
  const [isResizingLeft, setIsResizingLeft] = useState(false);
  const [isResizingRight, setIsResizingRight] = useState(false);
  const [terminalHeight, setTerminalHeight] = useState(250);
  const [isResizingTerminal, setIsResizingTerminal] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Min and max widths
  const MIN_PANEL_WIDTH = 200;
  const MAX_PANEL_WIDTH = 600;

  // Dropdown menu state
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  // Active view state (explorer or search)
  const [activeView, setActiveView] = useState<"explorer" | "search">(
    "explorer"
  );

  // Root folder path for search
  const [rootFolderPath, setRootFolderPath] = useState<string | null>(null);

  // Terminal state
  const [showTerminal, setShowTerminal] = useState(false);

  const handleFileClick = async (file: FileNode) => {
    // 1. Add to openFiles if not already there
    if (!openFiles.find((f) => f.path === file.path)) {
      setOpenFiles((prev) => [...prev, file]);
    }

    // 2. Set as active
    setActiveFile(file);

    // 3. Fetch content if not cached
    if (!fileContents[file.path]) {
      const result = await window.ipcRenderer.invoke("fs:readFile", file.path);
      if (result.success) {
        setFileContents((prev) => ({ ...prev, [file.path]: result.content }));
      } else {
        console.error("Failed to read file:", result.error);
        setFileContents((prev) => ({
          ...prev,
          [file.path]: `Error reading file: ${result.error}`,
        }));
      }
    }
  };

  const handleCloseTab = (e: React.MouseEvent, path: string) => {
    e.stopPropagation();
    const newOpenFiles = openFiles.filter((f) => f.path !== path);
    setOpenFiles(newOpenFiles);

    // If closing active file, switch to the last tab or null
    if (activeFile?.path === path) {
      if (newOpenFiles.length > 0) {
        setActiveFile(newOpenFiles[newOpenFiles.length - 1]);
      } else {
        setActiveFile(null);
      }
    }

    // Optional: Clean up cache? Usually keep it for performance if they re-open.
  };

  const handleFileDelete = (path: string) => {
    // 1. Remove from openFiles
    const index = openFiles.findIndex((f) => f.path === path);
    if (index === -1) return;

    const newOpenFiles = openFiles.filter((f) => f.path !== path);
    setOpenFiles(newOpenFiles);

    // 2. Adjust activeFile if needed
    if (activeFile?.path === path) {
      if (newOpenFiles.length > 0) {
        // Select the one before it, or the first one if it was the first
        // User requested: "select before element"
        // If index was 0 (first element), select the new first element (which was index 1)
        // If index was > 0, select index - 1
        const newActiveIndex = index > 0 ? index - 1 : 0;
        // Ensure bounds
        if (newActiveIndex < newOpenFiles.length) {
          setActiveFile(newOpenFiles[newActiveIndex]);
        } else {
          setActiveFile(null);
        }
      } else {
        setActiveFile(null);
      }
    }
  };

  const getLanguage = (fileName: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase();
    switch (ext) {
      case "js":
      case "jsx":
        return "javascript";
      case "ts":
      case "tsx":
        return "typescript";
      case "css":
        return "css";
      case "html":
        return "html";
      case "json":
        return "json";
      case "md":
        return "markdown";
      default:
        return "plaintext";
    }
  };

  // Resize handlers for left panel (side panel)
  const handleLeftMouseDown = useCallback(() => {
    setIsResizingLeft(true);
  }, []);

  const handleLeftMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizingLeft || !containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const newWidth = e.clientX - containerRect.left - 48; // 48px for activity bar

      if (newWidth >= MIN_PANEL_WIDTH && newWidth <= MAX_PANEL_WIDTH) {
        setSidePanelWidth(newWidth);
      }
    },
    [isResizingLeft, MIN_PANEL_WIDTH, MAX_PANEL_WIDTH]
  );

  const handleLeftMouseUp = useCallback(() => {
    setIsResizingLeft(false);
  }, []);

  // Resize handlers for right panel (right sidebar)
  const handleRightMouseDown = useCallback(() => {
    setIsResizingRight(true);
  }, []);

  const handleRightMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizingRight || !containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const newWidth = containerRect.right - e.clientX;

      if (newWidth >= MIN_PANEL_WIDTH && newWidth <= MAX_PANEL_WIDTH) {
        setRightSidebarWidth(newWidth);
      }
    },
    [isResizingRight, MIN_PANEL_WIDTH, MAX_PANEL_WIDTH]
  );

  const handleRightMouseUp = useCallback(() => {
    setIsResizingRight(false);
  }, []);

  // Resize handlers for terminal
  const handleTerminalMouseDown = useCallback(() => {
    setIsResizingTerminal(true);
  }, []);

  const handleTerminalMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizingTerminal || !containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const newHeight = containerRect.bottom - e.clientY;

      if (newHeight >= 100 && newHeight <= 600) {
        setTerminalHeight(newHeight);
      }
    },
    [isResizingTerminal]
  );

  const handleTerminalMouseUp = useCallback(() => {
    setIsResizingTerminal(false);
  }, []);

  // Global mouse event listeners
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      handleLeftMouseMove(e);
      handleRightMouseMove(e);
      handleTerminalMouseMove(e);
    };

    const handleMouseUp = () => {
      handleLeftMouseUp();
      handleRightMouseUp();
      handleTerminalMouseUp();
    };

    if (isResizingLeft || isResizingRight || isResizingTerminal) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = isResizingTerminal
        ? "row-resize"
        : "col-resize";
      document.body.style.userSelect = "none";

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      };
    }
  }, [
    isResizingTerminal,
    handleLeftMouseMove,
    handleRightMouseMove,
    handleTerminalMouseMove,
    handleLeftMouseUp,
    handleRightMouseUp,
    handleTerminalMouseUp,
  ]);

  // Close dropdown menus when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (openMenu) {
        setOpenMenu(null);
      }
    };

    if (openMenu) {
      document.addEventListener("click", handleClickOutside);
      return () => {
        document.removeEventListener("click", handleClickOutside);
      };
    }
  }, [openMenu]);

  const toggleMenu = (menu: string) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  // Window control handlers
  const handleMinimize = () => {
    window.ipcRenderer.send("window:minimize");
  };

  const handleMaximize = () => {
    window.ipcRenderer.send("window:maximize");
  };

  const handleClose = () => {
    window.ipcRenderer.send("window:close");
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-[#232A35] text-[#cccccc] overflow-hidden">
      {/* Header */}
      <header className="h-8 bg-[#232A35] flex items-center shrink-0 draggable-area border-b border-[#1a1f29]">
        {/* Left Section - Menu Items */}
        <div className="flex items-center gap-2 px-3 non-draggable-area">
          <div className="flex items-center gap-1">
            <VscSymbolColor className="w-4 h-4 text-[#3794ff]" />
          </div>
          <div className="flex items-center gap-1 text-xs">
            {/* File Menu */}
            <div className="relative">
              <span
                className="hover:text-white cursor-pointer px-2 py-1 hover:bg-[#2a3441] rounded"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleMenu("file");
                }}
              >
                File
              </span>
              {openMenu === "file" && (
                <div className="absolute top-full left-0 mt-1 bg-[#1e242e] border border-[#2d3440] shadow-lg min-w-[200px] text-xs z-50">
                  <div className="py-1">
                    <div className="px-3 py-1.5 hover:bg-[#2a3441] cursor-pointer flex justify-between">
                      <span>New File</span>
                      <span className="text-[#7a8a9e]">Ctrl+N</span>
                    </div>
                    <div className="px-3 py-1.5 hover:bg-[#2a3441] cursor-pointer flex justify-between">
                      <span>New Window</span>
                      <span className="text-[#7a8a9e]">Ctrl+Shift+N</span>
                    </div>
                    <div className="border-t border-[#2d3440] my-1"></div>
                    <div className="px-3 py-1.5 hover:bg-[#2a3441] cursor-pointer flex justify-between">
                      <span>Open File...</span>
                      <span className="text-[#7a8a9e]">Ctrl+O</span>
                    </div>
                    <div className="px-3 py-1.5 hover:bg-[#2a3441] cursor-pointer flex justify-between">
                      <span>Open Folder...</span>
                      <span className="text-[#7a8a9e]">Ctrl+K Ctrl+O</span>
                    </div>
                    <div className="border-t border-[#2d3440] my-1"></div>
                    <div className="px-3 py-1.5 hover:bg-[#2a3441] cursor-pointer flex justify-between">
                      <span>Save</span>
                      <span className="text-[#7a8a9e]">Ctrl+S</span>
                    </div>
                    <div className="px-3 py-1.5 hover:bg-[#2a3441] cursor-pointer flex justify-between">
                      <span>Save As...</span>
                      <span className="text-[#7a8a9e]">Ctrl+Shift+S</span>
                    </div>
                    <div className="border-t border-[#2d3440] my-1"></div>
                    <div className="px-3 py-1.5 hover:bg-[#2a3441] cursor-pointer">
                      <span>Exit</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Edit Menu */}
            <div className="relative">
              <span
                className="hover:text-white cursor-pointer px-2 py-1 hover:bg-[#2a3441] rounded"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleMenu("edit");
                }}
              >
                Edit
              </span>
              {openMenu === "edit" && (
                <div className="absolute top-full left-0 mt-1 bg-[#1e242e] border border-[#2d3440] shadow-lg min-w-[200px] text-xs z-50">
                  <div className="py-1">
                    <div className="px-3 py-1.5 hover:bg-[#2a3441] cursor-pointer flex justify-between">
                      <span>Undo</span>
                      <span className="text-[#7a8a9e]">Ctrl+Z</span>
                    </div>
                    <div className="px-3 py-1.5 hover:bg-[#2a3441] cursor-pointer flex justify-between">
                      <span>Redo</span>
                      <span className="text-[#7a8a9e]">Ctrl+Y</span>
                    </div>
                    <div className="border-t border-[#2d3440] my-1"></div>
                    <div className="px-3 py-1.5 hover:bg-[#2a3441] cursor-pointer flex justify-between">
                      <span>Cut</span>
                      <span className="text-[#7a8a9e]">Ctrl+X</span>
                    </div>
                    <div className="px-3 py-1.5 hover:bg-[#2a3441] cursor-pointer flex justify-between">
                      <span>Copy</span>
                      <span className="text-[#7a8a9e]">Ctrl+C</span>
                    </div>
                    <div className="px-3 py-1.5 hover:bg-[#2a3441] cursor-pointer flex justify-between">
                      <span>Paste</span>
                      <span className="text-[#7a8a9e]">Ctrl+V</span>
                    </div>
                    <div className="border-t border-[#2d3440] my-1"></div>
                    <div className="px-3 py-1.5 hover:bg-[#2a3441] cursor-pointer flex justify-between">
                      <span>Find</span>
                      <span className="text-[#7a8a9e]">Ctrl+F</span>
                    </div>
                    <div className="px-3 py-1.5 hover:bg-[#2a3441] cursor-pointer flex justify-between">
                      <span>Replace</span>
                      <span className="text-[#7a8a9e]">Ctrl+H</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Selection Menu */}
            <div className="relative">
              <span
                className="hover:text-white cursor-pointer px-2 py-1 hover:bg-[#2a3441] rounded"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleMenu("selection");
                }}
              >
                Selection
              </span>
              {openMenu === "selection" && (
                <div className="absolute top-full left-0 mt-1 bg-[#1e242e] border border-[#2d3440] shadow-lg min-w-[200px] text-xs z-50">
                  <div className="py-1">
                    <div className="px-3 py-1.5 hover:bg-[#2a3441] cursor-pointer flex justify-between">
                      <span>Select All</span>
                      <span className="text-[#7a8a9e]">Ctrl+A</span>
                    </div>
                    <div className="px-3 py-1.5 hover:bg-[#2a3441] cursor-pointer flex justify-between">
                      <span>Expand Selection</span>
                      <span className="text-[#7a8a9e]">Shift+Alt+→</span>
                    </div>
                    <div className="px-3 py-1.5 hover:bg-[#2a3441] cursor-pointer flex justify-between">
                      <span>Shrink Selection</span>
                      <span className="text-[#7a8a9e]">Shift+Alt+←</span>
                    </div>
                    <div className="border-t border-[#2d3440] my-1"></div>
                    <div className="px-3 py-1.5 hover:bg-[#2a3441] cursor-pointer flex justify-between">
                      <span>Copy Line Up</span>
                      <span className="text-[#7a8a9e]">Shift+Alt+↑</span>
                    </div>
                    <div className="px-3 py-1.5 hover:bg-[#2a3441] cursor-pointer flex justify-between">
                      <span>Copy Line Down</span>
                      <span className="text-[#7a8a9e]">Shift+Alt+↓</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* View Menu */}
            <div className="relative">
              <span
                className="hover:text-white cursor-pointer px-2 py-1 hover:bg-[#2a3441] rounded"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleMenu("view");
                }}
              >
                View
              </span>
              {openMenu === "view" && (
                <div className="absolute top-full left-0 mt-1 bg-[#1e242e] border border-[#2d3440] shadow-lg min-w-[200px] text-xs z-50">
                  <div className="py-1">
                    <div className="px-3 py-1.5 hover:bg-[#2a3441] cursor-pointer flex justify-between">
                      <span>Command Palette...</span>
                      <span className="text-[#7a8a9e]">Ctrl+Shift+P</span>
                    </div>
                    <div className="border-t border-[#2d3440] my-1"></div>
                    <div className="px-3 py-1.5 hover:bg-[#2a3441] cursor-pointer flex justify-between">
                      <span>Explorer</span>
                      <span className="text-[#7a8a9e]">Ctrl+Shift+E</span>
                    </div>
                    <div className="px-3 py-1.5 hover:bg-[#2a3441] cursor-pointer flex justify-between">
                      <span>Search</span>
                      <span className="text-[#7a8a9e]">Ctrl+Shift+F</span>
                    </div>
                    <div className="px-3 py-1.5 hover:bg-[#2a3441] cursor-pointer flex justify-between">
                      <span>Source Control</span>
                      <span className="text-[#7a8a9e]">Ctrl+Shift+G</span>
                    </div>
                    <div className="border-t border-[#2d3440] my-1"></div>
                    <div className="px-3 py-1.5 hover:bg-[#2a3441] cursor-pointer flex justify-between">
                      <span>Terminal</span>
                      <span className="text-[#7a8a9e]">Ctrl+`</span>
                    </div>
                    <div className="px-3 py-1.5 hover:bg-[#2a3441] cursor-pointer">
                      <span>Toggle Full Screen</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Go Menu */}
            <div className="relative">
              <span
                className="hover:text-white cursor-pointer px-2 py-1 hover:bg-[#2a3441] rounded"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleMenu("go");
                }}
              >
                Go
              </span>
              {openMenu === "go" && (
                <div className="absolute top-full left-0 mt-1 bg-[#1e242e] border border-[#2d3440] shadow-lg min-w-[200px] text-xs z-50">
                  <div className="py-1">
                    <div className="px-3 py-1.5 hover:bg-[#2a3441] cursor-pointer flex justify-between">
                      <span>Back</span>
                      <span className="text-[#7a8a9e]">Alt+←</span>
                    </div>
                    <div className="px-3 py-1.5 hover:bg-[#2a3441] cursor-pointer flex justify-between">
                      <span>Forward</span>
                      <span className="text-[#7a8a9e]">Alt+→</span>
                    </div>
                    <div className="border-t border-[#2d3440] my-1"></div>
                    <div className="px-3 py-1.5 hover:bg-[#2a3441] cursor-pointer flex justify-between">
                      <span>Go to File...</span>
                      <span className="text-[#7a8a9e]">Ctrl+P</span>
                    </div>
                    <div className="px-3 py-1.5 hover:bg-[#2a3441] cursor-pointer flex justify-between">
                      <span>Go to Line...</span>
                      <span className="text-[#7a8a9e]">Ctrl+G</span>
                    </div>
                    <div className="px-3 py-1.5 hover:bg-[#2a3441] cursor-pointer flex justify-between">
                      <span>Go to Symbol...</span>
                      <span className="text-[#7a8a9e]">Ctrl+Shift+O</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Run Menu */}
            <div className="relative">
              <span
                className="hover:text-white cursor-pointer px-2 py-1 hover:bg-[#2a3441] rounded"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleMenu("run");
                }}
              >
                Run
              </span>
              {openMenu === "run" && (
                <div className="absolute top-full left-0 mt-1 bg-[#1e242e] border border-[#2d3440] shadow-lg min-w-[200px] text-xs z-50">
                  <div className="py-1">
                    <div className="px-3 py-1.5 hover:bg-[#2a3441] cursor-pointer flex justify-between">
                      <span>Start Debugging</span>
                      <span className="text-[#7a8a9e]">F5</span>
                    </div>
                    <div className="px-3 py-1.5 hover:bg-[#2a3441] cursor-pointer flex justify-between">
                      <span>Run Without Debugging</span>
                      <span className="text-[#7a8a9e]">Ctrl+F5</span>
                    </div>
                    <div className="border-t border-[#2d3440] my-1"></div>
                    <div className="px-3 py-1.5 hover:bg-[#2a3441] cursor-pointer flex justify-between">
                      <span>Stop Debugging</span>
                      <span className="text-[#7a8a9e]">Shift+F5</span>
                    </div>
                    <div className="px-3 py-1.5 hover:bg-[#2a3441] cursor-pointer flex justify-between">
                      <span>Restart Debugging</span>
                      <span className="text-[#7a8a9e]">Ctrl+Shift+F5</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Terminal Menu */}
            <div className="relative">
              <span
                className="hover:text-white cursor-pointer px-2 py-1 hover:bg-[#2a3441] rounded"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleMenu("terminal");
                }}
              >
                Terminal
              </span>
              {openMenu === "terminal" && (
                <div className="absolute top-full left-0 mt-1 bg-[#1e242e] border border-[#2d3440] shadow-lg min-w-[200px] text-xs z-50">
                  <div className="py-1">
                    <div
                      className="px-3 py-1.5 hover:bg-[#2a3441] cursor-pointer flex justify-between"
                      onClick={() => {
                        setShowTerminal(true);
                        setOpenMenu(null);
                      }}
                    >
                      <span>New Terminal</span>
                      <span className="text-[#7a8a9e]">Ctrl+Shift+`</span>
                    </div>
                    <div className="px-3 py-1.5 hover:bg-[#2a3441] cursor-pointer">
                      <span>Split Terminal</span>
                    </div>
                    <div className="border-t border-[#2d3440] my-1"></div>
                    <div className="px-3 py-1.5 hover:bg-[#2a3441] cursor-pointer">
                      <span>Run Task...</span>
                    </div>
                    <div className="px-3 py-1.5 hover:bg-[#2a3441] cursor-pointer">
                      <span>Run Build Task...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Help Menu */}
            <div className="relative">
              <span
                className="hover:text-white cursor-pointer px-2 py-1 hover:bg-[#2a3441] rounded"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleMenu("help");
                }}
              >
                Help
              </span>
              {openMenu === "help" && (
                <div className="absolute top-full left-0 mt-1 bg-[#1e242e] border border-[#2d3440] shadow-lg min-w-[200px] text-xs z-50">
                  <div className="py-1">
                    <div className="px-3 py-1.5 hover:bg-[#2a3441] cursor-pointer">
                      <span>Welcome</span>
                    </div>
                    <div className="px-3 py-1.5 hover:bg-[#2a3441] cursor-pointer">
                      <span>Documentation</span>
                    </div>
                    <div className="border-t border-[#2d3440] my-1"></div>
                    <div className="px-3 py-1.5 hover:bg-[#2a3441] cursor-pointer">
                      <span>Show All Commands</span>
                    </div>
                    <div className="px-3 py-1.5 hover:bg-[#2a3441] cursor-pointer">
                      <span>Keyboard Shortcuts Reference</span>
                    </div>
                    <div className="border-t border-[#2d3440] my-1"></div>
                    <div className="px-3 py-1.5 hover:bg-[#2a3441] cursor-pointer">
                      <span>About</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Center Section - Navigation & Search */}
        <div className="flex-1 flex items-center justify-center gap-2 px-4 non-draggable-area">
          <div className="flex items-center gap-1">
            <button className="p-1 hover:bg-[#2a3441] rounded text-[#7a8a9e] hover:text-white">
              <VscChevronLeft className="w-3 h-3" />
            </button>
            <button className="p-1 hover:bg-[#2a3441] rounded text-[#7a8a9e] hover:text-white">
              <VscChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="flex items-center bg-[#1e242e] border border-[#2d3440] rounded px-3 py-0.5 max-w-md w-full">
            <VscSearch className="w-3 h-3 text-[#7a8a9e] mr-2" />
            <input
              type="text"
              placeholder="arcosys-code-editor"
              className="bg-transparent text-xs text-[#cccccc] outline-none flex-1 placeholder-[#7a8a9e]"
            />
          </div>
        </div>

        {/* Right Section - Icons & Window Controls */}
        <div className="flex items-center gap-1 pr-2 non-draggable-area">
          <button className="p-1 hover:bg-[#2a3441] rounded text-[#7a8a9e] hover:text-white">
            <VscAccount className="w-4 h-4" />
          </button>
          <button className="p-1 hover:bg-[#2a3441] rounded text-[#7a8a9e] hover:text-white">
            <VscSettingsGear className="w-4 h-4" />
          </button>

          {/* Window Controls */}
          <div className="flex items-center ml-2">
            <button
              className="p-1 hover:bg-[#2a3441] w-11 h-8 flex items-center justify-center"
              onClick={handleMinimize}
            >
              <VscChromeMinimize className="w-3 h-3" />
            </button>
            <button
              className="p-1 hover:bg-[#2a3441] w-11 h-8 flex items-center justify-center"
              onClick={handleMaximize}
            >
              <VscChromeMaximize className="w-3 h-3" />
            </button>
            <button
              className="p-1 hover:bg-[#e81123] hover:text-white w-11 h-8 flex items-center justify-center"
              onClick={handleClose}
            >
              <VscChromeClose className="w-3 h-3" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden" ref={containerRef}>
        {/* Sidebar */}
        <aside className="flex h-full shrink-0">
          {/* Activity Bar */}
          <ActivityBar activeView={activeView} onViewChange={setActiveView} />

          {/* Side Panel with Resize Handle */}
          <SidePanel
            width={sidePanelWidth}
            activeView={activeView}
            rootFolderPath={rootFolderPath}
            onFolderOpen={setRootFolderPath}
            onFileClick={handleFileClick}
            onFileDelete={handleFileDelete}
            onMouseDown={handleLeftMouseDown}
          />
        </aside>

        {/* Editor Area */}
        <EditorArea
          openFiles={openFiles}
          activeFile={activeFile}
          fileContents={fileContents}
          onTabClick={handleFileClick}
          onCloseTab={handleCloseTab}
          getLanguage={getLanguage}
          showTerminal={showTerminal}
          onCloseTerminal={() => setShowTerminal(false)}
          terminalHeight={terminalHeight}
          onTerminalResize={handleTerminalMouseDown}
          rootFolderPath={rootFolderPath}
        />

        {/* Right Sidebar with Resize Handle */}
        <RightSidebar
          width={rightSidebarWidth}
          onMouseDown={handleRightMouseDown}
        />
      </div>

      {/* Footer / Status Bar Area */}
      <footer className="h-6 bg-[#232A35] shrink-0"></footer>
    </div>
  );
}

export default App;
