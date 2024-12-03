import { signOut } from "firebase/auth";
import { Button, Container, Form, Nav, Navbar } from "react-bootstrap";
import { auth } from "../firebase/firebase";
import { useDispatch, useSelector } from "react-redux";
import { toggleTheme } from "../redux/themeSlice";
import classNames from "classnames";

// компонент хедера с пропсом для открытия меню профиля
const Header = ({ handleGoProfile }) => {
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.theme.theme); // Получаем текущую тему

  const handleExit = async () => {
    try {
      await signOut(auth); // Выполняем выход из аккаунта
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const handleThemeSwitch = () => {
    dispatch(toggleTheme()); // Переключаем тему
  };

  return (
    <Navbar bg="transparent" expand="lg" className="px-3">
      <Container fluid>
        <Navbar.Brand
          href="#home"
          className={classNames("d-flex align-items-center", {
            "text-dark": theme === "light", // Темный текст для светлой темы
            "text-light": theme === "dark", // Светлый текст для темной темы
          })}
        >
          <i
            className="bi bi-rocket-takeoff"
            style={{ fontSize: "1.5rem", marginRight: "0.5rem" }}
          ></i>
          ChatApp
        </Navbar.Brand>

        <Nav className="ms-auto align-items-center">
          <Form.Check
            type="switch"
            id="theme-switch"
            label="Themes"
            className={classNames("me-4", {
              "text-dark": theme === "light",
              "text-light": theme === "dark",
            })}
            checked={theme === "dark"} // Устанавливаем состояние переключателя
            onChange={handleThemeSwitch} // Обработчик переключения
          />
          <Nav.Link
            as={Button}
            onClick={handleGoProfile}
            className={classNames({
              "text-dark": theme === "light",
              "text-light": theme === "dark",
            })}
          >
            Profile
          </Nav.Link>
          <Nav.Link
            href="#pricing"
            onClick={handleExit}
            className={classNames({
              "text-dark": theme === "light",
              "text-light": theme === "dark",
            })}
          >
            Exit
          </Nav.Link>
        </Nav>
      </Container>
    </Navbar>
  );
};

export default Header;
