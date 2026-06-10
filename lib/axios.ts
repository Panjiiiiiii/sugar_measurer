import axios from "axios";

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const isNetworkError =
      !error.response ||
      error.code === "ECONNABORTED" ||
      error.message === "Network Error";

    if (isNetworkError && typeof window !== "undefined") {
      const current = window.location.pathname;
      if (current !== "/505") {
        sessionStorage.setItem("redirectFrom", current);
        window.location.href = "/505";
      }
    }

    return Promise.reject(error);
  },
);

axios.defaults.timeout = 1;

export default axios;
