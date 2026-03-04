# TRV Heating Scheduler for Home Assistant

A beautiful, Tado-inspired heating scheduler for controlling smart TRVs (Thermostatic Radiator Valves) in Home Assistant. Features a visual timeline interface, per-day scheduling, and easy copy/paste between days.

![TRV Scheduler Screenshot](screenshot.png)

## Features

✨ **Beautiful Visual Interface**
- Tado-inspired timeline view showing temperature blocks
- Color-coded temperature visualization
- Clean, modern dark theme design

📅 **Flexible Scheduling**
- Different schedules for each day of the week
- Copy and paste schedules between days
- Unlimited time blocks per day
- Drag and drop time selection

🏠 **Multi-Zone Support**
- Manage multiple rooms/zones from one interface
- Tab-based zone switching
- Independent schedules per zone

🌡️ **Temperature Control**
- Visual temperature sliders
- Customizable min/max temperatures
- Default and comfort temperature presets

🔧 **Universal Compatibility**
- Works with any climate entity (Matter, Zigbee, Z-Wave, etc.)
- Tested with Eve Thermostat via Matter
- Multiple TRVs per zone supported

## Installation

### 1. Frontend Card (via HACS)
1. Open HACS in Home Assistant.
2. Click on **Frontend**.
3. Click the three dots in the top right and select **Custom repositories**.
4. Add this repository URL (`https://github.com/damacus/trv-scheduler-card`) and select **Lovelace** as the category.
5. Search for "TRV Heating Scheduler Card" and install it.

### 2. Backend Logic (AppDaemon)
**IMPORTANT:** To actually enforce the schedules, you must install the AppDaemon component from its separate repository:

