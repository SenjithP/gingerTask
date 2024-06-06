import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "./LoginPage.css";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    userEmail: "",
    userPassword: "",
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:8080/api/users/userLogin",
        formData
      );
      localStorage.setItem("userInfo", JSON.stringify(response.data));
      toast.success(response.data.message);
      navigate("/home");
    } catch (error) {
      if (error.response) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Something went wrong");
      }
    }
  };

  return (
    <>
      <div className="login-card">
        <div className="login-rightside">
          <form onSubmit={submitHandler}>
            <input
              type="email"
              name="userEmail"
              placeholder="Your Email"
              value={formData.userEmail}
              onChange={handleInputChange}
            />
            <input
              type="password"
              name="userPassword"
              placeholder="Your Password"
              value={formData.userPassword}
              onChange={handleInputChange}
            />

            <button className="login-button" type="submit">
              Login
            </button>
          </form>
        </div>
        <p2 onClick={() => navigate("/")}>Go to Register</p2>
      </div>
    </>
  );
};

export default LoginPage;
