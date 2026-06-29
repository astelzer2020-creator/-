import axios from 'axios'

// Change this to your server IP when running on a real device
const BASE_NODE = __DEV__ ? 'http://10.0.2.2:3001' : 'https://your-api.example.com'
const BASE_PYTHON = __DEV__ ? 'http://10.0.2.2:8001' : 'https://your-api.example.com'

export const nodeApi = axios.create({ baseURL: BASE_NODE, timeout: 15000 })
export const pythonApi = axios.create({ baseURL: BASE_PYTHON, timeout: 15000 })

export const api = {
  projects: {
    list: (params) => nodeApi.get('/projects', { params }),
    get: (id) => nodeApi.get(`/projects/${id}`),
    create: (data) => nodeApi.post('/projects', data),
    update: (id, data) => nodeApi.put(`/projects/${id}`, data),
    delete: (id) => nodeApi.delete(`/projects/${id}`),
  },
  roi: {
    calculate: (data) => pythonApi.post('/roi/calculate', data),
    sensitivity: (data) => pythonApi.post('/roi/sensitivity', data),
    batch: (projects) => pythonApi.post('/roi/batch', { projects }),
  },
  analysis: {
    summary: (projects) => pythonApi.post('/analysis/summary', { projects }),
    rank: (projects) => pythonApi.post('/analysis/rank', { projects }),
  },
  geocode: {
    search: (address, city) => pythonApi.post('/geocode/', { address, city }),
    cities: () => pythonApi.get('/geocode/cities'),
  },
}
