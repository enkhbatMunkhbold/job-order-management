import { useContext } from "react";
import UserContext from "../context/UserContext";
import { Link, useNavigate } from "react-router-dom";
import { useFormik } from "formik"
import * as Yup from "yup"
import "../styling/authent.css";

const Register = () => {
  const navigate = useNavigate()
  const { setUser } = useContext(UserContext)

  const formik = useFormik({
    initialValues: {
      username: "",
      email: "",
      password: "",
      passwordConfirmation: ""
    },
    validationSchema: Yup.object({
      username: Yup.string()
        .required("Username is required")
        .min(3, "Username must be at least 3 characters"),
      email: Yup.string()
        .email("Invalid email format")
        .required("Email is required"),
      password: Yup.string()
        .required("Password is required")
        .min(8, "Password must be at least 8 characters"),
      passwordConfirmation: Yup.string()
        .required("Password confirmation is required")
        .oneOf([Yup.ref('password')], "Passwords must match")
    }),
    onSubmit: (values) => {
      console.log("Submitting registration with values:", { username: values.username, email: values.email });
      
      fetch("/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
          username: values.username,
          email: values.email,
          password: values.password
        })
      })
      .then(async res => {
        console.log("Registration response status:", res.status);
        console.log("Registration response headers:", res.headers);
        
        if (res.ok) {
          return res.json();
        } else {
          const errorData = await res.json();
          console.error("Server error response:", errorData);
          throw new Error(errorData.error || `Registration failed with status ${res.status}`);
        }
      })
      .then(user => {
        setUser(user);
        navigate("/profile");
      })
      .catch(error => {
        console.error("Registration error:", error);
        console.error("Error details:", {
          message: error.message,
          stack: error.stack
        });
        alert(`Registration failed: ${error.message}`);
      });
    }
  })

  return (
    <div className="auth-container">
      <form onSubmit={formik.handleSubmit} className="auth-form">
        <h2>Register</h2>
        <div className="form-group">
          <input
            type="text"
            name="username"
            placeholder="Username"
            autoComplete="off"
            value={formik.values.username}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {formik.touched.username && formik.errors.username && (
            <p style={{ color: "red" }}>{formik.errors.username}</p>
          )}
        </div>
        <div className="form-group">
          <input
            type="email"
            name="email"
            placeholder="Email"
            autoComplete="off"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {formik.touched.email && formik.errors.email && (
            <p style={{ color: "red" }}>{formik.errors.email}</p>
          )}
        </div>
        <div className="form-group">
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            autoComplete="new-password"
          />
          {formik.touched.password && formik.errors.password && (
            <p style={{ color: "red" }}>{formik.errors.password}</p>
          )}
        </div>
        <div className="form-group">
          <input
            type="password"
            name="passwordConfirmation"
            placeholder="Password Confirmation"
            value={formik.values.passwordConfirmation}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            autoComplete="new-password"
          />
          {formik.touched.passwordConfirmation && formik.errors.passwordConfirmation && (
            <p style={{ color: "red" }}>{formik.errors.passwordConfirmation}</p>
          )}
        </div>
        <button type="submit">Register</button>
        <div className="auth-link">
          Already have an account? <Link to="/login">Login</Link>
        </div>
      </form>
    </div>
  );
};

export default Register; 