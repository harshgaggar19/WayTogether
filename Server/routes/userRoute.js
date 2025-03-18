import { Router } from "express";
import { signup, login } from "../controllers/userController.js";

const userRouter = Router();

userRouter.post("/signup", signup);
// userRouter.post("/login", login);
export default userRouter;
