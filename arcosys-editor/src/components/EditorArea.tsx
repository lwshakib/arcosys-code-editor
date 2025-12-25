import Editor from "@monaco-editor/react";
import { VscChromeClose } from "react-icons/vsc";
import { getIcon } from "../utils/icons";

interface FileNode {
  name: string;
  path: string;
  type: "file" | "directory";
  children?: FileNode[];
}

interface EditorAreaProps {
  openFiles: FileNode[];
  activeFile: FileNode | null;
  fileContents: { [path: string]: string };
  onTabClick: (file: FileNode) => void;
  onCloseTab: (e: React.MouseEvent, path: string) => void;
  getLanguage: (fileName: string) => string;
}

export const EditorArea = ({
  openFiles,
  activeFile,
  fileContents,
  onTabClick,
  onCloseTab,
  getLanguage,
}: EditorAreaProps) => {
  return (
    <main className="flex-1 bg-[#181D27] rounded-md overflow-hidden flex flex-col min-w-0">
      {openFiles.length > 0 ? (
        <div className="flex-1 flex flex-col">
          {/* Tab Bar */}
          <div className="h-9 bg-[#181D27] flex items-center overflow-x-auto no-scrollbar border-b border-[#2a2d2e] shrink-0">
            {openFiles.map((file) => (
              <div
                key={file.path}
                onClick={() => onTabClick(file)}
                className={`group flex items-center px-3 h-full cursor-pointer border-r border-[#2a2d2e] min-w-[120px] max-w-[200px] shrink-0 select-none transition-colors ${
                  activeFile?.path === file.path
                    ? "bg-[#1e1e1e] border-t-2 border-[#007fd4]"
                    : "bg-[#181D27] hover:bg-[#1e1e1e]"
                }`}
              >
                <img
                  src={`/seti-icons/${getIcon(file.name)}`}
                  alt=""
                  className="w-4 h-4 mr-2 shrink-0"
                />
                <span
                  className={`text-xs truncate flex-1 ${
                    activeFile?.path === file.path
                      ? "text-white"
                      : "text-[#858585]"
                  }`}
                >
                  {file.name}
                </span>
                <div
                  className={`ml-2 p-0.5 rounded-md hover:bg-[#FFFFFF1A] opacity-0 group-hover:opacity-100 ${
                    activeFile?.path === file.path ? "opacity-100" : ""
                  }`}
                  onClick={(e) => onCloseTab(e, file.path)}
                >
                  <VscChromeClose
                    size={12}
                    className="text-[#858585] hover:text-white"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Editor Content */}
          <div className="flex-1 relative">
            {activeFile && (
              <Editor
                height="100%"
                theme="arcosys-dark"
                language={getLanguage(activeFile.name)}
                value={fileContents[activeFile.path] || ""}
                beforeMount={(monaco) => {
                  monaco.editor.defineTheme("arcosys-dark", {
                    base: "vs-dark",
                    inherit: true,
                    rules: [],
                    colors: {
                      "editor.background": "#181D27",
                      "editorGutter.background": "#181D27",
                      "editorLineNumber.foreground": "#636d83",
                      "editorLineNumber.activeForeground": "#cccccc",
                    },
                  });
                }}
                options={{
                  fontSize: 14,
                  minimap: { enabled: true },
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  padding: { top: 10 },
                }}
              />
            )}
          </div>
        </div>
      ) : (
        /* Welcome Screen */
        <div className="flex-1 flex items-center justify-center text-[#858585]">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">ArcoSys Editor</h2>
            <p>Select a file to start editing</p>
          </div>
        </div>
      )}
    </main>
  );
};
