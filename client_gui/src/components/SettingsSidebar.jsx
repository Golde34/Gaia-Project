import PropTypes from "prop-types";
import { Card, Text } from "@tremor/react";

const SettingsSidebar = ({ title = "Quick navigation", items, activeItemId, onSelect }) => {
    return (
        <Card className="h-full bg-slate-900/60 border border-slate-800">
            <Text className="text-gray-300 text-sm mb-3">{title}</Text>
            <div className="flex flex-col gap-2">
                {items.map((item) => {
                    const isActive = item.id === activeItemId;
                    return (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => onSelect?.(item.id)}
                            className={`w-full text-left rounded-lg border px-3 py-2 transition-colors duration-150 ${isActive
                                ? "border-indigo-500 bg-indigo-900/40 text-white"
                                : "border-slate-800 bg-slate-950 text-gray-300 hover:border-indigo-500/60 hover:bg-indigo-900/20"}
                            `}
                        >
                            <div className="font-semibold text-sm">{item.label}</div>
                            {item.description && (
                                <div className="text-xs text-gray-400 mt-1 leading-snug">
                                    {item.description}
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>
        </Card>
    );
};

SettingsSidebar.propTypes = {
    title: PropTypes.string,
    items: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
        description: PropTypes.string,
    })).isRequired,
    activeItemId: PropTypes.string,
    onSelect: PropTypes.func,
};

export default SettingsSidebar;
