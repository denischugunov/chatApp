import { Col, Container, Row, Alert, Spinner } from "react-bootstrap";
import Header from "../components/Header";
import ChatItemsList from "../components/ChatItemsList";
import UserItemsList from "../components/UserItemsList";
import Profile from "../components/Profile";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
} from "firebase/firestore";
import { setUserData, setUserLoading, setUserError } from "../redux/userSlice";
import { setChats, setChatsLoading, setChatsError } from "../redux/chatSlice";
import { auth, db } from "../firebase/firebase";
import { Outlet } from "react-router-dom";

const MainPage = () => {
  const dispatch = useDispatch();
  
  // Получение текущей темы из Redux
  const theme = useSelector((state) => state.theme.theme); 

  const [leftPanel, setLeftPanel] = useState("chats");

  const { userData, loading: userLoading, error: userError } = useSelector((state) => state.user);
  const { chats, loading: chatsLoading, error: chatsError } = useSelector((state) => state.chats);

  useEffect(() => {
    dispatch(setUserLoading(true));

    let unsubscribeChats = null;
    let unsubscribeUser = null;

    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          dispatch(
            setUserData({ id: userDocSnap.id, ...userDocSnap.data() })
          );
        } else {
          console.log("No such document!");
        }

        const chatsQuery = query(
          collection(db, "chats"),
          where("users", "array-contains", user.uid),
          orderBy("lastMessageTimestamp", "desc"),
          limit(10)
        );

        unsubscribeChats = onSnapshot(chatsQuery, (querySnapshot) => {
          const chatsData = [];
          querySnapshot.forEach((doc) => {
            chatsData.push({ id: doc.id, ...doc.data() });
          });
          dispatch(setChats(chatsData));
        });

        unsubscribeUser = onSnapshot(userDocRef, (userDocSnap) => {
          if (userDocSnap.exists()) {
            dispatch(
              setUserData({ id: userDocSnap.id, ...userDocSnap.data() })
            );
          }
        });
      } catch (error) {
        console.error("Error fetching user data or chats: ", error);
        dispatch(setUserError("Failed to fetch user data"));
        dispatch(setChatsError("Failed to fetch chats"));
      } finally {
        dispatch(setUserLoading(false));
        dispatch(setChatsLoading(false));
      }
    };

    fetchUserData();

    return () => {
      if (unsubscribeChats) unsubscribeChats();
      if (unsubscribeUser) unsubscribeUser();
    };
  }, [dispatch]);

  // Определяем URL фонового изображения на основе текущей темы
  const backgroundImageUrl =
    theme === "light"
      ? "/Images/background_light.png"
      : "/Images/background_dark.png";

  if (userLoading || chatsLoading) {
    return (
      <div
        style={{
          backgroundImage: `url('${backgroundImageUrl}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          overflow: "hidden",
        }}
      >
        <Container fluid className="vh-100 d-flex flex-column">
          <div className="d-flex justify-content-center align-items-center vh-100">
            <Spinner animation="border" variant="primary" />
          </div>
        </Container>
      </div>
    );
  }

  if (userError || chatsError) {
    return (
      <div
        style={{
          backgroundImage: `url('${backgroundImageUrl}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          overflow: "hidden",
        }}
      >
        <Container fluid className="vh-100 d-flex flex-column">
          <Alert variant="danger">
            Error: {userError || chatsError}
          </Alert>
        </Container>
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundImage: `url('${backgroundImageUrl}')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        overflow: "hidden",
      }}
    >
      <Container fluid className="vh-100 d-flex flex-column" style={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}>
        <Row className="flex-shrink-0">
          <Col>
            <Header handleGoProfile={() => setLeftPanel("profile")} />
          </Col>
        </Row>

        <Row className="flex-grow-1 overflow-hidden p-4">
          <Col xs={4} className="h-100 overflow-auto">
            {leftPanel === "chats" ? (
              <ChatItemsList handleGoFindUse={() => setLeftPanel("search")} />
            ) : leftPanel === "profile" ? (
              <Profile handleGoChatList={() => setLeftPanel("chats")} />
            ) : leftPanel === "search" ? (
              <UserItemsList handleGoChatList={() => setLeftPanel("chats")} />
            ) : null}
          </Col>
          <Col xs={8} className="h-100 overflow-auto">
            <Outlet />
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default MainPage;
