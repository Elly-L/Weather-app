"use client"

import { useEffect, useRef } from "react"

interface WeatherSoundsProps {
  weatherType: string
  enabled: boolean
}

export function WeatherSounds({ weatherType, enabled }: WeatherSoundsProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (!enabled) {
      if (audioRef.current) {
        audioRef.current.pause()
      }
      return
    }

    // Create audio context for weather sounds
    const playWeatherSound = () => {
      if (audioRef.current) {
        audioRef.current.pause()
      }

      // Create different sounds based on weather
      switch (weatherType.toLowerCase()) {
        case "rain":
        case "drizzle":
          playRainSound()
          break
        case "thunderstorm":
          playThunderSound()
          break
        case "clear":
          playBirdsSound()
          break
        case "clouds":
          playWindSound()
          break
        default:
          break
      }
    }

    playWeatherSound()

    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
      }
    }
  }, [weatherType, enabled])

  const playRainSound = () => {
    // Create rain sound using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.type = "white"
    oscillator.frequency.setValueAtTime(200, audioContext.currentTime)
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)

    oscillator.start()
    setTimeout(() => oscillator.stop(), 5000)
  }

  const playThunderSound = () => {
    // Create thunder sound
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()

    // Thunder rumble
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.type = "sawtooth"
    oscillator.frequency.setValueAtTime(60, audioContext.currentTime)
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 2)

    oscillator.start()
    setTimeout(() => oscillator.stop(), 2000)
  }

  const playBirdsSound = () => {
    // Create gentle bird chirping
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()

    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)

        oscillator.type = "sine"
        oscillator.frequency.setValueAtTime(800 + Math.random() * 400, audioContext.currentTime)
        gainNode.gain.setValueAtTime(0.05, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)

        oscillator.start()
        setTimeout(() => oscillator.stop(), 300)
      }, i * 1000)
    }
  }

  const playWindSound = () => {
    // Create wind sound
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.type = "white"
    oscillator.frequency.setValueAtTime(150, audioContext.currentTime)
    gainNode.gain.setValueAtTime(0.08, audioContext.currentTime)

    oscillator.start()
    setTimeout(() => oscillator.stop(), 4000)
  }

  return null
}
