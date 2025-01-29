"use client"
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../../utils/firebase.config";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignIn() {
    const [value, setValue] = useState('');
    const router = useRouter()
    const handleClick = async ()=> {
        signInWithPopup(auth, provider).then(async (data) => {
            setValue(data.user.email as string);
            localStorage.setItem("email", data.user.email as string);
            localStorage.setItem("token", await data.user.getIdToken());
            router.push('/')
        })

    }
    return (
        <div>
            <button onClick={handleClick}>Sign in with google</button>
        </div>
    )
}