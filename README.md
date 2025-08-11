# QuickReflex - Reaction Time Testing PWA

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)

A research-grade Progressive Web App designed for measuring and training reaction time in athletes, coaches, and researchers. QuickReflex implements multiple reaction time testing modules with comprehensive Movement Initiation Time (MIT) integration and scientific-grade data collection.

## 🎯 Features

### Test Modules
- **Simple Reaction Time (SRT)** - Measure processing speed with single stimulus response
- **Choice Reaction Time (CRT)** - 2-choice and 4-choice reaction tests
- **Go/No-Go Tests** - Response inhibition and impulse control assessment
- **Movement Initiation Time (MIT)** - Complete finger-tapping protocol with correction system

### Stimulus Types
- **Visual** - Color-based and shape-based cues
- **Auditory** - Tone-based stimulus delivery with preloaded audio
- **Tactile** - Vibration-based cues for mobile devices

### Data & Analysis
- **Precision Timing** - High-resolution timestamps using Performance.now() API
- **MIT Correction** - Automatic Movement Initiation Time correction for all tests
- **Statistical Analysis** - Built-in reliability calculations (ICC, CV%)
- **Data Cleaning** - Automated outlier detection and removal
- **Export Formats** - CSV, JSON, PDF reports, SPSS-compatible data

### Technical Features
- **Progressive Web App** - Offline functionality with service worker
- **Mobile-First Design** - Optimized for smartphones and tablets
- **Cross-Platform** - Works on iOS, Android, and desktop browsers
- **Research-Grade** - Scientific disclaimers and validation protocols
- **Real-Time Sync** - IndexedDB for offline storage with cloud synchronization

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager
- PostgreSQL database (optional - uses in-memory storage by default)

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

3. **Set up environment (optional)**
   ```bash
   # For database connection
   echo "DATABASE_URL=your_postgresql_connection_string" > .env
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173` to access QuickReflex

### Build for Production

```bash
npm run build
npm start
```

## 📱 Usage

### Getting Started
1. **Select Test Type** - Choose from SRT, CRT, Go/No-Go, or MIT tests
2. **Configure Parameters** - Set trial counts, intervals, and stimulus types
3. **Calibration** - Run device-specific latency calibration (recommended)
4. **Practice Session** - Complete practice trials to familiarize with the test
5. **Main Testing** - Perform the actual reaction time assessment
6. **Review Results** - View real-time statistics and MIT-corrected data
7. **Export Data** - Download results in your preferred format

### Test Configuration
- **Trial Count**: 10-100 trials per session
- **Inter-Stimulus Interval**: 1-5 seconds (randomized)
- **Stimulus Duration**: 50-2000ms (test-dependent)
- **Response Window**: 100-3000ms timeout
- **Practice Trials**: 3-10 warm-up trials

### Data Export Options
- **CSV**: Raw trial data with MIT corrections
- **JSON**: Complete session data with metadata
- **PDF**: Professional summary reports
- **SPSS**: Statistical software-compatible format

## 🏗️ Architecture

### Frontend Stack
- **React 18** with TypeScript and Vite
- **Shadcn/ui** component library with Radix UI primitives
- **Tailwind CSS** for responsive styling
- **Zustand** for state management
- **TanStack Query** for data fetching
- **Wouter** for lightweight routing

### Backend Stack
- **Node.js** with Express.js framework
- **PostgreSQL** with Drizzle ORM
- **Neon Database** for cloud deployment
- **RESTful API** with `/api` prefix
- **Session management** with express-session

### Core Systems
- **Timing Engine**: Performance.now() API with frame synchronization
- **Event Handling**: Pointer events for cross-device compatibility
- **Audio System**: Pre-cached audio files for stimulus delivery
- **Storage Layer**: IndexedDB for offline capability
- **PWA Features**: Service worker for app-like behavior

## 📊 Scientific Validation

### Movement Initiation Time (MIT)
QuickReflex includes a comprehensive MIT testing and correction system:
- **Finger-tapping protocol** for baseline MIT measurement
- **Automatic correction** applied to all reaction time tests
- **MIT reliability metrics** (ICC, CV%) for quality assessment
- **Cross-modal validation** with scientific disclaimers

### Data Quality
- **Outlier Detection**: Automated removal of invalid trials
- **Reliability Analysis**: Intraclass correlation coefficients
- **Coefficient of Variation**: Within-subject consistency metrics
- **Scientific Standards**: Research-grade protocols and validation

### Research Applications
- **Sports Performance**: Athlete reaction time assessment
- **Clinical Research**: Neurological and cognitive studies
- **Training Programs**: Reaction time improvement protocols
- **Academic Research**: Peer-reviewed study compatibility

## 🛠️ Development

### Project Structure
```
quickreflex/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Application pages
│   │   ├── lib/           # Utility functions
│   │   └── types/         # TypeScript definitions
├── server/                # Express backend
│   ├── index.ts           # Server entry point
│   ├── routes.ts          # API endpoints
│   └── storage.ts         # Storage interface
├── shared/                # Shared types and schemas
│   └── schema.ts          # Database schema
├── docs/                  # Documentation
└── public/                # Static assets
```

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run check` - TypeScript type checking
- `npm run db:push` - Push database schema changes

### Development Guidelines
- **TypeScript First**: Strong typing throughout the codebase
- **Component Reusability**: Shadcn/ui component system
- **Performance**: Optimized timing and rendering
- **Testing**: Built-in validation and reliability testing
- **Documentation**: Comprehensive API and scientific documentation

## 📚 Documentation

- **[API Documentation](docs/API.md)** - Complete API reference
- **[Scientific Protocols](docs/SCIENTIFIC_PROTOCOLS.md)** - Research methodologies
- **[Deployment Guide](docs/DEPLOYMENT.md)** - Production deployment instructions

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development Setup
1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes with tests
4. Submit a pull request

### Areas for Contribution
- Additional test protocols
- Enhanced statistical analysis
- Mobile optimization
- Accessibility improvements
- Documentation and tutorials

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔬 Research & Citations

QuickReflex is designed for scientific research applications. When using this software in academic research, please cite:

```
QuickReflex: A Research-Grade Progressive Web App for Reaction Time Testing
[Your Institution/Publication Details]
```

## 📞 Support

- **Issues**: Report bugs and feature requests on GitHub
- **Documentation**: Check the `docs/` directory for detailed guides
- **Community**: Join discussions in GitHub Discussions

## 🏆 Acknowledgments

- Built with modern web technologies for optimal performance
- Designed following scientific research standards
- Optimized for mobile and cross-platform compatibility
- Inspired by sports science and cognitive research needs

---

**QuickReflex** - Precise. Scientific. Accessible.