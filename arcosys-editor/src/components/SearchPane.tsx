import { useState, useRef, useEffect } from "react";
import {
  VscSearch,
  VscCaseSensitive,
  VscWholeWord,
  VscRegex,
  VscChevronDown,
  VscChevronRight,
} from "react-icons/vsc";
import { getIcon } from "../utils/icons";

interface SearchResult {
  filePath: string;
  fileName: string;
  nameMatched?: boolean;
  matches: {
    line: number;
    content: string;
    matchStart: number;
    matchEnd: number;
  }[];
}

interface FileNode {
  name: string;
  path: string;
  type: "file" | "directory";
  children?: FileNode[];
}

export const SearchPane = ({
  onFileClick,
  rootPath,
}: {
  onFileClick: (node: FileNode) => void;
  rootPath?: string | null;
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [wholeWord, setWholeWord] = useState(false);
  const [useRegex, setUseRegex] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set());
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        const performSearch = async () => {
          setIsSearching(true);
          try {
            const results = await window.ipcRenderer.invoke(
              "fs:search",
              searchQuery,
              {
                caseSensitive,
                wholeWord,
                useRegex,
              },
              rootPath
            );
            setSearchResults(results || []);
            // Auto-expand files with few results
            if (results && results.length < 10) {
              setExpandedFiles(
                new Set(results.map((r: SearchResult) => r.filePath))
              );
            }
          } catch (error) {
            console.error("Search error:", error);
            setSearchResults([]);
          } finally {
            setIsSearching(false);
          }
        };
        performSearch();
      } else {
        setSearchResults([]);
      }
    }, 500); // 500ms debounce delay

    return () => clearTimeout(timer);
  }, [searchQuery, caseSensitive, wholeWord, useRegex, rootPath]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      // Immediate search on Enter
    }
  };

  const toggleFileExpansion = (filePath: string) => {
    const newExpanded = new Set(expandedFiles);
    if (newExpanded.has(filePath)) {
      newExpanded.delete(filePath);
    } else {
      newExpanded.add(filePath);
    }
    setExpandedFiles(newExpanded);
  };

  const handleResultClick = (result: SearchResult) => {
    onFileClick({
      name: result.fileName,
      path: result.filePath,
      type: "file",
    });
  };

  return (
    <div className="h-full w-full flex flex-col text-[#cccccc] text-[13px] font-sans bg-[#181D27]">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-2 text-[11px] font-bold tracking-wide text-[#bbbbbb] shrink-0">
        <span>SEARCH</span>
      </div>

      {/* Search Input Section */}
      <div className="px-3 pb-3 shrink-0">
        {/* Main Search Input */}
        <div className="relative mb-2">
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search"
            className="w-full bg-[#1e242e] border border-[#2d3440] rounded px-3 py-1.5 pr-10 text-[13px] text-white placeholder-[#7a8a9e] outline-none focus:border-[#3794ff]"
          />
          <button
            disabled={isSearching}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-[#7a8a9e] hover:text-white disabled:opacity-50"
          >
            <VscSearch size={16} />
          </button>
        </div>

        {/* Search Options */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCaseSensitive(!caseSensitive)}
            className={`p-1.5 rounded transition-colors ${
              caseSensitive
                ? "bg-[#2a3441] text-white"
                : "text-[#7a8a9e] hover:bg-[#2a3441] hover:text-white"
            }`}
            title="Match Case"
          >
            <VscCaseSensitive size={16} />
          </button>
          <button
            onClick={() => setWholeWord(!wholeWord)}
            className={`p-1.5 rounded transition-colors ${
              wholeWord
                ? "bg-[#2a3441] text-white"
                : "text-[#7a8a9e] hover:bg-[#2a3441] hover:text-white"
            }`}
            title="Match Whole Word"
          >
            <VscWholeWord size={16} />
          </button>
          <button
            onClick={() => setUseRegex(!useRegex)}
            className={`p-1.5 rounded transition-colors ${
              useRegex
                ? "bg-[#2a3441] text-white"
                : "text-[#7a8a9e] hover:bg-[#2a3441] hover:text-white"
            }`}
            title="Use Regular Expression"
          >
            <VscRegex size={16} />
          </button>
        </div>
      </div>

      {/* Results Section */}
      <div className="flex-1 overflow-y-auto px-2">
        {isSearching ? (
          <div className="px-3 py-2 text-[#7a8a9e]">Searching...</div>
        ) : searchResults.length === 0 && searchQuery ? (
          <div className="px-3 py-2 text-[#7a8a9e]">No results found</div>
        ) : searchResults.length === 0 ? (
          <div className="px-3 py-2 text-[#7a8a9e]">
            Search for files and text across your workspace
          </div>
        ) : (
          <div>
            <div className="px-3 py-1 text-[11px] text-[#7a8a9e]">
              {searchResults.reduce((acc, r) => acc + r.matches.length, 0)}{" "}
              results in {searchResults.length} files
            </div>
            {searchResults.map((result) => {
              const isExpanded = expandedFiles.has(result.filePath);
              return (
                <div key={result.filePath} className="mb-1">
                  {/* File Header */}
                  <div
                    className="flex items-center px-2 py-1 cursor-pointer hover:bg-[#2a3441] rounded transition-colors"
                    onClick={() => toggleFileExpansion(result.filePath)}
                  >
                    <span className="mr-1.5 shrink-0">
                      {isExpanded ? (
                        <VscChevronDown size={14} />
                      ) : (
                        <VscChevronRight size={14} />
                      )}
                    </span>
                    <img
                      src={`/seti-icons/${getIcon(result.fileName)}`}
                      alt=""
                      className="w-3.5 h-3.5 mr-1.5"
                    />
                    <span
                      className={`truncate text-[13px] ${
                        result.nameMatched ? "text-white font-medium" : ""
                      }`}
                    >
                      {result.fileName}
                    </span>
                    <span className="ml-auto text-[11px] text-[#7a8a9e] shrink-0">
                      {result.matches.length ||
                        (result.nameMatched ? "name" : "")}
                    </span>
                  </div>

                  {/* Match Results */}
                  {isExpanded && (
                    <div className="ml-6">
                      {result.nameMatched && result.matches.length === 0 && (
                        <div className="px-2 py-1 text-[#7a8a9e] italic text-[12px]">
                          File name match
                        </div>
                      )}
                      {result.matches.map((match, idx) => (
                        <div
                          key={idx}
                          className="flex items-start px-2 py-1 cursor-pointer hover:bg-[#2a3441] rounded transition-colors text-[12px]"
                          onClick={() => handleResultClick(result)}
                        >
                          <span className="text-[#7a8a9e] mr-2 shrink-0 w-8 text-right">
                            {match.line}
                          </span>
                          <span className="truncate">
                            {match.content.substring(0, match.matchStart)}
                            <span className="bg-[#3794ff]/30 text-[#3794ff] border-b border-[#3794ff]">
                              {match.content.substring(
                                match.matchStart,
                                match.matchEnd
                              )}
                            </span>
                            {match.content.substring(match.matchEnd)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
