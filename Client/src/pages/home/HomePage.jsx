// HomePage.js

import { useEffect, useRef, useState } from "react";
import "./HomePage.css";
import axios from "axios";
import { io } from "socket.io-client";

const HomePage = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);

  const socket = useRef();

  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  const handleChange = (event) => {
    setNewMessage(event.target.value);
  };

  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        const response = await axios.post(
          "http://localhost:8080/api/chat/getAllUsers"
        );
        if (response.data.allUsers) {
          const filteredUsers = response.data.allUsers.filter(
            (user) => user._id !== userInfo.id
          );
          setUsers(filteredUsers);
        } else {
          setUsers(["No User Found"]);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchAllUsers();
  }, [userInfo.id]);

  const handleChatClick = async (userId) => {
    try {
      const senderId = userInfo.id;
      const receiverId = userId;
      const response = await axios.post(
        "http://localhost:8080/api/chat/generateChat",
        {
          senderId,
          receiverId,
        }
      );
      if (response.data) {
        console.log(response.data);
      }
      const user = users.find((u) => u._id === userId);
      setSelectedUser(user);
      const chat = chats.find((item) => item.chatPersons.includes(user._id));
      if (chat) {
        setCurrentChat(chat);
      } else {
        console.log("Chat not found");
      }
      setMessages([]);
      setNewMessage("");
    } catch (error) {
      console.error("Error creating chat:", error);
    }
  };

  useEffect(() => {
    const getChats = async () => {
      try {
        const userId = userInfo?.id;
        if (userId) {
          const { data } = await axios.get(
            `http://localhost:8080/api/chat/${userId}`
          );
          setChats(data);
        }
      } catch (error) {
        console.error("Error fetching chats:", error);
      }
    };
    getChats();
  }, [userInfo.id]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8080/api/message/${currentChat._id}`
        );
        setMessages(response.data);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    if (currentChat !== null) fetchMessages();
  }, [currentChat]);

  useEffect(() => {
    socket.current = io("http://localhost:8080");

    return () => {
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();

    const message = {
      senderId: userInfo?.id,
      text: newMessage,
      chatId: currentChat?._id,
    };

    const receiverId = currentChat?.chatPersons.find(
      (id) => id !== userInfo?.id
    );

    try {
      // Send message to database
      const { data } = await axios.post(
        "http://localhost:8080/api/message/addMessage",
        message
      );
      setMessages([...messages, data]);

      // Send message to socket server
      socket.current.emit("send-message", { ...message, receiverId });

      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  useEffect(() => {
    socket.current.on("receive-message", (data) => {
      setMessages([...messages, data]);
    });
  }, [messages]);

  return (
    <div className="container">
      <div className="user-list">
        {users.map((user) => (
          <div key={user._id} className="user-item">
            <span>{user.userName}</span>
            <button onClick={() => handleChatClick(user._id)}>Chat</button>
          </div>
        ))}
      </div>
      <div className="chat-box">
        <div className="chat-header">
          {selectedUser
            ? `Chat with ${selectedUser.userName}`
            : "Select a user to chat"}
        </div>
        <div className="chat-messages">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`chat-message ${
                msg.senderId === userInfo.id ? "my-message" : "their-message"
              }`}
            >
              {msg.text}
            </div>
          ))}
        </div>
        {selectedUser && (
          <div className="chat-input">
            <input
              type="text"
              value={newMessage}
              onChange={handleChange}
              placeholder="Type a message"
            />
            <button onClick={handleSend}>Send</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
