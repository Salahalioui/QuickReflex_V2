import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Mail, MapPin, GraduationCap, Users, FlaskConical, BookOpen, AlertTriangle } from 'lucide-react';

export default function About() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header Section */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-primary mb-4" data-testid="about-title">QuickReflex</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto" data-testid="about-subtitle">
          Research-Grade Progressive Web App for Reaction Time Testing and Training
        </p>
      </div>

      <div className="grid gap-6">
        {/* App Purpose Card */}
        <Card data-testid="card-app-purpose">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FlaskConical className="h-5 w-5 text-primary" />
              App Purpose & Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              QuickReflex is a research-grade Progressive Web App designed for measuring and training reaction time 
              in athletes, coaches, and researchers. The application implements multiple reaction time testing modules 
              including Simple Reaction Time (SRT), Choice Reaction Time (CRT), and Go/No-Go tests across visual, 
              auditory, and tactile stimulus types.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              The system features comprehensive Movement Initiation Time (MIT) integration, precision timing, 
              mobile-first design, and research-grade data collection with advanced statistical analysis including 
              speed-accuracy trade-off metrics.
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              <Badge variant="secondary">Research-Grade</Badge>
              <Badge variant="secondary">Progressive Web App</Badge>
              <Badge variant="secondary">MIT Integration</Badge>
              <Badge variant="secondary">Cross-Platform</Badge>
              <Badge variant="secondary">Offline Capable</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Developer Card */}
        <Card data-testid="card-developer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              Developer
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold" data-testid="text-developer-name">Alioui Salah Eddine</h3>
              <p className="text-muted-foreground font-medium">PhD in Sport Sciences – Specialization in Elite Sports Training</p>
              <p className="text-muted-foreground">Primary School Physical Education Teacher & Volunteer Volleyball Coach</p>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>El Bayadh, Algeria</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contributors Card */}
        <Card data-testid="card-contributors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Contributors
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-primary">Professor Khiredine BenRabah</h4>
                <p className="text-sm text-muted-foreground">Supervisor</p>
              </div>
              <div>
                <h4 className="font-semibold text-primary">Professor Mohamed BenNaâdja</h4>
                <p className="text-sm text-muted-foreground">Co‑Supervisor</p>
              </div>
              <div>
                <h4 className="font-semibold text-primary">Professor Mohamed El Amine Ouadah</h4>
                <p className="text-sm text-muted-foreground">Senior Advisor</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Research Affiliation Card */}
        <Card data-testid="card-research-affiliation">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Research Affiliation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <h4 className="font-semibold">Laboratory of Multidisciplinary Research Program in Sports Science and Human Movement</h4>
              <p className="text-muted-foreground">University of Tissemsilt, Algeria</p>
            </div>
          </CardContent>
        </Card>

        {/* Acknowledgements Card */}
        <Card data-testid="card-acknowledgements">
          <CardHeader>
            <CardTitle>Acknowledgements</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              We thank all the participants, coaches, and colleagues who contributed to the development, 
              testing, and feedback phases of QuickReflex. Their valuable insights and dedication have 
              been instrumental in creating a reliable and effective research tool.
            </p>
          </CardContent>
        </Card>

        {/* Technical Features Card */}
        <Card data-testid="card-technical-features">
          <CardHeader>
            <CardTitle>Technical Features</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Core Testing Modules</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Simple Reaction Time (SRT)</li>
                  <li>• Choice Reaction Time (CRT)</li>
                  <li>• Go/No-Go Tests</li>
                  <li>• Movement Initiation Time (MIT)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Advanced Analytics</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• MIT-Corrected Analysis</li>
                  <li>• Inverse Efficiency Score (IES)</li>
                  <li>• Multiple Outlier Detection Methods</li>
                  <li>• Comprehensive Export Options</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Disclaimer Card */}
        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950 dark:border-orange-800" data-testid="card-disclaimer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
              <AlertTriangle className="h-5 w-5" />
              Important Disclaimer
            </CardTitle>
          </CardHeader>
          <CardContent className="text-orange-700 dark:text-orange-300 space-y-2">
            <p className="font-medium">This app is intended for research, educational, and self-assessment purposes.</p>
            <ul className="text-sm space-y-1 ml-4">
              <li>• It is not a medical diagnostic tool</li>
              <li>• Results may vary depending on device hardware and environmental factors</li>
              <li>• Always consult qualified professionals for medical or clinical assessments</li>
            </ul>
          </CardContent>
        </Card>

        {/* Contact Card */}
        <Card data-testid="card-contact">
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>Get in touch for support, feedback, or collaboration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Email</p>
                <a 
                  href="mailto:salahallioui01@gmail.com" 
                  className="text-primary hover:underline"
                  data-testid="link-email"
                >
                  salahallioui01@gmail.com
                </a>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Location</p>
                <p className="text-muted-foreground">El Bayadh, Algeria</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Version Info */}
        <div className="text-center pt-4">
          <Separator className="mb-4" />
          <p className="text-sm text-muted-foreground" data-testid="text-version-info">
            QuickReflex v1.0 - Built with React, TypeScript, and modern web technologies
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            © 2025 Alioui Salah Eddine. Developed for research and educational purposes.
          </p>
        </div>
      </div>
    </div>
  );
}