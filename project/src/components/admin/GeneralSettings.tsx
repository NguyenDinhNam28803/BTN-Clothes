import { Info, Phone, Globe } from 'lucide-react';

interface SettingsTabsProps {
  activeTab: string;
  onTabClick: (tab: string) => void;
}

const tabs = [
  { id: 'general', label: 'Thông tin chung', icon: Info },
  { id: 'contact', label: 'Liên hệ', icon: Phone },
  { id: 'social', label: 'Mạng xã hội', icon: Globe },
];

export default function SettingsTabs({ activeTab, onTabClick }: SettingsTabsProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="space-y-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabClick(tab.id)}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-lg
                transition-all duration-200
                ${isActive
                  ? 'bg-cyan-500 text-white font-medium'
                  : 'text-gray-600 hover:bg-gray-50'
                }
              `}
            >
              <Icon size={18} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
