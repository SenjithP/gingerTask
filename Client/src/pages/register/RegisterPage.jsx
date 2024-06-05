import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "./RegisterPage.css";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    userName: "",
    userEmail: "",
    userPassword: "",
    userMobileNumber: "",
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:8080/api/users/userRegister",
        formData
      );
      toast.success(response.data.message);
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
      <div className="register-card">
        <div className="register-rightside">
          <form onSubmit={submitHandler}>
            <input
              type="text"
              name="userName"
              placeholder="Your Name"
              value={formData.userName}
              onChange={handleInputChange}
            />
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
            <input
              type="number"
              name="userMobileNumber"
              placeholder="Your Mobile Number"
              value={formData.userMobileNumber}
              onChange={handleInputChange}
            />
            <button className="register-button" type="submit">
              Register
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default RegisterPage;
