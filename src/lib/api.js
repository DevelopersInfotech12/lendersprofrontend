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

// ── CRM module (clients/projects/leads/etc.) ──
export const clientsApi = {
  getAll: (params = {}) => api.get('/clients', { params }),
  getById: (id) => api.get(`/clients/${id}`),
  getProfile: (id) => api.get(`/clients/${id}/profile`),
  create: (data) => api.post('/clients', data),
  update: (id, data) => api.put(`/clients/${id}`, data),
  delete: (id) => api.delete(`/clients/${id}`),
  toggleStatus: (id) => api.patch(`/clients/${id}/toggle-status`),
};

export const projectsApi = {
  getAll: (params = {}) => api.get('/projects', { params }),
  getById: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
  getRecurringDue: () => api.get('/projects/recurring/due'),
  getRecurringByClient: () => api.get('/projects/recurring/clients'),
  getClientRecurring: () => api.get('/projects/recurring/clients'),
};

export const leadsApi = {
  getAll: (params = {}) => api.get('/leads', { params }),
  getById: (id) => api.get(`/leads/${id}`),
  create: (data) => api.post('/leads', data),
  update: (id, data) => api.put(`/leads/${id}`, data),
  delete: (id) => api.delete(`/leads/${id}`),
  getPipeline: () => api.get('/leads/pipeline'),
  convert: (id, data) => api.post(`/leads/${id}/convert`, data),
  addActivity: (id, data) => api.post(`/leads/${id}/activity`, data),
};

export const notesApi = {
  getAll: (params = {}) => api.get('/notes', { params }),
  getById: (id) => api.get(`/notes/${id}`),
  getByProject: (projectId) => api.get(`/notes/project/${projectId}`),
  create: (data) => api.post('/notes', data),
  update: (id, data) => api.put(`/notes/${id}`, data),
  delete: (id) => api.delete(`/notes/${id}`),
};

export const paymentsApi = {
  getAll: (params = {}) => api.get('/payments', { params }),
  getById: (id) => api.get(`/payments/${id}`),
  create: (data) => api.post('/payments', data),
  update: (id, data) => api.put(`/payments/${id}`, data),
  delete: (id) => api.delete(`/payments/${id}`),
};

export const milestonesApi = {
  getByProject: (projectId) => api.get(`/milestones/project/${projectId}`),
  create: (data) => api.post('/milestones', data),
  update: (id, data) => api.put(`/milestones/${id}`, data),
  delete: (id) => api.delete(`/milestones/${id}`),
  addPayment: (id, data) => api.post(`/milestones/${id}/payment`, data),
};

export const invoicesApi = {
  getByProject: (projectId) => api.get(`/invoices/project/${projectId}`),
  upload: (formData) => api.post('/invoices/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => api.delete(`/invoices/${id}`),
};

export const tasksApi = {
  getAll: (params = {}) => api.get('/tasks', { params }),
  getByProject: (projectId) => api.get(`/tasks/project/${projectId}`),
  create: (data) => api.post('/tasks', data),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  delete: (id) => api.delete(`/tasks/${id}`),
  getOverdue: () => api.get('/tasks/overdue'),
};

export const meetingsApi = {
  getAll: (params = {}) => api.get('/meetings', { params }),
  getById: (id) => api.get(`/meetings/${id}`),
  getToday: () => api.get('/meetings/today'),
  getUpcoming: () => api.get('/meetings/upcoming'),
  create: (data) => api.post('/meetings', data),
  update: (id, data) => api.put(`/meetings/${id}`, data),
  delete: (id) => api.delete(`/meetings/${id}`),
  updateStatus: (id, status) => api.patch(`/meetings/${id}/status`, { status }),
};

export const employeesApi = {
  getAll: (params = {}) => api.get('/employees', { params }),
  getById: (id) => api.get(`/employees/${id}`),
  create: (data) => api.post('/employees', data),
  update: (id, data) => api.put(`/employees/${id}`, data),
  delete: (id) => api.delete(`/employees/${id}`),
  toggleStatus: (id) => api.patch(`/employees/${id}/toggle`),
};

export const payrollApi = {
  getAll:       (params = {}) => api.get('/payroll', { params }),
  getStats:     (year)        => api.get('/payroll/stats', { params: { year } }),
  getById:      (id)          => api.get(`/payroll/${id}`),
  create:       (data)        => api.post('/payroll', data),
  bulkGenerate: (data)        => api.post('/payroll/bulk', data),
  update:       (id, data)    => api.put(`/payroll/${id}`, data),
  markAsPaid:   (id, data)    => api.patch(`/payroll/${id}/pay`, data),
  delete:       (id)          => api.delete(`/payroll/${id}`),
};

export const activityApi = {
  getByProject: (projectId, params = {}) => api.get(`/activity/project/${projectId}`, { params }),
  getByClient:  (clientId,  params = {}) => api.get(`/activity/client/${clientId}`,   { params }),
  getByPage:    (pageName,  params = {}) => api.get(`/activity/page/${pageName}`,      { params }),
  getAll:       (params = {})            => api.get('/activity/all',                   { params }),
};
