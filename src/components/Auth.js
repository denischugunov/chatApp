import { Formik } from "formik";
import * as yup from "yup";
import { Button, Card, Form } from "react-bootstrap";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/firebase";
import { Link, useNavigate } from "react-router-dom";

// окно авторизации, валидируем Yup, работа с формами через Формик
const Auth = () => {
  const navigate = useNavigate();

  // Схема валидации
  const schema = yup.object().shape({
    email: yup
      .string()
      .email("Invalid email address")
      .required("Email is required"),
    password: yup
      .string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
  });

  return (
    <Card style={{ width: "400px" }} className="p-4 shadow">
      <Card.Body>
        <Card.Title className="text-center mb-4">Login</Card.Title>
        <Formik
          validationSchema={schema}
          // по сабмиту используем функцию от Гугла для авторизации
          onSubmit={async (values, { setErrors }) => {
            try {
              await signInWithEmailAndPassword(
                auth,
                values.email,
                values.password
              );
              navigate("/");
            } catch (err) {
              console.error(err);
              setErrors({ email: "Invalid email or password" });
            }
          }}
          initialValues={{
            email: "",
            password: "",
          }}
        >
          {({
            handleSubmit,
            handleChange,
            handleBlur,
            values,
            touched,
            errors,
            isSubmitting,
          }) => (
            <Form noValidate onSubmit={handleSubmit}>
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

              <Button
                variant="primary"
                type="submit"
                className="w-100 mb-3"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Logging in..." : "Log in"}
              </Button>
              <div className="text-center">
                <Form.Text>
                  Don't have an account?{" "}
                  <Link to="/reg" href="#register" className="text-primary">
                    Register
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
};

export default Auth;
