import { doc, setDoc } from "firebase/firestore";
import { Formik } from "formik";
import { Button, Container, Form, Image } from "react-bootstrap";
import * as yup from "yup";
import { db } from "../firebase/firebase";
import { useSelector } from "react-redux";

// Компонент профиля, позволяет поменять в БД имя и аватарку, в пропсе функция для возврата к списку чатов

const avatars = [
  "/Images/Avatar_1.png",
  "/Images/Avatar_2.png",
  "/Images/Avatar_3.png",
];

const Profile = ({ handleGoChatList }) => {
  const userDataFromDb = useSelector((state) => state.user.userData);
  const theme = useSelector((state) => state.theme.theme);

  // Проверка на наличие данных о юзере
  if (!userDataFromDb) {
    return (
      <Container
        className="d-flex justify-content-center align-items-center"
        style={{ height: "100%" }}
      >
        <div className={theme === "light" ? "text-dark" : "text-light"}>
          Loading user data...
        </div>
      </Container>
    );
  }

  // схема валидации имени и выбора аватарки
  const schema = yup.object().shape({
    name: yup
      .string()
      .required("Name is required")
      .min(2, "Name must be at least 2 characters"),
    avatar: yup.string().required("Please select an avatar"),
  });

  return (
    <Container style={{ height: "100%" }} className="d-flex flex-column pb-2">
      {/* Тут в начальное состояние подставляем данные с БД о юзере */}
      <Formik
        validationSchema={schema}
        initialValues={{
          name: userDataFromDb.name || "",
          avatar: userDataFromDb.avatarUrl || avatars[0],
        }}
        // По сабмиту меняем в БД данные
        onSubmit={async (values, { setSubmitting }) => {
          try {
            await setDoc(
              doc(db, "users", userDataFromDb.id),
              {
                name: values.name,
                avatarUrl: values.avatar,
              },
              { merge: true }
            );
            alert("Profile updated successfully!");
          } catch (error) {
            console.error("Error updating profile:", error);
            alert("Failed to update profile.");
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({
          handleSubmit,
          handleChange,
          handleBlur,
          values,
          setFieldValue,
          touched,
          errors,
          initialValues,
          isSubmitting,
        }) => {
          const hasChanges =
            JSON.stringify(values) !== JSON.stringify(initialValues);

          return (
            <Form
              noValidate
              className="d-flex flex-column flex-grow-1"
              onSubmit={handleSubmit}
            >
              <Form.Group className="mb-3" controlId="validationFormik01">
                <Form.Label
                  className={theme === "light" ? "text-dark" : "text-light"}
                >
                  Name
                </Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  placeholder="Enter name"
                  value={values.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  isValid={touched.name && !errors.name}
                  isInvalid={touched.name && !!errors.name}
                  style={{
                    backgroundColor: theme === "light" ? "#ffffff" : "#343a40",
                    color: theme === "light" ? "#000000" : "#ffffff",
                  }}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.name}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label
                  className={theme === "light" ? "text-dark" : "text-light"}
                >
                  Choose an Avatar
                </Form.Label>
                <div className="d-flex justify-content-between">
                  {avatars.map((avatar, index) => (
                    <div key={index} className="text-center">
                      <Form.Check
                        type="radio"
                        id={`avatar-${index}`}
                        name="avatar"
                        value={avatar}
                        onChange={(event) => {
                          setFieldValue("avatar", event.target.value);
                        }}
                        checked={values.avatar === avatar}
                        className="d-none"
                      />
                      <label htmlFor={`avatar-${index}`}>
                        <Image
                          src={avatar}
                          alt={`Avatar ${index + 1}`}
                          roundedCircle
                          className={`img-thumbnail ${
                            values.avatar === avatar ? "border-primary" : ""
                          }`}
                          style={{
                            width: "70px",
                            height: "70px",
                            cursor: "pointer",
                            borderWidth:
                              values.avatar === avatar ? "3px" : "1px",
                            borderColor:
                              values.avatar === avatar
                                ? theme === "light"
                                  ? "#0d6efd"
                                  : "#1f6feb"
                                : "#dee2e6",
                          }}
                        />
                      </label>
                    </div>
                  ))}
                </div>
                {touched.avatar && errors.avatar && (
                  <div className="text-danger mt-2">{errors.avatar}</div>
                )}
              </Form.Group>

              <Button
                type="submit"
                variant={theme === "light" ? "primary" : "dark"}
                className="align-self-end mb-3"
                disabled={!hasChanges || isSubmitting}
              >
                Save
              </Button>
            </Form>
          );
        }}
      </Formik>

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

export default Profile;
