#!/bin/bash

# TRV Heating Scheduler - Installation Script
# This script automates the installation of the TRV Heating Scheduler card
# for Home Assistant

set -e

echo "================================================"
echo "TRV Heating Scheduler - Installation Script"
echo "================================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default Home Assistant config directory
HA_CONFIG_DIR="/config"

# Check if running in Home Assistant OS/Supervised
if [ ! -d "$HA_CONFIG_DIR" ]; then
    echo -e "${YELLOW}Default config directory not found.${NC}"
    read -p "Enter your Home Assistant config directory path: " HA_CONFIG_DIR
fi

if [ ! -d "$HA_CONFIG_DIR" ]; then
    echo -e "${RED}Error: Directory $HA_CONFIG_DIR does not exist!${NC}"
    exit 1
fi

echo -e "${GREEN}Using config directory: $HA_CONFIG_DIR${NC}"
echo ""

# Create www directory if it doesn't exist
WWW_DIR="$HA_CONFIG_DIR/www"
if [ ! -d "$WWW_DIR" ]; then
    echo "Creating www directory..."
    mkdir -p "$WWW_DIR"
fi

# Create card directory
CARD_DIR="$WWW_DIR/trv-scheduler"
echo "Creating card directory..."
mkdir -p "$CARD_DIR"

# Check if files exist in current directory
if [ ! -f "trv-heating-scheduler-card.js" ]; then
    echo -e "${RED}Error: trv-heating-scheduler-card.js not found in current directory!${NC}"
    echo "Please run this script from the directory containing the card files."
    exit 1
fi

# Copy files
echo "Copying card files..."
cp trv-heating-scheduler-card.js "$CARD_DIR/"
cp trv-heating-scheduler-card-editor.js "$CARD_DIR/"

echo -e "${GREEN}✓ Files copied successfully!${NC}"
echo ""

# Install AppDaemon app (optional)
read -p "Do you want to install the AppDaemon automation app? (y/n): " install_appdaemon

if [ "$install_appdaemon" == "y" ] || [ "$install_appdaemon" == "Y" ]; then
    APPDAEMON_DIR="$HA_CONFIG_DIR/appdaemon/apps"
    
    if [ ! -d "$APPDAEMON_DIR" ]; then
        echo "Creating AppDaemon apps directory..."
        mkdir -p "$APPDAEMON_DIR"
    fi
    
    if [ -f "trv_scheduler.py" ]; then
        echo "Copying AppDaemon app..."
        cp trv_scheduler.py "$APPDAEMON_DIR/"
        echo -e "${GREEN}✓ AppDaemon app installed!${NC}"
        echo ""
        echo -e "${YELLOW}Don't forget to configure apps.yaml!${NC}"
        echo "See README.md for configuration details."
    else
        echo -e "${YELLOW}Warning: trv_scheduler.py not found, skipping...${NC}"
    fi
fi

echo ""
echo "================================================"
echo "Installation Complete!"
echo "================================================"
echo ""
echo "Next steps:"
echo ""
echo "1. Add the resource to Lovelace:"
echo "   - Go to Settings → Dashboards → Resources"
echo "   - Click + ADD RESOURCE"
echo "   - URL: /local/trv-scheduler/trv-heating-scheduler-card.js"
echo "   - Type: JavaScript Module"
echo ""
echo "2. Restart Home Assistant"
echo ""
echo "3. Add the card to your dashboard:"
echo "   - Edit any dashboard"
echo "   - Click + ADD CARD"
echo "   - Search for 'TRV Heating Scheduler'"
echo ""
echo "For detailed instructions, see QUICKSTART.md"
echo ""
echo -e "${GREEN}Happy heating scheduling! 🏠🌡️${NC}"
