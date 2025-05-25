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
      {Array.from({ length: 100 }).map((_, i) => (
        <div
          key={i}
          className="raindrop"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${0.5 + Math.random() * 0.5}s`,
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
          height: 20px;
          background: linear-gradient(to bottom, rgba(174, 194, 224, 0.6), rgba(174, 194, 224, 0.3));
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
            opacity: 0.3;
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
      if (Math.random() > 0.7) {
        setLightning(true)
        setTimeout(() => setLightning(false), 150)
      }
    }, 2000)

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
          background: rgba(255, 255, 255, 0.8);
          animation: flash 0.15s ease-out;
        }
        .lightning-bolt {
          position: absolute;
          top: 10%;
          left: 50%;
          width: 3px;
          height: 60%;
          background: #fff;
          box-shadow: 0 0 10px #fff, 0 0 20px #fff, 0 0 30px #fff;
          transform: translateX(-50%) rotate(15deg);
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
      <div className="sun">
        <div className="sun-rays">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="ray"
              style={{
                transform: `rotate(${i * 30}deg)`,
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </div>
      </div>
      <div className="particles">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
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
        .sun {
          position: absolute;
          top: 20%;
          right: 20%;
          width: 80px;
          height: 80px;
          background: radial-gradient(circle, #ffd700, #ffed4e);
          border-radius: 50%;
          animation: glow 3s ease-in-out infinite alternate;
        }
        .sun-rays {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 120px;
          height: 120px;
          transform: translate(-50%, -50%);
        }
        .ray {
          position: absolute;
          top: 0;
          left: 50%;
          width: 2px;
          height: 20px;
          background: linear-gradient(to bottom, #ffd700, transparent);
          transform-origin: 0 60px;
          animation: rotate 8s linear infinite;
        }
        .particles {
          position: absolute;
          width: 100%;
          height: 100%;
        }
        .particle {
          position: absolute;
          width: 3px;
          height: 3px;
          background: #ffd700;
          border-radius: 50%;
          animation: float 3s ease-in-out infinite;
        }
        @keyframes glow {
          0% { box-shadow: 0 0 20px rgba(255, 215, 0, 0.5); }
          100% { box-shadow: 0 0 40px rgba(255, 215, 0, 0.8); }
        }
        @keyframes rotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(1); opacity: 0.7; }
          50% { transform: translateY(-20px) scale(1.2); opacity: 1; }
        }
      `}</style>
    </div>
  )
}

function CloudsAnimation() {
  return (
    <div className="clouds-container">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className={`cloud cloud-${i + 1}`}
          style={{
            animationDelay: `${i * 2}s`,
            top: `${10 + i * 15}%`,
          }}
        />
      ))}
      <style jsx>{`
        .clouds-container {
          position: relative;
          width: 100%;
          height: 100%;
        }
        .cloud {
          position: absolute;
          background: rgba(255, 255, 255, 0.8);
          border-radius: 50px;
          animation: drift 20s ease-in-out infinite;
        }
        .cloud::before,
        .cloud::after {
          content: '';
          position: absolute;
          background: rgba(255, 255, 255, 0.8);
          border-radius: 50px;
        }
        .cloud-1 {
          width: 80px;
          height: 40px;
          left: -80px;
        }
        .cloud-1::before {
          width: 50px;
          height: 50px;
          top: -25px;
          left: 10px;
        }
        .cloud-1::after {
          width: 60px;
          height: 40px;
          top: -15px;
          right: 10px;
        }
        .cloud-2 {
          width: 60px;
          height: 30px;
          left: -60px;
          animation-duration: 25s;
        }
        .cloud-2::before {
          width: 40px;
          height: 40px;
          top: -20px;
          left: 8px;
        }
        .cloud-2::after {
          width: 50px;
          height: 30px;
          top: -10px;
          right: 8px;
        }
        .cloud-3 {
          width: 100px;
          height: 50px;
          left: -100px;
          animation-duration: 30s;
        }
        .cloud-3::before {
          width: 60px;
          height: 60px;
          top: -30px;
          left: 15px;
        }
        .cloud-3::after {
          width: 70px;
          height: 50px;
          top: -20px;
          right: 15px;
        }
        @keyframes drift {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(100vw + 100px)); }
        }
      `}</style>
    </div>
  )
}

function MistAnimation() {
  return (
    <div className="mist-container">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="mist-layer"
          style={{
            animationDelay: `${i * 0.5}s`,
            top: `${i * 12}%`,
            opacity: 0.3 - i * 0.03,
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
          width: 120%;
          height: 60px;
          background: linear-gradient(90deg, 
            transparent, 
            rgba(200, 200, 200, 0.6), 
            rgba(220, 220, 220, 0.4), 
            transparent
          );
          animation: mistMove 15s ease-in-out infinite;
        }
        @keyframes mistMove {
          0%, 100% { transform: translateX(-20%); }
          50% { transform: translateX(0%); }
        }
      `}</style>
    </div>
  )
}
