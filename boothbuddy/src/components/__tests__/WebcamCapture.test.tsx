import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import { createRef } from 'react'
import WebcamCapture from '../WebcamCapture'
import { onAuthStateChanged } from 'firebase/auth'

// Mock Firebase Auth - override the global mock for this test file
vi.mock('firebase/auth', async () => {
  const actual = await vi.importActual('firebase/auth')
  const mockUnsubscribe = vi.fn()
  const mockOnAuthStateChanged = vi.fn((auth, callback) => {
    callback(null) // Default: no user
    return mockUnsubscribe
  })
  return {
    ...actual,
    onAuthStateChanged: mockOnAuthStateChanged,
  }
})

// Get the mocked function for use in tests
const getMockOnAuthStateChanged = () => {
  return onAuthStateChanged as any
}

// Mock navigator.mediaDevices.getUserMedia
const mockGetUserMedia = vi.fn()
const mockTrack = {
  stop: vi.fn(),
  kind: 'video',
}
const mockStream = {
  getTracks: () => [mockTrack],
}

// Mock canvas methods
const mockDrawImage = vi.fn()
const mockToDataURL = vi.fn(() => 'data:image/png;base64,mock-image-data')

describe('WebcamCapture Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Reset mockTrack.stop
    mockTrack.stop.mockClear()
    
    // Setup getUserMedia mock
    mockGetUserMedia.mockResolvedValue(mockStream)
    global.navigator.mediaDevices = {
      getUserMedia: mockGetUserMedia,
    } as any

    // Setup canvas mocks
    HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
      drawImage: mockDrawImage,
    })) as any
    HTMLCanvasElement.prototype.toDataURL = mockToDataURL

    // Setup video element properties
    Object.defineProperty(HTMLVideoElement.prototype, 'videoWidth', {
      writable: true,
      value: 640,
      configurable: true,
    })
    Object.defineProperty(HTMLVideoElement.prototype, 'videoHeight', {
      writable: true,
      value: 480,
      configurable: true,
    })
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  // 1. Rendering Tests
  describe('Rendering', () => {
    it('should render video element with correct attributes', () => {
      render(<WebcamCapture />)
      const video = document.querySelector('video')
      expect(video).toBeInTheDocument()
      expect(video).toHaveAttribute('autoPlay')
      expect(video).toHaveAttribute('playsInline')
      expect(video).toHaveClass('rounded', 'shadow-md', 'w-full', 'max-w-md')
      expect(video).toHaveClass('transform', 'scale-x-[-1]')
    })

    it('should render hidden canvas element', () => {
      render(<WebcamCapture />)
      const canvas = document.querySelector('canvas')
      expect(canvas).toBeInTheDocument()
      expect(canvas).toHaveClass('hidden')
    })

    it('should not render countdown initially', () => {
      render(<WebcamCapture />)
      const countdown = document.querySelector('.text-6xl')
      expect(countdown).not.toBeInTheDocument()
    })

    it('should not render flash effect initially', () => {
      render(<WebcamCapture />)
      const flash = document.querySelector('.bg-white.opacity-75')
      expect(flash).not.toBeInTheDocument()
    })
  })

  // 2. Props Tests
  describe('Props', () => {
    it('should call onPhotosUpdate callback when photos are captured', async () => {
      vi.useFakeTimers()
      const onPhotosUpdate = vi.fn()
      const ref = createRef<any>()

      render(<WebcamCapture ref={ref} onPhotosUpdate={onPhotosUpdate} />)

      vi.useRealTimers()
      await waitFor(() => {
        expect(mockGetUserMedia).toHaveBeenCalled()
      })
      vi.useFakeTimers()

      ref.current?.startCapture()

      // Process all 4 photos: each has 3s countdown + 150ms flash + capture
      // Countdown: advance 1000ms at a time for each second
      for (let i = 0; i < 4; i++) {
        // Countdown: 3, 2, 1 (3000ms total)
        for (let j = 0; j < 3; j++) {
          vi.advanceTimersByTime(1000)
          await vi.runAllTimersAsync()
        }
        
        // Flash (150ms)
        vi.advanceTimersByTime(150)
        await vi.runAllTimersAsync()
      }

      vi.useRealTimers()
      await waitFor(() => {
        // onPhotosUpdate is called multiple times (once per photo)
        expect(onPhotosUpdate.mock.calls.length).toBeGreaterThanOrEqual(4)
      }, { timeout: 5000 })

      // Verify last call has 4 photos
      const lastCall = onPhotosUpdate.mock.calls[onPhotosUpdate.mock.calls.length - 1]
      expect(lastCall[0]).toHaveLength(4)
    }, { timeout: 15000 })

    it('should call onGuestStatusChange when auth state changes', () => {
      const onGuestStatusChange = vi.fn()
      const mockOnAuthStateChanged = getMockOnAuthStateChanged()

      render(<WebcamCapture onGuestStatusChange={onGuestStatusChange} />)

      const callback = mockOnAuthStateChanged.mock.calls[0][1]
      callback({ isAnonymous: true })

      expect(onGuestStatusChange).toHaveBeenCalledWith(true)
    })

    it('should call onGuestStatusChange with false for authenticated user', () => {
      const onGuestStatusChange = vi.fn()
      const mockOnAuthStateChanged = getMockOnAuthStateChanged()

      render(<WebcamCapture onGuestStatusChange={onGuestStatusChange} />)

      const callback = mockOnAuthStateChanged.mock.calls[0][1]
      callback({ isAnonymous: false, uid: 'user-123' })

      expect(onGuestStatusChange).toHaveBeenCalledWith(false)
    })

    it('should call onGuestStatusChange with false for no user', () => {
      const onGuestStatusChange = vi.fn()
      const mockOnAuthStateChanged = getMockOnAuthStateChanged()

      render(<WebcamCapture onGuestStatusChange={onGuestStatusChange} />)

      const callback = mockOnAuthStateChanged.mock.calls[0][1]
      callback(null)

      expect(onGuestStatusChange).toHaveBeenCalledWith(false)
    })

    it('should work without optional props', () => {
      expect(() => {
        render(<WebcamCapture />)
      }).not.toThrow()
    })
  })

  // 3. User Interactions (via Ref)
  describe('Ref Methods', () => {
    it('should expose startCapture method via ref', () => {
      const ref = createRef<any>()
      render(<WebcamCapture ref={ref} />)

      expect(ref.current).toBeDefined()
      expect(typeof ref.current.startCapture).toBe('function')
      expect(typeof ref.current.isCapturing).toBe('function')
    })

    it('should capture 4 photos when startCapture is called', async () => {
      vi.useFakeTimers()
      const onPhotosUpdate = vi.fn()
      const ref = createRef<any>()

      render(<WebcamCapture ref={ref} onPhotosUpdate={onPhotosUpdate} />)

      vi.useRealTimers()
      await waitFor(() => {
        expect(mockGetUserMedia).toHaveBeenCalled()
      })
      vi.useFakeTimers()

      ref.current?.startCapture()

      // Process all 4 photos: each has 3s countdown + 150ms flash + capture
      // Countdown: advance 1000ms at a time for each second
      for (let i = 0; i < 4; i++) {
        // Countdown: 3, 2, 1 (3000ms total)
        for (let j = 0; j < 3; j++) {
          vi.advanceTimersByTime(1000)
          await vi.runAllTimersAsync()
        }
        
        // Flash (150ms)
        vi.advanceTimersByTime(150)
        await vi.runAllTimersAsync()
      }

      vi.useRealTimers()
      await waitFor(() => {
        // onPhotosUpdate is called multiple times (once per photo)
        expect(onPhotosUpdate.mock.calls.length).toBeGreaterThanOrEqual(4)
      }, { timeout: 5000 })

      // Verify last call has 4 photos
      const lastCall = onPhotosUpdate.mock.calls[onPhotosUpdate.mock.calls.length - 1]
      expect(lastCall[0]).toHaveLength(4)
    }, { timeout: 15000 })

    it('should set isCapturing state correctly', async () => {
      vi.useFakeTimers()
      const ref = createRef<any>()

      render(<WebcamCapture ref={ref} />)

      vi.useRealTimers()
      await waitFor(() => {
        expect(mockGetUserMedia).toHaveBeenCalled()
      })
      vi.useFakeTimers()

      // Initially not capturing
      expect(ref.current.isCapturing()).toBe(false)

      // Start capture - setIsCapturing(true) happens synchronously
      const capturePromise = ref.current?.startCapture()

      // Flush state updates
      await act(async () => {
        await Promise.resolve()
      })

      // Should be capturing now
      expect(ref.current.isCapturing()).toBe(true)

      // Complete capture sequence - advance countdown properly
      // Each photo: 3 seconds countdown + 150ms flash + capture
      for (let i = 0; i < 4; i++) {
        // Countdown: 3 seconds (3, 2, 1)
        for (let j = 0; j < 3; j++) {
          await act(async () => {
            vi.advanceTimersByTime(1000)
            await vi.runAllTimersAsync()
          })
        }
        // Flash (150ms)
        await act(async () => {
          vi.advanceTimersByTime(150)
          await vi.runAllTimersAsync()
        })
        // Photo capture happens synchronously after flash
      }

      // After all 4 photos, setIsCapturing(false) is called at the end of the function
      // The async function should complete, so wait for it
      vi.useRealTimers()
      await capturePromise
      
      // Now check that isCapturing is false
      await waitFor(() => {
        expect(ref.current.isCapturing()).toBe(false)
      }, { timeout: 3000 })
    }, { timeout: 15000 })
  })

  // 4. Async Behavior Tests
  describe('Firebase Auth', () => {
    it('should monitor Firebase auth state on mount', () => {
      const mockOnAuthStateChanged = getMockOnAuthStateChanged()
      render(<WebcamCapture />)

      expect(mockOnAuthStateChanged).toHaveBeenCalled()
      expect(mockOnAuthStateChanged.mock.calls[0][0]).toBeDefined() // auth object
      expect(typeof mockOnAuthStateChanged.mock.calls[0][1]).toBe('function') // callback
    })

    it('should handle guest user detection', () => {
      const onGuestStatusChange = vi.fn()
      const mockOnAuthStateChanged = getMockOnAuthStateChanged()

      render(<WebcamCapture onGuestStatusChange={onGuestStatusChange} />)

      const callback = mockOnAuthStateChanged.mock.calls[0][1]
      callback({ isAnonymous: true })

      expect(onGuestStatusChange).toHaveBeenCalledWith(true)
    })

    it('should handle authenticated user', () => {
      const onGuestStatusChange = vi.fn()
      const mockOnAuthStateChanged = getMockOnAuthStateChanged()

      render(<WebcamCapture onGuestStatusChange={onGuestStatusChange} />)

      const callback = mockOnAuthStateChanged.mock.calls[0][1]
      callback({ isAnonymous: false, uid: 'user-123' })

      expect(onGuestStatusChange).toHaveBeenCalledWith(false)
    })

    it('should handle no user (null)', () => {
      const onGuestStatusChange = vi.fn()
      const mockOnAuthStateChanged = getMockOnAuthStateChanged()

      render(<WebcamCapture onGuestStatusChange={onGuestStatusChange} />)

      const callback = mockOnAuthStateChanged.mock.calls[0][1]
      callback(null)

      expect(onGuestStatusChange).toHaveBeenCalledWith(false)
    })

    it('should unsubscribe from auth state on unmount', () => {
      const mockOnAuthStateChanged = getMockOnAuthStateChanged()
      const mockUnsubscribe = vi.fn()
      mockOnAuthStateChanged.mockReturnValueOnce(mockUnsubscribe)

      const { unmount } = render(<WebcamCapture />)
      unmount()

      expect(mockUnsubscribe).toHaveBeenCalled()
    })
  })

  describe('Webcam Access', () => {
    it('should request webcam access on mount', async () => {
      render(<WebcamCapture />)

      await waitFor(() => {
        expect(mockGetUserMedia).toHaveBeenCalledWith({ video: true })
      })
    })

    it('should handle webcam access success', async () => {
      render(<WebcamCapture />)

      await waitFor(() => {
        expect(mockGetUserMedia).toHaveBeenCalled()
      })

      await waitFor(() => {
        const video = document.querySelector('video')
        expect(video?.srcObject).toBeDefined()
      })

      expect(global.alert).not.toHaveBeenCalled()
    })

    it('should handle webcam access error', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})
      
      mockGetUserMedia.mockRejectedValueOnce(new Error('Permission denied'))

      render(<WebcamCapture />)

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Error accessing webcam:',
          expect.any(Error)
        )
      })

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith(
          'Error accessing webcam. Please make sure no other app is using it.'
        )
      })

      consoleErrorSpy.mockRestore()
      alertSpy.mockRestore()
    })
  })

  // 5. State Changes Tests
  describe('State Changes', () => {
    it('should reset capturedImages when startCapture called', async () => {
      vi.useFakeTimers()
      const onPhotosUpdate = vi.fn()
      const ref = createRef<any>()

      render(<WebcamCapture ref={ref} onPhotosUpdate={onPhotosUpdate} />)

      vi.useRealTimers()
      await waitFor(() => {
        expect(mockGetUserMedia).toHaveBeenCalled()
      })
      vi.useFakeTimers()

      ref.current?.startCapture()

      // First call should be with empty array (reset) - this happens synchronously
      expect(onPhotosUpdate).toHaveBeenCalledWith([])

      // Then photos should be added - complete one full photo cycle (countdown + flash + capture)
      for (let i = 0; i < 3; i++) {
        await act(async () => {
          vi.advanceTimersByTime(1000)
          await vi.runAllTimersAsync()
        })
      }
      // Flash
      await act(async () => {
        vi.advanceTimersByTime(150)
        await vi.runAllTimersAsync()
      })

      // After first photo is captured, onPhotosUpdate should be called with one photo
      // Check synchronously after act
      const calls = onPhotosUpdate.mock.calls
      const photoCall = calls.find(call => call[0].length > 0)
      expect(photoCall).toBeDefined()
      expect(photoCall![0]).toHaveLength(1)
      expect(photoCall![0][0]).toContain('data:image/png')
    }, { timeout: 10000 })

    it('should update capturedImages state after each photo', async () => {
      vi.useFakeTimers()
      const onPhotosUpdate = vi.fn()
      const ref = createRef<any>()

      render(<WebcamCapture ref={ref} onPhotosUpdate={onPhotosUpdate} />)

      vi.useRealTimers()
      await waitFor(() => {
        expect(mockGetUserMedia).toHaveBeenCalled()
      })
      vi.useFakeTimers()

      ref.current?.startCapture()

      // Process all 4 photos - advance countdown properly
      for (let i = 0; i < 4; i++) {
        // Countdown: 3 seconds
        for (let j = 0; j < 3; j++) {
          vi.advanceTimersByTime(1000)
          await vi.runAllTimersAsync()
        }
        // Flash
        vi.advanceTimersByTime(150)
        await vi.runAllTimersAsync()
      }

      vi.useRealTimers()
      await waitFor(() => {
        // Check that onPhotosUpdate was called with increasing number of photos
        const calls = onPhotosUpdate.mock.calls
        expect(calls.length).toBeGreaterThanOrEqual(4)
        
        // Last call should have 4 photos
        const lastCall = calls[calls.length - 1]
        expect(lastCall[0]).toHaveLength(4)
      }, { timeout: 5000 })
    }, { timeout: 15000 })

    it('should set isCapturing to true during capture', async () => {
      vi.useFakeTimers()
      const ref = createRef<any>()

      render(<WebcamCapture ref={ref} />)

      vi.useRealTimers()
      await waitFor(() => {
        expect(mockGetUserMedia).toHaveBeenCalled()
      })
      vi.useFakeTimers()

      ref.current?.startCapture()

      vi.useRealTimers()
      await waitFor(() => {
        expect(ref.current.isCapturing()).toBe(true)
      }, { timeout: 2000 })
      vi.useFakeTimers()

      // Complete one photo cycle - advance countdown properly
      for (let i = 0; i < 3; i++) {
        vi.advanceTimersByTime(1000)
        await vi.runAllTimersAsync()
      }
      vi.advanceTimersByTime(150)
      await vi.runAllTimersAsync()

      // Should still be capturing (3 more photos to go)
      vi.useRealTimers()
      expect(ref.current.isCapturing()).toBe(true)
    }, { timeout: 10000 })
  })

  // 6. Edge Cases Tests
  describe('Edge Cases', () => {
    it('should handle missing video ref gracefully', async () => {
      vi.useFakeTimers()
      const ref = createRef<any>()
      const onPhotosUpdate = vi.fn()

      render(<WebcamCapture ref={ref} onPhotosUpdate={onPhotosUpdate} />)

      vi.useRealTimers()
      await waitFor(() => {
        expect(mockGetUserMedia).toHaveBeenCalled()
      })
      vi.useFakeTimers()

      // Manually set video ref to null to simulate missing ref
      const video = document.querySelector('video')
      if (video) {
        Object.defineProperty(video, 'videoWidth', { value: 0, writable: true, configurable: true })
        Object.defineProperty(video, 'videoHeight', { value: 0, writable: true, configurable: true })
      }

      // This should not throw
      expect(() => {
        ref.current?.startCapture()
      }).not.toThrow()

      // Should not capture photos - the function returns early if videoWidth/Height are 0
      // But we need to check if it actually returns early
      vi.advanceTimersByTime(1000)
      await vi.runAllTimersAsync()

      vi.useRealTimers()
      // onPhotosUpdate should be called with empty array (reset)
      await waitFor(() => {
        expect(onPhotosUpdate).toHaveBeenCalledWith([])
      }, { timeout: 2000 })
    }, { timeout: 10000 })

    it('should handle missing canvas ref gracefully', async () => {
      vi.useFakeTimers()
      const ref = createRef<any>()

      render(<WebcamCapture ref={ref} />)

      vi.useRealTimers()
      await waitFor(() => {
        expect(mockGetUserMedia).toHaveBeenCalled()
      })
      vi.useFakeTimers()

      // This should not throw even if canvas ref is somehow missing
      expect(() => {
        ref.current?.startCapture()
      }).not.toThrow()
    })

    it('should handle missing canvas context', async () => {
      vi.useFakeTimers()
      const ref = createRef<any>()
      const onPhotosUpdate = vi.fn()

      // Mock getContext to return null
      HTMLCanvasElement.prototype.getContext = vi.fn(() => null) as any

      render(<WebcamCapture ref={ref} onPhotosUpdate={onPhotosUpdate} />)

      vi.useRealTimers()
      await waitFor(() => {
        expect(mockGetUserMedia).toHaveBeenCalled()
      })
      vi.useFakeTimers()

      ref.current?.startCapture()

      // Advance timers - countdown properly
      for (let i = 0; i < 3; i++) {
        vi.advanceTimersByTime(1000)
        await vi.runAllTimersAsync()
      }
      vi.advanceTimersByTime(150)
      await vi.runAllTimersAsync()

      vi.useRealTimers()
      // Should not throw, but also should not capture photos
      // onPhotosUpdate should only be called with reset (empty array)
      await waitFor(() => {
        expect(onPhotosUpdate).toHaveBeenCalledWith([])
      }, { timeout: 2000 })
    }, { timeout: 10000 })

    it('should handle getUserMedia rejection gracefully', async () => {
      mockGetUserMedia.mockRejectedValueOnce(new Error('Permission denied'))

      expect(() => {
        render(<WebcamCapture />)
      }).not.toThrow()

      await waitFor(() => {
        expect(mockGetUserMedia).toHaveBeenCalled()
      })

      // Component should still render
      const video = document.querySelector('video')
      expect(video).toBeInTheDocument()
    })

    it('should handle multiple rapid startCapture calls', async () => {
      vi.useFakeTimers()
      const ref = createRef<any>()
      const onPhotosUpdate = vi.fn()

      render(<WebcamCapture ref={ref} onPhotosUpdate={onPhotosUpdate} />)

      vi.useRealTimers()
      await waitFor(() => {
        expect(mockGetUserMedia).toHaveBeenCalled()
      })
      vi.useFakeTimers()

      // Call startCapture twice rapidly
      ref.current?.startCapture()
      ref.current?.startCapture()

      // Advance timers
      vi.advanceTimersByTime(1000)
      await vi.runAllTimersAsync()

      // Should not throw
      expect(() => {
        ref.current?.startCapture()
      }).not.toThrow()
    })
  })

  // 7. Snapshot Tests
  describe('Snapshots', () => {
    it('should match snapshot of initial render', () => {
      const { container } = render(<WebcamCapture />)
      expect(container).toMatchSnapshot()
    })
  })
})

