import { API_URL } from "../page";

export const fetchUser = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error(" token not found in localStorage");
      return null;
    }

    const response = await fetch(`${API_URL}/get-user`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) { 
      console.error("failed to fetch user , status code :", response.status);
      return null;
    }

    const data = await response.json();

    if (data.success) {
      console.log("  user fetched successfully:", data.user);
      return data.user;
    } else {
      console.error("  user fetch failed:", data.message);
      return null;
    }
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
};
