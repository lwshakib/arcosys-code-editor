import { useState, useRef, KeyboardEvent } from "react";
import { VscAdd, VscSparkle } from "react-icons/vsc";

export const ChatInput = () => {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (message.trim()) {
      console.log("Sending message:", message);
      // TODO: Implement actual send logic
      setMessage("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    // Auto-resize textarea
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
  };

  return (
    <div className="p-4 border-t border-[#2a2d2e] bg-[#181D27]">
      {/* Token Counter Banner */}
      <div className="mb-3">
        <div className="relative h-[26px]">
          <div className="absolute top-0 left-0 flex w-full justify-between items-center rounded-t-lg border border-[#2a2d2e] bg-[#1e1e1e]/50 backdrop-blur px-3 py-1 text-xs">
            <span className="text-[#858585]">150K daily tokens remaining.</span>
            <button className="text-[#007fd4] font-semibold hover:underline bg-transparent">
              Subscribe to Pro for 66x more usage
            </button>
          </div>
        </div>
      </div>

      {/* Input Container */}
      <div className="relative rounded-lg shadow-lg backdrop-blur">
        <div className="flex flex-col rounded-lg border border-[#2a2d2e] bg-[#1e1e1e]/50 p-4">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="How can ArcoSys help you today?"
            className="w-full bg-transparent text-white placeholder-[#858585] resize-none outline-none text-sm mb-4"
            style={{ minHeight: "60px", maxHeight: "200px" }}
            rows={3}
          />

          {/* Action Buttons */}
          <div className="mt-auto flex gap-4">
            <button
              className="text-[#858585] hover:text-white transition-colors"
              title="Attach file"
            >
              <VscAdd size={20} />
            </button>
            <button
              onClick={handleSend}
              disabled={!message.trim()}
              className="text-[#858585] hover:text-white disabled:text-[#4a4a4a] disabled:cursor-not-allowed transition-colors"
              title="Send with AI"
            >
              <VscSparkle size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
