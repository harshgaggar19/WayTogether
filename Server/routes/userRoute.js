import { Router } from "express";
import { createUser,findMatch,getFinalMatch,getMatchedUsers, points } from "../controllers/userController.js";

const userRouter = Router();

// userRouter.post("/signup", signup);
userRouter.post("/find-match", findMatch);
userRouter.get("/get-match", getMatchedUsers);
userRouter.get("/dummy-points", points);
userRouter.post("/create-user", createUser);
userRouter.get("/get-match-final", getFinalMatch);
// userRouter.post("/login", login);
export default userRouter;
