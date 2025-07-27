import axios from "axios";

const API = axios.create({
  baseURL: "https://balanceview-backend.onrender.com/api",
});

export default API;
