import { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Sanskar Shopping',
    short_name: 'Sanskar Shopping',
    description: 'Find the best premium deals online.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0d0d0d',
    theme_color: '#ff6b00',
    icons: [
      {
        src: '/logo1.png',
        sizes: 'any',
        type: 'image/png',
      },
      {
        src: '/logo1.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/logo1.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
