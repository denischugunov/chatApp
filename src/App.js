import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import MainPage from "./pages/MainPage";
import RegistrationPage from "./pages/RegistrationPage";
import AuthPage from "./pages/AuthPage";
import Chat from "./components/Chat";
import { Container, Spinner } from "react-bootstrap";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { auth } from "./firebase/firebase";

// настраиваю роуты и проверяю авторизован ли юзер
function App() {
  const [user, setUserState] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUserState(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <Container
        className="d-flex justify-content-center align-items-center"
        style={{ height: "100vh" }}
      >
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Регистрация */}
        <Route path="/reg" element={<RegistrationPage />} />
        {/* Авторизация */}
        <Route path="/login" element={<AuthPage />} />
        {/* Главная страница с вложенными маршрутами */}
        <Route
          path="/"
          element={!!user ? <MainPage /> : <Navigate to="/login" replace />}
        >
          {/* Вложенные маршруты */}
          <Route index element={<Chat />} /> {/* Корневой маршрут */}
          <Route path="chat/:id" element={<Chat />} />{" "}
          {/* Динамический маршрут */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
