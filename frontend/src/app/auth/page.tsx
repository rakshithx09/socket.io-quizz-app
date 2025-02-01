"use client"
import { signInWithPopup, signOut } from "firebase/auth";
import { auth, provider } from "../../utils/firebase.config";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function SignIn() {
    const [token, setToken] = useState("");
    const router = useRouter()
    const handleSignIn = async () => {

        /* firebase sign in function */
        signInWithPopup(auth, provider).then(async (data) => {
            const token = await data.user.getIdToken()

            /* store access token and email in browser local storage */
            localStorage.setItem("email", data.user.uid as string);
            localStorage.setItem("token", token );
            setToken(token)
            router.push('/')
        })

    }
    const handleSignOut = async () => {
        /* firebase sign out function */
        signOut(auth).then(() => {

            /* rempve access token from browser local storage  */
            localStorage.removeItem("token")
            setToken("")
            console.log("Signed out succesfully")
        }).catch((error) => {
            console.error(error)
        });

    }
    useEffect(() => {
        const tokenFromLocalStorage = localStorage.getItem("token");
        /* console.log("token" , tokenFromLocalStorage) */
        if (tokenFromLocalStorage) {
            setToken(tokenFromLocalStorage)
        }
    }, [token])
    /* console.log("state token" ,token) */
    return (
        <div>
            {
                token.length!=0 ?
                    <button onClick={handleSignOut}>Sign out </button> : <button onClick={handleSignIn}>Sign in with google</button>
            }

        </div>
    )
}