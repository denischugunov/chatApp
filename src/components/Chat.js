import { Button, Card, Form, InputGroup } from "react-bootstrap";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { animateScroll } from "react-scroll";

// Компонент окна чата, при открытии использую реакт-скролл чтобы вниз прокручивать
const Chat = () => {
  const userData = useSelector((state) => state.user.userData);
  const theme = useSelector((state) => state.theme.theme); // Получение текущей темы для стилизации
  const { id } = useParams();
  const chat = useSelector((state) =>
    state.chats.chats.find((chat) => chat.id === id)
  );

  const [message, setMessage] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    animateScroll.scrollToBottom({
      containerId: "chat-messages",
      duration: 200,
      smooth: "easeInOutQuint",
    });
  }, [chat?.messages]);

  // Функция для отправки данных о сообщении в БД
  const handleSendMessage = async () => {
    if (message.trim() === "") return;

    try {
      const chatRef = doc(db, "chats", id);

      const newMessage = {
        name: userData.name,
        text: message,
        timestamp: new Date(), // Клиентская временная метка
      };

      await updateDoc(chatRef, {
        messages: arrayUnion(newMessage),
        lastMessageTimestamp: new Date(), // Клиентская временная метка
        [`lastReadTimestamps.${userData.id}`]: new Date(), // Обновляем время прочтения
      });

      setMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Failed to send message. Please try again.");
    }
  };

  // работа со временем для корректного отображения
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "";
    let date;
    if (timestamp.toDate) {
      date = timestamp.toDate();
    } else {
      date = new Date(timestamp);
    }
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // проверка на то, открыт ли чат
  if (!chat) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <h3>Select a chat</h3>
      </div>
    );
  }

  return (
    <Card
      style={{
        height: "100%",
        backgroundColor: theme === "light" ? "#ffffff" : "#212529",
      }}
    >
      <Card.Body
        id="chat-messages"
        style={{
          overflowY: "auto",
          padding: "10px",
          backgroundColor: theme === "light" ? "#f8f9fa" : "#343a40",
        }}
      >
        {chat.messages && chat.messages.length > 0 ? (
          chat.messages.map((message, index) => (
            <div
              key={index}
              className={`d-flex mb-3 ${
                message.name === userData.name ? "justify-content-end" : ""
              }`}
            >
              <div
                style={{
                  maxWidth: "60%",
                  backgroundColor:
                    message.name === userData.name
                      ? "var(--bs-primary)"
                      : "var(--bs-secondary)",
                  color: "white",
                  padding: "10px",
                  borderRadius: "10px",
                  textAlign: "left",
                }}
              >
                <div className="fw-bold">{message.name}</div>
                <div>{message.text}</div>
                <div
                  style={{
                    fontSize: "0.8rem",
                    textAlign: "right",
                    color: "rgba(255,255,255,0.7)",
                  }}
                >
                  {formatTimestamp(message.timestamp)}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div
            style={{
              color: theme === "light" ? "#000000" : "#ffffff",
            }}
          >
            No messages yet.
          </div>
        )}
      </Card.Body>

      <Card.Footer
        style={{
          backgroundColor: theme === "light" ? "#ffffff" : "#212529",
          borderTop:
            theme === "light" ? "1px solid #dee2e6" : "1px solid #495057",
        }}
      >
        <InputGroup>
          <Form.Control
            type="text"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            style={{
              backgroundColor: theme === "light" ? "#ffffff" : "#343a40",
              color: theme === "light" ? "#000000" : "#ffffff",
              borderColor: theme === "light" ? "#ced4da" : "#495057",
            }}
          />
          <Button
            variant={theme === "light" ? "primary" : "dark"}
            onClick={handleSendMessage}
          >
            Send
          </Button>
        </InputGroup>
        {error && <div className="text-danger mt-2">{error}</div>}
      </Card.Footer>
    </Card>
  );
};

export default Chat;
