/**
 * TRV Heating Scheduler Card Editor
 * Visual configuration editor for the scheduler card
 */

class TRVHeatingSchedulerCardEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config = {};
  }

  setConfig(config) {
    this._config = config;
    this.render();
  }

  set hass(hass) {
    this._hass = hass;
  }

  configChanged(newConfig) {
    const event = new Event('config-changed', {
      bubbles: true,
      composed: true,
    });
    event.detail = { config: newConfig };
    this.dispatchEvent(event);
  }

  getClimateEntities() {
    if (!this._hass) return [];
    return Object.keys(this._hass.states)
      .filter(entity => entity.startsWith('climate.'))
      .map(entity => ({
        id: entity,
        name: this._hass.states[entity].attributes.friendly_name || entity
      }));
  }

  render() {
    if (!this._hass) return;

    const config = this._config;
    const zones = config.zones || [];

    this.shadowRoot.innerHTML = `
      <style>
        ${this.getStyles()}
      </style>
      <div class="card-config">
        <div class="config-section">
          <label>Card Title</label>
          <input 
            type="text" 
            class="config-input"
            .value="${config.title || 'Heating Schedule'}"
            @change="${(e) => this.updateConfig('title', e.target.value)}"
          />
        </div>

        <div class="config-section">
          <label>Temperature Settings</label>
          <div class="temp-settings">
            <div class="temp-input-group">
              <span>Default Temperature</span>
              <input 
                type="number" 
                class="config-input small"
                .value="${config.default_temperature || 16}"
                min="5"
                max="30"
                step="0.5"
                @change="${(e) => this.updateConfig('default_temperature', parseFloat(e.target.value))}"
              />
              <span>°C</span>
            </div>
            <div class="temp-input-group">
              <span>Comfort Temperature</span>
              <input 
                type="number" 
                class="config-input small"
                .value="${config.comfort_temperature || 19}"
                min="5"
                max="30"
                step="0.5"
                @change="${(e) => this.updateConfig('comfort_temperature', parseFloat(e.target.value))}"
              />
              <span>°C</span>
            </div>
          </div>
        </div>

        <div class="config-section">
          <label>Zones/Rooms</label>
          <div class="zones-list">
            ${zones.map((zone, index) => this.renderZoneEditor(zone, index)).join('')}
          </div>
          <button class="add-zone-btn" @click="${() => this.addZone()}">
            + Add Zone
          </button>
        </div>

        <div class="config-section">
          <label>Advanced Settings</label>
          <div class="temp-input-group">
            <span>Min Temperature</span>
            <input 
              type="number" 
              class="config-input small"
              .value="${config.min_temperature || 5}"
              min="0"
              max="20"
              step="1"
              @change="${(e) => this.updateConfig('min_temperature', parseFloat(e.target.value))}"
            />
            <span>°C</span>
          </div>
          <div class="temp-input-group">
            <span>Max Temperature</span>
            <input 
              type="number" 
              class="config-input small"
              .value="${config.max_temperature || 30}"
              min="20"
              max="35"
              step="1"
              @change="${(e) => this.updateConfig('max_temperature', parseFloat(e.target.value))}"
            />
            <span>°C</span>
          </div>
        </div>
      </div>
    `;

    this.attachEventListeners();
  }

  renderZoneEditor(zone, index) {
    const climateEntities = this.getClimateEntities();
    
    return `
      <div class="zone-editor">
        <div class="zone-header">
          <input 
            type="text" 
            class="config-input"
            placeholder="Zone Name"
            value="${zone.name || ''}"
            data-index="${index}"
            data-field="name"
          />
          <button class="delete-zone-btn" data-index="${index}">×</button>
        </div>
        <div class="zone-entities">
          <label>Climate Entities</label>
          <select class="entity-select" data-index="${index}" multiple>
            ${climateEntities.map(entity => `
              <option 
                value="${entity.id}"
                ${zone.entities?.includes(entity.id) ? 'selected' : ''}
              >
                ${entity.name}
              </option>
            `).join('')}
          </select>
        </div>
      </div>
    `;
  }

  updateConfig(key, value) {
    this._config = { ...this._config, [key]: value };
    this.configChanged(this._config);
  }

  updateZone(index, field, value) {
    const zones = [...(this._config.zones || [])];
    zones[index] = { ...zones[index], [field]: value };
    this.updateConfig('zones', zones);
    this.render();
  }

  addZone() {
    const zones = [...(this._config.zones || [])];
    zones.push({
      id: `zone_${Date.now()}`,
      name: `Zone ${zones.length + 1}`,
      entities: []
    });
    this.updateConfig('zones', zones);
    this.render();
  }

  deleteZone(index) {
    const zones = [...(this._config.zones || [])];
    zones.splice(index, 1);
    this.updateConfig('zones', zones);
    this.render();
  }

  attachEventListeners() {
    // Zone name inputs
    this.shadowRoot.querySelectorAll('.zone-editor input[data-field="name"]').forEach(input => {
      input.addEventListener('change', (e) => {
        const index = parseInt(e.target.dataset.index);
        this.updateZone(index, 'name', e.target.value);
      });
    });

    // Entity selects
    this.shadowRoot.querySelectorAll('.entity-select').forEach(select => {
      select.addEventListener('change', (e) => {
        const index = parseInt(e.target.dataset.index);
        const selectedEntities = Array.from(e.target.selectedOptions).map(opt => opt.value);
        this.updateZone(index, 'entities', selectedEntities);
      });
    });

    // Delete zone buttons
    this.shadowRoot.querySelectorAll('.delete-zone-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.target.dataset.index);
        this.deleteZone(index);
      });
    });

    // Add zone button
    const addBtn = this.shadowRoot.querySelector('.add-zone-btn');
    if (addBtn) {
      addBtn.addEventListener('click', () => this.addZone());
    }

    // Config inputs
    this.shadowRoot.querySelectorAll('.config-input').forEach(input => {
      if (!input.dataset.index) { // Skip zone inputs
        input.addEventListener('change', (e) => {
          const field = e.target.previousElementSibling?.textContent?.toLowerCase().replace(/\s+/g, '_');
          if (field) {
            const value = e.target.type === 'number' ? parseFloat(e.target.value) : e.target.value;
            this.updateConfig(field, value);
          }
        });
      }
    });
  }

  getStyles() {
    return `
      .card-config {
        padding: 16px;
      }

      .config-section {
        margin-bottom: 24px;
      }

      .config-section label {
        display: block;
        margin-bottom: 8px;
        font-weight: 600;
        color: var(--primary-text-color);
      }

      .config-input {
        width: 100%;
        padding: 8px 12px;
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        background: var(--card-background-color);
        color: var(--primary-text-color);
        font-size: 14px;
      }

      .config-input.small {
        width: 80px;
      }

      .temp-settings,
      .temp-input-group {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 12px;
      }

      .zones-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
        margin-bottom: 12px;
      }

      .zone-editor {
        padding: 12px;
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        background: var(--secondary-background-color);
      }

      .zone-header {
        display: flex;
        gap: 8px;
        margin-bottom: 12px;
      }

      .zone-header input {
        flex: 1;
      }

      .delete-zone-btn {
        width: 32px;
        height: 32px;
        border: none;
        border-radius: 4px;
        background: var(--error-color);
        color: white;
        font-size: 20px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .zone-entities label {
        display: block;
        margin-bottom: 4px;
        font-size: 13px;
        color: var(--secondary-text-color);
      }

      .entity-select {
        width: 100%;
        padding: 8px;
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        background: var(--card-background-color);
        color: var(--primary-text-color);
        min-height: 80px;
      }

      .add-zone-btn {
        width: 100%;
        padding: 10px;
        border: 2px dashed var(--divider-color);
        border-radius: 4px;
        background: transparent;
        color: var(--primary-color);
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
      }

      .add-zone-btn:hover {
        border-color: var(--primary-color);
        background: var(--primary-color);
        color: white;
      }
    `;
  }
}

customElements.define('trv-heating-scheduler-card-editor', TRVHeatingSchedulerCardEditor);
