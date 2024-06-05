import express from "express";
import {
  userRegistration,
  userLogin,
} from "../Controllers/AuthenticationController.js";

const authenticationRouter = express.Router();

authenticationRouter.post("/userRegister", userRegistration);
authenticationRouter.post("/userLogin", userLogin);

export default authenticationRouter;
