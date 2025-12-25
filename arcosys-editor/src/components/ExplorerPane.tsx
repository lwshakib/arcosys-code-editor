import { useState, useRef, useEffect } from "react";
import {
  VscEllipsis,
  VscChevronDown,
  VscChevronRight,
  VscNewFile,
  VscNewFolder,
  VscRefresh,
  VscCollapseAll,
  VscFile,
  VscSymbolFile,
  VscEdit,
  VscTrash,
  VscFiles,
} from "react-icons/vsc";
import { getIcon } from "../utils/icons";

interface FileNode {
  name: string;
  path: string;
  type: "file" | "directory";
  children?: FileNode[];
}

const insertNode = (
  root: FileNode,
  parentPath: string,
  newNode: FileNode
): FileNode => {
  if (root.path === parentPath) {
    const children = [...(root.children || []), newNode];
    children.sort((a, b) => {
      if (a.type === b.type) return a.name.localeCompare(b.name);
      return a.type === "directory" ? -1 : 1;
    });
    return { ...root, children };
  }
  if (root.children) {
    return {
      ...root,
      children: root.children.map((c) => insertNode(c, parentPath, newNode)),
    };
  }
  return root;
};

const removeNode = (root: FileNode, targetPath: string): FileNode => {
  if (root.children) {
    return {
      ...root,
      children: root.children
        .filter((c) => c.path !== targetPath)
        .map((c) => removeNode(c, targetPath)),
    };
  }
  return root;
};

const CreationInputRow = ({
  type,
  level,
  onCommit,
  onCancel,
}: {
  type: "file" | "directory";
  level: number;
  onCommit: (name: string) => void;
  onCancel: () => void;
}) => {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (value.trim()) onCommit(value.trim());
      else onCancel();
    } else if (e.key === "Escape") {
      onCancel();
    }
  };

  const paddingLeft = 10 + level * 10;

  return (
    <div
      className="flex items-center py-0.5 bg-[#37373d] text-white"
      style={{ paddingLeft: `${paddingLeft}px` }}
    >
      <span className="mr-1.5 shrink-0 flex items-center justify-center min-w-4">
        {type === "directory" ? (
          <VscChevronRight size={14} />
        ) : (
          <VscFile size={14} />
        )}
      </span>
      <input
        ref={inputRef}
        type="text"
        className="bg-[#37373d] border border-[#007fd4] outline-none text-[13px] text-white flex-1 min-w-0 h-6 px-1"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          e.stopPropagation();
          handleKeyDown(e);
        }}
        onClick={(e) => e.stopPropagation()}
        onBlur={() => {
          if (value.trim()) onCommit(value.trim());
          else onCancel();
        }}
        spellCheck={false}
      />
    </div>
  );
};

const RenamingInputRow = ({
  initialValue,
  type,
  level,
  onCommit,
  onCancel,
}: {
  initialValue: string;
  type: "file" | "directory";
  level: number;
  onCommit: (name: string) => void;
  onCancel: () => void;
}) => {
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      if (type === "file" && initialValue.includes(".")) {
        inputRef.current.setSelectionRange(0, initialValue.lastIndexOf("."));
      } else {
        inputRef.current.select();
      }
    }
  }, [type, initialValue]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (value.trim() && value.trim() !== initialValue) onCommit(value.trim());
      else onCancel();
    } else if (e.key === "Escape") {
      onCancel();
    }
  };

  const paddingLeft = 10 + level * 10;

  return (
    <div
      className="flex items-center py-0.5 bg-[#37373d] text-white"
      style={{ paddingLeft: `${paddingLeft}px` }}
    >
      <span className="mr-1.5 shrink-0 flex items-center justify-center min-w-4">
        {type === "directory" ? (
          <VscChevronRight size={14} />
        ) : (
          <VscFile size={14} />
        )}
      </span>
      <input
        ref={inputRef}
        type="text"
        className="bg-[#37373d] border border-[#007fd4] outline-none text-[13px] text-white flex-1 min-w-0 h-6 px-1"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          e.stopPropagation();
          handleKeyDown(e);
        }}
        onClick={(e) => e.stopPropagation()}
        onBlur={() => {
          if (value.trim() && value.trim() !== initialValue)
            onCommit(value.trim());
          else onCancel();
        }}
        spellCheck={false}
      />
    </div>
  );
};

