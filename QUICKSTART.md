# Quick Start Guide - TRV Heating Scheduler

Get your heating scheduler up and running in 10 minutes!

## Prerequisites

- ✅ Home Assistant installed and running
- ✅ At least one climate entity (TRV) configured
- ✅ Access to your Home Assistant configuration directory

## Step 1: Install the Card (5 minutes)

### 1.1 Download Files

Download these two files:
- `trv-heating-scheduler-card.js`
- `trv-heating-scheduler-card-editor.js`

### 1.2 Upload to Home Assistant

**Option A - Using File Editor Add-on:**

1. Install "File Editor" add-on (if not installed):
   - Settings → Add-ons → Add-on Store → File Editor → Install
2. Open File Editor
3. Create folder: Click the folder icon → New Folder → `/www/trv-scheduler/`
4. Upload both `.js` files to this folder

**Option B - Using SSH/Terminal:**

```bash
# SSH into your Home Assistant
ssh root@homeassistant.local

# Create directory
mkdir -p /config/www/trv-scheduler/

# Upload files (use SCP or file transfer)
# Then move them:
mv trv-heating-scheduler-card.js /config/www/trv-scheduler/
mv trv-heating-scheduler-card-editor.js /config/www/trv-scheduler/
```

**Option C - Using Samba Share:**

1. Access your Home Assistant via network share
2. Navigate to `config/www/`
3. Create folder `trv-scheduler`
4. Copy both files into the folder

### 1.3 Register the Resource

1. Go to **Settings** → **Dashboards**
2. Click the **⋮** menu (top right)
3. Select **Resources**
4. Click **+ ADD RESOURCE**
5. Fill in:
   - **URL:** `/local/trv-scheduler/trv-heating-scheduler-card.js`
   - **Resource type:** JavaScript Module
6. Click **CREATE**
7. **Restart Home Assistant**: Settings → System → Restart

## Step 2: Add the Card (2 minutes)

### 2.1 Find Your Climate Entity IDs

1. Go to **Settings** → **Devices & Services**
2. Find your TRVs (look for climate entities)
3. Note down the entity IDs (e.g., `climate.bedroom_trv`)

### 2.2 Add Card to Dashboard

1. Open any dashboard
2. Click **Edit Dashboard** (top right)
3. Click **+ ADD CARD**
4. Search for "TRV Heating Scheduler"
5. Click on it

### 2.3 Configure the Card

In the visual editor that appears:

1. **Card Title:** "Heating Schedule" (or your preference)
2. **Temperature Settings:**
   - Default Temperature: 16°C
   - Comfort Temperature: 19°C
3. **Zones/Rooms:** Click "+ Add Zone"
   - Zone Name: "Living Room" (or your room name)
   - Select your climate entity from the dropdown
4. Add more zones as needed
5. Click **SAVE**

## Step 3: Create Your First Schedule (3 minutes)

### 3.1 Set Up Monday

1. Click on **"Mon"** day button
2. You'll see default time blocks
3. Click on a time block to edit:
   - **00:00 - 06:00**: Keep at 16°C (sleeping)
   - **06:00 - 18:00**: Change to 19°C (daytime comfort)
   - **18:00 - 24:00**: Keep at 16°C (away/evening setback)

### 3.2 Adjust to Your Routine

Example for typical family:

**Weekdays:**
- **00:00 - 06:30**: 16°C (sleeping)
- **06:30 - 08:00**: 20°C (morning warmth)
- **08:00 - 16:00**: 16°C (away at work/school)
- **16:00 - 22:00**: 19°C (evening comfort)
- **22:00 - 24:00**: 16°C (bedtime)

To create this:
1. Click "Add time block"
2. Set start time: 06:30
3. Set end time: 08:00
4. Set temperature: 20°C
5. Repeat for other blocks

### 3.3 Copy to Other Days

1. With Monday configured, click **"Copy"** button
2. Click **"Tue"** day button
3. Click **"Paste"** button
4. Repeat for Wednesday through Friday
5. Adjust weekends separately (maybe sleep in until 8am?)

## Step 4: Enable Automatic Application (Optional but Recommended)

Your schedules are now created, but they won't apply automatically yet. Choose one:

### Quick Method - Manual Control

Test it first! At any time:
1. Look at the timeline to see current temperature block
2. Your TRVs will show the scheduled temperature
3. Manually verify it's working

