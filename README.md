# QuickReflex - Reaction Time Testing PWA

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)

A research-grade Progressive Web App (PWA) designed for measuring and training reaction time in athletes, coaches, and researchers. Built with modern web technologies, QuickReflex provides scientifically-validated performance measurement across multiple cognitive test modules with comprehensive Movement Initiation Time (MIT) integration.

## ✨ Key Features

### 🧪 **Research-Grade Testing Modules**
- **Simple Reaction Time (SRT)**: Single stimulus response measuring basic processing speed
- **Choice Reaction Time (CRT)**: 2-choice and 4-choice response options for decision-making assessment  
- **Go/No-Go Test**: Response inhibition and impulse control measurement
- **Movement Initiation Time (MIT)**: 30-tap finger tapping protocol for individual calibration

### 🎯 **Cross-Modal Stimulus Types**
- **Visual**: Screen-based visual cues with precise timing
- **Auditory**: High-quality audio stimulus delivery  
- **Tactile**: Device vibration-based haptic feedback
- **Scientific Warnings**: Proper research disclaimers for cross-modal comparisons

### 📊 **Advanced Data Analysis**
- **MIT-Corrected Results**: All reaction times adjusted for individual movement initiation
- **Multiple Outlier Detection**: MAD, IQR, Percentage Trim, Standard Deviation methods
- **Reliability Metrics**: Intraclass Correlation Coefficient (ICC), Coefficient of Variation (CV%)
- **Professional Visualizations**: Interactive charts and trend analysis

### 📱 **Progressive Web App**
- **Offline Capability**: Full functionality without internet connection
- **Install Prompt**: Native app-like installation experience
- **Service Worker**: Background sync and caching for optimal performance
- **Mobile-First Design**: Touch-optimized interface for all devices

### 📈 **Comprehensive Export System**
- **CSV**: Raw trial data with MIT corrections and metadata
- **JSON**: Complete session data with full configuration details
- **PDF Reports**: Professional branded reports with scientific methodology
- **SPSS**: Statistical analysis-ready format for research workflows

### ⚙️ **Precision & Calibration**
- **Device Calibration**: Latency correction for accurate timing measurements
- **High-Resolution Timing**: Performance.now() API for microsecond precision
- **Frame Synchronization**: RequestAnimationFrame for precise visual cue delivery
- **Audio Preloading**: Pre-cached audio files for consistent auditory stimulus timing

## 🏗️ Technology Stack

### Frontend
- **React 18** with TypeScript for type-safe component development
- **Vite** for fast development and optimized builds
- **Tailwind CSS** with Shadcn/ui components for modern styling
- **Zustand** for efficient state management with persistence
- **Wouter** for lightweight client-side routing
- **Recharts** for interactive data visualization

### Backend  
- **Node.js** with Express.js framework
- **PostgreSQL** with Drizzle ORM for type-safe database operations
- **Neon Database** serverless PostgreSQL for cloud deployment
- **IndexedDB** for offline data persistence and synchronization

### PWA Infrastructure
- **Service Worker** with comprehensive caching strategies
- **Web App Manifest** for native app-like installation
- **Background Sync** for automatic data synchronization
- **Push Notifications** for test reminders and updates

## 🚀 Getting Started

