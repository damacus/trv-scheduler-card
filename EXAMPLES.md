# Example Lovelace Configurations

This file contains ready-to-use examples for different use cases.

## Basic Single Room

Perfect for testing or single-room setups.

```yaml
type: custom:trv-heating-scheduler-card
title: Bedroom Schedule
zones:
  - id: bedroom
    name: Bedroom
    entities:
      - climate.bedroom_trv
default_temperature: 16
comfort_temperature: 19
```

## Family Home - Multiple Rooms

Complete setup for a typical family home with 4 zones.

```yaml
type: custom:trv-heating-scheduler-card
title: Home Heating Schedule
zones:
  - id: living_room
    name: Living Room
    entities:
      - climate.living_room_trv
  - id: master_bedroom
    name: Master Bedroom
    entities:
      - climate.master_bedroom_trv
  - id: kids_bedroom
    name: Kids Bedroom
    entities:
      - climate.kids_bedroom_trv
  - id: bathroom
    name: Bathroom
    entities:
      - climate.bathroom_trv
default_temperature: 16
comfort_temperature: 20
min_temperature: 10
max_temperature: 25
```

## Open Plan Living

Single zone with multiple TRVs (e.g., large open-plan area).

```yaml
type: custom:trv-heating-scheduler-card
title: Ground Floor Heating
zones:
  - id: ground_floor
    name: Ground Floor
    entities:
      - climate.living_room_trv_left
      - climate.living_room_trv_right
      - climate.kitchen_trv
      - climate.dining_area_trv
default_temperature: 17
comfort_temperature: 21
```

## Energy Saving Configuration

Optimized for maximum energy savings.

```yaml
type: custom:trv-heating-scheduler-card
title: Eco Heating Schedule
zones:
  - id: living_room
    name: Living Room
    entities:
      - climate.living_room_trv
  - id: bedroom
    name: Bedroom
    entities:
      - climate.bedroom_trv
default_temperature: 15  # Lower default for savings
comfort_temperature: 19  # Moderate comfort temp
min_temperature: 12
max_temperature: 22
```

## Complete Dashboard Example

Full dashboard with scheduler and additional heating controls.

```yaml
title: Heating Control
path: heating
icon: mdi:radiator
badges: []
cards:
  # Main heating scheduler
  - type: custom:trv-heating-scheduler-card
    title: Weekly Heating Schedule
    zones:
      - id: downstairs
        name: Downstairs
        entities:
          - climate.living_room_trv
          - climate.kitchen_trv
      - id: upstairs
        name: Upstairs
        entities:
          - climate.master_bedroom_trv
          - climate.bedroom_2_trv
      - id: bathroom
        name: Bathroom
        entities:
          - climate.bathroom_trv
    default_temperature: 16
    comfort_temperature: 20

  # Quick temperature overrides
  - type: horizontal-stack
    cards:
      - type: button
        name: Boost All
        icon: mdi:fire
        tap_action:
          action: call-service
          service: climate.set_temperature
          service_data:
            temperature: 22
          target:
            entity_id: 
              - climate.living_room_trv
              - climate.kitchen_trv
              - climate.master_bedroom_trv
              - climate.bedroom_2_trv
      
      - type: button
        name: Away Mode
        icon: mdi:home-export-outline
        tap_action:
          action: call-service
          service: climate.set_temperature
          service_data:
            temperature: 15
          target:
            entity_id:
              - climate.living_room_trv
              - climate.kitchen_trv
              - climate.master_bedroom_trv
              - climate.bedroom_2_trv

  # Current temperatures
  - type: entities
    title: Current Temperatures
    entities:
      - entity: climate.living_room_trv
        name: Living Room
      - entity: climate.kitchen_trv
        name: Kitchen
      - entity: climate.master_bedroom_trv
        name: Master Bedroom
      - entity: climate.bedroom_2_trv
        name: Bedroom 2

  # Energy usage
  - type: energy-date-selection
```

## Grid Layout Example

Compact layout using the grid card.

```yaml
type: grid
square: false
columns: 1
cards:
  - type: custom:trv-heating-scheduler-card
    title: Heating Schedule
    zones:
      - id: downstairs
        name: Downstairs
        entities:
          - climate.downstairs_trv
      - id: upstairs
        name: Upstairs
        entities:
          - climate.upstairs_trv
    default_temperature: 16
    comfort_temperature: 19
```

## Tablet/Wall Display Configuration

