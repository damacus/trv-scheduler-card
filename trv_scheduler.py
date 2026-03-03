"""
TRV Heating Scheduler - AppDaemon App

This app provides sophisticated schedule management for TRV heating control.
It reads schedules from the custom card and automatically applies them to your climate entities.

Installation:
1. Install AppDaemon if you haven't already
2. Copy this file to /config/appdaemon/apps/trv_scheduler.py
3. Configure in /config/appdaemon/apps/apps.yaml (see example below)
4. Restart AppDaemon

Example apps.yaml configuration:
---
trv_scheduler:
  module: trv_scheduler
  class: TRVHeatingScheduler
  zones:
    - name: "Living Room"
      id: "living_room"
      entities:
        - climate.living_room_trv
    - name: "Bedroom"
      id: "bedroom"
      entities:
        - climate.bedroom_trv_1
        - climate.bedroom_trv_2
  default_temperature: 16
  comfort_temperature: 19
  check_interval: 60  # seconds
"""

import appdaemon.plugins.hass.hassapi as hass
import json
from datetime import datetime


class TRVHeatingScheduler(hass.Hass):
    """AppDaemon app for TRV heating schedule management."""

    def initialize(self):
        """Initialize the TRV scheduler."""
        self.log("Initializing TRV Heating Scheduler")
        
        # Get configuration
        self.zones = self.args.get("zones", [])
        self.default_temp = self.args.get("default_temperature", 16)
        self.comfort_temp = self.args.get("comfort_temperature", 19)
        self.check_interval = self.args.get("check_interval", 60)
        
        if not self.zones:
            self.log("ERROR: No zones configured!", level="ERROR")
            return
        
        # Load schedules from input_text entities (if they exist)
        self.schedules = {}
        self.load_schedules()
        
        # Register listeners
        self.setup_listeners()
        
        # Start the scheduler
        self.run_every(
            self.check_and_apply_schedule,
            datetime.now(),
            self.check_interval
        )
        
        self.log(f"TRV Scheduler initialized with {len(self.zones)} zones")

    def load_schedules(self):
        """Load schedules from Home Assistant input_text entities."""
        days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
        
        for zone in self.zones:
            zone_id = zone['id']
            self.schedules[zone_id] = {}
            
            for day in days:
                entity_id = f"input_text.{zone_id}_schedule_{day}"
                
                # Check if entity exists
                if self.entity_exists(entity_id):
                    schedule_json = self.get_state(entity_id)
                    
                    try:
                        schedule = json.loads(schedule_json) if schedule_json else []
                        self.schedules[zone_id][day] = schedule
                    except json.JSONDecodeError:
                        self.log(f"Invalid JSON in {entity_id}, using default schedule", level="WARNING")
                        self.schedules[zone_id][day] = self.get_default_schedule()
                else:
                    # Create default schedule
                    self.schedules[zone_id][day] = self.get_default_schedule()
        
        self.log(f"Loaded schedules for {len(self.schedules)} zones")

    def get_default_schedule(self):
        """Return a default schedule."""
        return [
            {"start": "00:00", "end": "06:00", "temperature": self.default_temp},
            {"start": "06:00", "end": "18:00", "temperature": self.comfort_temp},
            {"start": "18:00", "end": "24:00", "temperature": self.default_temp}
        ]

    def setup_listeners(self):
        """Set up listeners for schedule changes."""
        days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
        
        for zone in self.zones:
            zone_id = zone['id']
            
            for day in days:
                entity_id = f"input_text.{zone_id}_schedule_{day}"
                
                if self.entity_exists(entity_id):
                    self.listen_state(
                        self.on_schedule_change,
                        entity_id,
                        zone_id=zone_id,
                        day=day
                    )

    def on_schedule_change(self, entity, attribute, old, new, kwargs):
        """Handle schedule changes."""
        zone_id = kwargs.get('zone_id')
        day = kwargs.get('day')
        
        try:
            schedule = json.loads(new) if new else []
            self.schedules[zone_id][day] = schedule
            self.log(f"Updated schedule for {zone_id} - {day}")
            
            # Apply immediately if it's the current day
            current_day = datetime.now().strftime('%A').lower()
            if day == current_day:
                self.check_and_apply_schedule(None)
        except json.JSONDecodeError:
            self.log(f"Invalid JSON in schedule update for {zone_id} - {day}", level="ERROR")

    def check_and_apply_schedule(self, kwargs):
        """Check current time and apply appropriate temperature."""
        now = datetime.now()
        current_time = now.strftime('%H:%M')
        current_day = now.strftime('%A').lower()
        
        for zone in self.zones:
            zone_id = zone['id']
            zone_name = zone['name']
            entities = zone.get('entities', [])
            
            if not entities:
                continue
            
            # Get schedule for current day
            day_schedule = self.schedules.get(zone_id, {}).get(current_day, [])
            
            if not day_schedule:
                self.log(f"No schedule found for {zone_name} on {current_day}", level="WARNING")
                continue
            
            # Find active time block
            active_block = self.find_active_block(current_time, day_schedule)
            
            if active_block:
                target_temp = active_block['temperature']
                
                # Apply temperature to all entities in zone
                for entity_id in entities:
                    current_temp = self.get_state(entity_id, attribute='temperature')
                    
                    # Only update if temperature is different
                    if not self.temperatures_match(current_temp, target_temp):
                        self.log(
                            f"Setting {entity_id} to {target_temp}°C "
                            f"(block: {active_block['start']}-{active_block['end']})"
                        )
                        
                        self.call_service(
                            'climate/set_temperature',
                            entity_id=entity_id,
                            temperature=target_temp
                        )

    def find_active_block(self, current_time, schedule):
        """Find the active temperature block for the current time."""
        current_minutes = self.time_to_minutes(current_time)
        
        for block in schedule:
            start_minutes = self.time_to_minutes(block['start'])
            end_minutes = self.time_to_minutes(block['end'])
            
            # Handle blocks that span midnight
            if end_minutes < start_minutes:
                if current_minutes >= start_minutes or current_minutes < end_minutes:
                    return block
                continue

            if start_minutes <= current_minutes < end_minutes:
                return block
        
        return None

    def time_to_minutes(self, time_str):
        """Convert time string (HH:MM) to minutes since midnight."""
        hours, minutes = map(int, time_str.split(':'))
        return hours * 60 + minutes

    def temperatures_match(self, current_temp, target_temp):
        """Compare temperatures with tolerance, handling HA string states."""
        try:
            return abs(float(current_temp) - float(target_temp)) < 0.1
        except (TypeError, ValueError):
            return False

    def terminate(self):
        """Clean up on termination."""
        self.log("TRV Heating Scheduler terminated")
