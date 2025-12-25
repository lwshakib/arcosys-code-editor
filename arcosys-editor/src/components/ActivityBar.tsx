import {
  VscFiles,
  VscSearch,
  VscGitMerge,
  VscDebugAltSmall,
  VscExtensions,
  VscAccount,
  VscSettingsGear,
} from "react-icons/vsc";

interface ActivityBarProps {
  activeView: "explorer" | "search";
  onViewChange: (view: "explorer" | "search") => void;
}

export const ActivityBar = ({ activeView, onViewChange }: ActivityBarProps) => {
  return (
    <div className="w-12 bg-[#232A35] h-full flex flex-col items-center py-2 justify-between draggable-area">
      {/* Top Icons */}
      <div className="flex flex-col gap-6 non-draggable-area">
        <div
          className={`cursor-pointer transition-colors ${
            activeView === "explorer"
              ? "text-white"
              : "text-[#7a8a9e] hover:text-white"
          }`}
          title="Explorer"
          onClick={() => onViewChange("explorer")}
        >
          <VscFiles size={24} />
        </div>
        <div
          className={`cursor-pointer transition-colors ${
            activeView === "search"
              ? "text-white"
              : "text-[#7a8a9e] hover:text-white"
          }`}
          title="Search"
          onClick={() => onViewChange("search")}
        >
          <VscSearch size={24} />
        </div>
        <div
          className="text-[#7a8a9e] hover:text-white cursor-pointer transform rotate-180"
          title="Source Control"
        >
          <VscGitMerge size={24} />
        </div>
        <div
          className="text-[#7a8a9e] hover:text-white cursor-pointer"
          title="Run and Debug"
        >
          <VscDebugAltSmall size={24} />
        </div>
        <div
          className="text-[#7a8a9e] hover:text-white cursor-pointer"
          title="Extensions"
        >
          <VscExtensions size={24} />
        </div>
      </div>

      {/* Bottom Icons */}
      <div className="flex flex-col gap-6 non-draggable-area">
        <div
          className="text-[#7a8a9e] hover:text-white cursor-pointer"
          title="Accounts"
        >
          <VscAccount size={24} />
        </div>
        <div
          className="text-[#7a8a9e] hover:text-white cursor-pointer"
          title="Settings"
        >
          <VscSettingsGear size={24} />
        </div>
      </div>
    </div>
  );
};
