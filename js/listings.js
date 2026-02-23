/**
 * SPLit8 - Gestione Inserzioni Sopralluoghi
 * Sistema dettagliato per pubblicare e consultare sopralluoghi architettonici
 */

class ListingsManager {
  constructor() {
    this.listings = this.loadListings();
    this.map = null;
    this.markers = [];
    this.currentUser = this.loadUser();
    this.filteredListings = [...this.listings];
    this.init();
  }

  init() {
    this.setupForm();
    this.setupMap();
    this.setupFilters();
    this.renderListings();
    this.setupDetailsPanel();
  }

  setupForm() {
    const form = document.getElementById('listingForm');
    if (!form) return;

    form.addEventListener('submit', (e) => this.handleFormSubmit(e));

    // Aggiungi interattività ai campi della mappa
    const coordsInput = form.querySelector('[name="coords"]');
    if (coordsInput) {
      coordsInput.addEventListener('change', () => {
        this.updateMapPreview(coordsInput.value);
      });
    }
  }

  setupMap() {
    const mapEl = document.getElementById('map');
    if (!mapEl) return;

    // Inizializza mappa Leaflet
    this.map = L.map('map').setView([41.8719, 12.5674], 4); // Centro Italia

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(this.map);

    // Assicura che la mappa calcoli correttamente le dimensioni
    this.map.whenReady(() => {
      setTimeout(() => this.map.invalidateSize(), 0);
    });

    // Aggiungi marcatori per le inserzioni esistenti
    this.displayListingsOnMap();

    // Consenti click sulla mappa per selezionare coordinate
    this.map.on('click', (e) => {
      const coordsInput = document.querySelector('[name="coords"]');
      if (coordsInput) {
        coordsInput.value = `${e.latlng.lat.toFixed(4)}, ${e.latlng.lng.toFixed(4)}`;
        this.updateMapPreview(coordsInput.value);
      }
    });
  }

  displayListingsOnMap() {
    this.markers.forEach((marker) => marker.remove());
    this.markers = [];

    this.filteredListings.forEach((listing) => {
      const [lat, lon] = listing.coords
        .split(',')
        .map((c) => parseFloat(c.trim()));
      const marker = L.circleMarker([lat, lon], {
        radius: 8,
        fillColor: this.getColorByWorkType(listing.workType),
        color: '#fff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8,
      })
        .addTo(this.map)
        .bindPopup(`
          <strong>${listing.workType}</strong><br/>
          ${listing.location}<br/>
          <small>${listing.status}</small>
        `, { offset: [0, 12] })
        .on('click', () => this.showDetails(listing));

      this.markers.push(marker);
    });
  }

  getColorByWorkType(workType) {
    const types = {
      'Rilievo': '#56B4FF',
      'Perizia': '#4DB9A6',
      'Indagine': '#D4A856',
      'Progettazione': '#7B68EE',
      'Restauro': '#FF6B9D',
      'Altro': '#999',
    };

    for (const [key, color] of Object.entries(types)) {
      if (workType.includes(key)) return color;
    }
    return types['Altro'];
  }

  updateMapPreview(coordsStr) {
    try {
      const [lat, lon] = coordsStr.split(',').map((c) => parseFloat(c.trim()));
      if (!isNaN(lat) && !isNaN(lon)) {
        // Rimuovi marker precedente di preview
        this.map.eachLayer((layer) => {
          if (layer instanceof L.CircleMarker && layer._isPreview) {
            this.map.removeLayer(layer);
          }
        });

        // Aggiungi nuovo marker di preview
        const previewMarker = L.circleMarker([lat, lon], {
          radius: 10,
          fillColor: '#FF6B9D',
          color: '#fff',
          weight: 3,
          opacity: 1,
          fillOpacity: 0.8,
        })
          .addTo(this.map)
          .bindPopup('Posizione selezionata')
          .openPopup();

        previewMarker._isPreview = true;
        this.map.setView([lat, lon], 12);
      }
    } catch (e) {
      console.log('Coordinate non valide');
    }
  }

