import Router from "express"
import { db } from "../db";

const router = Router();

router.post("/message", async (req, res) => {
    try {
        await db.message.create({
            data: {
                content: req.body.content,
                chatId: req.body.chatId
            }
        })
        res.json({
            messsage: "created"
        })
    } catch (error) {
        console.log("Internal server error")
        res.status(400).json({
            message: "Internal Server Error"
        })
    }
})

router.post("/create", async (req, res) => {
    try {
        const { title, userId } = req.body;

        const newChat = await db.chat.create({
            data: {
                title,
                userId,
                createdAt: new Date()
            }
        })
        
        res.json({
            id: newChat.id
        })
    } catch (error) {
        console.log("Internal server error")
        res.status(400).json({
            message: "Internal Server Error"
        })
    }
})

router.get("/", async (req, res) => {
    try {
        const userId = req.body.userId;
        const chats = await db.chat.findMany({
            where: {
                userId
            }
        })
        res.json(chats)
    } catch (error) {
        console.log("Internal server error")
        res.status(400).json({
            message: "Internal Server Error"
        })
    }
})

export const chatRouter = router;