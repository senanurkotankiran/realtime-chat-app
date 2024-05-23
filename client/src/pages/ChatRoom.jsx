

import { useContext, useEffect, useState, useRef } from "react";
import { ChatContext } from "../context/ChatContext";
import { AuthContext } from "../context/AuthContext";
import { Stack } from "react-bootstrap";
import moment from "moment";
import InputEmoji from "react-input-emoji";



const ChatRoom = () => {
    const { generalMessages, sendGeneralMessage, isGeneralMessagesLoading, generalMessagesError } = useContext(ChatContext);
    const { user } = useContext(AuthContext);
    const [textMessage, setTextMessage] = useState("");
    const scroll = useRef();

    useEffect(() => {
        scroll.current?.scrollIntoView({ behavior: "smooth" });
    }, [generalMessages]);

    if (isGeneralMessagesLoading) {
        return <div>Loading...</div>;
    }

    if (generalMessagesError) {
        return <div>Error: {generalMessagesError}</div>;
    }

    const handleSendMessage = () => {
        if (textMessage.trim() !== "") {
            sendGeneralMessage(textMessage, user, setTextMessage);
            setTextMessage(""); // Clear the input after sending the message
        }
    };
    return (
        <Stack gap={4} className="chat-box">
            <div className="chat-header">
                <strong>Admin_Oda</strong>
            </div>
            <Stack gap={3} className="messages">
                {generalMessages.map((msg) => (
                    <Stack
                        key={msg._id}
                        className={`${msg?.senderId === user?._id ? "message self align-self-end flex-grow-0" : "message align-self-start flex-grow-0"}`}
                        ref={scroll}
                    >
                        <span><strong>{msg._id}: </strong></span>
                        <span>{msg.text}</span>
                        <span className="messages-footer">{moment(msg.createdAt).calendar()}</span>
                    </Stack>
                ))}
            </Stack>
            <Stack direction="horizontal" gap={3} className="chat-input flex-grow-0">
                <InputEmoji
                    value={textMessage}
                    onChange={setTextMessage}
                    fontFamily="nunito"
                />
                <button className="send-btn" onClick={handleSendMessage}>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        className="bi bi-send-fill"
                        viewBox="0 0 16 16"
                    >
                        <path d="M15.964.686a.5.5 0 0 0-.65-.65L.767 5.855H.766l-.452.18a.5.5 0 0 0-.082.887l.41.26.001.002 4.995 3.178 3.178 4.995.002.002.26.41a.5.5 0 0 0 .886-.083zm-1.833 1.89L6.637 10.07l-.215-.338a.5.5 0 0 0-.154-.154l-.338-.215 7.494-7.494 1.178-.471z" />
                    </svg>
                </button>
            </Stack>
        </Stack>
    );
};

export default ChatRoom;
