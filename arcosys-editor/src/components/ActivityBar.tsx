import {
  VscFiles,
  VscSearch,
  VscGitMerge,
  VscDebugAltSmall,
  VscExtensions,
  VscAccount,
  VscSettingsGear,
} from "react-icons/vsc";

export const ActivityBar = () => {
  return (
    <div className="w-12 bg-[#232A35] h-full flex flex-col items-center py-2 justify-between draggable-area">
      {/* Top Icons */}
      <div className="flex flex-col gap-6 non-draggable-area">
        <div
          className="text-white hover:text-white cursor-pointer"
          title="Explorer"
        >
          <VscFiles size={24} />
        </div>
        <div
          className="text-[#858585] hover:text-white cursor-pointer"
          title="Search"
        >
          <VscSearch size={24} />
        </div>
        <div
          className="text-[#858585] hover:text-white cursor-pointer transform rotate-180"
          title="Source Control"
        >
          <VscGitMerge size={24} />
        </div>
        <div
          className="text-[#858585] hover:text-white cursor-pointer"
          title="Run and Debug"
        >
          <VscDebugAltSmall size={24} />
        </div>
        <div
          className="text-[#858585] hover:text-white cursor-pointer"
          title="Extensions"
        >
          <VscExtensions size={24} />
        </div>
      </div>

      {/* Bottom Icons */}
      <div className="flex flex-col gap-6 non-draggable-area">
        <div
          className="text-[#858585] hover:text-white cursor-pointer"
          title="Accounts"
        >
          <VscAccount size={24} />
        </div>
        <div
          className="text-[#858585] hover:text-white cursor-pointer"
          title="Settings"
        >
          <VscSettingsGear size={24} />
        </div>
      </div>
    </div>
  );
};
