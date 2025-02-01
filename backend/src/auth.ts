import { NextFunction, request, Request, Response } from "express";
import { GoogleAuthProvider } from "firebase/auth";
import admin from "firebase-admin";
import db from "./db"
import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";
const provider = new GoogleAuthProvider();

export interface AuthenticatedRequest extends Request {
    user?: DecodedIdToken; 
  }

export const authMiddleWare = async (req: Request, res: Response, next: NextFunction) => {

    console.log("From middleware")
    
    const idToken = req.headers.authorization?.split("Bearer ")[1] || req.body.idToken;

    if (!idToken) {
        res.status(401).json({ success: false, error: "unauthrozied, no token provided" });
    }

    try {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}');

        if (!serviceAccount) {
            throw new Error("cant fetch FIREBASE_SERVICE_ACCOUNT from env or its not defined");
        }
        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });
        }
    } catch (error) {
        console.error("Couldnt parse serviceAccount json", error)
    }




    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        console.log("Middle ware: token verified succesfully")
        console.log("decoded token -----", decodedToken)
        req.user = decodedToken;
        next();
        return;
    } catch (error) {
        console.error("errror verfying token:", error);
        res.status(401).json({ success: false, error: "invalid or expired token" });
        return;
    }
};
