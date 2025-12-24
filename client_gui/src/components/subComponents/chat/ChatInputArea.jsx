import { Button, TextInput } from "@tremor/react";

/**
 * ChatInputArea - Chat input field with send button
 * @param {string} value - Current input value
 * @param {function} onChange - Handler for input change
 * @param {function} onSend - Handler for send action
 * @param {boolean} isDashboard - Whether component is in dashboard mode
 * @param {function} onNavigateToOtherChats - Handler for navigation button
 */
export default function ChatInputArea({ 
    value, 
    onChange, 
    onSend, 
    isDashboard = false,
    onNavigateToOtherChats 
}) {
    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            onSend();
        }
    };

    return (
        <>
            <div className="flex items-center p-4 border-t">
                <TextInput
                    placeholder="Type your message here..."
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 mr-2"
                />
                <Button color="indigo" onClick={onSend}>
                    Send
                </Button>
            </div>
            {isDashboard && (
                <div className="mt-2 text-center">
                    <Button variant="light" size="sm" onClick={onNavigateToOtherChats}>
                        Go to Other Chats
                    </Button>
                </div>
            )}
        </>
    );
}
