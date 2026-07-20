import type { Theme } from '../types'

/**
 * Virtual POV workspaces — places you’d actually sit down and get work done.
 * Animated themes use looping Mixkit stock video (rainy windows, cafés, offices).
 */
export const themes: Theme[] = [
  // —— Animated ambient worlds (Flocus-style looping scenes) ——
  {
    id: 'rainy-window-desk',
    name: 'Rainy Window Desk',
    image:
      'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=1600&q=70',
    video: 'https://assets.mixkit.co/videos/2846/2846-720.mp4',
    overlay: 0.42,
    category: 'desk',
    animated: true,
  },
  {
    id: 'open-window-rain',
    name: 'Open Window Rain',
    image:
      'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=1600&q=70',
    video: 'https://assets.mixkit.co/videos/28085/28085-720.mp4',
    overlay: 0.4,
    category: 'desk',
    animated: true,
  },
  {
    id: 'foggy-rain-glass',
    name: 'Foggy Rain Glass',
    image:
      'https://images.unsplash.com/photo-1428908728789-d2de25dbd4e2?auto=format&fit=crop&w=1600&q=70',
    video: 'https://assets.mixkit.co/videos/18308/18308-720.mp4',
    overlay: 0.38,
    category: 'desk',
    animated: true,
  },
  {
    id: 'tablet-by-window',
    name: 'Tablet by the Window',
    image:
      'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=1600&q=70',
    video: 'https://assets.mixkit.co/videos/14606/14606-720.mp4',
    overlay: 0.44,
    category: 'desk',
    animated: true,
  },
  {
    id: 'dev-coffee-desk',
    name: 'Dev + Coffee',
    image:
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1600&q=70',
    video: 'https://assets.mixkit.co/videos/1749/1749-720.mp4',
    overlay: 0.46,
    category: 'desk',
    animated: true,
  },
  {
    id: 'laptop-cafe-live',
    name: 'Laptop Café Live',
    image:
      'https://images.unsplash.com/photo-1445116572660-236099ec97a0?auto=format&fit=crop&w=1600&q=70',
    video: 'https://assets.mixkit.co/videos/206/206-720.mp4',
    overlay: 0.45,
    category: 'cafe',
    animated: true,
  },
  {
    id: 'reading-cafe-live',
    name: 'Reading Café',
    image:
      'https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=1600&q=70',
    video: 'https://assets.mixkit.co/videos/237/237-720.mp4',
    overlay: 0.46,
    category: 'cafe',
    animated: true,
  },
  {
    id: 'urban-coffee-live',
    name: 'Urban Coffee Shop',
    image:
      'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1600&q=70',
    video: 'https://assets.mixkit.co/videos/4350/4350-720.mp4',
    overlay: 0.48,
    category: 'cafe',
    animated: true,
  },
  {
    id: 'city-window-office',
    name: 'City Window Office',
    image:
      'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=70',
    video: 'https://assets.mixkit.co/videos/14279/14279-720.mp4',
    overlay: 0.44,
    category: 'office',
    animated: true,
  },
  {
    id: 'highrise-window',
    name: 'Highrise Window',
    image:
      'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1600&q=70',
    video: 'https://assets.mixkit.co/videos/13218/13218-720.mp4',
    overlay: 0.5,
    category: 'office',
    animated: true,
  },
  {
    id: 'open-office-live',
    name: 'Open Office Live',
    image:
      'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1600&q=70',
    video: 'https://assets.mixkit.co/videos/914/914-720.mp4',
    overlay: 0.48,
    category: 'office',
    animated: true,
  },
  {
    id: 'busy-office-live',
    name: 'Busy Office Floor',
    image:
      'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1600&q=70',
    video: 'https://assets.mixkit.co/videos/918/918-720.mp4',
    overlay: 0.5,
    category: 'office',
    animated: true,
  },

  // —— Still POV workspaces ——
  {
    id: 'sunlit-desk',
    name: 'Sunlit Desk',
    image:
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1600&q=70',
    overlay: 0.42,
    category: 'desk',
  },
  {
    id: 'laptop-flatlay',
    name: 'Laptop Flatlay',
    image:
      'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=1600&q=70',
    overlay: 0.4,
    category: 'desk',
  },
  {
    id: 'night-coding-desk',
    name: 'Coding Desk',
    image:
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1600&q=70',
    overlay: 0.45,
    category: 'desk',
  },
  {
    id: 'video-call-desk',
    name: 'Video Call Desk',
    image:
      'https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?auto=format&fit=crop&w=1600&q=70',
    overlay: 0.46,
    category: 'desk',
  },
  {
    id: 'study-nook',
    name: 'Study Nook',
    image:
      'https://images.unsplash.com/photo-1650661926447-9efb2610f64c?auto=format&fit=crop&w=1600&q=70',
    overlay: 0.45,
    category: 'desk',
  },
  {
    id: 'planner-desk',
    name: 'Planner Desk',
    image:
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1600&q=70',
    overlay: 0.44,
    category: 'desk',
  },
  {
    id: 'warm-lamp-desk',
    name: 'Warm Lamp Desk',
    image:
      'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=1600&q=70',
    overlay: 0.5,
    category: 'desk',
  },
  {
    id: 'minimal-workspace',
    name: 'Minimal Workspace',
    image:
      'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?auto=format&fit=crop&w=1600&q=70',
    overlay: 0.42,
    category: 'desk',
  },
  {
    id: 'notes-and-coffee',
    name: 'Notes & Coffee',
    image:
      'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1600&q=70',
    overlay: 0.43,
    category: 'desk',
  },
  {
    id: 'corner-cafe',
    name: 'Corner Café',
    image:
      'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1600&q=70',
    overlay: 0.48,
    category: 'cafe',
  },
  {
    id: 'cafe-table-pov',
    name: 'Café Table POV',
    image:
      'https://images.unsplash.com/photo-1445116572660-236099ec97a0?auto=format&fit=crop&w=1600&q=70',
    overlay: 0.46,
    category: 'cafe',
  },
  {
    id: 'soft-cafe-light',
    name: 'Soft Café Light',
    image:
      'https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=1600&q=70',
    overlay: 0.47,
    category: 'cafe',
  },
  {
    id: 'laptop-at-cafe',
    name: 'Laptop at the Café',
    image:
      'https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=1600&q=70',
    overlay: 0.45,
    category: 'cafe',
  },
  {
    id: 'espresso-bar',
    name: 'Espresso Bar',
    image:
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=70',
    overlay: 0.5,
    category: 'cafe',
  },
  {
    id: 'morning-library',
    name: 'Library Reading Room',
    image:
      'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1600&q=70',
    overlay: 0.48,
    category: 'library',
  },
  {
    id: 'library-table',
    name: 'Library Table',
    image:
      'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?auto=format&fit=crop&w=1600&q=70',
    overlay: 0.5,
    category: 'library',
  },
  {
    id: 'stacked-references',
    name: 'Stacked References',
    image:
      'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=1600&q=70',
    overlay: 0.46,
    category: 'library',
  },
  {
    id: 'quiet-study-hall',
    name: 'Quiet Study Hall',
    image:
      'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1600&q=70',
    overlay: 0.48,
    category: 'library',
  },
  {
    id: 'open-plan-office',
    name: 'Open Plan Office',
    image:
      'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=70',
    overlay: 0.48,
    category: 'office',
  },
  {
    id: 'glass-office',
    name: 'Glass Office',
    image:
      'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1600&q=70',
    overlay: 0.45,
    category: 'office',
  },
  {
    id: 'modern-suite',
    name: 'Modern Suite',
    image:
      'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1600&q=70',
    overlay: 0.46,
    category: 'office',
  },
  {
    id: 'evening-office',
    name: 'Evening Office',
    image:
      'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1600&q=70',
    overlay: 0.55,
    category: 'office',
  },
  {
    id: 'collab-room',
    name: 'Collab Room',
    image:
      'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1600&q=70',
    overlay: 0.48,
    category: 'office',
  },
  {
    id: 'coworking-loft',
    name: 'Coworking Loft',
    image:
      'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1600&q=70',
    overlay: 0.47,
    category: 'office',
  },
  {
    id: 'meeting-nook',
    name: 'Meeting Nook',
    image:
      'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1600&q=70',
    overlay: 0.5,
    category: 'office',
  },
]

export const themeImageUrls = themes.map((t) => t.image)
export const animatedThemes = themes.filter((t) => t.animated && t.video)
