require("dotenv").config()

import { Router } from "express";
import { LoginSchema, SignUpSchema } from "../zodTypes";
import { db } from "../db";
import bcrypt from "bcrypt"
import jwt, { JwtPayload } from 'jsonwebtoken'  

export interface ExtendedRequest extends Request {
    id: string
}

const JWT_SECRET = process.env.JWT_SECRET as string || "SUPER_SECRET"

const router = Router();

router.post("/signup", async (req, res) => {
    try {
        const parsedResponse =  SignUpSchema.safeParse(req.body)

        if (!parsedResponse.success) {
            res.status(422).json({
                message: "Invalid inputs"
            })
            return;
        }

        const { email, password, name } = parsedResponse.data;

        const user = await db.user.findFirst({
            where: {
                email
            }
        })

        if (user) {
            res.status(403).json({
                message: "User already exists"
            })
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 5);

        await db.user.create({
            data: {
                email,
                password: hashedPassword,
                name
            }
        })

        res.status(201).json({
            message: "User created successfully"
        })
    } catch (error) {
        res.status(400).json({
            message: "Internal Server Error"
        })

        return;
    }
})

router.post("/signin", async (req, res) => {  
    try {
        const parsedResponse = LoginSchema.safeParse(req.body)

        if (!parsedResponse.success) {  
            res.status(422).json({
                message: "Incorrect inputs"
            })

            return;
        }

        const user = await db.user.findUnique({
            where: {
                email: parsedResponse.data.email
            }
        })

        if (!user) {
            res.status(401).json({
                message: "User not found"
            })
            return;
        }

        if (!bcrypt.compare(parsedResponse.data.password, user.password)) { 
            res.status(401).json({
                message: "Incorrect password"
            })
            return;
        }

        const token = jwt.sign({ userId: user.id }, JWT_SECRET)

        res.json({
            message: "Login Successful",
            token
        })

    } catch (error) {
        res.status(400).json({
            message: "Internal Server Error"
        })
    }
})

router.post("/authenticate", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({
          message: "You are not logged in",
          LoggedIn: false
        });

        return;
      }
  
      const token = authHeader.split(" ")[1];
      if (!token) {
        res.status(401).json({
          message: "You are not logged in",
          LoggedIn: false
        });
        return;
      }
  
      try {
        const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
        //@ts-ignore
        req.id = payload.userId; 
        res.status(200).json({
          message: "You are logged in",
          LoggedIn: true
        });
        return;
      } catch (error) {
        console.log("JWT verification failed:", error);
        res.status(401).json({
          message: "You are not logged in",
          LoggedIn: false
        });
        return;
      }
    } catch (error) {
      console.error("Internal server error:", error);
      res.status(500).json({
        message: "Internal Server Error"
      });
      return;
    }
  });
  

export const userRouter = router;