### Automatic Method - AppDaemon

If you want hands-free automation:

1. **Install AppDaemon:**
   - Settings → Add-ons → Add-on Store
   - Search "AppDaemon"
   - Install and Start

2. **Configure AppDaemon:**
   
   Create/edit `/config/appdaemon/apps/apps.yaml`:
   ```yaml
   trv_scheduler:
     module: trv_scheduler
     class: TRVHeatingScheduler
     zones:
       - name: "Living Room"
         id: "living_room"
         entities:
           - climate.living_room_trv  # Your entity here
     default_temperature: 16
     comfort_temperature: 19
   ```

3. **Add the Python App:**
   - Copy `trv_scheduler.py` to `/config/appdaemon/apps/`

4. **Restart AppDaemon:**
   - Settings → Add-ons → AppDaemon → Restart

5. **Done!** Your schedules now apply automatically.

## Example Configurations

### Single Room Setup

```yaml
type: custom:trv-heating-scheduler-card
title: Bedroom Heating
zones:
  - id: bedroom
    name: Bedroom
    entities:
      - climate.bedroom_trv
default_temperature: 16
comfort_temperature: 18
```

### Multi-Room House

```yaml
type: custom:trv-heating-scheduler-card
title: House Heating Schedule
zones:
  - id: living_room
    name: Living Room
    entities:
      - climate.living_room_trv
  - id: master_bedroom
    name: Master Bedroom
    entities:
      - climate.master_bed_trv
  - id: kids_room
    name: Kids Room
    entities:
      - climate.kids_trv_1
      - climate.kids_trv_2
  - id: bathroom
    name: Bathroom
    entities:
      - climate.bathroom_trv
default_temperature: 16
comfort_temperature: 20
max_temperature: 25
```

### Zone with Multiple TRVs

```yaml
type: custom:trv-heating-scheduler-card
title: Open Plan Living
zones:
  - id: open_plan
    name: Living/Kitchen/Dining
    entities:
      - climate.living_trv_1
      - climate.living_trv_2
      - climate.kitchen_trv
      - climate.dining_trv
default_temperature: 17
comfort_temperature: 21
```

## Troubleshooting

### "Card not found" error
- Did you add the resource in Settings → Dashboards → Resources?
- Did you restart Home Assistant after adding the resource?
- Check the URL is exactly: `/local/trv-scheduler/trv-heating-scheduler-card.js`

### Card shows but no zones appear
- Did you configure at least one zone?
- Check that entity IDs are correct (no typos)
- Verify climate entities exist in Settings → Devices & Services

### Schedule created but temperature not changing
- This is normal! Schedules need automation to apply
- Either use manual control or set up AppDaemon
- See Step 4 above

### Can't see the timeline/colors
- The timeline shows all your time blocks visually
- Each block is color-coded by temperature (blue=cool, orange=warm)
- If empty, you need to create time blocks first

### Lost my schedules
- Schedules are stored in browser localStorage
- Clearing browser data will delete them
- For now, avoid private/incognito mode
- Future version will support cloud storage

## Next Steps

✅ **Basic**: You now have a working heating scheduler!

🎯 **Improve**:
- Fine-tune temperatures for comfort and efficiency
- Set up different schedules for weekdays vs weekends
- Add boost buttons for quick overrides
- Install AppDaemon for automatic scheduling

📊 **Monitor**:
- Track energy usage in Home Assistant Energy dashboard
- Compare heating costs before/after scheduler
- Adjust schedules based on actual comfort levels

💡 **Advanced**:
- Create automations for away mode
- Integrate with presence detection
- Add weather-based temperature adjustments
- Use Home Assistant scenes for different modes

## Support & Community

Need help?

- 📖 **Full Documentation**: See README.md
- 💬 **Community Forum**: Home Assistant Community
- 🐛 **Bug Reports**: GitHub Issues
- ⭐ **Feature Requests**: GitHub Discussions

## Tips for Success

1. **Start Simple**: Begin with one room, get comfortable, then expand
2. **Test First**: Watch it work for a day before enabling automation
3. **Energy Savings**: Every 1°C lower saves ~7% on heating costs
4. **Comfort First**: Don't sacrifice comfort for savings - find your balance
5. **Iterate**: Adjust schedules weekly until you find what works

**Happy Scheduling! 🏠🌡️**
