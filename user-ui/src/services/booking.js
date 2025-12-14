import axios from "./";

export const addBooking = (data) => {
  return axios.post("/api/bookings", data);
};
