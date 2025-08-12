# QuickReflex - Reaction Time Testing PWA

## Overview

QuickReflex is a research-grade Progressive Web App (PWA) designed for measuring and training reaction time in athletes, coaches, and researchers. The application implements multiple reaction time testing modules including Simple Reaction Time (SRT), Choice Reaction Time (CRT), and Go/No-Go tests across visual, auditory, and tactile stimulus types, with comprehensive Movement Initiation Time (MIT) integration.

The system is built as a full-stack TypeScript application with a React frontend and Express backend, utilizing PostgreSQL for data persistence and IndexedDB for offline functionality. The architecture emphasizes precision timing, mobile-first design, and research-grade data collection with MIT correction capabilities and comprehensive export functionality.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Major Enhancements (January 2025)

### Movement Initiation Time (MIT) Integration - COMPLETED
- ✅ **Complete MIT Testing System**: 30-tap finger tapping protocol with reliability calculations
- ✅ **MIT Database Integration**: Full storage and retrieval of MIT calibration data
- ✅ **MIT-Corrected Analysis**: All reaction time measurements now subtract individual MIT values
- ✅ **Settings MIT Display**: Calibration menu shows current MIT status, reliability metrics
- ✅ **Export MIT Integration**: All export formats (CSV, JSON, PDF, SPSS) include MIT data and corrections
- ✅ **Cross-Modal Scientific Warnings**: Proper research disclaimers for modality comparisons

### Export System Enhancements - COMPLETED
- ✅ **Fixed Date Handling**: Resolved date conversion errors in CSV and PDF exports
- ✅ **Complete Export Functionality**: All formats (CSV, JSON, PDF, SPSS) working perfectly
- ✅ **Enhanced Error Logging**: Detailed error reporting for troubleshooting
- ✅ **MIT Data Inclusion**: Comprehensive MIT metadata in all export formats
- ✅ **Professional PDF Reports**: Complete redesign with branded headers, footers, and scientific methodology documentation

### Database and Architecture Improvements - COMPLETED  
- ✅ **Database Method Restoration**: Fixed missing getTestSessions() database method
- ✅ **TypeScript Compatibility**: Resolved all type errors and compatibility issues
- ✅ **Enhanced Data Flow**: Complete MIT data integration from testing → storage → display → export
- ✅ **Robust Error Handling**: Improved error messages and graceful failure handling

### System Refinements (January 2025) - COMPLETED
- ✅ **Full Battery Removal**: Completely removed Full Battery test functionality and all associated logic
- ✅ **Individual Test Focus**: Streamlined to only include separate test modules (SRT, CRT, Go/No-Go, MIT)
- ✅ **Schema Cleanup**: Updated database schema and type definitions to remove BATTERY test type
- ✅ **UI Simplification**: Removed Full Battery cards from Dashboard and TestSelect components
- ✅ **Outlier Method Integration**: Enhanced UI with outlier detection method selection and results display

### Speed-Accuracy Trade-off & Critical Bug Fixes (January 2025) - COMPLETED
- ✅ **IES Implementation**: Added Inverse Efficiency Score (IES = MeanRT ÷ ProportionCorrect) for CRT and Go/No-Go tests
- ✅ **Fixed Accuracy Bug**: Corrected critical issue where errors were excluded as outliers instead of being included in accuracy calculations
- ✅ **Proper RT Filtering**: Only correct responses now used for RT outlier analysis, all responses used for accuracy
- ✅ **Enhanced PDF Reports**: Added IES metrics and comprehensive methodology documentation to export functionality
- ✅ **Scientific Compliance**: Fixed accuracy calculations to show realistic performance (not artificial 100%)
- ✅ **Vercel Deployment**: Fixed critical deployment issues with simplified static build configuration

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript and Vite for fast development and building
- **UI Components**: Shadcn/ui component library with Radix UI primitives for accessibility
- **Styling**: Tailwind CSS with CSS variables for theming and responsive design
- **State Management**: Zustand for global state with persistence middleware
- **Client-Side Storage**: IndexedDB through custom wrapper for offline data persistence
- **Routing**: Wouter for lightweight client-side routing
- **PWA Features**: Service worker for offline functionality and app-like behavior

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Development Server**: Vite integration for hot module replacement in development
- **Storage Interface**: Abstracted storage layer with in-memory implementation and database migration capability
- **API Structure**: RESTful endpoints with /api prefix for client-server communication

### Data Layer
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Schema Management**: Drizzle Kit for migrations and schema synchronization
- **Connection**: Neon Database serverless PostgreSQL for cloud deployment
- **Local Storage**: IndexedDB for offline capability and data synchronization

