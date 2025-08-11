# Changelog

All notable changes to QuickReflex will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.1.0] - 2025-01-11

### Added - Movement Initiation Time (MIT) Integration
- **Complete MIT Testing System**: 30-tap finger tapping protocol with ICC reliability calculations
- **MIT Database Integration**: Full storage, retrieval, and management of MIT calibration data
- **MIT-Corrected Analysis**: All reaction time measurements now subtract individual MIT values
- **Settings MIT Display**: Calibration menu shows current MIT status, reliability metrics, and standard deviation
- **Cross-Modal Scientific Warnings**: Proper research disclaimers when comparing across different stimulus modalities
- **MIT Export Integration**: All export formats (CSV, JSON, PDF, SPSS) include comprehensive MIT data and corrections
- **Enhanced Results Analysis**: MIT-corrected reaction time displays with cognitive processing time isolation

### Fixed - Export System Comprehensive Repairs
- **Date Handling Issues**: Resolved date conversion errors in CSV and PDF exports that caused function failures
- **Database Method Restoration**: Fixed missing `getTestSessions()` database method causing MIT data loading errors
- **PDF Export Functionality**: Corrected multiple date formatting issues in PDF generation pipeline
- **CSV Export Compatibility**: Enhanced date field handling for reliable CSV data export
- **SPSS Export Parameters**: Fixed function signature to properly accept export data parameters
- **TypeScript Compatibility**: Resolved all type errors and compatibility issues across the codebase

### Enhanced - Scientific Validation and Research Compliance
- **MIT Reliability Metrics**: Automatic ICC (Intraclass Correlation) and standard deviation calculations
- **Cognitive Processing Focus**: MIT removal isolates pure cognitive response time from motor initiation
- **Research-Grade Metadata**: Complete MIT test results, calibration timestamps, and reliability data in exports
- **Cross-Modal Warnings**: Scientific disclaimers for comparing MIT and reaction times across modalities
- **Enhanced Error Handling**: Detailed error logging and graceful failure handling throughout the system

### Changed - Architecture and Performance Improvements
- **Database Integration**: Complete MIT data flow from testing → storage → display → export
- **Export Data Structure**: Enhanced to include MIT corrections, raw data, and comprehensive metadata
- **Results Page Analysis**: Real-time MIT-corrected reaction time calculations and displays
- **Settings Calibration Menu**: Comprehensive MIT calibration status with reliability indicators
- **Error Logging**: Enhanced export error reporting with detailed diagnostic information

### Technical Improvements
- **Date Object Handling**: Robust date conversion for all timestamp fields in export functions
- **Type Safety**: Enhanced TypeScript definitions for MIT data structures and export interfaces
- **Database Methods**: Complete IndexedDB method implementations for MIT data persistence
- **React State Management**: Proper MIT data loading and error state handling
- **Export Validation**: Comprehensive data validation before export processing

### Documentation Updates
- **README Enhancement**: Complete MIT methodology documentation and usage guidelines
- **Replit.md Updates**: Comprehensive project architecture documentation with MIT integration
- **Scientific Citations**: Updated references to include MIT methodology from motor control literature
- **Performance Guidelines**: MIT-specific timing accuracy and calibration recommendations

## [2.0.0] - 2024-12-15

### Added - Initial Research-Grade Implementation
- **Core Test Modules**: SRT, CRT (2-choice/4-choice), and Go/No-Go reaction time tests
- **Multi-Modal Stimuli**: Visual, auditory, and tactile stimulus presentation across all test types
- **Device Calibration**: Systematic latency correction and timing validation system
- **Progressive Web App**: Complete PWA implementation with offline functionality
- **Export System**: Multiple data export formats (CSV, JSON, PDF, SPSS) with research metadata
- **Statistical Analysis**: Automated outlier detection, reliability metrics, and data cleaning
- **Mobile Optimization**: Touch-friendly interface with responsive design for all device types

### Technical Foundation
- **React TypeScript Frontend**: Modern web application with Vite development environment
- **Express Backend**: RESTful API with PostgreSQL database integration
- **Drizzle ORM**: Type-safe database operations and schema management
- **IndexedDB Storage**: Client-side data persistence for offline functionality
- **Recharts Visualization**: Interactive data visualization and performance trend analysis

## [1.0.0] - 2024-11-01

### Added - Foundation Release
- **Basic SRT Testing**: Simple Reaction Time measurement with visual stimuli
- **User Profile System**: Profile creation and management for personalized testing
- **Device Calibration Framework**: Initial timing accuracy improvements
- **Data Storage**: Basic test result storage and retrieval
- **PWA Foundation**: Service worker and manifest for app-like behavior

### Technical Implementation
- **Project Structure**: React + TypeScript frontend with Express backend
- **Database Schema**: Initial PostgreSQL schema with Drizzle ORM
- **UI Components**: Shadcn/ui component library integration
- **Development Environment**: Vite build system and development server