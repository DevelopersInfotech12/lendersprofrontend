import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== "undefined") {
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;

// Auth
export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login:    (data) => api.post("/auth/login", data),
  logout:   ()     => api.post("/auth/logout"),
  me:       ()     => api.get("/auth/me"),
  updateProfile:   (data) => api.put("/auth/profile", data),
  changePassword:  (data) => api.put("/auth/change-password", data),
};
export const authApi = authAPI; // alias for lowercase imports

// Borrowers
export const borrowersAPI = {
  getAll:     (params) => api.get("/borrowers", { params }),
  getOne:     (id)     => api.get(`/borrowers/${id}`),
  getProfile: (id)     => api.get(`/borrowers/${id}/profile`),
  create:     (data)   => api.post("/borrowers", data),
  update:     (id, d)  => api.put(`/borrowers/${id}`, d),
  delete:     (id)     => api.delete(`/borrowers/${id}`),
};

// Loans
export const loansAPI = {
  getAll:       (params) => api.get("/loans", { params }),
  getOne:       (id)     => api.get(`/loans/${id}`),
  getRecurring: (params) => api.get("/loans/recurring/due", { params }),
  create:       (data)   => api.post("/loans", data),
  update:       (id, d)  => api.put(`/loans/${id}`, d),
  close:        (id)     => api.patch(`/loans/${id}/close`),
  delete:       (id)     => api.delete(`/loans/${id}`),
};

// Repayments
export const repaymentsAPI = {
  getAll:  (params) => api.get("/repayments", { params }),
  create:  (data)   => api.post("/repayments", data),
  delete:  (id)     => api.delete(`/repayments/${id}`),
};

// Dashboard
export const dashboardAPI = {
  get: () => api.get("/dashboard"),
};

// Collaterals (asset deposits)
export const collateralsAPI = {
  getAll:  (params) => api.get("/collaterals", { params }),
  getOne:  (id)     => api.get(`/collaterals/${id}`),
  create:  (data)   => api.post("/collaterals", data),
  update:  (id, d)  => api.put(`/collaterals/${id}`, d),
  return:  (id)     => api.patch(`/collaterals/${id}/return`),
  delete:  (id)     => api.delete(`/collaterals/${id}`),
};

// Guarantors
export const guarantorsAPI = {
  getAll:  (params) => api.get("/guarantors", { params }),
  getOne:  (id)     => api.get(`/guarantors/${id}`),
  create:  (data)   => api.post("/guarantors", data),
  update:  (id, d)  => api.put(`/guarantors/${id}`, d),
  delete:  (id)     => api.delete(`/guarantors/${id}`),
};

// Reminders (follow-ups)
export const remindersAPI = {
  getAll:    (params) => api.get("/reminders", { params }),
  create:    (data)   => api.post("/reminders", data),
  update:    (id, d)  => api.put(`/reminders/${id}`, d),
  complete:  (id)     => api.patch(`/reminders/${id}/done`),
  delete:    (id)     => api.delete(`/reminders/${id}`),
};

