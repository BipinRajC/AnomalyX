import express from "express"
import cors from "cors"
import { userRouter } from "./router/userRouter";
import { chatRouter } from "./router/chatRouter";


const app = express()
app.use(express.json());
app.use(cors());

const router = express.Router();

const PORT = 9000;

app.use("/api/v1/user", userRouter);
app.use("/api/v1/chat", chatRouter);

app.listen(PORT, () => {
    console.log(`server running at port ${PORT}`);
})