### Core Timing System
- **Precision Timing**: Performance.now() API for high-resolution timestamps
- **Event Handling**: Pointer events for cross-device compatibility
- **Frame Synchronization**: RequestAnimationFrame for precise visual cue display
- **Latency Correction**: Manual calibration system with device-specific offset calculations
- **Audio Preloading**: Pre-cached audio files for auditory stimulus delivery

### Test Module Architecture
- **Individual Module Design**: Separate implementations for SRT, CRT (2-choice/4-choice), Go/No-Go tests, and MIT testing
- **MIT Integration**: Complete Movement Initiation Time testing and correction system with finger-tapping protocol
- **Configurable Parameters**: Customizable trial counts, inter-stimulus intervals, practice sessions, and outlier detection methods
- **Advanced Data Cleaning**: Multiple outlier detection algorithms (MAD, IQR, Percentage Trim, Standard Deviation)
- **Validation Suite**: Built-in reliability calculations (ICC, CV%) with MIT reliability metrics
- **Cross-Modal Warnings**: Scientific disclaimers for comparing across different stimulus modalities
- **Streamlined Focus**: Individual test modules only - no combined battery functionality

### Export and Analysis System
- **Multiple Formats**: CSV, JSON, PDF summary reports, and SPSS-compatible data with MIT integration
- **Professional PDF Reports**: Branded reports with headers, footers, structured sections, and comprehensive scientific methodology
- **MIT-Corrected Exports**: All export formats include Movement Initiation Time corrections and raw data
- **Comprehensive Metadata**: Device information, calibration data, MIT reliability metrics, outlier detection methods, and test configuration
- **Statistical Analysis**: Automated calculation of MIT-corrected descriptive statistics and reliability metrics
- **Visualization**: Recharts integration for MIT-corrected data visualization and trend analysis
- **Scientific Compliance**: Cross-modal warnings, research disclaimers, and methodology documentation included in exports
- **Outlier Method Documentation**: Complete tracking and reporting of outlier detection methods used in each session

### Progressive Web App Features
- **Offline Capability**: Full functionality without internet connection through service worker caching
- **App-like Experience**: Native app behavior with installation prompts and standalone display
- **Mobile Optimization**: Touch-friendly interface with responsive design patterns
- **Cross-Platform**: Consistent experience across desktop, tablet, and mobile devices

## Deployment Configuration

### Vercel Deployment - COMPLETED
- ✅ **Vercel Configuration**: Complete vercel.json with proper routing and functions
- ✅ **Serverless Function**: Custom api/index.js for Vercel deployment compatibility  
- ✅ **PWA Asset Handling**: Proper MIME types for manifest.json, sw.js, and SVG icons
- ✅ **Static Build**: Optimized build process for Vercel's static + serverless architecture
- ✅ **Deployment Guide**: Comprehensive DEPLOYMENT.md with step-by-step instructions

The application is now fully configured for Vercel deployment with automatic builds, proper PWA asset serving, and serverless function handling. The configuration handles both the React frontend and Express backend seamlessly.

## External Dependencies

### Database and Storage
- **PostgreSQL**: Primary database using Neon Database serverless platform
- **Drizzle ORM**: Type-safe database operations and schema management
- **IndexedDB**: Client-side storage for offline functionality

### UI and Styling
- **Radix UI**: Accessible component primitives for complex UI elements
- **Tailwind CSS**: Utility-first CSS framework for responsive styling
- **Lucide React**: Icon library for consistent iconography
- **React Hook Form**: Form validation and state management

### Charts and Visualization
- **Recharts**: React charting library for data visualization
- **jsPDF**: PDF generation for summary reports
- **Embla Carousel**: Touch-friendly carousel component

### Development and Build Tools
- **Vite**: Fast build tool and development server
- **TypeScript**: Type safety across frontend and backend
- **ESLint/Prettier**: Code quality and formatting tools
- **Husky**: Git hooks for pre-commit validation

### Testing and Validation
- **React Testing Library**: Component testing utilities
- **Jest/Vitest**: Unit testing framework for validation algorithms
- **Zod**: Runtime type validation and schema definition

### Audio and Media
- **Web Audio API**: Precise audio timing and playback control
- **MediaDevices API**: Device capability detection for calibration

### PWA Infrastructure
- **Service Worker**: Offline caching and background synchronization
- **Web App Manifest**: App installation and native-like behavior
- **Workbox**: PWA toolkit for advanced caching strategies