import React from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Card from "react-bootstrap/Card";
import { Formik } from "formik";
import * as yup from "yup";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase/firebase";
import { setDoc, doc } from "firebase/firestore";

// Компонент для авторизации, Yup + Формик используются, по сабмиту отправляем данные методами firebase
// Предустановленные аватары
const avatars = [
  "/Images/Avatar_1.png",
  "/Images/Avatar_2.png",
  "/Images/Avatar_3.png",
];

function RegistrationForm() {
  const navigate = useNavigate();

  // Схема валидации
  const schema = yup.object().shape({
    name: yup.string().required("Name is required"),
    email: yup
      .string()
      .email("Invalid email address")
      .required("Email is required"),
    password: yup
      .string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
    avatar: yup.string().required("Please select an avatar"),
  });

  return (
    <Card style={{ width: "400px" }} className="p-4 shadow">
      <Card.Body>
        <Card.Title className="text-center mb-4">Register</Card.Title>
        <Formik
          validationSchema={schema}
          onSubmit={async (values, { setSubmitting, setErrors }) => {
            try {
              // Регистрируем пользователя
              const userCredential = await createUserWithEmailAndPassword(
                auth,
                values.email,
                values.password
              );
              const user = userCredential.user;

              // Сохраняем данные пользователя в Firestore
              await setDoc(doc(db, "users", user.uid), {
                name: values.name,
                AvatarUrl: values.avatar,
                chats: [],
              });

              navigate("/");
            } catch (err) {
              console.error(err);
              // Проверка ошибки: если ошибка при регистрации из-за существующего email
              if (err.code === "auth/email-already-in-use") {
                setErrors({ email: "This email is already in use." });
              } else {
                setErrors({ email: "Failed to register. Try again later." });
              }
            } finally {
              setSubmitting(false);
            }
          }}
          initialValues={{
            name: "",
            email: "",
            password: "",
            avatar: "",
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
          }) => (
            <Form noValidate onSubmit={handleSubmit}>
              {/* Поле Name */}
              <Form.Group className="mb-3" controlId="validationFormik01">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  placeholder="Enter name"
                  value={values.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  isValid={touched.name && !errors.name}
                  isInvalid={touched.name && !!errors.name}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.name}
                </Form.Control.Feedback>
              </Form.Group>

              {/* Поле Email */}
              <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label>Email address</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  placeholder="Enter email"
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  isValid={touched.email && !errors.email}
                  isInvalid={touched.email && !!errors.email}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.email}
                </Form.Control.Feedback>
              </Form.Group>

              {/* Поле Password */}
              <Form.Group className="mb-3" controlId="formBasicPassword">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Password"
                  name="password"
                  value={values.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  isValid={touched.password && !errors.password}
                  isInvalid={touched.password && !!errors.password}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.password}
                </Form.Control.Feedback>
              </Form.Group>

              {/* Поле Avatar */}
              <Form.Group className="mb-3">
                <Form.Label>Choose an Avatar</Form.Label>
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
                      />
                      <img
                        src={avatar}
                        alt={`Avatar ${index + 1}`}
                        className="img-thumbnail mt-2"
                        style={{
                          width: "70px",
                          height: "70px",
                          objectFit: "cover",
                          cursor: "pointer",
                        }}
                        onClick={() => setFieldValue("avatar", avatar)}
                      />
                    </div>
                  ))}
                </div>
                {touched.avatar && errors.avatar && (
                  <div className="text-danger mt-2">{errors.avatar}</div>
                )}
              </Form.Group>

              <Button
                variant="primary"
                type="submit"
                className="w-100 mb-3"
                disabled={false}
              >
                Register
              </Button>
              <div className="text-center">
                <Form.Text>
                  Already have an account?{" "}
                  <Link to="/login" className="text-primary">
                    Log in
                  </Link>
                  .
                </Form.Text>
              </div>
            </Form>
          )}
        </Formik>
      </Card.Body>
    </Card>
  );
}

export default RegistrationForm;
