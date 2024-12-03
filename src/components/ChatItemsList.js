import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  Badge,
  Button,
  Container,
  Form,
  Image,
  ListGroup,
  Alert,
  Spinner,
} from "react-bootstrap";
import { db } from "../firebase/firebase";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

// Компонент для выведения списка чатов юзера
const ChatItemsList = ({ handleGoFindUse }) => {
  // обращаемся к стору
  const {
    chats,
    loading: chatsLoading,
    error: chatsError,
  } = useSelector((state) => state.chats);
  const {
    userData,
    loading: userLoading,
    error: userError,
  } = useSelector((state) => state.user);
  const theme = useSelector((state) => state.theme.theme);

  // вводим состояния для возможности вывода и фильтрации чатов
  const [otherUsers, setOtherUsers] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredChats, setFilteredChats] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Функция для получения данных о другом пользователе
  const fetchOtherUser = async (userId) => {
    if (otherUsers[userId]) return;
    try {
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        setOtherUsers((prev) => ({
          ...prev,
          [userId]: userDoc.data(),
        }));
      } else {
        console.warn(`User with ID ${userId} not found.`);
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
    }
  };

  // Функция для обрезки длинных текстов
  const truncateText = (text, maxLength) => {
    if (text.length > maxLength) {
      return text.substring(0, maxLength) + "...";
    }
    return text;
  };

  // Получение данных о других пользователях из чатов
  useEffect(() => {
    if (chats && chats.length > 0 && userData && userData.id) {
      chats.forEach((chat) => {
        if (chat.users && Array.isArray(chat.users)) {
          const otherUserId = chat.users.find((id) => id !== userData.id);
          if (otherUserId) {
            fetchOtherUser(otherUserId);
          } else {
            console.warn(`Chat ${chat.id} is missing the other user.`);
          }
        } else {
          console.warn(`Chat ${chat.id} has an incorrect users structure.`);
        }
      });
    }
  }, [chats, userData]);

  // Обновляем список фильтрованных чатов
  useEffect(() => {
    if (!userData || !userData.id) {
      setFilteredChats([]);
      return;
    }
    if (searchQuery.trim() === "") {
      setFilteredChats(chats);
    } else {
      const filtered = chats.filter((chat) => {
        if (chat.users && Array.isArray(chat.users)) {
          const otherUserId = chat.users.find((id) => id !== userData.id);
          const otherUser = otherUsers[otherUserId];
          if (otherUser && otherUser.name) {
            return otherUser.name
              .toLowerCase()
              .includes(searchQuery.toLowerCase());
          } else {
            console.warn(`Missing name for user ID: ${otherUserId}`, otherUser);
          }
        }
        return false;
      });
      setFilteredChats(filtered);
    }
  }, [searchQuery, chats, otherUsers, userData]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Обработчик нажатия на чат
  const handleChatClick = async (chatId) => {
    try {
      const chatRef = doc(db, "chats", chatId);
      await updateDoc(chatRef, {
        [`lastReadTimestamps.${userData.id}`]: new Date(), // Используем клиентскую временную метку
      });
      navigate(`/chat/${chatId}`);
    } catch (err) {
      console.error("Error updating chat read timestamp:", err);
    }
  };

  // Обновляем ошибки загрузки
  useEffect(() => {
    if (chatsError) {
      setError("Не удалось загрузить чаты. Пожалуйста, попробуйте позже.");
    } else if (userError) {
      setError(
        "Не удалось загрузить данные пользователя. Пожалуйста, попробуйте позже."
      );
    } else {
      setError(null);
    }
  }, [chatsError, userError]);

  // Проверка, загрузка данных или нет
  const isLoading = chatsLoading || userLoading;

  // Конвертация временной метки в миллисекунды
  const getTimestampInMillis = (timestamp) => {
    if (!timestamp) return 0;
    if (timestamp instanceof Date) {
      return timestamp.getTime();
    }
    if (timestamp.toDate) {
      return timestamp.toDate().getTime();
    }
    if (timestamp.seconds) {
      return timestamp.seconds * 1000;
    }
    return new Date(timestamp).getTime();
  };

  return (
    <Container
      style={{ height: "100%", backgroundColor: "transparent" }}
      className="d-flex flex-column pb-2"
    >
      {error && <Alert variant="danger">{error}</Alert>}
      {isLoading ? (
        <div className="d-flex justify-content-center align-items-center flex-grow-1">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      ) : (
        <>
          <Form>
            <Form.Group className="mb-3" controlId="formBasicSearch">
              <Form.Label
                className={theme === "light" ? "text-dark" : "text-light"}
              >
                Find chat
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter username"
                value={searchQuery}
                onChange={handleSearchChange}
                style={{
                  backgroundColor: theme === "light" ? "#ffffff" : "#343a40",
                  color: theme === "light" ? "#000000" : "#ffffff",
                }}
              />
            </Form.Group>
          </Form>

          <ListGroup as="ul" style={{ overflowY: "auto" }}>
            {!userData || !userData.id || filteredChats.length === 0 ? (
              <div className={theme === "light" ? "text-dark" : "text-light"}>
                Чатов не найдено
              </div>
            ) : (
              filteredChats.map((chat) => {
                if (!chat.users || !Array.isArray(chat.users)) {
                  console.warn(
                    `Chat ${chat.id} has an incorrect users structure.`
                  );
                  return null;
                }

                const otherUserId = chat.users.find((id) => id !== userData.id);
                const otherUser = otherUsers[otherUserId];
                let unread = false;

                const lastMessage =
                  chat.messages && chat.messages.length > 0
                    ? chat.messages[chat.messages.length - 1]
                    : null;

                const lastMessageTime = lastMessage
                  ? getTimestampInMillis(lastMessage.timestamp)
                  : 0;

                const lastReadTimestamp =
                  chat.lastReadTimestamps &&
                  chat.lastReadTimestamps[userData.id];
                const lastReadTime = getTimestampInMillis(lastReadTimestamp);

                const lastMessageFromOthers =
                  lastMessage && lastMessage.name !== userData.name;

                unread =
                  lastMessageTime > lastReadTime && lastMessageFromOthers;

                return (
                  <ListGroup.Item
                    as="li"
                    className="d-flex justify-content-between align-items-center"
                    key={chat.id}
                    style={{
                      cursor: "pointer",
                      backgroundColor:
                        theme === "light" ? "#ffffff" : "#212529",
                      color: theme === "light" ? "#000000" : "#ffffff",
                      transition: "background-color 0.3s ease, color 0.3s ease",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor =
                        theme === "light" ? "#f8f9fa" : "#343a40")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor =
                        theme === "light" ? "#ffffff" : "#212529")
                    }
                    onClick={() => handleChatClick(chat.id)}
                  >
                    <div className="d-flex align-items-center">
                      <Image
                        src={
                          otherUser?.AvatarUrl || "/images/default-avatar.png"
                        }
                        roundedCircle
                        style={{
                          width: "40px",
                          height: "40px",
                          objectFit: "cover",
                          marginRight: "10px",
                        }}
                      />
                      <div className="ms-2 me-auto">
                        <div className="fw-bold">
                          {otherUser ? otherUser.name : "Загрузка..."}
                        </div>
                        <div>
                          {chat.messages && chat.messages.length > 0
                            ? truncateText(
                                chat.messages[chat.messages.length - 1].text,
                                50
                              )
                            : "Нет сообщений."}
                        </div>
                      </div>
                    </div>
                    <Badge
                      bg={
                        unread
                          ? theme === "light"
                            ? "danger"
                            : "warning"
                          : "primary"
                      }
                      pill
                      text="white"
                    >
                      {unread ? "New" : chat.unreadCount || 0}
                    </Badge>
                  </ListGroup.Item>
                );
              })
            )}
          </ListGroup>

          <Button
            onClick={handleGoFindUse}
            variant={theme === "light" ? "primary" : "dark"}
            className="mt-auto"
          >
            <i className="bi bi-person-fill-add me-1"></i>Add new chat
          </Button>
        </>
      )}
    </Container>
  );
};

export default ChatItemsList;
