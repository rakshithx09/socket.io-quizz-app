"use client"

import { Dispatch, SetStateAction, useEffect, useState } from "react";

const fetchData = async (setResponse:Dispatch<SetStateAction<string>>) => {
  const response = await fetch("http://localhost:3001/", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    }
  });
  const data = await response.json();
  setResponse(JSON.stringify(data));
}

export default function Home() {
  const [response, setResponse] = useState("");

  useEffect(() => { 
     fetchData(setResponse); 
   
  }, [])
  
  return (
    <div className="">
      hello {response}
    </div>
  );
}