Optimized for wall-mounted tablets.

```yaml
type: custom:trv-heating-scheduler-card
title: House Heating
zones:
  - id: zone1
    name: Ground Floor
    entities:
      - climate.living_trv
      - climate.kitchen_trv
  - id: zone2
    name: First Floor
    entities:
      - climate.bedroom1_trv
      - climate.bedroom2_trv
  - id: zone3
    name: Second Floor
    entities:
      - climate.bedroom3_trv
      - climate.bathroom_trv
default_temperature: 16
comfort_temperature: 20
min_temperature: 10
max_temperature: 28
```

## Matter TRV Specific (Eve Thermostat)

Configuration optimized for Matter-based TRVs like Eve Thermostat.

```yaml
type: custom:trv-heating-scheduler-card
title: Eve Thermostat Schedule
zones:
  - id: living_room
    name: Living Room
    entities:
      - climate.eve_thermo_living_room
  - id: bedroom
    name: Bedroom
    entities:
      - climate.eve_thermo_bedroom
  - id: office
    name: Home Office
    entities:
      - climate.eve_thermo_office
default_temperature: 16
comfort_temperature: 19.5
min_temperature: 7      # Eve supports down to 7°C
max_temperature: 28     # Eve max is 28°C
time_step: 30          # 30-minute increments
```

## Home Office Setup

Special configuration for home workers.

```yaml
type: custom:trv-heating-scheduler-card
title: Home Office Heating
zones:
  - id: office
    name: Home Office
    entities:
      - climate.office_trv
  - id: living_room
    name: Living Room
    entities:
      - climate.living_room_trv
default_temperature: 15
comfort_temperature: 20  # Higher for work hours
min_temperature: 12
max_temperature: 24
```

**Typical Schedule for Home Office:**
- **Monday-Friday:**
  - 00:00-07:00: 15°C (night)
  - 07:00-09:00: 20°C (morning prep)
  - 09:00-17:00: 21°C (work hours - high comfort)
  - 17:00-22:00: 19°C (evening)
  - 22:00-24:00: 15°C (night)

- **Saturday-Sunday:**
  - 00:00-09:00: 15°C (sleep in)
  - 09:00-22:00: 19°C (relaxed comfort)
  - 22:00-24:00: 15°C (night)

## Rental/Apartment

Simple setup for rental properties.

```yaml
type: custom:trv-heating-scheduler-card
title: Apartment Heating
zones:
  - id: apartment
    name: Whole Apartment
    entities:
      - climate.bedroom_trv
      - climate.living_room_trv
default_temperature: 16
comfort_temperature: 19
```

## Holiday Home

Configuration for vacation properties.

```yaml
type: custom:trv-heating-scheduler-card
title: Holiday Home Heating
zones:
  - id: ground_floor
    name: Ground Floor
    entities:
      - climate.living_trv
      - climate.kitchen_trv
  - id: first_floor
    name: Bedrooms
    entities:
      - climate.bedroom1_trv
      - climate.bedroom2_trv
default_temperature: 12  # Frost protection when away
comfort_temperature: 21  # Extra comfort when occupied
min_temperature: 8
max_temperature: 24
```

## Tips for Each Configuration

### Single Room
- Perfect for beginners
- Test all features before expanding
- Easy to troubleshoot

### Multiple Rooms
- Use meaningful zone names
- Group similar areas together
- Consider zone heating patterns

### Open Plan
- All TRVs set to same temperature
- Prevents fighting between units
- Ensures even heating

### Energy Saving
- Lower default temperatures
- Shorter comfort periods
- Use presence detection to override

### Wall Display
- Larger text for visibility
- More zones visible at once
- Consider read-only mode

### Matter Devices
- Respect device limitations
- Test Thread network reliability
- Keep firmware updated

## Advanced YAML Tips

### Using Anchors for Repeated Entities

```yaml
# Define common entities
common_entities: &living_entities
  - climate.living_trv_1
  - climate.living_trv_2

# Use in card
type: custom:trv-heating-scheduler-card
zones:
  - id: living
    name: Living Room
    entities: *living_entities
```

### Template-Based Configuration

```yaml
type: custom:trv-heating-scheduler-card
zones:
  - id: "{{ zone_id }}"
    name: "{{ zone_name }}"
    entities:
      - climate.{{ zone_id }}_trv
```

---

**Choose the configuration that matches your needs and customize it!**
