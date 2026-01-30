import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { PageNotice } from '../PageNotice'
import { Info, ShoppingCart } from 'lucide-react'
import type { PageNoticeConfig } from '@/lib/notices/types'

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: Record<string, unknown>) => {
      const { initial, animate, exit, transition, ...rest } = props
      return <div {...rest}>{children as React.ReactNode}</div>
    },
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

// Mock analytics
vi.mock('@/lib/notices/analytics', () => ({
  trackNoticeView: vi.fn(),
  trackNoticeExpansion: vi.fn(),
  trackNoticeCollapse: vi.fn(),
  trackNoticeFeedback: vi.fn(),
  getNoticeFeedback: vi.fn().mockReturnValue(null),
}))

const mockConfig: PageNoticeConfig = {
  pageId: 'test-page',
  title: 'Test Notice',
  purpose: 'This is a test notice purpose.',
  icon: Info,
  moduleColor: 'indigo',
  sections: [
    {
      title: 'Features',
      items: ['Feature 1', 'Feature 2', 'Feature 3'],
    },
  ],
}

describe('PageNotice', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('renders title and purpose', async () => {
    render(<PageNotice config={mockConfig} />)

    await waitFor(() => {
      expect(screen.getByText('Test Notice')).toBeInTheDocument()
    })

    expect(screen.getByText('This is a test notice purpose.')).toBeInTheDocument()
  })

  it('renders sections with items', async () => {
    render(<PageNotice config={mockConfig} />)

    await waitFor(() => {
      expect(screen.getByText('Features')).toBeInTheDocument()
    })

    expect(screen.getByText('Feature 1')).toBeInTheDocument()
    expect(screen.getByText('Feature 2')).toBeInTheDocument()
    expect(screen.getByText('Feature 3')).toBeInTheDocument()
  })

  it('renders with custom icon', async () => {
    const config: PageNoticeConfig = {
      ...mockConfig,
      icon: ShoppingCart,
    }

    render(<PageNotice config={config} />)

    await waitFor(() => {
      expect(screen.getByText('Test Notice')).toBeInTheDocument()
    })
  })

  it('renders feedback buttons by default', async () => {
    render(<PageNotice config={mockConfig} />)

    await waitFor(() => {
      expect(screen.getByLabelText("Oui, c'est utile")).toBeInTheDocument()
    })

    expect(screen.getByLabelText('Non, pas utile')).toBeInTheDocument()
  })

  it('hides feedback when enableFeedback is false', async () => {
    render(<PageNotice config={mockConfig} enableFeedback={false} />)

    await waitFor(() => {
      expect(screen.getByText('Test Notice')).toBeInTheDocument()
    })

    expect(screen.queryByLabelText("Oui, c'est utile")).not.toBeInTheDocument()
  })

  it('shows thank you message after positive feedback', async () => {
    render(<PageNotice config={mockConfig} />)

    await waitFor(() => {
      expect(screen.getByLabelText("Oui, c'est utile")).toBeInTheDocument()
    })

    fireEvent.click(screen.getByLabelText("Oui, c'est utile"))

    expect(screen.getByText('Merci pour votre retour positif !')).toBeInTheDocument()
  })

  it('shows thank you message after negative feedback', async () => {
    render(<PageNotice config={mockConfig} />)

    await waitFor(() => {
      expect(screen.getByLabelText('Non, pas utile')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByLabelText('Non, pas utile'))

    expect(screen.getByText(/Merci pour votre retour/)).toBeInTheDocument()
  })

  it('toggles collapse state', async () => {
    render(<PageNotice config={mockConfig} />)

    // Wait for mount
    await waitFor(() => {
      expect(screen.getByText('Test Notice')).toBeInTheDocument()
    })

    // Find collapse button
    const collapseButton = screen.getByLabelText(/Masquer les informations/)
    fireEvent.click(collapseButton)

    // After collapse, the expand button should show
    await waitFor(() => {
      expect(screen.getByLabelText(/Développer les informations/)).toBeInTheDocument()
    })
  })

  it('persists collapse state in localStorage', async () => {
    render(<PageNotice config={mockConfig} />)

    await waitFor(() => {
      expect(screen.getByText('Test Notice')).toBeInTheDocument()
    })

    const collapseButton = screen.getByLabelText(/Masquer les informations/)
    fireEvent.click(collapseButton)

    expect(localStorage.getItem('quelyos_page_notice_collapsed_test-page')).toBe('true')
  })

  it('applies custom className', () => {
    const { container } = render(
      <PageNotice config={mockConfig} className="my-custom-class" />
    )

    expect(container.firstChild).toHaveClass('my-custom-class')
  })
})
