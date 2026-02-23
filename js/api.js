/* ===========================
   API SERVICE & DATA MANAGEMENT
   Logica per gestione dati piattaforma
   =========================== */

// Configurazione
const API_BASE_URL = 'https://api.split8.com/v1'; // TODO: Sostituire con URL reale
const API_TIMEOUT = 30000;

// ==========================
// AUTH SERVICE
// ==========================
class AuthService {
  constructor() {
    this.currentUser = null;
    this.token = localStorage.getItem('auth_token');
  }

  async login(email, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (data.success) {
        this.token = data.token;
        this.currentUser = data.user;
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user_type', data.user.userType);
        return { success: true, user: data.user };
      }
      return { success: false, error: data.message };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Errore di connessione' };
    }
  }

  async register(userData) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Register error:', error);
      return { success: false, error: 'Errore di connessione' };
    }
  }

  async logout() {
    this.token = null;
    this.currentUser = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_type');
    window.location.href = '/';
  }

  isAuthenticated() {
    return !!this.token;
  }

  getUserType() {
    return localStorage.getItem('user_type') || 'guest';
  }
}

// ==========================
// PROJECT SERVICE
// ==========================
class ProjectService {
  async getProjects(filters = {}) {
    try {
      const queryString = new URLSearchParams(filters).toString();
      const response = await fetch(`${API_BASE_URL}/projects?${queryString}`, {
        headers: { 'Authorization': `Bearer ${authService.token}` }
      });
      return await response.json();
    } catch (error) {
      console.error('Get projects error:', error);
      return { success: false, error: 'Errore nel caricamento progetti' };
    }
  }

  async createProject(projectData) {
    try {
      const response = await fetch(`${API_BASE_URL}/projects`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authService.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(projectData)
      });
      return await response.json();
    } catch (error) {
      console.error('Create project error:', error);
      return { success: false, error: 'Errore nella creazione progetto' };
    }
  }

  async updateProject(projectId, updates) {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${authService.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });
      return await response.json();
    } catch (error) {
      console.error('Update project error:', error);
      return { success: false, error: 'Errore nell\'aggiornamento progetto' };
    }
  }

  async deleteProject(projectId) {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${authService.token}` }
      });
      return await response.json();
    } catch (error) {
      console.error('Delete project error:', error);
      return { success: false, error: 'Errore nell\'eliminazione progetto' };
    }
  }
}

// ==========================
// REQUEST SERVICE
// ==========================
class RequestService {
  async getRequests(status = 'all') {
    try {
      const response = await fetch(`${API_BASE_URL}/requests?status=${status}`, {
        headers: { 'Authorization': `Bearer ${authService.token}` }
      });
      return await response.json();
    } catch (error) {
      console.error('Get requests error:', error);
      return { success: false, error: 'Errore nel caricamento richieste' };
    }
  }

  async sendQuote(requestId, quoteData) {
    try {
      const response = await fetch(`${API_BASE_URL}/requests/${requestId}/quote`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authService.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(quoteData)
      });
      return await response.json();
    } catch (error) {
      console.error('Send quote error:', error);
      return { success: false, error: 'Errore nell\'invio preventivo' };
    }
  }

  async acceptRequest(requestId) {
    try {
      const response = await fetch(`${API_BASE_URL}/requests/${requestId}/accept`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${authService.token}` }
      });
      return await response.json();
    } catch (error) {
      console.error('Accept request error:', error);
      return { success: false, error: 'Errore nell\'accettazione richiesta' };
    }
  }

  async rejectRequest(requestId, reason) {
    try {
      const response = await fetch(`${API_BASE_URL}/requests/${requestId}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authService.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      });
      return await response.json();
    } catch (error) {
      console.error('Reject request error:', error);
      return { success: false, error: 'Errore nel rifiuto richiesta' };
    }
  }
}

// ==========================
// MESSAGE SERVICE
// ==========================
class MessageService {
  async getConversations() {
    try {
      const response = await fetch(`${API_BASE_URL}/messages/conversations`, {
        headers: { 'Authorization': `Bearer ${authService.token}` }
      });
      return await response.json();
    } catch (error) {
      console.error('Get conversations error:', error);
      return { success: false, error: 'Errore nel caricamento conversazioni' };
    }
  }

  async getMessages(conversationId) {
    try {
      const response = await fetch(`${API_BASE_URL}/messages/conversations/${conversationId}`, {
        headers: { 'Authorization': `Bearer ${authService.token}` }
      });
      return await response.json();
    } catch (error) {
      console.error('Get messages error:', error);
      return { success: false, error: 'Errore nel caricamento messaggi' };
    }
  }

  async sendMessage(conversationId, message) {
    try {
      const response = await fetch(`${API_BASE_URL}/messages/conversations/${conversationId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authService.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message })
      });
      return await response.json();
    } catch (error) {
      console.error('Send message error:', error);
      return { success: false, error: 'Errore nell\'invio messaggio' };
    }
  }
}

