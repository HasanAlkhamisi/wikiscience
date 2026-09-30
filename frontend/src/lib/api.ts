import axios from "axios"

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
})
// من دون axios.create
// يجب تكرار رابط الخادم الكامل ورأس التوثيق في كل استدعاء واحد في كل ملف، في كل مكون

api.interceptors.request.use((config) => {
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith("auth_token="))
  const token = match?.split("=")[1]
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
export default api

//مكتبة Axios
//للتواصل بين الواجهة وال
//API

//لارسال طلبات
//HTTP (GET,POST, ..... )
// من المتصفح أو
//Node.js
