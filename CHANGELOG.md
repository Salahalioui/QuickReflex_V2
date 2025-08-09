# Changelog

All notable changes to QuickReflex will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Research-grade reaction time testing with three test modules (SRT, CRT, Go/No-Go)
- Progressive Web App functionality with offline support
- Device calibration system for timing accuracy
- Scientific data export in multiple formats (CSV, JSON, PDF, SPSS)
- Comprehensive Go/No-Go false alarm handling per scientific standards
- Mobile-first responsive design with touch optimization
- Dark mode support throughout the application
- Real-time accuracy tracking for choice reaction time tests
- Automatic outlier detection and trial exclusion
- Visual feedback system for practice trials

### Test Modules
- **Simple Reaction Time (SRT)**: Visual, auditory, and tactile stimulus options
- **Choice Reaction Time (CRT)**: 2-choice and 4-choice directional responses with spatial validation
- **Go/No-Go Test**: Inhibitory control assessment with 28/12 Go/No-Go distribution

### Technical Features
- TypeScript implementation for type safety
- Zustand state management with persistence
- Drizzle ORM with PostgreSQL database
- High-precision timing using Performance.now() API
- Service worker for offline functionality
- Responsive UI with Tailwind CSS and Shadcn/ui components

### Scientific Standards
- False alarm exclusion from reaction time calculations
- Anticipatory response detection (<100ms)
- Delayed response flagging (>1000ms for Go/No-Go, >1500ms for others)
- Statistical outlier removal using 2.5 standard deviation rule
- Comprehensive metadata collection for research validity
- Inhibition rate calculations for Go/No-Go tests

### Fixed
- STOP signal auto-disappearing after 1.5 seconds in Go/No-Go tests
- Calibration status persistence across sessions and page refreshes
- Navigation routing for Go/No-Go test access
- State management issues in timeout handling
- Accuracy calculation and display in results tables

## [1.0.0] - 2025-01-09

### Added
- Initial release of QuickReflex PWA
- Core reaction time testing functionality
- Basic user profile management
- Device calibration system
- Results visualization and export

---

## Version History

- **v1.0.0**: Initial public release with core testing modules
- **Development**: Continuous improvements based on scientific standards and user feedback