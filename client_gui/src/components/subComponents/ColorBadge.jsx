import { Badge } from "@tremor/react"

export const ColorBadge = (props) => {
    const color = props.color;
    const name = props.name;
    return (
        <Badge
            color={color || "gray"} size="sm"
            className="px-2 py-1 rounded-full text-xs font-medium"
        > {name}
        </Badge>
    )
}