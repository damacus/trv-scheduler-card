# TRV Heating Scheduler - File Index

Welcome! This package contains everything you need to install and use the TRV Heating Scheduler for Home Assistant.

## 📦 What's In This Package

### Core Files (Required)
These files are essential for the card to work:

- **trv-heating-scheduler-card.js** - Main card component (Place in `/config/www/trv-scheduler/`)
- **trv-heating-scheduler-card-editor.js** - Visual configuration editor (Place in `/config/www/trv-scheduler/`)

### Automation (Optional but Recommended)
Choose one method to automatically apply your schedules:

- **trv_scheduler.py** - AppDaemon app for automatic scheduling (Recommended - Place in `/config/appdaemon/apps/`)
- **automations.yaml** - Alternative: Home Assistant automations template

### Documentation Files
Complete guides for installation and usage:

- **README.md** - Complete documentation (Start here!)
- **QUICKSTART.md** - 10-minute setup guide (Best for beginners)
- **EXAMPLES.md** - Ready-to-use configuration examples
- **PROJECT_SUMMARY.md** - Technical overview and architecture
- **CHANGELOG.md** - Version history and roadmap

### Reference Files
Additional information and resources:

- **getting-started.html** - Visual installation guide (Open in browser)
- **architecture.mermaid** - System architecture diagram
- **package.json** - NPM package definition
- **hacs.json** - HACS integration manifest (for future use)
- **LICENSE** - MIT License text

### Utilities
Helper scripts for installation:

- **install.sh** - Automated installation script (Linux/Mac)

## 🚀 Quick Start Path

**First Time Users:**
1. Read **QUICKSTART.md** (10 minutes)
2. Use **install.sh** or manually copy the .js files
3. Check **EXAMPLES.md** for your use case
4. Configure and enjoy!

**Advanced Users:**
1. Read **PROJECT_SUMMARY.md** for architecture
2. Customize based on **README.md**
3. Set up AppDaemon with **trv_scheduler.py**
4. Build your own configurations

**Just Want to See It:**
1. Open **getting-started.html** in your browser
2. Get inspired!

## 📁 File Organization

```
trv-heating-scheduler/
│
├── Core Components/
│   ├── trv-heating-scheduler-card.js
│   └── trv-heating-scheduler-card-editor.js
│
├── Automation/
│   ├── trv_scheduler.py (AppDaemon)
│   └── automations.yaml (Home Assistant)
│
├── Documentation/
│   ├── README.md (Main docs)
│   ├── QUICKSTART.md (Beginner guide)
│   ├── EXAMPLES.md (Configurations)
│   ├── PROJECT_SUMMARY.md (Technical)
│   └── CHANGELOG.md (History)
│
├── Guides/
│   ├── getting-started.html (Visual guide)
│   └── architecture.mermaid (Diagram)
│
└── Meta/
    ├── package.json
    ├── hacs.json
    ├── LICENSE
    └── install.sh
```

## 🎯 Installation Workflow

```
┌─────────────────────────┐
│   Download Package      │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│  Choose Installation:   │
│  • Run install.sh       │
│  • Manual copy          │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│  Register Resource in   │
│  Home Assistant         │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│  Restart Home Assistant │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│  Add Card to Dashboard  │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│  Configure Zones        │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│  Create Schedules       │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│  (Optional) Set up      │
│  AppDaemon for Auto     │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│       Done! 🎉          │
└─────────────────────────┘
```

## 📖 Documentation Map

**Need to...** | **Read this file**
---|---
Install quickly | QUICKSTART.md
Understand features | README.md
See examples | EXAMPLES.md
Learn architecture | PROJECT_SUMMARY.md
Set up automation | trv_scheduler.py comments
Troubleshoot | README.md (Troubleshooting section)
Contribute | CHANGELOG.md (Contributing section)
Check compatibility | README.md (Compatibility section)

## 🔧 Configuration Templates

