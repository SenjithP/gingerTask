import React, { useEffect, useRef, useState } from "react";
import "./HomePage.css";
import axios from "axios";
import { io } from "socket.io-client";

const HomePage = () => {
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const [chats, setChats] = useState([]);
  const [users, setUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [recievedMessage,setRecievedMessage] = useState()
  const [messages,setMessages] = useState()



  const socket = useRef();

  useEffect(() => {
    const getAllAvailableUsers = async () => {
      try {
        const responses = await axios.post(
          "http://localhost:8080/api/chat/getAllUsers"
        );
        setUsers(responses.data);
      } catch (error) {
        console.log(error);
      }
    };
    getAllAvailableUsers();
  }, []);

  useEffect(() => {
    const getAllChats = async () => {
      try {
        const userId = userInfo?.id;

        if (userId) {
          const response = await axios.get(
            `http://localhost:8080/api/chat/${userId}`
          );
          setChats(response.data, "chatData");
        }
      } catch (error) {
        console.log(error);
      }
    };

    getAllChats();
  }, [userInfo?.id]);

  useEffect(() => {
    socket.current = io("ws://localhost:8080");

    const userId = userInfo?.id;

    if (userId) {
      socket.current.emit("user-connected", userId);
    }

    socket.current.on("update-user-list", (users) => {
      setOnlineUsers(users);
    });
  }, [userInfo?.id]);

  useEffect(() => {
    if (sendMessage !== null) {
      socket.current.emit("", sendMessage);
    }
  }, [sendMessage]);

  useEffect(() => {
    socket.current.on("", (data) => {
      setRecievedMessage(data);
    });
  }, []);

  //getmessage (show)
  useEffect(() => {
    const fetchAllMessages = async () => {
      try {
        const response = await axios.get(chats._id);
        setMessages(response.data);
      } catch (error) {
        console.log(error);
      }
    };

    if (chats !== null) {
      fetchAllMessages();
    }
  }, [chats]);

  //addmessage (send)

  return (
    <div className="chat-app">
      <div className="user-list">
        {users.map((user) => (
          <div className="user" key={user.id}>
            {user.userName}
          </div>
        ))}
      </div>
      <div className="chat-area">
        <input
          value={newMessage}
          onChange={handleChange}
          type="text"
          placeholder="type your messages here"
        />
        <button  onClick={handleSend} >send</button>
      </div>
    </div>
  );
};

export default HomePage;
