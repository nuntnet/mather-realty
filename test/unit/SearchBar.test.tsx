// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SearchBar from '@/components/SearchBar'

// Mock next-intl: return translation key as value
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('SearchBar', () => {
  it('renders with default placeholder from translations', () => {
    const onSearch = vi.fn()
    render(<SearchBar onSearch={onSearch} />)
    // placeholder defaults to t("title") which returns "title"
    expect(screen.getByPlaceholderText('title')).toBeInTheDocument()
  })

  it('renders with custom placeholder', () => {
    const onSearch = vi.fn()
    render(<SearchBar onSearch={onSearch} placeholder="Search properties..." />)
    expect(screen.getByPlaceholderText('Search properties...')).toBeInTheDocument()
  })

  it('calls onSearch after debounce when user types', async () => {
    const onSearch = vi.fn()
    render(<SearchBar onSearch={onSearch} />)

    const input = screen.getByRole('searchbox')
    fireEvent.change(input, { target: { value: 'Bangkok' } })

    // Not called immediately
    expect(onSearch).not.toHaveBeenCalled()

    // Advance past the 300ms debounce
    vi.advanceTimersByTime(350)

    expect(onSearch).toHaveBeenCalledWith('Bangkok')
  })

  it('does not call onSearch before debounce delay', async () => {
    const onSearch = vi.fn()
    render(<SearchBar onSearch={onSearch} />)

    const input = screen.getByRole('searchbox')
    fireEvent.change(input, { target: { value: 'Chiang' } })

    vi.advanceTimersByTime(100)
    expect(onSearch).not.toHaveBeenCalled()
  })

  it('debounces multiple rapid changes — only fires once', async () => {
    const onSearch = vi.fn()
    render(<SearchBar onSearch={onSearch} />)

    const input = screen.getByRole('searchbox')
    fireEvent.change(input, { target: { value: 'B' } })
    vi.advanceTimersByTime(100)
    fireEvent.change(input, { target: { value: 'Ba' } })
    vi.advanceTimersByTime(100)
    fireEvent.change(input, { target: { value: 'Bangkok' } })
    vi.advanceTimersByTime(350)

    expect(onSearch).toHaveBeenCalledTimes(1)
    expect(onSearch).toHaveBeenCalledWith('Bangkok')
  })

  it('clear button appears only when input has a value', () => {
    const onSearch = vi.fn()
    render(<SearchBar onSearch={onSearch} defaultValue="" />)

    expect(screen.queryByRole('button', { name: 'Clear search' })).not.toBeInTheDocument()

    const input = screen.getByRole('searchbox')
    fireEvent.change(input, { target: { value: 'Phuket' } })

    expect(screen.getByRole('button', { name: 'Clear search' })).toBeInTheDocument()
  })

  it('clear button resets input and calls onSearch with empty string', () => {
    const onSearch = vi.fn()
    render(<SearchBar onSearch={onSearch} defaultValue="Pattaya" />)

    const clearBtn = screen.getByRole('button', { name: 'Clear search' })
    fireEvent.click(clearBtn)

    const input = screen.getByRole('searchbox') as HTMLInputElement
    expect(input.value).toBe('')
    expect(onSearch).toHaveBeenCalledWith('')
  })

  it('Enter key triggers search immediately without waiting for debounce', () => {
    const onSearch = vi.fn()
    render(<SearchBar onSearch={onSearch} />)

    const input = screen.getByRole('searchbox')
    fireEvent.change(input, { target: { value: 'Sukhumvit' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    // Should fire immediately, no need to advance timers
    expect(onSearch).toHaveBeenCalledWith('Sukhumvit')
  })

  it('search button click triggers immediate search', () => {
    const onSearch = vi.fn()
    render(<SearchBar onSearch={onSearch} />)

    const input = screen.getByRole('searchbox')
    fireEvent.change(input, { target: { value: 'Silom' } })

    // Click the search button (not the clear button)
    const searchButtons = screen.getAllByRole('button')
    const searchBtn = searchButtons.find((b) => b !== screen.queryByRole('button', { name: 'Clear search' }))
    fireEvent.click(searchBtn!)

    expect(onSearch).toHaveBeenCalledWith('Silom')
  })

  it('renders with a pre-filled defaultValue', () => {
    const onSearch = vi.fn()
    render(<SearchBar onSearch={onSearch} defaultValue="Hua Hin" />)
    const input = screen.getByRole('searchbox') as HTMLInputElement
    expect(input.value).toBe('Hua Hin')
  })
})