// ==========================
// PROFILE SERVICE
// ==========================
class ProfileService {
  async getProfile(userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/profiles/${userId}`);
      return await response.json();
    } catch (error) {
      console.error('Get profile error:', error);
      return { success: false, error: 'Errore nel caricamento profilo' };
    }
  }

  async updateProfile(updates) {
    try {
      const response = await fetch(`${API_BASE_URL}/profiles/me`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${authService.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });
      return await response.json();
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, error: 'Errore nell\'aggiornamento profilo' };
    }
  }

  async uploadPortfolioImage(file) {
    try {
      const formData = new FormData();
      formData.append('image', file);
      const response = await fetch(`${API_BASE_URL}/profiles/me/portfolio`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${authService.token}` },
        body: formData
      });
      return await response.json();
    } catch (error) {
      console.error('Upload image error:', error);
      return { success: false, error: 'Errore nel caricamento immagine' };
    }
  }
}

// ==========================
// SEARCH SERVICE
// ==========================
class SearchService {
  async searchProfessionals(filters) {
    try {
      const queryString = new URLSearchParams(filters).toString();
      const response = await fetch(`${API_BASE_URL}/search/professionals?${queryString}`);
      return await response.json();
    } catch (error) {
      console.error('Search error:', error);
      return { success: false, error: 'Errore nella ricerca' };
    }
  }

  async searchProjects(filters) {
    try {
      const queryString = new URLSearchParams(filters).toString();
      const response = await fetch(`${API_BASE_URL}/search/projects?${queryString}`);
      return await response.json();
    } catch (error) {
      console.error('Search projects error:', error);
      return { success: false, error: 'Errore nella ricerca progetti' };
    }
  }
}

// ==========================
// REVIEW SERVICE
// ==========================
class ReviewService {
  async getReviews(professionalId) {
    try {
      const response = await fetch(`${API_BASE_URL}/reviews/${professionalId}`);
      return await response.json();
    } catch (error) {
      console.error('Get reviews error:', error);
      return { success: false, error: 'Errore nel caricamento valutazioni' };
    }
  }

  async submitReview(projectId, reviewData) {
    try {
      const response = await fetch(`${API_BASE_URL}/reviews`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authService.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ projectId, ...reviewData })
      });
      return await response.json();
    } catch (error) {
      console.error('Submit review error:', error);
      return { success: false, error: 'Errore nell\'invio valutazione' };
    }
  }
}

// ==========================
// ALERT SERVICE
// ==========================
class AlertService {
  async getAlerts() {
    try {
      const response = await fetch(`${API_BASE_URL}/alerts`, {
        headers: { 'Authorization': `Bearer ${authService.token}` }
      });
      return await response.json();
    } catch (error) {
      console.error('Get alerts error:', error);
      return { success: false, error: 'Errore nel caricamento alert' };
    }
  }

  async createAlert(alertData) {
    try {
      const response = await fetch(`${API_BASE_URL}/alerts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authService.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(alertData)
      });
      return await response.json();
    } catch (error) {
      console.error('Create alert error:', error);
      return { success: false, error: 'Errore nella creazione alert' };
    }
  }

  async deleteAlert(alertId) {
    try {
      const response = await fetch(`${API_BASE_URL}/alerts/${alertId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${authService.token}` }
      });
      return await response.json();
    } catch (error) {
      console.error('Delete alert error:', error);
      return { success: false, error: 'Errore nell\'eliminazione alert' };
    }
  }
}

// ==========================
// UTILITY FUNCTIONS
// ==========================
const Utils = {
  formatDate(dateString) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('it-IT', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }).format(date);
  },

  formatCurrency(amount) {
    return new Intl.NumberFormat('it-IT', { 
      style: 'currency', 
      currency: 'EUR' 
    }).format(amount);
  },

  validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  },

  showNotification(message, type = 'info') {
    // TODO: Implementare notifiche toast
    console.log(`[${type.toUpperCase()}]`, message);
  },

  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
};

// ==========================
// INITIALIZE SERVICES
// ==========================
const authService = new AuthService();
const projectService = new ProjectService();
const requestService = new RequestService();
const messageService = new MessageService();
const profileService = new ProfileService();
const searchService = new SearchService();
const reviewService = new ReviewService();
const alertService = new AlertService();

// Export for use in other scripts
if (typeof window !== 'undefined') {
  window.SPLit8 = {
    auth: authService,
    projects: projectService,
    requests: requestService,
    messages: messageService,
    profiles: profileService,
    search: searchService,
    reviews: reviewService,
    alerts: alertService,
    utils: Utils
  };
}
