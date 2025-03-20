import './globals.css';
import type { Metadata } from 'next';
import { Lexend } from 'next/font/google';
import { AppProvider } from '@/context/AppContext';

const lexend = Lexend({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Productivity App',
  description: 'Track your focus time and tasks',
};

// Random number helper function for particles
const getRandomNumber = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Generate particles data
const generateParticles = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    size: getRandomNumber(1, 3),
    opacity: Math.random() * 0.5 + 0.1,
    x: getRandomNumber(1, 100),
    y: getRandomNumber(1, 100),
    duration: getRandomNumber(20, 60)
  }));
};

// Pregenerate particles for better server rendering
const particles = generateParticles(30);

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={lexend.className}>
        <AppProvider>
          {/* Aesthetic animated background */}
          <div className="aesthetic-bg">
            <div className="blob blob-1"></div>
            <div className="blob blob-2"></div>
            <div className="blob blob-3"></div>
            
            {/* Floating particles */}
            <div className="particles">
              {particles.map(particle => (
                <div
                  key={particle.id}
                  className="particle"
                  style={{
                    width: `${particle.size}px`,
                    height: `${particle.size}px`,
                    left: `${particle.x}%`,
                    top: `${particle.y}%`,
                    opacity: particle.opacity,
                    animation: `float-particle ${particle.duration}s linear infinite`
                  }}
                />
              ))}
            </div>
          </div>
          
          <main className="max-w-6xl mx-auto px-4 py-10 min-h-screen relative z-0">
            {children}
          </main>
        </AppProvider>
      </body>
    </html>
  );
} 