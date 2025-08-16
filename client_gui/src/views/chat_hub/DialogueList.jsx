import { useDispatch, useSelector } from "react-redux";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Card, Button, Text, Title, Badge, Metric, Subtitle } from "@tremor/react";
import { getAllDialogues } from "../../api/store/actions/chat_hub/dialogue.actions";

const DialogueList = ({
    onNavigate,
    onDialogueList,
    onOpenFolder,
    maxHeightClass = "max-h-[60vh]",
}) => {
    const dispatch = useDispatch();

    // ---- Mock data ----
    const [shortcuts, setShortcuts] = useState([]);
    const [size] = useState(20);

    const [gpts, setGpts] = useState([]);
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
        // fake load
        setTimeout(() => {
            setShortcuts([
                { id: "new", label: "New chat", route: "new", icon: "🆕" },
                { id: "search", label: "Search chats", route: "search", icon: "🔎" },
                { id: "library", label: "Library", route: "library", icon: "📚" },
            ]);
            setFolders([
                { id: "new-project", name: "New project", icon: "📁" },
                { id: "5gsystem", name: "5GSystem", icon: "📁" },
                { id: "shaw_vu", name: "Shaw_Vu", icon: "📁", unreadCount: 2 },
                { id: "khiem_french", name: "Khiem_ÉtudierLeFrancais", icon: "📁" },
                { id: "khiem_future", name: "Khiem_future", icon: "📁" },
                { id: "chiennt", name: "Chiennt", icon: "📁" },
            ]);
            setLoading(false);
        }, 500);
    }, []);

    const notReadyMessage = useMemo(() => {
        if (loading) return "Loading workspace…";
        if (!shortcuts.length && !gpts.length && !folders.length) return "No items yet.";
        return null;
    }, [loading, shortcuts, gpts, folders]);

    const ItemRow = ({ icon, label, onClick, right }) => (
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

    return (
        <div className="flex flex-col gap-3">
            <div>
                <Metric className="text-xl">Workspace</Metric>
                <Subtitle className="text-sm text-gray-500">Your chats, GPTs & projects</Subtitle>
            </div>

            <div className={`overflow-y-auto pr-1 space-y-3 ${maxHeightClass}`}>
                <Card className="p-3">
                    <Title className="text-sm mb-2">Shortcuts</Title>
                    {loading ? (
                        <Text>Loading…</Text>
                    ) : (
                        (shortcuts.length ? shortcuts : [
                            { id: "new", label: "New chat", route: "new", icon: "🆕" },
                            { id: "search", label: "Search chats", route: "search", icon: "🔎" },
                            { id: "library", label: "Library", route: "library", icon: "📚" },
                        ]).map((sc) => (
                            <ItemRow
                                key={sc.id}
                                icon={sc.icon}
                                label={sc.label}
                                onClick={() => onNavigate?.(sc.route)}
                            />
                        ))
                    )}
                </Card>

                {/* GPTs */}
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
                                onClick={() => onDialogueList?.(g.id)}
                            />
                        ))
                    ) : (
                        <Text>No Dialogues yet.</Text>
                    )}
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
            </div>

            {/* <div>
        {notReadyMessage && <Text className="text-gray-600">{notReadyMessage}</Text>}
        <Text className="mt-2 text-sm">Beam Dev Tech (Plus)</Text>
      </div> */}
        </div>
    );
};

export default DialogueList;
