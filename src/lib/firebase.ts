import { getApps, initializeApp } from 'firebase/app'
import { getDatabase } from 'firebase/database'

const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY
const databaseURL = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL

const isConfigured =
  apiKey && apiKey !== 'placeholder' &&
  databaseURL && databaseURL !== 'placeholder'

const config = {
  apiKey,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  databaseURL,
}

// Only initialize Firebase if real credentials are present
const app = isConfigured
  ? (getApps().length === 0 ? initializeApp(config) : getApps()[0])
  : null

export const realtimeDb = app ? getDatabase(app) : null
