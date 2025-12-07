import { afterEach, beforeAll, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom'

// Mock Firebase Auth
vi.mock('../firebaseConfig', () => ({
  auth: {},
  default: {},
}))

vi.mock('firebase/auth', () => ({
  onAuthStateChanged: vi.fn((auth, callback) => {
    // Default: no user (guest)
    callback(null)
    return () => {} // unsubscribe function
  }),
  getAuth: vi.fn(),
}))

// Mock navigator.mediaDevices.getUserMedia
const mockGetUserMedia = vi.fn()
global.navigator = {
  ...global.navigator,
  mediaDevices: {
    getUserMedia: mockGetUserMedia,
  },
} as any

// Mock window.alert
global.alert = vi.fn()

// Mock console.error to avoid noise in tests
global.console.error = vi.fn()

// Setup cleanup after each test
afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

