'use client'

import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

export function CustomCursor() {
    const [isVisible, setIsVisible] = useState(false)
    const [isPointer, setIsPointer] = useState(false)

    const cursorX = useMotionValue(-100)
    const cursorY = useMotionValue(-100)

    const springConfig = { damping: 25, stiffness: 300, mass: 0.5 }
    const cursorXSpring = useSpring(cursorX, springConfig)
    const cursorYSpring = useSpring(cursorY, springConfig)

    useEffect(() => {
        // Only enable on desktop devices
        if (window.matchMedia('(max-width: 768px)').matches) return

        // Hide default cursor across document
        document.documentElement.style.cursor = 'none'

        const moveCursor = (e: MouseEvent) => {
            cursorX.set(e.clientX - 16)
            cursorY.set(e.clientY - 16)
            setIsVisible(true)

            // Check if hovering over clickable element
            const target = e.target as HTMLElement
            const isHoverable =
                window.getComputedStyle(target).cursor === 'pointer' ||
                target.closest('a, button, [role="button"]') !== null

            setIsPointer(isHoverable)
        }

        const handleMouseLeave = () => setIsVisible(false)

        window.addEventListener('mousemove', moveCursor)
        document.body.addEventListener('mouseleave', handleMouseLeave)

        return () => {
            window.removeEventListener('mousemove', moveCursor)
            document.body.removeEventListener('mouseleave', handleMouseLeave)
            document.documentElement.style.cursor = 'auto'
        }
    }, [cursorX, cursorY])

    if (!isVisible) return null

    return (
        <motion.div
            className="pointer-events-none fixed left-0 top-0 z-[10000] flex h-8 w-8 items-center justify-center rounded-full border mix-blend-difference"
            animate={{
                scale: isPointer ? 1.8 : 1,
                borderColor: isPointer ? 'rgba(255,255,255,0.0)' : 'rgba(255,255,255,0.5)',
                backgroundColor: isPointer ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.0)',
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            style={{
                x: cursorXSpring,
                y: cursorYSpring,
            }}
        >
            <motion.div
                className="h-1.5 w-1.5 rounded-full bg-white transition-opacity duration-200"
                style={{ opacity: isPointer ? 0 : 1 }}
            />
        </motion.div>
    )
}