const ContextMenu = ({
  x,
  y,
  onClose,
  target,
  onAction,
  canPaste,
}: {
  x: number;
  y: number;
  onClose: () => void;
  target: FileNode;
  onAction: (action: string) => void;
  canPaste: boolean;
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const items = [
    { label: "New File", action: "newFile", icon: <VscNewFile size={14} /> },
    {
      label: "New Folder",
      action: "newFolder",
      icon: <VscNewFolder size={14} />,
    },
    { type: "separator" },
    {
      label: "Reveal in File Explorer",
      action: "reveal",
      icon: <VscSymbolFile size={14} />,
    },
    { type: "separator" },
    { label: "Copy", action: "copy", icon: <VscFiles size={14} /> },
    {
      label: "Paste",
      action: "paste",
      icon: <VscFiles size={14} />,
      disabled: !canPaste,
    },
    { type: "separator" },
    { label: "Copy Path", action: "copyPath" },
    { label: "Copy Relative Path", action: "copyRelativePath" },
    { type: "separator" },
    { label: "Rename", action: "rename", icon: <VscEdit size={14} /> },
    {
      label: "Delete",
      action: "delete",
      icon: <VscTrash size={14} />,
      className: "text-[#f85149] hover:bg-[#442726]",
    },
  ];

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-[#252526] border border-[#454545] shadow-lg py-1 min-w-[220px] rounded-[4px] text-[#cccccc] font-sans"
      style={{ left: x, top: y }}
      onClick={(e) => e.stopPropagation()}
    >
      {items.map((item, i) =>
        item.type === "separator" ? (
          <div key={i} className="h-[1px] bg-[#454545] my-1 mx-1" />
        ) : (
          <div
            key={i}
            className={`flex items-center px-3 py-1.5 cursor-pointer text-[13px] hover:bg-[#094771] hover:text-white transition-colors ${
              item.disabled ? "opacity-40 pointer-events-none" : ""
            } ${item.className || ""}`}
            onClick={() => {
              onAction(item.action!);
              onClose();
            }}
          >
            {item.icon && (
              <span className="mr-2.5 opacity-80">{item.icon}</span>
            )}
            <span className="flex-1">{item.label}</span>
          </div>
        )
      )}
    </div>
  );
};

const FileTreeItem = ({
  node,
  level = 0,
  activePath,
  creationState,
  onSelect,
  onCreateCommit,
  onCreateCancel,
  onFileClick,
  onContextMenu,
  renamingPath,
  onRenameCommit,
  onRenameCancel,
}: {
  node: FileNode;
  level?: number;
  activePath: string | null;
  creationState: { type: "file" | "directory"; parentPath: string } | null;
  onSelect: (path: string, type: "file" | "directory") => void;
  onCreateCommit: (name: string) => void;
  onCreateCancel: () => void;
  onFileClick: (node: FileNode) => void;
  onContextMenu: (e: React.MouseEvent, node: FileNode) => void;
  renamingPath: string | null;
  onRenameCommit: (name: string) => void;
  onRenameCancel: () => void;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const paddingLeft = 10 + level * 10;

  const isCreatingHere = creationState?.parentPath === node.path;
  const isRenaming = renamingPath === node.path;

  useEffect(() => {
    if (isCreatingHere && !isExpanded) {
      setIsExpanded(true);
    }
  }, [isCreatingHere, isExpanded]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(node.path, node.type);
    if (node.type === "directory") {
      setIsExpanded(!isExpanded);
    } else {
      onFileClick(node);
    }
  };

  const isSelected = activePath === node.path;
  const folders = node.children?.filter((c) => c.type === "directory") || [];
  const files = node.children?.filter((c) => c.type === "file") || [];

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onContextMenu(e, node);
  };

  if (isRenaming) {
    return (
      <RenamingInputRow
        initialValue={node.name}
        type={node.type}
        level={level}
        onCommit={onRenameCommit}
        onCancel={onRenameCancel}
      />
    );
  }

  return (
    <div>
      <div
        className={`flex items-center py-0.5 cursor-pointer text-[#cccccc] hover:text-white transition-colors ${
          isSelected ? "bg-[#37373d]" : "hover:bg-[#2a2d2e]"
        }`}
        style={{ paddingLeft: `${paddingLeft}px` }}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
      >
        <span className="mr-1.5 shrink-0 flex items-center justify-center min-w-4">
          {node.type === "directory" ? (
            isExpanded ? (
              <VscChevronDown size={14} />
            ) : (
              <VscChevronRight size={14} />
            )
          ) : (
            <img
              src={`/seti-icons/${getIcon(node.name)}`}
              alt=""
              className="w-3.75 h-3.75"
            />
          )}
        </span>
        <span className="truncate" style={{ fontSize: "13px" }}>
          {node.name}
        </span>
      </div>

      {node.type === "directory" && isExpanded && (
        <div>
          {isCreatingHere && creationState?.type === "directory" && (
            <CreationInputRow
              type="directory"
              level={level + 1}
              onCommit={onCreateCommit}
              onCancel={onCreateCancel}
            />
          )}
          {folders.map((child) => (
            <FileTreeItem
              key={child.path}
              node={child}
              level={level + 1}
              activePath={activePath}
              creationState={creationState}
              onSelect={onSelect}
              onCreateCommit={onCreateCommit}
              onCreateCancel={onCreateCancel}
              onFileClick={onFileClick}
              onContextMenu={onContextMenu}
              renamingPath={renamingPath}
              onRenameCommit={onRenameCommit}
              onRenameCancel={onRenameCancel}
            />
          ))}
          {isCreatingHere && creationState?.type === "file" && (
            <CreationInputRow
              type="file"
              level={level + 1}
              onCommit={onCreateCommit}
              onCancel={onCreateCancel}
            />
          )}
          {files.map((child) => (
            <FileTreeItem
              key={child.path}
              node={child}
              level={level + 1}
              activePath={activePath}
              creationState={creationState}
              onSelect={onSelect}
              onCreateCommit={onCreateCommit}
              onCreateCancel={onCreateCancel}
              onFileClick={onFileClick}
              onContextMenu={onContextMenu}
              renamingPath={renamingPath}
              onRenameCommit={onRenameCommit}
              onRenameCancel={onRenameCancel}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const ExplorerPane = ({
  onFileClick,
  onFileDelete,
}: {
  onFileClick: (node: FileNode) => void;
  onFileDelete: (path: string) => void;
}) => {
  const [isSectionExpanded, setIsSectionExpanded] = useState(true);
  const [folderData, setFolderData] = useState<FileNode | null>(null);
  const [activePath, setActivePath] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<"file" | "directory" | null>(
    null
  );
  const [creationState, setCreationState] = useState<{
    type: "file" | "directory";
    parentPath: string;
  } | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    node: FileNode;
  } | null>(null);
  const [copiedPath, setCopiedPath] = useState<{
    path: string;
    name: string;
    type: "file" | "directory";
  } | null>(null);
  const [renamingPath, setRenamingPath] = useState<string | null>(null);

  const folderPathRef = useRef<string | null>(null);

  useEffect(() => {
    folderPathRef.current = folderData?.path || null;
  }, [folderData]);

  const handleOpenFolder = async () => {
    const data = await window.ipcRenderer.invoke("dialog:openFolder");
    if (data) {
      setFolderData(data);
      setIsSectionExpanded(true);
      setActivePath(null);
    }
  };

  const handleRefresh = async () => {
    const currentPath = folderPathRef.current;
    if (currentPath) {
      const data = await window.ipcRenderer.invoke(
        "fs:readDirRecursively",
        currentPath
      );
      if (data) setFolderData(data);
    }
  };

  useEffect(() => {
    const handleFsChanged = () => {
      handleRefresh();
    };

    window.ipcRenderer.on("fs:changed", handleFsChanged);

    return () => {
      window.ipcRenderer.off("fs:changed", handleFsChanged);
    };
  }, []); // Only once on mount

  const handleSelect = (path: string, type: "file" | "directory") => {
    setActivePath(path);
    setActiveType(type);
  };

  const startCreation = (type: "file" | "directory") => {
    if (!folderData) return;
    let parentPath = folderData.path;
    if (activePath) {
      if (activeType === "directory") {
        parentPath = activePath;
      } else {
        const separator = activePath.includes("\\") ? "\\" : "/";
        parentPath = activePath.substring(0, activePath.lastIndexOf(separator));
      }
    }
    setCreationState({ type, parentPath });
    setIsSectionExpanded(true);
  };

  const handleCreateCommit = async (name: string) => {
    if (!creationState || !folderData) return;
    const separator = creationState.parentPath.includes("\\") ? "\\" : "/";
    const fullPath = `${creationState.parentPath}${separator}${name}`;

    let success = false;
    if (creationState.type === "file") {
      const res = await window.ipcRenderer.invoke("fs:createFile", fullPath);
      success = res?.success;
    } else {
      const res = await window.ipcRenderer.invoke("fs:createFolder", fullPath);
      success = res?.success;
    }

    if (success) {
      const newNode: FileNode = {
        name,
        path: fullPath,
        type: creationState.type,
        children: creationState.type === "directory" ? [] : undefined,
      };

      setFolderData((prev) => {
        if (!prev) return null;
        return insertNode(prev, creationState.parentPath, newNode);
      });

      handleSelect(fullPath, creationState.type);
      if (creationState.type === "file") {
        onFileClick(newNode);
      }
    }
    setCreationState(null);
  };

  const handleContextMenu = (e: React.MouseEvent, node: FileNode) => {
    setContextMenu({ x: e.clientX, y: e.clientY, node });
    setActivePath(node.path);
    setActiveType(node.type);
  };

  const handleContextAction = async (action: string) => {
    if (!contextMenu) return;
    const { node } = contextMenu;

    switch (action) {
      case "newFile":
        startCreation("file");
        break;
      case "newFolder":
        startCreation("directory");
        break;
      case "reveal":
        await window.ipcRenderer.invoke("fs:revealInExplorer", node.path);
        break;
      case "copy":
        setCopiedPath({ path: node.path, name: node.name, type: node.type });
        break;
      case "paste":
        if (copiedPath) {
          const separator = node.path.includes("\\") ? "\\" : "/";
          const destDir =
            node.type === "directory" ? node.path : pathDir(node.path);
          const destPath = `${destDir}${separator}${copiedPath.name}`;
          const res = await window.ipcRenderer.invoke(
            "fs:copy",
            copiedPath.path,
            destPath
          );
          if (res.success) handleRefresh();
        }
        break;
      case "copyPath":
        navigator.clipboard.writeText(node.path);
        break;
      case "copyRelativePath":
        if (folderData) {
          const relative = node.path.replace(folderData.path, "");
          navigator.clipboard.writeText(
            relative.startsWith("/") || relative.startsWith("\\")
              ? relative.substring(1)
              : relative
          );
        }
        break;
      case "delete":
        if (confirm(`Are you sure you want to delete ${node.name}?`)) {
          const res = await window.ipcRenderer.invoke("fs:delete", node.path);
          if (res.success) {
            setFolderData((prev) =>
              prev ? removeNode(prev, node.path) : null
            );
            onFileDelete(node.path);
          }
        }
        break;
      case "rename":
        setRenamingPath(node.path);
        break;
    }
  };

  const handleRenameCommit = async (newName: string) => {
    if (!renamingPath || !folderData) return;
    const oldPath = renamingPath;
    const separator = oldPath.includes("\\") ? "\\" : "/";
    const dir = oldPath.substring(0, oldPath.lastIndexOf(separator));
    const newPath = `${dir}${separator}${newName}`;

    const res = await window.ipcRenderer.invoke("fs:rename", oldPath, newPath);
    if (res.success) handleRefresh();
    setRenamingPath(null);
  };

  const pathDir = (p: string) => {
    const separator = p.includes("\\") ? "\\" : "/";
    return p.substring(0, p.lastIndexOf(separator));
  };

  const rootFolders =
    folderData?.children?.filter((c) => c.type === "directory") || [];
  const rootFiles =
    folderData?.children?.filter((c) => c.type === "file") || [];
  const isCreatingRoot = creationState?.parentPath === folderData?.path;

  const handleExplorerContextMenu = (e: React.MouseEvent) => {
    if (!folderData) return;
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, node: folderData });
  };

  return (
    <div
      className="h-full w-full flex flex-col text-[#cccccc] text-[13px] font-sans"
      onClick={() => setActivePath(null)}
    >
      <div className="flex items-center justify-between px-5 py-2 text-[11px] font-bold tracking-wide text-[#bbbbbb] shrink-0">
        <span>EXPLORER</span>
        <VscEllipsis className="cursor-pointer hover:text-white" size={16} />
      </div>

      {folderData ? (
        <div className="flex-1 overflow-y-auto">
          <div
            className="group flex items-center justify-between px-1 py-1 cursor-pointer font-bold text-[#bbbbbb] hover:bg-[#FFFFFF10] shrink-0 transition-colors uppercase"
            onClick={(e) => {
              e.stopPropagation();
              setIsSectionExpanded(!isSectionExpanded);
            }}
          >
            <div className="flex items-center flex-1 min-w-0">
              <VscChevronDown
                className={`mr-1 transition-transform duration-100 ${
                  isSectionExpanded ? "" : "-rotate-90"
                }`}
                size={16}
              />
              <span className="truncate text-xs font-bold leading-none pt-0.5">
                {folderData.name}
              </span>
            </div>
            <div
              className="flex items-center gap-1.5 mr-2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => e.stopPropagation()}
            >
              <VscNewFile
                size={15}
                className="hover:text-white"
                title="New File"
                onClick={() => startCreation("file")}
              />
              <VscNewFolder
                size={15}
                className="hover:text-white"
                title="New Folder"
                onClick={() => startCreation("directory")}
              />
              <VscRefresh
                size={15}
                className="hover:text-white"
                title="Refresh"
                onClick={handleRefresh}
              />
              <VscCollapseAll
                size={15}
                className="hover:text-white"
                title="Collapse All"
              />
            </div>
          </div>
          {isSectionExpanded && (
            <div
              className="flex flex-col"
              onContextMenu={handleExplorerContextMenu}
            >
              {isCreatingRoot && creationState?.type === "directory" && (
                <CreationInputRow
                  type="directory"
                  level={0}
                  onCommit={handleCreateCommit}
                  onCancel={() => setCreationState(null)}
                />
              )}
              {rootFolders.map((child) => (
                <FileTreeItem
                  key={child.path}
                  node={child}
                  activePath={activePath}
                  creationState={creationState}
                  onSelect={handleSelect}
                  onCreateCommit={handleCreateCommit}
                  onCreateCancel={() => setCreationState(null)}
                  onFileClick={onFileClick}
                  onContextMenu={handleContextMenu}
                  renamingPath={renamingPath}
                  onRenameCommit={handleRenameCommit}
                  onRenameCancel={() => setRenamingPath(null)}
                />
              ))}
              {isCreatingRoot && creationState?.type === "file" && (
                <CreationInputRow
                  type="file"
                  level={0}
                  onCommit={handleCreateCommit}
                  onCancel={() => setCreationState(null)}
                />
              )}
              {rootFiles.map((child) => (
                <FileTreeItem
                  key={child.path}
                  node={child}
                  activePath={activePath}
                  creationState={creationState}
                  onSelect={handleSelect}
                  onCreateCommit={handleCreateCommit}
                  onCreateCancel={() => setCreationState(null)}
                  onFileClick={onFileClick}
                  onContextMenu={handleContextMenu}
                  renamingPath={renamingPath}
                  onRenameCommit={handleRenameCommit}
                  onRenameCancel={() => setRenamingPath(null)}
                />
              ))}
            </div>
          )}
          {contextMenu && (
            <ContextMenu
              x={contextMenu.x}
              y={contextMenu.y}
              target={contextMenu.node}
              onClose={() => setContextMenu(null)}
              onAction={handleContextAction}
              canPaste={!!copiedPath}
            />
          )}
        </div>
      ) : (
        <>
          <div
            className="flex items-center px-1 py-1 cursor-pointer font-bold text-white hover:bg-[#FFFFFF10] shrink-0 transition-colors"
            onClick={() => setIsSectionExpanded(!isSectionExpanded)}
          >
            <VscChevronDown
              className={`mr-1 transition-transform duration-100 ${
                isSectionExpanded ? "" : "-rotate-90"
              }`}
              size={16}
            />
            <span>NO FOLDER OPENED</span>
          </div>
          {isSectionExpanded && (
            <div className="px-5 py-3 flex flex-col gap-4">
              <p>You have not yet opened a folder.</p>
              <button
                onClick={handleOpenFolder}
                className="bg-[#007fd4] hover:bg-[#026ec1] text-white py-1.5 px-4 outline-none border-none cursor-pointer text-center font-medium"
              >
                Open Folder
              </button>
              <div className="flex flex-col gap-3">
                <p>You can clone a repository locally.</p>
                <button className="bg-[#007fd4] hover:bg-[#026ec1] text-white py-1.5 px-4 outline-none border-none cursor-pointer text-center font-medium">
                  Clone Repository
                </button>
              </div>
              <p className="leading-5 mt-2">
                To learn more about how to use Git and source control in VS Code{" "}
                <a href="#" className="text-[#3794ff] hover:underline">
                  read our docs
                </a>
                .
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};
