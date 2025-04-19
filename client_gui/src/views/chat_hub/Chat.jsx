import { useDispatch } from "react-redux";
import Template from "../../components/template/Template";

function ContentArea() {
    const userId = "1";
    const dispatch = useDispatch();

    return (
        <div>
            <h1>Chat Application</h1>
            <div style={{ maxHeight: "300px", overflowY: "auto", border: "1px solid #ddd", padding: "10px" }}>
                {/* Chat messages will be displayed here */}
            </div>
            <input
                type="text"
                placeholder="Type your message"
                style={{ width: "70%", padding: "10px" }}
            />
            <button style={{ padding: "10px 20px", marginLeft: "10px" }}>
                Send
            </button>
        </div>
    );
}

const Chat = () => {
    return (
        <Template>
            <ContentArea />
        </Template>
    )
}

export default Chat;