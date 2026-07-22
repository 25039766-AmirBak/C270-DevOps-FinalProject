import axios from "axios";

const API = "http://localhost:5000/api/requests";

const getAllRequests = (token) => {
  return axios.get(API, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

const updateRequestStatus = (id, status, token) => {
  return axios.put(
    `${API}/${id}`,
    { status },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export default {
  getAllRequests,
  updateRequestStatus,
};