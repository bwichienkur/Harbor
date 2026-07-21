import type { Theme } from '../types'

/**
 * Flocus-style ambient worlds — real scenic workspaces with subtle looping motion.
 * Fixed camera, soft animation, places you’d actually sit and focus.
 */
export const themes: Theme[] = [
  {
    id: 'rainy-lofi-cafe',
    name: 'Rainy Lofi Café',
    image:
      'https://images.unsplash.com/photo-1445116572660-236099ec97a0?auto=format&fit=crop&w=1600&q=70',
    video: 'https://assets.mixkit.co/videos/206/206-720.mp4',
    overlay: 0.42,
    category: 'cafe',
    animated: true,
  },
  {
    id: 'reading-cafe',
    name: 'Reading Café',
    image:
      'https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=1600&q=70',
    video: 'https://assets.mixkit.co/videos/237/237-720.mp4',
    overlay: 0.44,
    category: 'cafe',
    animated: true,
  },
  {
    id: 'urban-coffee-shop',
    name: 'Urban Coffee Shop',
    image:
      'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1600&q=70',
    video: 'https://assets.mixkit.co/videos/4350/4350-720.mp4',
    overlay: 0.46,
    category: 'cafe',
    animated: true,
  },
  {
    id: 'rainy-window-desk',
    name: 'Rainy Window Desk',
    image:
      'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=1600&q=70',
    video: 'https://assets.mixkit.co/videos/2846/2846-720.mp4',
    overlay: 0.4,
    category: 'desk',
    animated: true,
  },
  {
    id: 'open-window-rain',
    name: 'Open Window Rain',
    image:
      'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=1600&q=70',
    video: 'https://assets.mixkit.co/videos/28085/28085-720.mp4',
    overlay: 0.38,
    category: 'desk',
    animated: true,
  },
  {
    id: 'foggy-rain-glass',
    name: 'Foggy Rain Glass',
    image:
      'https://images.unsplash.com/photo-1428908728789-d2de25dbd4e2?auto=format&fit=crop&w=1600&q=70',
    video: 'https://assets.mixkit.co/videos/18308/18308-720.mp4',
    overlay: 0.36,
    category: 'desk',
    animated: true,
  },
  {
    id: 'window-seat-study',
    name: 'Window Seat Study',
    image:
      'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=1600&q=70',
    video: 'https://assets.mixkit.co/videos/14606/14606-720.mp4',
    overlay: 0.42,
    category: 'desk',
    animated: true,
  },
  {
    id: 'cozy-coffee-desk',
    name: 'Cozy Coffee Desk',
    image:
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1600&q=70',
    video: 'https://assets.mixkit.co/videos/1749/1749-720.mp4',
    overlay: 0.44,
    category: 'desk',
    animated: true,
  },
  {
    id: 'city-window-office',
    name: 'City Window Office',
    image:
      'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=70',
    video: 'https://assets.mixkit.co/videos/14279/14279-720.mp4',
    overlay: 0.42,
    category: 'office',
    animated: true,
  },
  {
    id: 'highrise-workspace',
    name: 'Highrise Workspace',
    image:
      'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1600&q=70',
    video: 'https://assets.mixkit.co/videos/13218/13218-720.mp4',
    overlay: 0.46,
    category: 'office',
    animated: true,
  },
  {
    id: 'quiet-open-office',
    name: 'Quiet Open Office',
    image:
      'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1600&q=70',
    video: 'https://assets.mixkit.co/videos/914/914-720.mp4',
    overlay: 0.44,
    category: 'office',
    animated: true,
  },
  {
    id: 'modern-office-floor',
    name: 'Modern Office Floor',
    image:
      'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1600&q=70',
    video: 'https://assets.mixkit.co/videos/918/918-720.mp4',
    overlay: 0.46,
    category: 'office',
    animated: true,
  },
]

export const themeImageUrls = themes.map((t) => t.image)
export const animatedThemes = themes.filter((t) => t.animated && t.video)
