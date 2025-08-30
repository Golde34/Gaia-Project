import { Card, Metric, Title } from "@tremor/react";
import { useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom";
import { ItemRow } from "../../components/subComponents/ItemRow";

const UserMenu = ({
    onNavigate,
    maxHeightClass = "max-h-[80vh", }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    return (
        <div className="flex flex-col gap-3">
            <Metric className="text-xl">Menu</Metric>

            <div className={`overflow-y-auto p-1 space-y-3 ${maxHeightClass}`}>
                <Card className="p-3">
                    <Title className="text-sm mb-2">Shortcuts</Title>
                    <ItemRow
                        key={"user_profile_screen"}
                        icon={"🆕"}
                        label={"User profile"}
                        onClick={() => {
                            navigate("/chat");
                            window.location.reload();
                        }}
                    />
                    <ItemRow
                        key={"user_setting_screen"}
                        icon={"🔎"}
                        label={"User setting + calendar setting"}
                    />
                    <ItemRow
                        key={"llm_config"}
                    />
                    <ItemRow
                        key={"github_config"} 
                    >
                    </ItemRow>
                </Card>
            </div>
        </div>

    )
}