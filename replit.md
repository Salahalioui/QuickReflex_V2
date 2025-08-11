# QuickReflex - Reaction Time Testing PWA

## Overview

QuickReflex is a research-grade Progressive Web App (PWA) designed for measuring and training reaction time in athletes, coaches, and researchers. The application implements multiple reaction time testing modules including Simple Reaction Time (SRT), Choice Reaction Time (CRT), Go/No-Go tests, and Movement Time estimation across visual, auditory, and tactile stimulus types.

The system is built as a full-stack TypeScript application with a React frontend and Express backend, utilizing PostgreSQL for data persistence and IndexedDB for offline functionality. The architecture emphasizes precision timing, mobile-first design, and research-grade data collection with comprehensive export capabilities.

**Recent Scientific Enhancements (August 2025):**
- Implemented cross-modal analysis separation with scientific warnings against comparing different stimulus modalities
- Added Movement Time estimation task to separate cognitive processing from motor response initiation
- Enhanced calibration documentation with clear scope and limitations
- Updated all test interfaces with neural processing delay information for research validity

## User Preferences

Preferred communication style: Simple, everyday language.

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
- **Modular Design**: Separate implementations for SRT, CRT (2-choice/4-choice), Go/No-Go tests, and Movement Time estimation
- **Cross-Modal Analysis**: Scientifically-sound separation of visual, auditory, and tactile stimulus analysis
- **Movement Time Protocol**: Dedicated test for estimating pure motor response time without cognitive delay
- **Configurable Parameters**: Customizable trial counts, inter-stimulus intervals, and practice sessions
- **Data Cleaning**: Automated outlier detection and removal with configurable thresholds
- **Validation Suite**: Built-in reliability calculations (ICC, CV%) and statistical analysis
- **Research Compliance**: Neural processing delay documentation and cross-modal comparison warnings

### Export and Analysis System
- **Multiple Formats**: CSV, JSON, PDF summary reports, and SPSS-compatible data
- **Comprehensive Metadata**: Device information, calibration data, and test configuration included
- **Statistical Analysis**: Automated calculation of descriptive statistics and reliability metrics
- **Visualization**: Chart.js integration for data visualization and trend analysis

### Progressive Web App Features
- **Offline Capability**: Full functionality without internet connection through service worker caching
- **App-like Experience**: Native app behavior with installation prompts and standalone display
- **Mobile Optimization**: Touch-friendly interface with responsive design patterns
- **Cross-Platform**: Consistent experience across desktop, tablet, and mobile devices
- **Scientific UI**: Research-grade interface with neural delay information and cross-modal warnings

### Research and Scientific Validity
- **Cross-Modal Separation**: Prevents scientifically invalid comparisons between stimulus modalities
- **Neural Processing Documentation**: Clear labeling of inherent processing delays (visual: 20-40ms, auditory: 8-10ms)
- **Movement Time Estimation**: Dedicated protocol for separating cognitive and motor components
- **Calibration Scope Clarity**: Explicit documentation of what device calibration can and cannot address
- **Research Compliance**: Interface warnings and analysis separation for academic and clinical use

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