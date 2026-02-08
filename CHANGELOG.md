# Changelog

All notable changes to the TRV Heating Scheduler will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-02-06

### Added
- Initial release of TRV Heating Scheduler Card
- Beautiful Tado-inspired visual interface with timeline view
- Multi-zone/room support with tab-based switching
- Per-day scheduling (7-day week)
- Copy and paste schedules between days
- Visual temperature sliders with color-coded blocks
- Support for multiple TRVs per zone
- Configurable min/max temperatures
- Default and comfort temperature presets
- AppDaemon integration for automatic schedule application
- Comprehensive documentation (README, QUICKSTART, EXAMPLES)
- Mobile-responsive design
- Dark theme optimized for Home Assistant
- Visual configuration editor
- localStorage-based schedule storage
- Installation script for easy setup

### Features
- **Visual Timeline**: Color-coded temperature blocks showing full day at a glance
- **Flexible Time Blocks**: Add, edit, delete time blocks with start/end times
- **Temperature Control**: Smooth sliders with visual feedback
- **Day Management**: Individual schedules for each day of the week
- **Copy/Paste**: Quickly duplicate schedules across days
- **Multi-Zone**: Control multiple rooms/zones independently
- **Universal Compatibility**: Works with any Home Assistant climate entity
- **Matter Support**: Tested with Eve Thermostat via Matter
- **Energy Efficient**: Set different temperatures for comfort and savings

### Documentation
- Complete README with installation and usage instructions
- Quick Start Guide for new users
- Example configurations for common scenarios
- AppDaemon automation app
- Automation YAML templates
- Troubleshooting guide

### Technical
- Pure JavaScript implementation (no build step required)
- Web Components based (customElements)
- Shadow DOM for style encapsulation
- localStorage for client-side persistence
- Responsive CSS with mobile support
- Accessible time and temperature controls

## [Unreleased]

### Planned Features
- [ ] HACS integration for easy installation
- [ ] Home Assistant entity storage (input_text) option
- [ ] Multi-device schedule sync
- [ ] Temperature profiles (Home/Away/Sleep/Holiday)
- [ ] Boost function for temporary overrides
- [ ] Week view showing all days at once
- [ ] Import/Export schedules as JSON
- [ ] Sunrise/sunset relative scheduling
- [ ] Weather-based temperature adjustments
- [ ] Heating analytics and insights
- [ ] Frost protection mode
- [ ] Geofencing integration
- [ ] Voice control support
- [ ] Presence-based automation
- [ ] Energy cost calculations

### Ideas for Future Versions
- Schedule templates (e.g., "Standard Weekday", "Weekend Lie-in")
- Learning mode (suggest schedules based on manual adjustments)
- Integration with Home Assistant scenes
- Support for cooling/AC units
- Window open detection integration
- Multi-language support
- Custom themes/styling options
- Advanced schedule validation
- Schedule conflict detection
- Historical temperature tracking
- Performance optimizations
- Offline mode improvements

---

## Version History

### Version 1.0.0 (2026-02-06)
First public release with core scheduling functionality, multi-zone support, and comprehensive documentation.

---

## Upgrade Notes

### From v0.x to v1.0
This is the first stable release. No upgrade path needed.

---

## Breaking Changes

None in v1.0.0 (initial release)

---

## Known Issues

- Schedules stored in localStorage only (not synced across devices) - Will be addressed in v1.1
- No built-in automation (requires AppDaemon or manual setup) - Improved automation coming in v1.2
- Cannot set temperatures below midnight (use 24:00 as end time) - Fix planned for v1.0.1

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for details on how to contribute to this project.

## Support

For issues, questions, or feature requests, please use the [GitHub Issues](https://github.com/yourusername/trv-heating-scheduler-card/issues) page.
