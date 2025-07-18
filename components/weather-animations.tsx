"use client"

import { useEffect, useState } from "react"

interface WeatherAnimationProps {
  weatherType: string
  className?: string
}

export function WeatherAnimation({ weatherType, className = "" }: WeatherAnimationProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const renderAnimation = () => {
    switch (weatherType.toLowerCase()) {
      case "rain":
      case "drizzle":
        return <RainAnimation />
      case "thunderstorm":
        return <ThunderstormAnimation />
      case "clear":
        return <SunshineAnimation />
      case "clouds":
        return <CloudsAnimation />
      case "mist":
      case "fog":
        return <MistAnimation />
      default:
        return <CloudsAnimation />
    }
  }

  return <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>{renderAnimation()}</div>
}

function RainAnimation() {
  return (
    <div className="rain-container">
      {Array.from({ length: 150 }).map((_, i) => (
        <div
          key={i}
          className="raindrop"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${0.3 + Math.random() * 0.4}s`,
          }}
        />
      ))}
      <style jsx>{`
        .rain-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }
        .raindrop {
          position: absolute;
          top: -10px;
          width: 2px;
          height: 25px;
          background: linear-gradient(to bottom, rgba(174, 194, 224, 0.8), rgba(174, 194, 224, 0.4));
          border-radius: 0 0 2px 2px;
          animation: fall linear infinite;
        }
        @keyframes fall {
          0% {
            transform: translateY(-10px);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh);
            opacity: 0.2;
          }
        }
      `}</style>
    </div>
  )
}

function ThunderstormAnimation() {
  const [lightning, setLightning] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.6) {
        setLightning(true)
        setTimeout(() => setLightning(false), 200)
      }
    }, 1500)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="thunderstorm-container">
      <RainAnimation />
      {lightning && (
        <div className="lightning-flash">
          <div className="lightning-bolt" />
        </div>
      )}
      <style jsx>{`
        .thunderstorm-container {
          position: relative;
          width: 100%;
          height: 100%;
        }
        .lightning-flash {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(255, 255, 255, 0.9);
          animation: flash 0.2s ease-out;
        }
        .lightning-bolt {
          position: absolute;
          top: 5%;
          left: 50%;
          width: 4px;
          height: 70%;
          background: #fff;
          box-shadow: 0 0 15px #fff, 0 0 30px #fff, 0 0 45px #fff;
          transform: translateX(-50%) rotate(20deg);
          clip-path: polygon(0% 0%, 100% 0%, 80% 30%, 100% 30%, 0% 100%, 20% 70%, 0% 70%);
        }
        @keyframes flash {
          0%, 100% { opacity: 0; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  )
}

function SunshineAnimation() {
  return (
    <div className="sunshine-container">
      <div className="sun-moving">
        <div className="sun">
          <div className="sun-rays">
            {Array.from({ length: 16 }).map((_, i) => (
              <div
                key={i}
                className="ray"
                style={{
                  transform: `rotate(${i * 22.5}deg)`,
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="particles">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 4}s`,
            }}
          />
        ))}
      </div>
      <style jsx>{`
        .sunshine-container {
          position: relative;
          width: 100%;
          height: 100%;
        }
        .sun-moving {
          position: absolute;
          top: 10%;
          left: 0;
          width: 100%;
          height: 100px;
          animation: sunMove 20s ease-in-out infinite;
        }
        .sun {
          position: absolute;
          top: 0;
          left: 20%;
          width: 100px;
          height: 100px;
          background: radial-gradient(circle, #ffd700, #ffed4e);
          border-radius: 50%;
          animation: glow 4s ease-in-out infinite alternate;
          box-shadow: 0 0 30px rgba(255, 215, 0, 0.6);
        }
        .sun-rays {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 140px;
          height: 140px;
          transform: translate(-50%, -50%);
        }
        .ray {
          position: absolute;
          top: 0;
          left: 50%;
          width: 3px;
          height: 25px;
          background: linear-gradient(to bottom, #ffd700, transparent);
          transform-origin: 0 70px;
          animation: rotate 12s linear infinite;
        }
        .particles {
          position: absolute;
          width: 100%;
          height: 100%;
        }
        .particle {
          position: absolute;
          width: 4px;
          height: 4px;
          background: #ffd700;
          border-radius: 50%;
          animation: float 4s ease-in-out infinite;
        }
        @keyframes sunMove {
          0% { transform: translateX(0%); }
          50% { transform: translateX(70%); }
          100% { transform: translateX(0%); }
        }
        @keyframes glow {
          0% { box-shadow: 0 0 30px rgba(255, 215, 0, 0.6); }
          100% { box-shadow: 0 0 50px rgba(255, 215, 0, 0.9); }
        }
        @keyframes rotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(1); opacity: 0.7; }
          50% { transform: translateY(-30px) scale(1.3); opacity: 1; }
        }
      `}</style>
    </div>
  )
}

function CloudsAnimation() {
  return (
    <div className="clouds-container">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className={`cloud cloud-${i + 1}`}
          style={{
            animationDelay: `${i * 3}s`,
            top: `${5 + i * 12}%`,
          }}
        />
      ))}
      <div className="wind-lines">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="wind-line"
            style={{
              top: `${20 + i * 10}%`,
              animationDelay: `${i * 0.5}s`,
            }}
          />
        ))}
      </div>
      <style jsx>{`
        .clouds-container {
          position: relative;
          width: 100%;
          height: 100%;
        }
        .cloud {
          position: absolute;
          background: rgba(255, 255, 255, 0.9);
          border-radius: 50px;
          animation: drift 25s ease-in-out infinite;
        }
        .cloud::before,
        .cloud::after {
          content: '';
          position: absolute;
          background: rgba(255, 255, 255, 0.9);
          border-radius: 50px;
        }
        .cloud-1 {
          width: 100px;
          height: 50px;
          left: -100px;
        }
        .cloud-1::before {
          width: 60px;
          height: 60px;
          top: -30px;
          left: 15px;
        }
        .cloud-1::after {
          width: 70px;
          height: 50px;
          top: -20px;
          right: 15px;
        }
        .wind-lines {
          position: absolute;
          width: 100%;
          height: 100%;
        }
        .wind-line {
          position: absolute;
          left: -50px;
          width: 40px;
          height: 2px;
          background: rgba(255, 255, 255, 0.4);
          border-radius: 1px;
          animation: windBlow 3s ease-in-out infinite;
        }
        @keyframes drift {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(100vw + 150px)); }
        }
        @keyframes windBlow {
          0% { transform: translateX(0) scaleX(1); opacity: 0; }
          50% { transform: translateX(100px) scaleX(1.5); opacity: 1; }
          100% { transform: translateX(200px) scaleX(1); opacity: 0; }
        }
      `}</style>
    </div>
  )
}

function MistAnimation() {
  return (
    <div className="mist-container">
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          className="mist-layer"
          style={{
            animationDelay: `${i * 0.8}s`,
            top: `${i * 10}%`,
            opacity: 0.4 - i * 0.03,
          }}
        />
      ))}
      <style jsx>{`
        .mist-container {
          position: relative;
          width: 100%;
          height: 100%;
        }
        .mist-layer {
          position: absolute;
          width: 130%;
          height: 80px;
          background: linear-gradient(90deg, 
            transparent, 
            rgba(200, 200, 200, 0.7), 
            rgba(220, 220, 220, 0.5), 
            transparent
          );
          animation: mistMove 18s ease-in-out infinite;
        }
        @keyframes mistMove {
          0%, 100% { transform: translateX(-30%); }
          50% { transform: translateX(10%); }
        }
      `}</style>
    </div>
  )
}