  setupFilters() {
    const filterWork = document.getElementById('filterWork');
    const filterSite = document.getElementById('filterSite');
    const clearBtn = document.getElementById('clearFilters');

    if (filterWork) {
      filterWork.addEventListener('input', () => this.applyFilters());
    }
    if (filterSite) {
      filterSite.addEventListener('input', () => this.applyFilters());
    }
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (filterWork) filterWork.value = '';
        if (filterSite) filterSite.value = '';
        this.applyFilters();
      });
    }
  }

  applyFilters() {
    const filterWork = document.getElementById('filterWork')?.value.toLowerCase() || '';
    const filterSite = document.getElementById('filterSite')?.value.toLowerCase() || '';

    this.filteredListings = this.listings.filter((listing) => {
      const matchWork = !filterWork || listing.workType.toLowerCase().includes(filterWork);
      const matchSite = !filterSite || listing.siteType.toLowerCase().includes(filterSite);
      return matchWork && matchSite;
    });

    this.displayListingsOnMap();
    this.renderListings();
  }

  renderListings() {
    const container = document.getElementById('listingList');
    const countEl = document.getElementById('listingCount');

    if (!container) return;

    if (this.filteredListings.length === 0) {
      container.innerHTML = '<p class="muted">Nessuna inserzione trovata.</p>';
      if (countEl) countEl.textContent = '';
      return;
    }

    if (countEl) {
      countEl.textContent = `${this.filteredListings.length} inserzione${
        this.filteredListings.length !== 1 ? 'i' : ''
      } disponibile${this.filteredListings.length !== 1 ? 'i' : ''}`;
    }

    container.innerHTML = this.filteredListings
      .map((listing) => this.createListingCard(listing))
      .join('');

    container.querySelectorAll('[data-listing-id]').forEach((card) => {
      card.addEventListener('click', () => {
        const id = card.dataset.listingId;
        const listing = this.filteredListings.find((l) => l.id === id);
        if (listing) this.showDetails(listing);
      });
    });
  }

  createListingCard(listing) {
    const statusColor = {
      'Disponibile': '#4ADE80',
      'In corso': '#FBBF24',
      'Completato': '#999',
    };

    return `
      <div class="listing-card" data-listing-id="${listing.id}">
        <div class="listing-card__header">
          <h4>${listing.workType}</h4>
          <span class="badge" style="background: ${statusColor[listing.status] || '#999'}">
            ${listing.status}
          </span>
        </div>
        <div class="listing-card__content">
          <p><strong>📍 ${listing.location}</strong></p>
          <p class="muted">${listing.description}</p>
          <div class="listing-card__meta">
            <span>💰 Budget: €${listing.budget}</span>
            <span>📅 ${listing.date}</span>
          </div>
        </div>
        <div class="listing-card__footer">
          <button class="btn btn--small">Visualizza dettagli</button>
        </div>
      </div>
    `;
  }

  setupDetailsPanel() {
    const closeBtn = document.getElementById('closePanel');
    const panel = document.getElementById('detailsPanel');

    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        panel.setAttribute('aria-hidden', 'true');
      });
    }
  }

  showDetails(listing) {
    const panel = document.getElementById('detailsPanel');
    const content = document.getElementById('panelContent');

    if (!panel || !content) return;

    content.innerHTML = `
      <div class="details-grid">
        <div>
          <strong>Tipo di lavoro</strong>
          <p>${listing.workType}</p>
        </div>
        <div>
          <strong>Ubicazione</strong>
          <p>${listing.location}</p>
        </div>
        <div>
          <strong>Coordinate</strong>
          <p><code>${listing.coords}</code></p>
        </div>
        <div>
          <strong>Tipo sito</strong>
          <p>${listing.siteType}</p>
        </div>
        <div>
          <strong>Budget</strong>
          <p>€${listing.budget}</p>
        </div>
        <div>
          <strong>Data inserzione</strong>
          <p>${listing.date}</p>
        </div>
        <div style="grid-column: 1/-1">
          <strong>Descrizione</strong>
          <p>${listing.description}</p>
        </div>
        <div style="grid-column: 1/-1">
          <strong>Note tecniche</strong>
          <p>${listing.notes || 'Nessuna nota'}</p>
        </div>
      </div>
      <div class="actions" style="margin-top: 20px">
        <button class="btn">Contatta professionista</button>
        <button class="btn btn--ghost">Salva nei preferiti</button>
      </div>
    `;

    panel.setAttribute('aria-hidden', 'false');
  }

  handleFormSubmit(e) {
    e.preventDefault();

    if (!this.currentUser) {
      document.getElementById('authModal').setAttribute('aria-hidden', 'false');
      return;
    }

    const form = e.target;
    const formData = new FormData(form);

    const newListing = {
      id: Date.now().toString(),
      workType: formData.get('workType'),
      coords: formData.get('coords'),
      siteType: formData.get('siteType'),
      location: formData.get('location'),
      budget: formData.get('budget'),
      date: new Date().toLocaleDateString('it-IT'),
      description: formData.get('description'),
      notes: formData.get('notes'),
      status: 'Disponibile',
      userId: this.currentUser.id,
    };

    this.listings.push(newListing);
    this.saveListings();
    this.filteredListings = [...this.listings];
    this.displayListingsOnMap();
    this.renderListings();
    form.reset();

    alert('Inserzione pubblicata con successo!');
  }

  loadListings() {
    const stored = localStorage.getItem('listings');
    return stored
      ? JSON.parse(stored)
      : [
          {
            id: '1',
            workType: 'Rilievo strutturale',
            coords: '41.9028, 12.4964',
            siteType: 'Residenziale',
            location: 'Roma, Via dei Fori Imperiali',
            budget: 1500,
            date: '28/01/2026',
            description: 'Rilievo completo di edificio storico per valutazione strutturale',
            notes: 'Accesso limitato ai piani alti',
            status: 'Disponibile',
            userId: 'demo',
          },
          {
            id: '2',
            workType: 'Perizia urbanistica',
            coords: '45.4642, 9.1900',
            siteType: 'Commerciale',
            location: 'Milano, Centro Direzionale',
            budget: 2000,
            date: '27/01/2026',
            description: 'Perizia per variante urbanistica su immobile commerciale',
            notes: '',
            status: 'In corso',
            userId: 'demo',
          },
          {
            id: '3',
            workType: 'Indagine geotecnica',
            coords: '43.7696, 11.2558',
            siteType: 'Industriale',
            location: 'Siena, Area industriale',
            budget: 3000,
            date: '26/01/2026',
            description: 'Indagine geotecnica per fondazioni nuova struttura',
            notes: 'Richieste sondaggi fino a 20m di profondità',
            status: 'Disponibile',
            userId: 'demo',
          },
        ];
  }

  saveListings() {
    localStorage.setItem('listings', JSON.stringify(this.listings));
  }

  loadUser() {
    const stored = localStorage.getItem('currentUser');
    return stored ? JSON.parse(stored) : null;
  }
}

