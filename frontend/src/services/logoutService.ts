import axios from "axios";
import Cookies from "js-cookie";

export async function logoutService() {
  try {
    await axios.post("/api/auth/logout"); // Backend logout endpoint
    Cookies.remove("accessToken");
    Cookies.remove("refreshToken");
    window.location.href = "/login"; // Redirect to login
  } 
  catch (error) {
    console.error("Logout failed", error);
  }
}