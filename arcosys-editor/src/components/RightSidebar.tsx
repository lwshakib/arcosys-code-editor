import { ChatInput } from "./ChatInput";

interface RightSidebarProps {
  width: number;
  onMouseDown: () => void;
}

export const RightSidebar = ({ width, onMouseDown }: RightSidebarProps) => {
  return (
    <>
      {/* Resize Handle */}
      <div
        className="w-1 h-full cursor-col-resize hover:bg-[#232A35] transition-colors relative group"
        onMouseDown={onMouseDown}
      >
        <div className="absolute inset-0 w-3 -translate-x-1" />
      </div>

      {/* Right Sidebar */}
      <aside
        className="bg-[#181D27] rounded-md flex flex-col shrink-0 mr-1"
        style={{ width: `${width}px` }}
      >
        {/* Chat Messages Area - Placeholder for future */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Future: Chat messages will go here */}
        </div>

        {/* Chat Input at Bottom */}
        <ChatInput />
      </aside>
    </>
  );
};