function loadLeafletAssets() {
  if (window.L) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const existingScript = document.querySelector('script[data-leaflet="true"]');
    if (existingScript) {
      existingScript.addEventListener('load', resolve, { once: true });
      existingScript.addEventListener('error', reject, { once: true });
      return;
    }

    const leafletCss = document.querySelector('link[data-leaflet="true"]');
    if (!leafletCss) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
      link.crossOrigin = '';
      link.dataset.leaflet = 'true';
      document.head.appendChild(link);
    }

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
    script.crossOrigin = '';
    script.dataset.leaflet = 'true';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Leaflet load error'));
    document.body.appendChild(script);
  });
}

function initListings() {
  const mapEl = document.getElementById('map');
  const formEl = document.getElementById('listingForm');
  if (!mapEl && !formEl) return;

  if (window.listingsManager) {
    const container = window.listingsManager.map?.getContainer?.();
    if (container && !document.body.contains(container)) {
      window.listingsManager = null;
    } else {
      return;
    }
  }

  loadLeafletAssets()
    .then(() => {
      window.listingsManager = new ListingsManager();
    })
    .catch(() => {
      console.warn('Leaflet non disponibile');
    });
}

window.initListings = initListings;

// Inizializza quando il DOM è pronto
document.addEventListener('DOMContentLoaded', () => {
  initListings();
});
