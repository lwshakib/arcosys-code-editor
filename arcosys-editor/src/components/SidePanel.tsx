import { ExplorerPane } from "./ExplorerPane";

interface FileNode {
  name: string;
  path: string;
  type: "file" | "directory";
  children?: FileNode[];
}

interface SidePanelProps {
  width: number;
  onFileClick: (file: FileNode) => void;
  onFileDelete: (path: string) => void;
  onMouseDown: () => void;
}

export const SidePanel = ({
  width,
  onFileClick,
  onFileDelete,
  onMouseDown,
}: SidePanelProps) => {
  return (
    <>
      {/* Side Panel */}
      <div
        className="bg-[#181D27] h-full rounded-md non-draggable-area"
        style={{ width: `${width}px` }}
      >
        <ExplorerPane onFileClick={onFileClick} onFileDelete={onFileDelete} />
      </div>

      {/* Resize Handle */}
      <div
        className="w-1 h-full cursor-col-resize hover:bg-[#232A35] transition-colors relative group"
        onMouseDown={onMouseDown}
      >
        <div className="absolute inset-0 w-3 -translate-x-1" />
      </div>
    </>
  );
};

export type { FileNode };