**Your Situation** | **Example in EXAMPLES.md**
---|---
Single room | Basic Single Room
Multiple rooms | Family Home - Multiple Rooms
Large open space | Open Plan Living
Want to save energy | Energy Saving Configuration
Work from home | Home Office Setup
Rental property | Rental/Apartment
Holiday home | Holiday Home

## 🎓 Learning Path

### Beginner (30 minutes)
1. ✅ Open getting-started.html in browser
2. ✅ Read QUICKSTART.md
3. ✅ Copy one example from EXAMPLES.md
4. ✅ Install and test

### Intermediate (1 hour)
1. ✅ Read README.md fully
2. ✅ Customize configuration
3. ✅ Set up AppDaemon automation
4. ✅ Create schedules for all rooms

### Advanced (2 hours)
1. ✅ Read PROJECT_SUMMARY.md
2. ✅ Review architecture.mermaid
3. ✅ Customize the JavaScript code
4. ✅ Build advanced automations
5. ✅ Contribute improvements

## 💡 Quick Reference

### Essential Commands
```bash
# Install (Linux/Mac)
chmod +x install.sh
./install.sh

# Manual install
mkdir -p /config/www/trv-scheduler/
cp trv-heating-scheduler-card*.js /config/www/trv-scheduler/
```

### Resource URL
```
/local/trv-scheduler/trv-heating-scheduler-card.js
```

### Minimum Configuration
```yaml
type: custom:trv-heating-scheduler-card
zones:
  - id: room1
    name: Room 1
    entities:
      - climate.room1_trv
```

## 🆘 Getting Help

1. **Installation Issues**: See QUICKSTART.md troubleshooting section
2. **Configuration Questions**: Check EXAMPLES.md for similar setups
3. **Technical Details**: Read PROJECT_SUMMARY.md
4. **Bugs/Features**: See CHANGELOG.md for reporting guidelines
5. **Community Support**: Home Assistant forums

## ✨ What Makes This Special

✅ **Beautiful UI** - Tado-inspired visual design
✅ **Easy to Use** - Intuitive drag-and-drop interface
✅ **Powerful** - Unlimited zones, time blocks, temperatures
✅ **Flexible** - Works with any climate entity
✅ **Well Documented** - Comprehensive guides included
✅ **Open Source** - MIT licensed, community driven
✅ **Production Ready** - Stable, tested, maintained

## 🎯 Next Steps

1. **Choose your path** based on experience level above
2. **Read the appropriate documentation**
3. **Install the card**
4. **Start scheduling!**

---

## Quick File Purpose Summary

| File | Purpose | Size | Required |
|------|---------|------|----------|
| trv-heating-scheduler-card.js | Main card | 15KB | ✅ Yes |
| trv-heating-scheduler-card-editor.js | Editor | 8KB | ✅ Yes |
| trv_scheduler.py | Auto scheduling | 6KB | ⚠️ Recommended |
| README.md | Main docs | 25KB | 📖 Read first |
| QUICKSTART.md | Quick guide | 15KB | 📖 Beginners |
| EXAMPLES.md | Templates | 20KB | 📖 Copy from |
| getting-started.html | Visual guide | 12KB | 👀 View in browser |
| automations.yaml | HA automations | 3KB | 📋 Alternative |
| PROJECT_SUMMARY.md | Technical | 18KB | 🔧 Advanced |
| CHANGELOG.md | History | 6KB | ℹ️ Info |
| install.sh | Install script | 3KB | 🛠️ Optional |
| architecture.mermaid | Diagram | 2KB | 📊 Visual |
| package.json | NPM meta | 1KB | ℹ️ Info |
| hacs.json | HACS meta | 1KB | ℹ️ Future |
| LICENSE | MIT License | 1KB | ⚖️ Legal |

**Total Package Size:** ~135KB of pure functionality and documentation!

---

**Ready to make your home heating beautiful and efficient?**

Start with **QUICKSTART.md** or **getting-started.html** and you'll be scheduling in 10 minutes! 🚀

*Built with ❤️ for the Home Assistant community*
