/**
 * TRV Heating Scheduler Card
 * A beautiful, Tado-inspired heating schedule interface for Home Assistant
 * 
 * Features:
 * - Visual timeline with temperature blocks
 * - Drag to create/resize time blocks
 * - Per-day scheduling with copy/paste
 * - Zone/room management
 * - Works with any climate entity (Matter, Zigbee, etc.)
 */

class TRVHeatingSchedulerCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config = {};
    this._schedules = {};
    this._selectedDay = this.getCurrentDay();
    this._selectedZone = null;
    this._clipboard = null;
    this._dragState = null;
    this._visualEditorMode = true; // Enable visual editor by default
  }

  setConfig(config) {
    if (!config.zones || !Array.isArray(config.zones)) {
      throw new Error('You must define zones in the card configuration');
    }

    this._config = {
      title: config.title || 'Heating Schedule',
      zones: config.zones,
      default_temperature: config.default_temperature || 16,
      comfort_temperature: config.comfort_temperature || 19,
      min_temperature: config.min_temperature || 5,
      max_temperature: config.max_temperature || 30,
      time_step: config.time_step || 30, // minutes
      ...config
    };

    this._selectedZone = this._config.zones[0]?.id;
    this.loadSchedules();
  }

  set hass(hass) {
    this._hass = hass;
    this.render();
  }

  getCurrentDay() {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[new Date().getDay()];
  }

  loadSchedules() {
    // Load schedules from browser localStorage
    const stored = localStorage.getItem('trv_schedules');
    if (stored) {
      try {
        this._schedules = JSON.parse(stored);
      } catch (e) {
        this._schedules = {};
      }
    }

    // Initialize default schedules if not exists
    this._config.zones.forEach(zone => {
      if (!this._schedules[zone.id]) {
        this._schedules[zone.id] = this.createDefaultSchedule();
      }
    });
  }

  saveSchedules() {
    localStorage.setItem('trv_schedules', JSON.stringify(this._schedules));
    this.applySchedules();
  }

  createDefaultSchedule() {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const schedule = {};
    
    days.forEach(day => {
      schedule[day] = [
        { start: '00:00', end: '06:00', temperature: this._config.default_temperature },
        { start: '06:00', end: '18:00', temperature: this._config.comfort_temperature },
        { start: '18:00', end: '24:00', temperature: this._config.default_temperature }
      ];
    });
    
    return schedule;
  }

  applySchedules() {
    // Apply current schedule to TRVs based on current time
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const currentDay = this.getCurrentDay();

    this._config.zones.forEach(zone => {
      const daySchedule = this._schedules[zone.id]?.[currentDay] || [];
      const activeBlock = daySchedule.find(block => 
        currentTime >= block.start && currentTime < block.end
      );

      if (activeBlock && zone.entities) {
        zone.entities.forEach(entityId => {
          this._hass.callService('climate', 'set_temperature', {
            entity_id: entityId,
            temperature: activeBlock.temperature
          });
        });
      }
    });
  }

  copyDay() {
    const schedule = this._schedules[this._selectedZone]?.[this._selectedDay];
    if (schedule) {
      this._clipboard = JSON.parse(JSON.stringify(schedule));
      this.render();
    }
  }

  pasteDay() {
    if (this._clipboard && this._schedules[this._selectedZone]) {
      this._schedules[this._selectedZone][this._selectedDay] = 
        JSON.parse(JSON.stringify(this._clipboard));
      this.saveSchedules();
      this.render();
    }
  }

  addTimeBlock() {
    const schedule = this._schedules[this._selectedZone][this._selectedDay];
    schedule.push({
      start: '12:00',
      end: '14:00',
      temperature: this._config.comfort_temperature
    });
    this.sortSchedule();
    this.saveSchedules();
    this.render();
  }

  deleteTimeBlock(index) {
    this._schedules[this._selectedZone][this._selectedDay].splice(index, 1);
    this.saveSchedules();
    this.render();
  }

  updateTimeBlock(index, field, value) {
    this._schedules[this._selectedZone][this._selectedDay][index][field] = value;
    if (field === 'start' || field === 'end') {
      this.sortSchedule();
    }
    this.saveSchedules();
    this.render();
  }

  sortSchedule() {
    const schedule = this._schedules[this._selectedZone][this._selectedDay];
    schedule.sort((a, b) => a.start.localeCompare(b.start));
  }

  startDrag(e, index, side) {
    e.preventDefault();
    e.stopPropagation();
    
    const timeline = this.shadowRoot.querySelector('.timeline');
    const rect = timeline.getBoundingClientRect();
    
    this._dragState = {
      index,
      side,
      timelineRect: rect,
      startX: e.clientX || e.touches[0].clientX
    };
    
    document.addEventListener('mousemove', this._handleDragMove);
    document.addEventListener('mouseup', this._handleDragEnd);
    document.addEventListener('touchmove', this._handleDragMove);
    document.addEventListener('touchend', this._handleDragEnd);
  }

  handleDragMove = (e) => {
    if (!this._dragState) return;
    
    const clientX = e.clientX || e.touches?.[0]?.clientX;
    if (!clientX) return;
    
    const { index, side, timelineRect } = this._dragState;
    const schedule = this._schedules[this._selectedZone][this._selectedDay];
    const block = schedule[index];
    
    // Calculate position relative to timeline
    const relativeX = clientX - timelineRect.left;
    const percentage = Math.max(0, Math.min(100, (relativeX / timelineRect.width) * 100));
    const minutes = Math.round((percentage / 100) * 1440);
    
    // Snap to 15-minute intervals
    const snappedMinutes = Math.round(minutes / 15) * 15;
    const newTime = this.minutesToTime(snappedMinutes);
    
    if (side === 'left') {
      // Resize from left (change start time)
      const endMinutes = this.timeToMinutes(block.end);
      if (snappedMinutes < endMinutes - 30) { // Minimum 30 min block
        this.updateTimeBlock(index, 'start', newTime);
      }
    } else if (side === 'right') {
      // Resize from right (change end time)
      const startMinutes = this.timeToMinutes(block.start);
      if (snappedMinutes > startMinutes + 30) { // Minimum 30 min block
        this.updateTimeBlock(index, 'end', newTime);
      }
    } else {
      // Move entire block
      const blockDuration = this.timeToMinutes(block.end) - this.timeToMinutes(block.start);
      const newStart = Math.max(0, Math.min(1440 - blockDuration, snappedMinutes));
      const newEnd = newStart + blockDuration;
      
      this._schedules[this._selectedZone][this._selectedDay][index].start = this.minutesToTime(newStart);
      this._schedules[this._selectedZone][this._selectedDay][index].end = this.minutesToTime(newEnd);
      this.saveSchedules();
      this.render();
    }
  }

  handleDragEnd = (e) => {
    document.removeEventListener('mousemove', this._handleDragMove);
    document.removeEventListener('mouseup', this._handleDragEnd);
    document.removeEventListener('touchmove', this._handleDragMove);
    document.removeEventListener('touchend', this._handleDragEnd);
    
    this._dragState = null;
  }

  startBlockDrag(e, index) {
    // Only allow drag on the block itself, not the handles
    if (e.target.classList.contains('resize-handle')) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const timeline = this.shadowRoot.querySelector('.timeline');
    const rect = timeline.getBoundingClientRect();
    
    this._dragState = {
      index,
      side: 'move',
      timelineRect: rect,
      startX: e.clientX || e.touches[0].clientX
    };
    
    document.addEventListener('mousemove', this._handleDragMove);
    document.addEventListener('mouseup', this._handleDragEnd);
    document.addEventListener('touchmove', this._handleDragMove);
    document.addEventListener('touchend', this._handleDragEnd);
  }

  createNewBlockOnTimeline(e) {
    const timeline = this.shadowRoot.querySelector('.timeline');
    const rect = timeline.getBoundingClientRect();
    const relativeX = e.clientX - rect.left;
    const percentage = (relativeX / rect.width) * 100;
    const minutes = Math.round((percentage / 100) * 1440);
    
    // Snap to 15-minute intervals
    const snappedMinutes = Math.round(minutes / 15) * 15;
    const startTime = this.minutesToTime(snappedMinutes);
    const endMinutes = Math.min(1440, snappedMinutes + 120); // Default 2 hour block
    const endTime = this.minutesToTime(endMinutes);
    
    const schedule = this._schedules[this._selectedZone][this._selectedDay];
    schedule.push({
      start: startTime,
      end: endTime,
      temperature: this._config.comfort_temperature
    });
    
    this.sortSchedule();
    this.saveSchedules();
    this.render();
  }

  timeToMinutes(time) {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  minutesToTime(minutes) {
    const hours = Math.floor(minutes / 60) % 24;
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  render() {
    if (!this._hass || !this._config.zones) return;

    const zone = this._config.zones.find(z => z.id === this._selectedZone);
    const schedule = this._schedules[this._selectedZone]?.[this._selectedDay] || [];

    this.shadowRoot.innerHTML = `
      <style>
        ${this.getStyles()}
      </style>
      <ha-card>
        <div class="card-content">
          <div class="header">
            <h1 class="title">${this._config.title}</h1>
            <div class="zone-tabs">
              ${this._config.zones.map(z => `
                <button 
                  class="zone-tab ${z.id === this._selectedZone ? 'active' : ''}"
                  data-zone="${z.id}"
                >
                  ${z.name}
                </button>
              `).join('')}
            </div>
          </div>

          <div class="day-selector">
            ${['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => `
              <button 
                class="day-btn ${day.toLowerCase() === this._selectedDay ? 'active' : ''}"
                data-day="${day.toLowerCase()}"
              >
                ${day.substring(0, 3)}
              </button>
            `).join('')}
          </div>

          <div class="timeline-container">
            <div class="timeline-help">
              💡 <strong>Visual Editor:</strong> Drag blocks to move • Drag edges to resize • Double-click empty space to add
            </div>
            <div class="timeline">
              ${this.renderTimeline(schedule)}
            </div>
            <div class="time-labels">
              <span>0:00</span>
              <span>8:00</span>
              <span>16:00</span>
              <span>24:00</span>
            </div>
          </div>

          <div class="schedule-blocks">
            ${schedule.map((block, index) => this.renderTimeBlock(block, index)).join('')}
          </div>

          <div class="actions">
            <button class="add-block-btn" data-action="add">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Add time block
            </button>
            <div class="clipboard-actions">
              <button class="copy-btn" data-action="copy">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                Copy
              </button>
              <button 
                class="paste-btn ${this._clipboard ? '' : 'disabled'}" 
                data-action="paste"
                ${this._clipboard ? '' : 'disabled'}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                </svg>
                Paste
              </button>
            </div>
          </div>
        </div>
      </ha-card>
    `;

    this.attachEventListeners();
  }

  renderTimeline(schedule) {
    const blocks = schedule.map((block, index) => {
      const startMinutes = this.timeToMinutes(block.start);
      const endMinutes = this.timeToMinutes(block.end);
      const left = (startMinutes / 1440) * 100;
      const width = ((endMinutes - startMinutes) / 1440) * 100;
      
      const tempColor = this.getTemperatureColor(block.temperature);
      
      return `
        <div class="timeline-block" 
          data-index="${index}"
          style="
            left: ${left}%;
            width: ${width}%;
            background: ${tempColor};
          ">
          <div class="resize-handle resize-left" data-index="${index}" data-side="left"></div>
          <span class="timeline-temp">${block.temperature}°</span>
          <div class="resize-handle resize-right" data-index="${index}" data-side="right"></div>
        </div>
      `;
    }).join('');

    return blocks;
  }

  renderTimeBlock(block, index) {
    return `
      <div class="time-block">
        <div class="time-block-header">
          <div class="time-inputs">
            <input 
              type="time" 
              class="time-input" 
              value="${block.start}"
              data-index="${index}"
              data-field="start"
            />
            <span class="time-separator">-</span>
            <input 
              type="time" 
              class="time-input" 
              value="${block.end}"
              data-index="${index}"
              data-field="end"
            />
          </div>
          <button class="delete-btn" data-index="${index}" data-action="delete">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="temperature-control">
          <span class="temp-label">Temperature</span>
          <div class="temp-slider-container">
            <input 
              type="range" 
              class="temp-slider" 
              min="${this._config.min_temperature}"
              max="${this._config.max_temperature}"
              step="0.5"
              value="${block.temperature}"
              data-index="${index}"
              data-field="temperature"
              style="--value: ${block.temperature}; --min: ${this._config.min_temperature}; --max: ${this._config.max_temperature};"
            />
            <span class="temp-value">${block.temperature}°C</span>
          </div>
        </div>
      </div>
    `;
  }

  getTemperatureColor(temp) {
    const min = this._config.min_temperature;
    const max = this._config.max_temperature;
    const normalized = (temp - min) / (max - min);
    
    // Cool to warm gradient
    if (normalized < 0.5) {
      const r = Math.round(100 + normalized * 2 * 155);
      const g = Math.round(180 + normalized * 2 * 75);
      const b = 200;
      return `rgb(${r}, ${g}, ${b})`;
    } else {
      const r = 255;
      const g = Math.round(255 - (normalized - 0.5) * 2 * 100);
      const b = Math.round(200 - (normalized - 0.5) * 2 * 150);
      return `rgb(${r}, ${g}, ${b})`;
    }
  }

  attachEventListeners() {
    // Bind drag methods to this context
    this._handleDragMove = this.handleDragMove.bind(this);
    this._handleDragEnd = this.handleDragEnd.bind(this);

    // Zone tabs
    this.shadowRoot.querySelectorAll('.zone-tab').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this._selectedZone = e.target.dataset.zone;
        this.render();
      });
    });

    // Day selector
    this.shadowRoot.querySelectorAll('.day-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this._selectedDay = e.target.dataset.day;
        this.render();
      });
    });

    // Visual editor - timeline block dragging
    this.shadowRoot.querySelectorAll('.timeline-block').forEach(block => {
      block.addEventListener('mousedown', (e) => {
        const index = parseInt(e.currentTarget.dataset.index);
        this.startBlockDrag(e, index);
      });
      block.addEventListener('touchstart', (e) => {
        const index = parseInt(e.currentTarget.dataset.index);
        this.startBlockDrag(e, index);
      });
    });

    // Visual editor - resize handles
    this.shadowRoot.querySelectorAll('.resize-handle').forEach(handle => {
      handle.addEventListener('mousedown', (e) => {
        const index = parseInt(e.target.dataset.index);
        const side = e.target.dataset.side;
        this.startDrag(e, index, side);
      });
      handle.addEventListener('touchstart', (e) => {
        const index = parseInt(e.target.dataset.index);
        const side = e.target.dataset.side;
        this.startDrag(e, index, side);
      });
    });

    // Visual editor - double-click timeline to create new block
    const timeline = this.shadowRoot.querySelector('.timeline');
    if (timeline) {
      timeline.addEventListener('dblclick', (e) => {
        // Only create if clicking on empty space
        if (e.target === timeline) {
          this.createNewBlockOnTimeline(e);
        }
      });
    }

    // Time inputs
    this.shadowRoot.querySelectorAll('.time-input').forEach(input => {
      input.addEventListener('change', (e) => {
        const index = parseInt(e.target.dataset.index);
        const field = e.target.dataset.field;
        this.updateTimeBlock(index, field, e.target.value);
      });
    });

    // Temperature sliders
    this.shadowRoot.querySelectorAll('.temp-slider').forEach(slider => {
      slider.addEventListener('input', (e) => {
        const index = parseInt(e.target.dataset.index);
        this.updateTimeBlock(index, 'temperature', parseFloat(e.target.value));
      });
    });

    // Action buttons
    this.shadowRoot.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = e.currentTarget.dataset.action;
        if (action === 'add') this.addTimeBlock();
        if (action === 'copy') this.copyDay();
        if (action === 'paste') this.pasteDay();
        if (action === 'delete') {
          const index = parseInt(e.currentTarget.dataset.index);
          this.deleteTimeBlock(index);
        }
      });
    });
  }

  getStyles() {
    return `
      * {
        box-sizing: border-box;
      }

      ha-card {
        background: #1a1a1a;
        border-radius: 16px;
        overflow: hidden;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      }

      .card-content {
        padding: 24px;
        color: #ffffff;
      }

      .header {
        margin-bottom: 24px;
      }

      .title {
        margin: 0 0 16px 0;
        font-size: 24px;
        font-weight: 600;
        color: #ffffff;
      }

      .zone-tabs {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }

      .zone-tab {
        padding: 8px 16px;
        border: none;
        border-radius: 20px;
        background: #2a2a2a;
        color: #999;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .zone-tab:hover {
        background: #333;
      }

      .zone-tab.active {
        background: #ff6b35;
        color: #ffffff;
      }

      .day-selector {
        display: flex;
        gap: 8px;
        margin-bottom: 24px;
        padding: 4px;
        background: #2a2a2a;
        border-radius: 12px;
      }

      .day-btn {
        flex: 1;
        padding: 10px 8px;
        border: none;
        border-radius: 8px;
        background: transparent;
        color: #999;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .day-btn:hover {
        background: #333;
        color: #fff;
      }

      .day-btn.active {
        background: #fff;
        color: #1a1a1a;
      }

      .timeline-container {
        margin-bottom: 24px;
      }

      .timeline-help {
        margin-bottom: 12px;
        padding: 8px 12px;
        background: rgba(255, 107, 53, 0.1);
        border-left: 3px solid #ff6b35;
        border-radius: 4px;
        font-size: 13px;
        color: #ccc;
      }

      .timeline-help strong {
        color: #ff6b35;
      }

      .timeline {
        position: relative;
        height: 60px;
        background: #2a2a2a;
        border-radius: 12px;
        overflow: hidden;
      }

      .timeline-block {
        position: absolute;
        top: 0;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
        cursor: move;
        user-select: none;
        border-left: 2px solid rgba(255, 255, 255, 0.3);
        border-right: 2px solid rgba(255, 255, 255, 0.3);
      }

      .timeline-block:hover {
        filter: brightness(1.1);
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
        z-index: 10;
      }

      .resize-handle {
        position: absolute;
        top: 0;
        bottom: 0;
        width: 12px;
        cursor: ew-resize;
        z-index: 20;
        opacity: 0;
        transition: opacity 0.2s ease;
      }

      .resize-handle:hover {
        opacity: 1;
      }

      .timeline-block:hover .resize-handle {
        opacity: 0.7;
      }

      .resize-left {
        left: -6px;
        background: linear-gradient(to right, rgba(255,255,255,0.8), transparent);
        border-left: 3px solid white;
      }

      .resize-right {
        right: -6px;
        background: linear-gradient(to left, rgba(255,255,255,0.8), transparent);
        border-right: 3px solid white;
      }

      .timeline-temp {
        font-size: 14px;
        font-weight: 600;
        color: rgba(0, 0, 0, 0.7);
        text-shadow: 0 1px 2px rgba(255, 255, 255, 0.3);
      }

      .time-labels {
        display: flex;
        justify-content: space-between;
        margin-top: 8px;
        padding: 0 4px;
        font-size: 12px;
        color: #666;
      }

      .schedule-blocks {
        display: flex;
        flex-direction: column;
        gap: 12px;
        margin-bottom: 20px;
      }

      .time-block {
        background: #2a2a2a;
        border-radius: 12px;
        padding: 16px;
      }

      .time-block-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
      }

      .time-inputs {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .time-input {
        padding: 8px 12px;
        border: none;
        border-radius: 8px;
        background: #1a1a1a;
        color: #fff;
        font-size: 14px;
        font-weight: 500;
        width: 80px;
      }

      .time-input::-webkit-calendar-picker-indicator {
        filter: invert(1);
      }

      .time-separator {
        color: #666;
        font-weight: 600;
      }

      .delete-btn {
        padding: 8px;
        border: none;
        border-radius: 8px;
        background: transparent;
        color: #ff4444;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .delete-btn:hover {
        background: rgba(255, 68, 68, 0.1);
      }

      .temperature-control {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .temp-label {
        font-size: 13px;
        color: #999;
        font-weight: 500;
      }

      .temp-slider-container {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .temp-slider {
        flex: 1;
        -webkit-appearance: none;
        height: 6px;
        border-radius: 3px;
        background: linear-gradient(
          to right,
          #64b5f6 0%,
          #64b5f6 calc((var(--value) - var(--min)) / (var(--max) - var(--min)) * 100%),
          #1a1a1a calc((var(--value) - var(--min)) / (var(--max) - var(--min)) * 100%),
          #1a1a1a 100%
        );
        outline: none;
      }

      .temp-slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: #fff;
        cursor: pointer;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
      }

      .temp-slider::-moz-range-thumb {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: #fff;
        cursor: pointer;
        border: none;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
      }

      .temp-value {
        min-width: 50px;
        text-align: right;
        font-size: 16px;
        font-weight: 600;
        color: #fff;
      }

      .actions {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
        margin-top: 20px;
      }

      .add-block-btn {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 20px;
        border: none;
        border-radius: 10px;
        background: #ff6b35;
        color: #fff;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .add-block-btn:hover {
        background: #ff7f50;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
      }

      .clipboard-actions {
        display: flex;
        gap: 8px;
      }

      .copy-btn,
      .paste-btn {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 10px 16px;
        border: 1px solid #444;
        border-radius: 10px;
        background: transparent;
        color: #fff;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .copy-btn:hover,
      .paste-btn:hover:not(.disabled) {
        background: #2a2a2a;
        border-color: #666;
      }

      .paste-btn.disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }

      @media (max-width: 600px) {
        .card-content {
          padding: 16px;
        }

        .title {
          font-size: 20px;
        }

        .day-btn {
          font-size: 11px;
          padding: 8px 4px;
        }

        .actions {
          flex-direction: column;
          align-items: stretch;
        }

        .clipboard-actions {
          justify-content: stretch;
        }

        .copy-btn,
        .paste-btn {
          flex: 1;
        }
      }
    `;
  }

  getCardSize() {
    return 6;
  }

  static getConfigElement() {
    return document.createElement('trv-heating-scheduler-card-editor');
  }

  static getStubConfig() {
    return {
      title: 'Heating Schedule',
      zones: [
        {
          id: 'living_room',
          name: 'Living Room',
          entities: ['climate.living_room_trv']
        }
      ],
      default_temperature: 16,
      comfort_temperature: 19
    };
  }
}

customElements.define('trv-heating-scheduler-card', TRVHeatingSchedulerCard);

// Register the card with Home Assistant
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'trv-heating-scheduler-card',
  name: 'TRV Heating Scheduler',
  description: 'A beautiful scheduler for TRV heating control',
  preview: true,
  documentationURL: 'https://github.com/yourusername/trv-heating-scheduler-card'
});

console.info(
  '%c TRV-HEATING-SCHEDULER-CARD %c v1.0.0 ',
  'background-color: #ff6b35; color: #fff; font-weight: bold;',
  'background-color: #1a1a1a; color: #fff;'
);
