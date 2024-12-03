import React, { useEffect, useState } from "react";
import { Container } from "react-bootstrap";
import Registration from "../components/Registration";

// Страница регистрации, для стилизации используется анимированная картинка,
// которая смещается в зависимости от положения мышки юзера
const RegistrationPage = () => {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [requestId, setRequestId] = useState(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (requestId) return;

      const newRequestId = requestAnimationFrame(() => {
        const x = (e.clientX / window.innerWidth) * 100;
        const y = (e.clientY / window.innerHeight) * 100;
        setOffset({
          x: (x - 50) * 0.05,
          y: (y - 50) * 0.05,
        });
        setRequestId(null);
      });

      setRequestId(newRequestId);
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (requestId) {
        cancelAnimationFrame(requestId);
      }
    };
  }, [requestId]);

  // Инлайн стили для внешнего контейнера
  const pageStyle = {
    position: "relative",
    width: "100vw",
    height: "100vh",
    overflow: "hidden",
  };

  // Инлайн стили для фонового изображения
  const backgroundStyle = {
    position: "fixed",
    top: "-10%",
    left: "-10%",
    width: "120%",
    height: "120%",
    backgroundImage: "url('/Images/background.png')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    transition: "transform 0.1s ease-out",
    transform: `translate(${offset.x}px, ${offset.y}px)`,
    zIndex: -1,
  };

  // Инлайн стили для контейнера с регистрацией
  const containerStyle = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
  };

  return (
    <div style={pageStyle}>
      <div style={backgroundStyle}></div>
      <Container style={containerStyle}>
        <Registration />
      </Container>
    </div>
  );
};

export default RegistrationPage;