1. [TRV Heating Scheduler AppDaemon Repository](https://github.com/damacus/trv-scheduler-appdaemon)
2. Follow the installation instructions there to install via HACS (Automations category).
3. Ensure **Sync schedules to Home Assistant input_text helpers** is enabled in the card configuration.

## Configuration

### Basic Configuration

Add the card to your dashboard:

```yaml
type: custom:trv-heating-scheduler-card
title: Heating Schedule
zones:
  - id: living_room
    name: Living Room
    entities:
      - climate.living_room_trv
  - id: bedroom
    name: Bedroom
    entities:
      - climate.bedroom_trv
default_temperature: 16
comfort_temperature: 19
```

### Advanced Configuration

```yaml
type: custom:trv-heating-scheduler-card
title: Heating Schedule
zones:
  - id: living_room
    name: Living Room
    entities:
      - climate.living_room_trv
      - climate.living_room_underfloor
  - id: master_bedroom
    name: Master Bedroom
    entities:
      - climate.master_bedroom_trv
  - id: kids_room
    name: Kids Room
    entities:
      - climate.kids_room_trv_1
      - climate.kids_room_trv_2
default_temperature: 16      # Temperature when away/sleeping
comfort_temperature: 19      # Comfortable daytime temperature
min_temperature: 5          # Minimum settable temperature
max_temperature: 30         # Maximum settable temperature
time_step: 30              # Time picker step in minutes
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `title` | string | `'Heating Schedule'` | Card title |
| `zones` | list | **required** | List of zones/rooms to control |
| `default_temperature` | number | `16` | Default/away temperature (°C) |
| `comfort_temperature` | number | `19` | Comfort temperature (°C) |
| `min_temperature` | number | `5` | Minimum temperature (°C) |
| `max_temperature` | number | `30` | Maximum temperature (°C) |
| `time_step` | number | `30` | Time picker increment (minutes) |
| `use_input_helpers` | boolean | `false` | Sync schedules to `input_text` helpers (for AppDaemon/multi-device persistence) |

### Zone Configuration

Each zone requires:

| Option | Type | Description |
|--------|------|-------------|
| `id` | string | Unique identifier (lowercase, no spaces) |
| `name` | string | Display name |
| `entities` | list | Climate entity IDs to control |

## Usage

### Creating a Schedule

1. **Select a Zone**: Click the zone tab at the top
2. **Select a Day**: Click the day button
3. **Add Time Blocks**: Click "Add time block"
4. **Set Times**: Use the time pickers to set start/end times
5. **Set Temperature**: Use the slider to set the desired temperature
6. **Copy/Paste**: Use copy/paste buttons to duplicate schedules to other days

### Time Block Management

- **Edit Time**: Click on the time inputs to change start/end times
- **Change Temperature**: Drag the slider or click to set temperature
- **Delete Block**: Click the × button to remove a time block
- **Visual Timeline**: View all blocks at once in the timeline at the top

### Copy & Paste Between Days

1. Select the day you want to copy
2. Click the "Copy" button
3. Select the destination day
4. Click "Paste"
5. The schedule is now duplicated!

## Automatic Schedule Application

The card displays and edits schedules, but you need to set up automation to apply them. Choose one method:

### Option 1: AppDaemon (Recommended)

Most sophisticated option with automatic schedule application.

1. **Install AppDaemon** (if not already installed)
2. **Copy `trv_scheduler.py`** to `/config/appdaemon/apps/`
3. **Configure in `apps.yaml`:**

```yaml
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
        - climate.bedroom_trv
  default_temperature: 16
  comfort_temperature: 19
  check_interval: 60  # Check every 60 seconds
```

4. **Enable helper sync in card config** and create helpers:

```yaml
type: custom:trv-heating-scheduler-card
use_input_helpers: true
```

```yaml
input_text:
  living_room_schedule_monday:
    name: "Living Room Schedule - Monday"
    initial: '[]'
    max: 1024
```

Create one helper per zone/day: `input_text.<zone_id>_schedule_<day>`.

5. **Restart AppDaemon**

The app will automatically:
- Apply schedules based on current time
- Update TRVs when schedules change
- Handle multiple zones
- Log all temperature changes

### Option 2: Home Assistant Automations

Use built-in automations (simpler but less flexible).

1. **Create input_text helpers** for each zone/day combination:
   
   ```yaml
   input_text:
     living_room_schedule_monday:
       name: "Living Room Schedule - Monday"
       max: 255
   ```

2. **Create automation** to check and apply schedules every minute

3. **See `automations.yaml`** for a complete example

### Option 3: Node-RED

If you use Node-RED, create a flow that reads `input_text.<zone_id>_schedule_<day>` and applies temperatures based on current time.

## Troubleshooting

### Card doesn't appear

- Check that both JavaScript files are loaded in Resources (`...card.js` and `...card-editor.js`)
- Check browser console for errors (F12)
- Verify the file path is correct
- Clear browser cache (Ctrl+Shift+R)

### Schedules not applying

- Check that you've set up the automation/AppDaemon app
- Verify climate entity IDs are correct
- Check Home Assistant logs for errors
- Ensure TRVs are responsive and connected

### Can't edit schedules

- Check browser localStorage is enabled
- Verify you're not in a private/incognito window
- Try refreshing the page

### Temperature not changing

- Verify climate entities are working (test manually)
- Check entity IDs match exactly
- Ensure TRVs support temperature setting
- Check for automations that might override settings

### Time blocks overlap

- The card allows overlaps - last applied wins
- Consider deleting overlapping blocks
- Use the timeline view to visualize conflicts

## Tips & Best Practices

### Energy Efficiency

- Use 16°C for nighttime/away periods
- Set 19-20°C for comfort periods
- Consider setback periods when everyone is out
- Use lower temperatures for bedrooms (better sleep)

### Schedule Design

- Start with a basic daily pattern, then adjust
- Use copy/paste to quickly set up weekdays
- Keep weekends separate for lie-ins
- Consider your family's routine

### Multi-Zone Strategies

- Living areas: warm during evening
- Bedrooms: warm before bedtime, cool overnight
- Bathroom: warm in mornings
- Home office: warm during work hours

### Matter TRV Specific

If using Matter TRVs (like Eve Thermostat):
- Ensure Thread network is stable
- Keep border routers close to TRVs
- Update firmware regularly
- Use local control for faster response

## Development

### Building from Source

```bash
# Clone the repository
git clone https://github.com/yourusername/trv-heating-scheduler

# Make changes to the JavaScript files

# Test in Home Assistant
cp *.js /config/www/community/trv-heating-scheduler/
```

### Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Data Storage

The card stores schedules in browser **localStorage** by default.
When `use_input_helpers: true` is enabled, it also syncs schedules to Home Assistant `input_text` helpers.

Default localStorage mode:

✅ **Pros:**
- Instant updates
- No Home Assistant storage needed
- Works offline

❌ **Cons:**
- Not synced across devices
- Lost if browser data is cleared
- Not accessible to automations

Input-helper sync mode (`use_input_helpers: true`):

✅ **Pros:**
- Schedules accessible to AppDaemon/automations
- Shared across devices/browsers

❌ **Cons:**
- Requires creating helper entities in HA
- Helper values can be truncated if `max` is too low (use `1024+`)

## Roadmap

- [ ] HACS integration
- [ ] Multi-device sync
- [ ] Temperature profiles (Home/Away/Sleep)
- [ ] Holiday mode
- [ ] Boost function
- [ ] Week view with all days visible
- [ ] Import/Export schedules
- [ ] Sunrise/sunset relative times
- [ ] Weather-based adjustments

## Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/trv-heating-scheduler/issues)
- **Discussions**: [Home Assistant Community](https://community.home-assistant.io/)
- **Documentation**: [Wiki](https://github.com/yourusername/trv-heating-scheduler/wiki)

## License

MIT License - see LICENSE file for details

## Credits

- Inspired by Tado's elegant scheduling interface
- Built for the Home Assistant community
- With love for smart home automation ❤️

## Screenshots

### Main Interface
*Beautiful timeline view with temperature blocks*

### Multiple Zones
*Tab-based zone switching*

### Mobile Responsive
*Works perfectly on phones and tablets*

---

**Made with ☕ and 🏠 automation**
