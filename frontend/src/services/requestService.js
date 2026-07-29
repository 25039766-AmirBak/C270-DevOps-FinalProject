import axios from "axios";

const API = `${process.env.REACT_APP_API_URL}/api/requests`;

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

const requestService = {
  getAllRequests,
  updateRequestStatus,
};

export default requestService;