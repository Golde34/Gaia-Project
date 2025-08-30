import { Text } from "@tremor/react";

export const ItemRow = ({ icon, label, onClick, right }) => (
    <button
        onClick={onClick}
        className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-100 transition text-left"
    >
        <span className="flex items-center gap-2">
            {icon && <span className="text-lg">{icon}</span>}
            <Text>{label}</Text>
        </span>
        {right}
    </button>
);