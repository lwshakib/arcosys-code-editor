import { useEffect, useRef } from "react";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import "xterm/css/xterm.css";
import { VscClose } from "react-icons/vsc";

interface TerminalPaneProps {
  onClose: () => void;
  workspacePath: string | null;
  height: number;
}

export const TerminalPane = ({
  onClose,
  workspacePath,
  height,
}: TerminalPaneProps) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);

  // Re-fit when height changes
  useEffect(() => {
    if (xtermRef.current && fitAddonRef.current) {
      fitAddonRef.current.fit();
      window.ipcRenderer.send("terminal:resize", {
        cols: xtermRef.current.cols,
        rows: xtermRef.current.rows,
      });
    }
  }, [height]);

  useEffect(() => {
    if (!terminalRef.current) return;

    // Initialize terminal
    const term = new Terminal({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
      theme: {
        background: "#181D27",
        foreground: "#cccccc",
        cursor: "#cccccc",
        selectionBackground: "#264f78",
      },
      convertEol: true, // Handle line endings across platforms
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);

    term.open(terminalRef.current);

    // Initial fit after a small delay to ensure DOM is ready
    const fitTimer = setTimeout(() => {
      fitAddon.fit();
      // Start shell after fit
      window.ipcRenderer.send("terminal:start", workspacePath);
    }, 100);

    xtermRef.current = term;
    fitAddonRef.current = fitAddon;

    // Terminal data from shell
    const handleData = (_: any, data: string) => {
      console.log("Renderer received terminal data:", data);
      term.write(data);
    };
    window.ipcRenderer.on("terminal:data", handleData);

    // Terminal input to shell
    term.onData((data) => {
      window.ipcRenderer.send("terminal:write", data);
    });

    // Handle resize
    const handleResize = () => {
      if (fitAddonRef.current && xtermRef.current) {
        fitAddonRef.current.fit();
        window.ipcRenderer.send("terminal:resize", {
          cols: xtermRef.current.cols,
          rows: xtermRef.current.rows,
        });
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      clearTimeout(fitTimer);
      window.removeEventListener("resize", handleResize);
      window.ipcRenderer.off("terminal:data", handleData);
      term.dispose();
    };
  }, [workspacePath]);

  return (
    <div
      className="flex flex-col bg-[#181D27] border-t border-[#2d3440]"
      style={{ height: `${height}px` }}
    >
      {/* Terminal Title Bar */}
      <div className="flex items-center justify-between px-4 py-1.5 shrink-0 bg-[#232A35]">
        <div className="flex items-center gap-4">
          <span className="text-[11px] font-bold text-[#bbbbbb] uppercase tracking-wider">
            Terminal
          </span>
          <div className="h-full px-2 py-0.5 text-[11px] text-white border-b-2 border-[#3794ff] cursor-pointer">
            powershell
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-[#2a3441] rounded text-[#7a8a9e] hover:text-white transition-colors"
        >
          <VscClose size={14} />
        </button>
      </div>

      {/* Terminal Content */}
      <div className="flex-1 overflow-hidden p-2" ref={terminalRef} />
    </div>
  );
};
