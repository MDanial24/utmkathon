"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"

export function GlobalBackground() {
  const { resolvedTheme } = useTheme()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const isLanding = pathname === "/"
  const isDark = resolvedTheme === "dark"
  
  // Logic: 
  // Landing: Always Video
  // App: Dark -> Image, Light -> Video (as per previous request for lightmode)
  const showVideo = isLanding || !isDark
  const videoSrc = isDark ? "/utmkathon/assets/bgm-dark.MP4" : "/utmkathon/assets/bgm-light.mp4"
  const imageSrc = "/utmkathon/assets/img-dark.PNG"

  return (
    <div className="fixed inset-0 -z-50 overflow-hidden bg-background">
      {showVideo ? (
        <video
          key={videoSrc}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          disablePictureInPicture
          className="global-video-bg opacity-0 transition-opacity duration-1000"
          onCanPlay={(e) => (e.currentTarget.style.opacity = "1")}
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
      ) : (
        <div 
          className="w-full h-full bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${imageSrc})` }}
        />
      )}
    </div>
  )
}
