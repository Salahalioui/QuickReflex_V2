# QuickReflex - Reaction Time Testing PWA

A research-grade Progressive Web App for measuring and training reaction time in athletes, coaches, and researchers. Built with precision timing, scientific validation, and mobile-first design.

## Features

### Test Modules
- **Simple Reaction Time (SRT)** - Basic reaction time measurement
- **Choice Reaction Time (CRT)** - 2-choice and 4-choice directional responses  
- **Go/No-Go Test** - Inhibitory control assessment with proper false alarm handling

### Scientific Standards
- High-precision timing using Performance.now() API
- Device calibration with latency compensation
- Automatic outlier detection and exclusion
- Research-grade data export (CSV, JSON, PDF, SPSS)
- Scientifically valid Go/No-Go analysis (false alarms excluded from RT calculations)

### Progressive Web App
- Works offline with service worker caching
- Installable on mobile devices
- Cross-platform compatibility (iOS, Android, Desktop)
- Touch-optimized interface

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Styling**: Tailwind CSS with Shadcn/ui components
- **Build Tool**: Vite
- **State Management**: Zustand with persistence
- **Charts**: Recharts for data visualization

## Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL database

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/quickreflex.git
cd quickreflex
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your database credentials
```

4. Run database migrations:
```bash
npm run db:migrate
```

5. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5000`

## Usage

### Getting Started
1. Create a user profile in Settings
2. Calibrate your device for accurate timing
3. Choose a test module from the Dashboard
4. Complete practice trials, then run the main test
5. View results and export data for analysis

### Device Calibration
Critical for scientific accuracy - calibrates for:
- Display refresh rate timing
- Touch sampling rate compensation  
- Device-specific latency offsets

### Test Protocols

**Simple Reaction Time (SRT)**
- 20 trials with visual, auditory, or tactile stimuli
- Inter-stimulus interval: 1.5-4 seconds

**Choice Reaction Time (CRT)**  
- 2-choice: Left/right responses (40 trials)
- 4-choice: Up/down/left/right responses (40 trials)
- Spatial accuracy validation

**Go/No-Go Test**
- 28 Go trials (green GO signal)
- 12 No-Go trials (red STOP signal)  
- 1.5-second auto-timeout for STOP signals
- False alarms excluded from RT analysis per scientific standards

## Data Export

Export formats include:
- **CSV**: Raw trial data for statistical analysis
- **JSON**: Complete session data with metadata
- **PDF**: Summary reports with charts
- **SPSS**: Import syntax for SPSS analysis

## Scientific Validation

The app implements research-grade protocols:
- Outlier detection (±2.5 SD, min/max removal)
- Trial exclusion criteria (anticipatory responses <100ms, delayed >1000ms)
- Go/No-Go false alarm handling per published standards
- Comprehensive metadata collection

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Citation

If you use QuickReflex in research, please cite:

```
QuickReflex: A Progressive Web App for Research-Grade Reaction Time Testing
[Alioui Salah Dine/Tisemsilt University]
GitHub: https://github.com/Salahalioui/quickreflex
```

## Support

- Report bugs via GitHub Issues
- For research collaboration inquiries, contact [your-email]
- Documentation: See `/docs` folder for detailed guides

## Roadmap

- [ ] Advanced statistical analysis dashboard
- [ ] Mobile app store deployment
- [ ] Research study management features
