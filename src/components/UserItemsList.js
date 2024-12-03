import {
  addDoc,
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  Badge,
  Button,
  Container,
  Form,
  Image,
  ListGroup,
} from "react-bootstrap";
import { db } from "../firebase/firebase";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

// компонент списка всех пользователей для поиска и создания нового чата
const UserItemsList = ({ handleGoChatList }) => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const userId = useSelector((state) => state.user.userData.id);
  const theme = useSelector((state) => state.theme.theme);
  const navigate = useNavigate();

  const [chats, setChats] = useState([]);

  // фетчим список пользователей с БД
  useEffect(() => {
    const fetchUsersData = async () => {
      try {
        const usersQuery = query(collection(db, "users"));
        const usersSnapshot = await getDocs(usersQuery);

        if (!usersSnapshot.empty) {
          const usersData = usersSnapshot.docs
            .filter((doc) => doc.id !== userId)
            .map((doc) => ({ id: doc.id, ...doc.data() }));
          setUsers(usersData);
          setFilteredUsers(usersData);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsersData();
  }, [userId]);

  // Фетчим список чатов пользователя с БД
  useEffect(() => {
    const chatsQuery = query(
      collection(db, "chats"),
      where("users", "array-contains", userId), // Фильтруем чаты, где текущий пользователь является участником
      orderBy("lastMessageTimestamp", "desc"),
      limit(10)
    );

    // Обработчик изменения строки поиска
    const unsubscribe = onSnapshot(chatsQuery, (snapshot) => {
      const chatsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setChats(chatsData);
    });

    return () => unsubscribe();
  }, [userId]);

  // Обработчик клика по пользователю
  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    if (query === "") {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter((user) =>
        user.name.toLowerCase().includes(query)
      );
      console.log(filtered);
      setFilteredUsers(filtered);
    }
  };

  //
  const handleUserClick = async (selectedUser) => {
    try {
      const chatsRef = collection(db, "chats");
      const q = query(chatsRef, where("users", "array-contains", userId));
      const querySnapshot = await getDocs(q);

      let chatExists = false;
      let chatId = null;

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.users.includes(selectedUser.id)) {
          chatExists = true;
          chatId = doc.id;
        }
      });

      if (!chatExists) {
        const newChat = {
          users: [userId, selectedUser.id],
          lastMessageTimestamp: null,
        };
        const chatDocRef = await addDoc(chatsRef, newChat);
        chatId = chatDocRef.id;
      }

      navigate(`/chat/${chatId}`);
    } catch (error) {
      console.error("Error handling user click:", error);
    }
  };

  return (
    <Container style={{ height: "100%" }} className="d-flex flex-column pb-2">
      <Form>
        <Form.Group className="mb-3" controlId="formBasicSearch">
          <Form.Label
            className={theme === "light" ? "text-dark" : "text-light"}
          >
            Find Users
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
        {filteredUsers.length === 0 ? (
          <div className={theme === "light" ? "text-dark" : "text-light"}>
            No users found
          </div>
        ) : (
          filteredUsers.map((user) => (
            <ListGroup.Item
              as="li"
              key={user.id}
              action
              variant={theme === "light" ? "light" : "dark"}
              style={{
                cursor: "pointer",
                backgroundColor: theme === "light" ? "#ffffff" : "#212529",
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
              onClick={() => handleUserClick(user)}
            >
              <div className="d-flex align-items-center">
                <Image
                  src={user.AvatarUrl || "/default-avatar.png"}
                  roundedCircle
                  style={{
                    width: "40px",
                    height: "40px",
                    objectFit: "cover",
                    marginRight: "10px",
                  }}
                />
                <div className="ms-2 me-auto">
                  <div className="fw-bold">{user.name}</div>
                  {user.email}
                </div>
              </div>
              <Badge
                pill
                bg={theme === "light" ? "primary" : "info"}
                text="white"
              >
                Add
              </Badge>
            </ListGroup.Item>
          ))
        )}
      </ListGroup>

      <Button
        onClick={handleGoChatList}
        variant={theme === "light" ? "primary" : "dark"}
        className="mt-auto"
      >
        <i className="bi bi-arrow-left me-1"></i>Return to Chats
      </Button>
    </Container>
  );
};

export default UserItemsList;