### Prerequisites
- Node.js 18 or higher
- PostgreSQL database (local or cloud)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd quickreflex
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env
   # Configure your database connection in .env
   ```

4. **Database setup**
   ```bash
   npm run db:migrate
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5000`.

## 📖 Usage Guide

### Initial Setup
1. **Create Profile**: Set up athlete or participant information
2. **Device Calibration**: Calibrate for accurate timing measurements  
3. **MIT Testing**: Complete Movement Initiation Time calibration for personalized corrections

### Running Tests
1. **Select Test Module**: Choose SRT, CRT, or Go/No-Go based on research needs
2. **Configure Parameters**: Set trial counts, inter-stimulus intervals, and practice sessions
3. **Choose Stimulus Type**: Select visual, auditory, or tactile presentation
4. **Execute Test**: Follow on-screen instructions for optimal results

### Data Analysis & Export
1. **View Results**: Review performance metrics with MIT-corrected statistics
2. **Analyze Trends**: Use interactive charts for performance tracking
3. **Export Data**: Download in CSV, JSON, PDF, or SPSS formats
4. **Share Reports**: Professional PDF reports for coaches and researchers

## 🧪 Testing Modules Details

### Simple Reaction Time (SRT)
- **Purpose**: Measures basic processing speed and neural response time
- **Protocol**: Single stimulus with immediate response requirement
- **Applications**: Baseline cognitive assessment, fatigue monitoring
- **MIT Integration**: Individual movement time subtracted for pure reaction time

### Choice Reaction Time (CRT)
- **2-Choice**: Binary decision-making with left/right responses
- **4-Choice**: Complex decision-making with directional responses  
- **Protocol**: Stimulus-response mapping with configurable complexity
- **Applications**: Decision-making assessment, cognitive load measurement

### Go/No-Go Test
- **Purpose**: Response inhibition and impulse control assessment
- **Protocol**: Mixed Go (respond) and No-Go (inhibit) stimuli
- **Metrics**: Response accuracy, false alarms, reaction time variability
- **Applications**: ADHD assessment, cognitive control research

### Movement Initiation Time (MIT)
- **Protocol**: 30-tap finger tapping with reliability calculations
- **Purpose**: Individual calibration for reaction time correction
- **Metrics**: Mean MIT, reliability (ICC, CV%), consistency measures
- **Integration**: Automatic correction applied to all reaction time measurements

## 📊 Data Analysis Features

### Outlier Detection Methods
- **Modified Absolute Deviation (MAD)**: Robust statistical outlier identification
- **Interquartile Range (IQR)**: Traditional quartile-based filtering
- **Percentage Trim**: Removes extreme percentile values
- **Standard Deviation**: Classic mean-based outlier removal

### Reliability Calculations
- **Intraclass Correlation Coefficient (ICC)**: Test-retest reliability
- **Coefficient of Variation (CV%)**: Measurement consistency
- **MIT Reliability**: Specific reliability metrics for movement initiation

### Statistical Outputs
- **Descriptive Statistics**: Mean, median, standard deviation, range
- **MIT-Corrected Values**: All measurements adjusted for individual movement time
- **Performance Trends**: Session-to-session comparison and improvement tracking

## 📱 PWA Installation

### Desktop Installation
1. Visit the application URL in Chrome, Edge, or Firefox
2. Look for the install prompt or click the install icon in the address bar
3. Follow browser-specific installation steps
4. Launch from desktop or start menu

### Mobile Installation
1. Open the app in Safari (iOS) or Chrome (Android)
2. Tap the share button and select "Add to Home Screen"
3. Confirm installation and launch from home screen
4. Enjoy full-screen, app-like experience

### Benefits of Installation
- **Faster Loading**: Cached resources for instant startup
- **Offline Access**: Complete functionality without internet
- **Native Feel**: Full-screen experience without browser UI
- **Background Sync**: Automatic data synchronization when online

## 🛠️ Development

### Project Structure
```
quickreflex/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Application pages
│   │   ├── lib/           # Utility functions
│   │   └── store/         # State management
├── server/                # Express backend
│   ├── index.ts           # Server entry point
│   ├── routes.ts          # API endpoints
│   └── storage.ts         # Storage interface
├── shared/                # Shared types and schemas
│   └── schema.ts          # Database schema
├── public/                # PWA assets and manifest
└── docs/                  # Documentation
```

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:push` - Push database schema changes
- `npm run db:migrate` - Run database migrations

### Development Guidelines
- **TypeScript First**: Strong typing throughout the codebase
- **Component Reusability**: Shadcn/ui component system
- **Performance**: Optimized timing and rendering for research accuracy
- **PWA Standards**: Comprehensive offline functionality and caching
- **Scientific Rigor**: Validated protocols and statistical methods

## 🤝 Contributing

We welcome contributions to improve QuickReflex! Please follow these steps:

1. **Fork the repository** and create a feature branch
2. **Follow coding standards** with TypeScript and ESLint configuration
3. **Test thoroughly** including PWA functionality and offline capability
4. **Update documentation** for any new features or changes
5. **Submit a pull request** with detailed description of changes

### Development Guidelines
- Use TypeScript for all new code
- Follow the existing component and file structure
- Ensure mobile-first responsive design
- Test PWA functionality across different devices
- Maintain scientific accuracy in timing and statistical calculations

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support & Documentation

- **Technical Issues**: Create an issue in the repository
- **Research Questions**: Contact the development team
- **Feature Requests**: Submit detailed proposals via issues
- **Documentation**: Comprehensive guides available in the `/docs` folder

## 🏆 Recent Updates (January 2025)

### ✅ **Complete MIT Integration System**
- 30-tap finger tapping protocol with reliability calculations
- Individual MIT calibration for all reaction time corrections
- MIT database integration with full storage and retrieval
- Comprehensive MIT display in settings and calibration menus

### ✅ **Enhanced Export System**
- Professional PDF reports with QuickReflex branding and scientific methodology
- Fixed date handling issues in CSV and PDF exports
- Complete MIT data inclusion in all export formats (CSV, JSON, PDF, SPSS)
- Enhanced error logging and robust error handling

### ✅ **PWA Improvements**
- Fixed service worker and manifest MIME type issues
- Created comprehensive PWA installation prompt with user preferences
- Proper SVG icon files for better cross-platform compatibility
- Resolved "unsupported MIME type" errors preventing installation

### ✅ **UI/UX Enhancements**
- Fixed button text visibility issues across entire application
- Explicit color classes for proper light/dark mode compatibility
- Enhanced welcome screen with gradient logo and professional design
- Consistent button color scheme throughout the application

### ✅ **System Refinements**
- Complete removal of Full Battery test functionality
- Streamlined focus on individual test modules (SRT, CRT, Go/No-Go, MIT)
- Updated database schema and type definitions
- Enhanced outlier detection method integration in UI

### ✅ **Data Integrity & Analysis**
- Cross-modal scientific warnings for proper research methodology
- Enhanced statistical analysis with MIT-corrected measurements
- Improved data validation and quality assurance
- Professional reporting with comprehensive metadata

---

**QuickReflex** - Precise. Scientific. Accessible.