import React, { useRef, useEffect, useState } from "react";
import stompService from "../utils/socketService"; 
import Message from "./Message";

export function Chat() {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [sender, setSender] = useState("A");
    const [to, setTo] = useState("B");

    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        stompService
            .subscribe(`/messageTo/${sender}`, (message) => {
                setMessages((prev) => [...prev, message]);
            })
            .catch((e) => console.error("Error al conectarse", e));

        return () => {
            stompService.unsubscribe(`/messageTo/${sender}`);
        };
    }, [sender]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        const messageData = {
            sender: sender,
            type: "message",
            content: newMessage,
            isRead: false,
        };

        fetch(`http://localhost:8080/chat?to=${to}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(messageData),
        })
        .then(() => {
            setMessages((prev) => [...prev, messageData]); 
            setNewMessage("");
        })
        .catch((err) => {
            console.error("Error al enviar el mensaje", err);
        });
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100vh", padding: "20px", backgroundColor: "#f4f4f4" }}>
            <div style={{ flexGrow: 1, overflowY: "auto", backgroundColor: "#fff", padding: "10px", marginBottom: "10px", borderRadius: "5px" }}>
                <h2 style={{ textAlign: "center" }}>Chat</h2>
                <div>
                    {messages.map((message, index) => (
                        <div
                            key={index}
                            style={{
                                display: "flex",
                                justifyContent: message.sender === sender ? "flex-end" : "flex-start",
                                marginBottom: "10px",
                            }}
                        >
                            <div
                                style={{
                                    backgroundColor: message.sender === sender ? "#DCF8C6" : "#E4E6EB",
                                    padding: "10px",
                                    borderRadius: "10px",
                                    maxWidth: "60%",
                                }}
                            >
                                <Message message={message} />
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            <div style={{ display: "flex", marginBottom: "10px" }}>
                <input
                    value={sender}
                    onChange={(e) => setSender(e.target.value)}
                    placeholder="Sender"
                    style={{ flexGrow: 1, marginRight: "10px", padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
                />
                <input
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    placeholder="Receiver"
                    style={{ flexGrow: 1, padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
                />
            </div>

            <form onSubmit={handleSendMessage} style={{ display: "flex" }}>
                <input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Write a message..."
                    style={{ flexGrow: 1, padding: "10px", borderRadius: "5px", border: "1px solid #ccc", marginRight: "10px" }}
                />
                <button type="submit" style={{ padding: "10px", borderRadius: "5px", backgroundColor: "#007BFF", color: "#fff", border: "none" }}>
                    Send
                </button>
            </form>
        </div>
    );
}

export default Chat;
