import { useDispatch, useSelector } from "react-redux";
import { useCallback, useEffect, useRef, useState } from "react";
import { Card, Text, Title, Badge, Metric, Subtitle, Grid } from "@tremor/react";
import { getAllDialogues } from "../../api/store/actions/chat_hub/dialogue.actions";
import { useNavigate } from "react-router-dom";
import { ItemRow } from "../../components/subComponents/ItemRow";

const DialogueList = ({
    maxHeightClass = "max-h-[80vh]",
}) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [size] = useState(20);

    const listDialogue = useSelector(state => state.allDialogues);
    const { loading: loadingDialogues, error: errorDialogues, dialogues, nextCursor, hasMore } = listDialogue;
    const debounceRef = useRef();
    const getAllUserDialogues = useCallback((loadCursor) => {
        const cursorToUse = loadCursor || nextCursor || "";
        dispatch(getAllDialogues(size, cursorToUse));
    }, [dispatch, nextCursor, size]);
    useEffect(() => {
        if (debounceRef.current) return;
        getAllUserDialogues();
        debounceRef.current = true;
    }, [getAllUserDialogues]);

    const handleDialogueClick = (dialogueId, dialogueType) => {
        navigate(`/chat?dialogueId=${encodeURIComponent(dialogueId)}&dialogueType=${encodeURIComponent(dialogueType)}`, {
            replace: false,
            state: { refresh: true }
        });
    };

    return (
        <div className="flex flex-col gap-3">
            <div>
                <Metric className="text-xl">Chat Hub</Metric>
                <Subtitle className="text-sm text-gray-500">Your chats</Subtitle>
            </div>

            <div className={`overflow-y-auto p-1 space-y-3 ${maxHeightClass}`}>
                <Card className="p-3">
                    <Title className="text-sm mb-2">Shortcuts</Title>
                    <ItemRow
                        key={"new_search_button"}
                        icon={"🆕"}
                        label={"New Chat"}
                        onClick={() => {
                            navigate("/chat", {
                                replace: false,
                                state: { refresh: true, newChat: true }
                            });
                        }}
                    />
                    <ItemRow
                        key={"search_chat_button"}
                        icon={"🔎"}
                        label={"Search Chats"}
                    />
                    <ItemRow
                        key={"memory_setting"}
                        icon={"⚙️"}
                        label={"Memory Settings"}
                        onClick={() => navigate("/chat/memory-settings")}
                    />
                </Card>

                <Card className="p-3">
                    <div className="flex items-center justify-between mb-2">
                        <Title className="text-sm">Dialogues</Title>
                        <Badge color="gray">{dialogues.length}</Badge>
                    </div>
                    {loadingDialogues ? (
                        <Text>Loading Dialogues…</Text>
                    ) : dialogues.length ? (
                        dialogues.map((g) => (
                            <ItemRow
                                key={g.id}
                                label={g.dialogueType}
                                onClick={() => handleDialogueClick(g.id, g.dialogueType)}
                            />
                        ))
                    ) : (
                        <Text>No Dialogues yet.</Text>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default DialogueList;
