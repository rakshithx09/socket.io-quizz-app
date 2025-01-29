import { NextFunction, Request, Response } from "express";
import { GoogleAuthProvider } from "firebase/auth";
import admin from "firebase-admin";
const provider = new GoogleAuthProvider();

export const authMiddleWare = async (req: Request, res: Response, next: NextFunction) => {

    const idToken = req.headers.authorization?.split("Bearer ")[1] || req.body.idToken;

    if (!idToken) {
        res.status(401).json({ success: false, error: "unauthrozied, no token provided" });
    }

    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}');
    console.log("service acc", serviceAccount)
    if (!serviceAccount) {
        throw new Error("cant fetch FIREBASE_SERVICE_ACCOUNT from env or its not defined");
    }
    console.log("before init")
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
    console.log("after init")
    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        console.log("Middle ware: token verified succesfully")
        req.user = decodedToken;
        next();
        return;
    } catch (error) {
        console.error("errror verfying token:", error);
        res.status(401).json({ success: false, error: "invalid or expired token" });
        return;
    }
};
