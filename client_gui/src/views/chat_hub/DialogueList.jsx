import { useDispatch, useSelector } from "react-redux";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Card, Button, Text, Title, Badge, Metric, Subtitle } from "@tremor/react";
import { getAllDialogues } from "../../api/store/actions/chat_hub/dialogue.actions";
import { useNavigate } from "react-router-dom";
import { ItemRow } from "../../components/subComponents/ItemRow";

const DialogueList = ({
    onNavigate,
    onOpenFolder,
    maxHeightClass = "max-h-[80vh]",
}) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // ---- Mock data ----
    const [size] = useState(20);

    const [folders, setFolders] = useState([]);
    const [loading, setLoading] = useState(true);

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

    useEffect(() => {
        setTimeout(() => {
            setFolders([
                { id: "new-project", name: "New project", icon: "📁" },
                { id: "5gsystem", name: "5GSystem", icon: "📁" },
                { id: "shaw_vu", name: "Shaw_Vu", icon: "📁", unreadCount: 2 },
                { id: "khiem_french", name: "Khiem_ÉtudierLeFrancais", icon: "📁" },
            ]);
            setLoading(false);
        }, 500);
    }, []);

    const handleDialogueClick = (dialogueId, dialogueType) => {
        navigate(`/chat?dialogueId=${encodeURIComponent(dialogueId)}&dialogueType=${encodeURIComponent(dialogueType)}`, { 
            replace: false,
            state: { refresh: true }
        });
    };

    const notReadyMessage = useMemo(() => {
        if (loading) return "Loading workspace…";
        if (!dialogues.length && !folders.length) return "No items yet.";
        return null;
    }, [loading, dialogues, folders]);

    return (
        <div className="flex flex-col gap-3">
            <div>
                <Metric className="text-xl">Chat Hub</Metric>
                <Subtitle className="text-sm text-gray-500">Your chats & projects</Subtitle>
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
                </Card>

                {/* Projects */}
                <Card className="p-3">
                    <div className="flex items-center justify-between mb-2">
                        <Title className="text-sm">Projects</Title>
                        <Badge color="gray">{folders.length}</Badge>
                    </div>
                    {loading ? (
                        <Text>Loading projects…</Text>
                    ) : folders.length ? (
                        folders.map((f) => (
                            <ItemRow
                                key={f.id}
                                icon={f.icon}
                                label={f.name}
                                right={f.unreadCount ? <Badge color="blue">{f.unreadCount}</Badge> : null}
                                onClick={() => {
                                    if (f.id === "new-project") onNavigate?.("create-project");
                                    else onOpenFolder?.(f.id);
                                }}
                            />
                        ))
                    ) : (
                        <div className="space-y-2">
                            <Text>No projects yet.</Text>
                            <Button size="xs" variant="primary" onClick={() => onNavigate?.("create-project")}>
                                New project
                            </Button>
                        </div>
                    )}
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

            {/* <div>
        {notReadyMessage && <Text className="text-gray-600">{notReadyMessage}</Text>}
        <Text className="mt-2 text-sm">Beam Dev Tech (Plus)</Text>
      </div> */}
        </div>
    );
};

export default DialogueList;
