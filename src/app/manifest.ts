import { MetadataRoute } from 'next'

export const dynamic = 'force-static'

export default function manifest(): MetadataRoute.Manifest {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ''
  const path = (value: string) => `${basePath}${value}`

  return {
    name: 'Resilience Agent',
    short_name: 'Resilience',
    description: 'AI-powered financial resilience companion for students.',
    start_url: path('/'),
    scope: path('/'),
    display: 'standalone',

    background_color: '#F8FAFC',
    theme_color: '#A855F7',
    icons: [
      {
        src: path('/icon-192x192.png'),
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: path('/icon-512x512.png'),
        sizes: '512x512',
        type: 'image/png',
      },
    ],

  }
}
