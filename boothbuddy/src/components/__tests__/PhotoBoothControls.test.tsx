import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { fireEvent } from '@testing-library/react'
import PhotoBoothControls, { Filter } from '../PhotoBoothControls'

describe('PhotoBoothControls Component', () => {
  const mockFilters: Filter[] = [
    {
      id: 'grayscale',
      name: 'Grayscale',
      description: 'Convert to black and white',
      defaultIntensity: 1.0,
      minIntensity: 0.0,
      maxIntensity: 1.0,
    },
    {
      id: 'sepia',
      name: 'Sepia',
      description: 'Vintage sepia tone',
      defaultIntensity: 0.8,
      minIntensity: 0.0,
      maxIntensity: 1.0,
    },
    {
      id: 'vintage',
      name: 'Vintage',
      description: 'Old photo effect',
      defaultIntensity: 0.7,
      minIntensity: 0.0,
      maxIntensity: 1.0,
    },
  ]

  const defaultProps = {
    filters: mockFilters,
    selectedFilter: 'none',
    setSelectedFilter: vi.fn(),
    filterIntensity: 1.0,
    setFilterIntensity: vi.fn(),
    isApplyingFilter: false,
    applyFilter: vi.fn().mockResolvedValue(undefined),
    createStrip: vi.fn().mockResolvedValue(undefined),
    resetPhotos: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  // 1. Rendering Tests
  describe('Rendering', () => {
    it('should render the component with all main elements', () => {
      render(<PhotoBoothControls {...defaultProps} />)

      expect(screen.getByText('Apply Filter')).toBeInTheDocument()
      expect(screen.getByRole('combobox')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument()
    })

    it('should render filter select dropdown', () => {
      render(<PhotoBoothControls {...defaultProps} />)

      const select = screen.getByRole('combobox')
      expect(select).toBeInTheDocument()
      expect(select).toHaveValue('none')
    })

    it('should render "No Filter" option', () => {
      render(<PhotoBoothControls {...defaultProps} />)

      expect(screen.getByRole('option', { name: 'No Filter' })).toBeInTheDocument()
    })

    it('should render Create Strip and Reset buttons', () => {
      render(<PhotoBoothControls {...defaultProps} />)

      // Create Strip button has no accessible name, only an icon, so find by SVG
      const buttons = screen.getAllByRole('button')
      const createStripButton = buttons.find(btn => btn.querySelector('svg'))
      const resetButton = screen.getByRole('button', { name: /reset/i })

      expect(createStripButton).toBeInTheDocument()
      expect(resetButton).toBeInTheDocument()
    })

    it('should not render intensity slider when no filter is selected', () => {
      render(<PhotoBoothControls {...defaultProps} selectedFilter="none" />)

      const intensityInput = screen.queryByRole('slider')
      expect(intensityInput).not.toBeInTheDocument()
    })

    it('should not render Apply Filter button when no filter is selected', () => {
      render(<PhotoBoothControls {...defaultProps} selectedFilter="none" />)

      const applyButton = screen.queryByRole('button', { name: /apply filter/i })
      expect(applyButton).not.toBeInTheDocument()
    })
  })

  // 2. Filter Selection Tests
  describe('Filter Selection', () => {
    it('should display all filters for logged-in users', () => {
      render(<PhotoBoothControls {...defaultProps} isGuest={false} />)

      expect(screen.getByRole('option', { name: /^Grayscale/i })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: /^Sepia/i })).toBeInTheDocument()
      // Use exact match to avoid matching "Sepia - Vintage sepia tone"
      expect(screen.getByRole('option', { name: /^Vintage - Old photo effect/i })).toBeInTheDocument()
    })

    it('should call setSelectedFilter when filter is changed', async () => {
      const user = userEvent.setup()
      const setSelectedFilter = vi.fn()

      render(
        <PhotoBoothControls
          {...defaultProps}
          setSelectedFilter={setSelectedFilter}
          isGuest={false}
        />
      )

      const select = screen.getByRole('combobox')
      await user.selectOptions(select, 'grayscale')

      expect(setSelectedFilter).toHaveBeenCalledWith('grayscale')
    })

    it('should update filter intensity to default when filter is selected', async () => {
      const user = userEvent.setup()
      const setSelectedFilter = vi.fn()
      const setFilterIntensity = vi.fn()

      render(
        <PhotoBoothControls
          {...defaultProps}
          setSelectedFilter={setSelectedFilter}
          setFilterIntensity={setFilterIntensity}
          isGuest={false}
        />
      )

      const select = screen.getByRole('combobox')
      await user.selectOptions(select, 'sepia')

      expect(setSelectedFilter).toHaveBeenCalledWith('sepia')
      expect(setFilterIntensity).toHaveBeenCalledWith(0.8) // sepia defaultIntensity
    })

    it('should show only grayscale filter for guests', () => {
      render(<PhotoBoothControls {...defaultProps} isGuest={true} />)

      // Grayscale should be available
      expect(screen.getByRole('option', { name: 'Grayscale' })).toBeInTheDocument()

      // Other filters should be disabled with "Sign up to unlock" text
      const sepiaOption = screen.getByRole('option', { name: /sepia.*sign up to unlock/i })
      const vintageOption = screen.getByRole('option', { name: /vintage.*sign up to unlock/i })

      expect(sepiaOption).toBeInTheDocument()
      expect(sepiaOption).toBeDisabled()
      expect(vintageOption).toBeInTheDocument()
      expect(vintageOption).toBeDisabled()
    })

    it('should display disabled filters with "Sign up to unlock" for guests', () => {
      render(<PhotoBoothControls {...defaultProps} isGuest={true} />)

      const disabledOptions = screen.getAllByText(/sign up to unlock/i)
      expect(disabledOptions.length).toBeGreaterThan(0)
    })
  })

  // 3. Intensity Slider Tests
  describe('Intensity Slider', () => {
    it('should render intensity slider when a filter is selected', () => {
      render(
        <PhotoBoothControls
          {...defaultProps}
          selectedFilter="grayscale"
        />
      )

      const intensityInput = screen.getByRole('slider')
      expect(intensityInput).toBeInTheDocument()
    })

    it('should display current intensity value', () => {
      render(
        <PhotoBoothControls
          {...defaultProps}
          selectedFilter="grayscale"
          filterIntensity={0.5}
        />
      )

      expect(screen.getByText('Intensity: 0.5')).toBeInTheDocument()
    })

    it('should display min and max intensity values', () => {
      render(
        <PhotoBoothControls
          {...defaultProps}
          selectedFilter="grayscale"
        />
      )

      expect(screen.getByText('0')).toBeInTheDocument()
      expect(screen.getByText('1')).toBeInTheDocument()
    })

    it('should call setFilterIntensity when slider is moved', () => {
      const setFilterIntensity = vi.fn()

      render(
        <PhotoBoothControls
          {...defaultProps}
          selectedFilter="grayscale"
          setFilterIntensity={setFilterIntensity}
        />
      )

      const slider = screen.getByRole('slider')
      fireEvent.change(slider, { target: { value: '0.7' } })

      expect(setFilterIntensity).toHaveBeenCalledWith(0.7)
    })

    it('should use correct min/max values from selected filter', () => {
      const customFilter: Filter = {
        id: 'custom',
        name: 'Custom',
        description: 'Custom filter',
        defaultIntensity: 0.5,
        minIntensity: 0.2,
        maxIntensity: 0.8,
      }

      render(
        <PhotoBoothControls
          {...defaultProps}
          filters={[customFilter]}
          selectedFilter="custom"
        />
      )

      const slider = screen.getByRole('slider')
      expect(slider).toHaveAttribute('min', '0.2')
      expect(slider).toHaveAttribute('max', '0.8')
      expect(slider).toHaveAttribute('step', '0.1')
    })

    it('should disable intensity slider when isApplyingFilter is true', () => {
      render(
        <PhotoBoothControls
          {...defaultProps}
          selectedFilter="grayscale"
          isApplyingFilter={true}
        />
      )

      const slider = screen.getByRole('slider')
      expect(slider).toBeDisabled()
    })
  })

  // 4. Apply Filter Button Tests
  describe('Apply Filter Button', () => {
    it('should render Apply Filter button when filter is selected', () => {
      render(
        <PhotoBoothControls
          {...defaultProps}
          selectedFilter="grayscale"
        />
      )

      const applyButton = screen.getByRole('button', { name: /apply filter/i })
      expect(applyButton).toBeInTheDocument()
    })

    it('should call applyFilter when button is clicked', async () => {
      const user = userEvent.setup()
      const applyFilter = vi.fn().mockResolvedValue(undefined)

      render(
        <PhotoBoothControls
          {...defaultProps}
          selectedFilter="grayscale"
          applyFilter={applyFilter}
        />
      )

      const applyButton = screen.getByRole('button', { name: /apply filter/i })
      await user.click(applyButton)

      expect(applyFilter).toHaveBeenCalledTimes(1)
    })

    it('should display "Applying..." text when isApplyingFilter is true', () => {
      render(
        <PhotoBoothControls
          {...defaultProps}
          selectedFilter="grayscale"
          isApplyingFilter={true}
        />
      )

      expect(screen.getByText('Applying...')).toBeInTheDocument()
      // Check that the button text is "Applying..." not "Apply Filter"
      const applyButton = screen.getByRole('button', { name: /applying/i })
      expect(applyButton).toHaveTextContent('Applying...')
      expect(applyButton).not.toHaveTextContent('Apply Filter')
    })

    it('should disable Apply Filter button when isApplyingFilter is true', () => {
      render(
        <PhotoBoothControls
          {...defaultProps}
          selectedFilter="grayscale"
          isApplyingFilter={true}
        />
      )

      const applyButton = screen.getByRole('button', { name: /applying/i })
      expect(applyButton).toBeDisabled()
    })

    it('should disable filter select when isApplyingFilter is true', () => {
      render(
        <PhotoBoothControls
          {...defaultProps}
          selectedFilter="grayscale"
          isApplyingFilter={true}
        />
      )

      const select = screen.getByRole('combobox')
      expect(select).toBeDisabled()
    })
  })

  // 5. Action Buttons Tests
  describe('Action Buttons', () => {
    it('should call createStrip when Create Strip button is clicked', async () => {
      const user = userEvent.setup()
      const createStrip = vi.fn().mockResolvedValue(undefined)

      render(
        <PhotoBoothControls
          {...defaultProps}
          createStrip={createStrip}
        />
      )

      // Create Strip button has no accessible name, only an icon, so find by SVG
      const buttons = screen.getAllByRole('button')
      const createStripButton = buttons.find(btn => btn.querySelector('svg'))
      expect(createStripButton).toBeInTheDocument()
      await user.click(createStripButton!)

      expect(createStrip).toHaveBeenCalledTimes(1)
    })

    it('should call resetPhotos when Reset button is clicked', async () => {
      const user = userEvent.setup()
      const resetPhotos = vi.fn()

      render(
        <PhotoBoothControls
          {...defaultProps}
          resetPhotos={resetPhotos}
        />
      )

      const resetButton = screen.getByRole('button', { name: /reset/i })
      await user.click(resetButton)

      expect(resetPhotos).toHaveBeenCalledTimes(1)
    })

    it('should render download icon in Create Strip button', () => {
      render(<PhotoBoothControls {...defaultProps} />)

      // Create Strip button has no accessible name, only an icon, so find by SVG
      const buttons = screen.getAllByRole('button')
      const createStripButton = buttons.find(btn => btn.querySelector('svg'))
      expect(createStripButton).toBeInTheDocument()
      // Check if the button contains an SVG (react-icons renders as SVG)
      expect(createStripButton?.querySelector('svg')).toBeInTheDocument()
    })
  })

  // 6. Edge Cases Tests
  describe('Edge Cases', () => {
    it('should handle empty filters array', () => {
      render(
        <PhotoBoothControls
          {...defaultProps}
          filters={[]}
          isGuest={false}
        />
      )

      expect(screen.getByRole('option', { name: 'No Filter' })).toBeInTheDocument()
    })

    it('should handle selectedFilter that does not exist in filters array', () => {
      render(
        <PhotoBoothControls
          {...defaultProps}
          selectedFilter="nonexistent"
        />
      )

      // Should not crash, but intensity slider should not appear
      const intensityInput = screen.queryByRole('slider')
      expect(intensityInput).not.toBeInTheDocument()
    })

    it('should handle filter selection when filter is not found', async () => {
      const user = userEvent.setup()
      const setSelectedFilter = vi.fn()
      const setFilterIntensity = vi.fn()

      render(
        <PhotoBoothControls
          {...defaultProps}
          setSelectedFilter={setSelectedFilter}
          setFilterIntensity={setFilterIntensity}
          isGuest={false}
        />
      )

      const select = screen.getByRole('combobox')
      await user.selectOptions(select, 'none')

      expect(setSelectedFilter).toHaveBeenCalledWith('none')
      // Should not call setFilterIntensity when "none" is selected
      expect(setFilterIntensity).not.toHaveBeenCalled()
    })

    it('should handle async applyFilter function', async () => {
      const user = userEvent.setup()
      const applyFilter = vi.fn(() => new Promise(resolve => setTimeout(resolve, 100)))

      render(
        <PhotoBoothControls
          {...defaultProps}
          selectedFilter="grayscale"
          applyFilter={applyFilter}
        />
      )

      const applyButton = screen.getByRole('button', { name: /apply filter/i })
      await user.click(applyButton)

      expect(applyFilter).toHaveBeenCalledTimes(1)
    })

    it('should handle async createStrip function', async () => {
      const user = userEvent.setup()
      const createStrip = vi.fn(() => new Promise(resolve => setTimeout(resolve, 100)))

      render(
        <PhotoBoothControls
          {...defaultProps}
          createStrip={createStrip}
        />
      )

      // Create Strip button has no accessible name, only an icon, so find by SVG
      const buttons = screen.getAllByRole('button')
      const createStripButton = buttons.find(btn => btn.querySelector('svg'))
      expect(createStripButton).toBeInTheDocument()
      await user.click(createStripButton!)

      expect(createStrip).toHaveBeenCalledTimes(1)
    })
  })

  // 7. Guest vs Logged-in User Tests
  describe('Guest vs Logged-in User', () => {
    it('should show all filters for logged-in users', () => {
      render(<PhotoBoothControls {...defaultProps} isGuest={false} />)

      const select = screen.getByRole('combobox')
      const options = Array.from(select.querySelectorAll('option'))

      // Should have "No Filter" + all filters
      expect(options.length).toBeGreaterThan(mockFilters.length)
    })

    it('should show only grayscale and disabled options for guests', () => {
      render(<PhotoBoothControls {...defaultProps} isGuest={true} />)

      const select = screen.getByRole('combobox')
      const options = Array.from(select.querySelectorAll('option'))

      // Should have "No Filter" + grayscale + disabled options
      const enabledOptions = options.filter(opt => !(opt as HTMLOptionElement).disabled)
      expect(enabledOptions.length).toBe(2) // "No Filter" + "Grayscale"
    })

    it('should not show disabled filters for logged-in users', () => {
      render(<PhotoBoothControls {...defaultProps} isGuest={false} />)

      const disabledOptions = screen.queryAllByText(/sign up to unlock/i)
      expect(disabledOptions.length).toBe(0)
    })
  })

  // 8. Snapshot Tests
  describe('Snapshots', () => {
    it('should match snapshot with no filter selected', () => {
      const { container } = render(<PhotoBoothControls {...defaultProps} />)
      expect(container).toMatchSnapshot()
    })

    it('should match snapshot with filter selected', () => {
      const { container } = render(
        <PhotoBoothControls
          {...defaultProps}
          selectedFilter="grayscale"
          filterIntensity={0.5}
        />
      )
      expect(container).toMatchSnapshot()
    })

    it('should match snapshot for guest user', () => {
      const { container } = render(
        <PhotoBoothControls
          {...defaultProps}
          isGuest={true}
        />
      )
      expect(container).toMatchSnapshot()
    })

    it('should match snapshot when applying filter', () => {
      const { container } = render(
        <PhotoBoothControls
          {...defaultProps}
          selectedFilter="grayscale"
          isApplyingFilter={true}
        />
      )
      expect(container).toMatchSnapshot()
    })
  })
})

