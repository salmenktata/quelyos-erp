import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Breadcrumbs } from '../Breadcrumbs'

const renderWithRouter = (ui: React.ReactElement) =>
  render(<MemoryRouter>{ui}</MemoryRouter>)

describe('Breadcrumbs', () => {
  it('renders a single breadcrumb item', () => {
    renderWithRouter(<Breadcrumbs items={[{ label: 'Accueil' }]} />)

    expect(screen.getByText('Accueil')).toBeInTheDocument()
    expect(screen.getByText('Accueil')).toHaveAttribute('aria-current', 'page')
  })

  it('renders multiple breadcrumb items', () => {
    renderWithRouter(
      <Breadcrumbs
        items={[
          { label: 'Tableau de bord', href: '/dashboard' },
          { label: 'Boutique', href: '/store' },
          { label: 'Produits' },
        ]}
      />
    )

    expect(screen.getByText('Tableau de bord')).toBeInTheDocument()
    expect(screen.getByText('Boutique')).toBeInTheDocument()
    expect(screen.getByText('Produits')).toBeInTheDocument()
  })

  it('renders links for items with href', () => {
    renderWithRouter(
      <Breadcrumbs
        items={[
          { label: 'Tableau de bord', href: '/dashboard' },
          { label: 'Produits' },
        ]}
      />
    )

    const link = screen.getByText('Tableau de bord')
    expect(link.tagName).toBe('A')
    expect(link).toHaveAttribute('href', '/dashboard')
  })

  it('renders last item as current page (not a link)', () => {
    renderWithRouter(
      <Breadcrumbs
        items={[
          { label: 'Tableau de bord', href: '/dashboard' },
          { label: 'Produits' },
        ]}
      />
    )

    const lastItem = screen.getByText('Produits')
    expect(lastItem.tagName).toBe('SPAN')
    expect(lastItem).toHaveAttribute('aria-current', 'page')
  })

  it('renders items without href as plain text (not last)', () => {
    renderWithRouter(
      <Breadcrumbs
        items={[
          { label: 'Section' },
          { label: 'Page' },
        ]}
      />
    )

    const firstItem = screen.getByText('Section')
    expect(firstItem.tagName).toBe('SPAN')
    expect(firstItem).not.toHaveAttribute('aria-current')
  })

  it('has proper navigation landmark', () => {
    renderWithRouter(
      <Breadcrumbs items={[{ label: 'Test' }]} />
    )

    const nav = screen.getByRole('navigation')
    expect(nav).toHaveAttribute('aria-label', "Fil d'Ariane")
  })

  it('renders separator arrows between items', () => {
    const { container } = renderWithRouter(
      <Breadcrumbs
        items={[
          { label: 'A', href: '/a' },
          { label: 'B', href: '/b' },
          { label: 'C' },
        ]}
      />
    )

    // 2 separators for 3 items
    const separators = container.querySelectorAll('svg[aria-hidden="true"]')
    expect(separators).toHaveLength(2)
  })

  it('renders ordered list for SEO', () => {
    const { container } = renderWithRouter(
      <Breadcrumbs items={[{ label: 'A' }, { label: 'B' }]} />
    )

    const ol = container.querySelector('ol')
    expect(ol).toBeInTheDocument()

    const items = container.querySelectorAll('li')
    expect(items).toHaveLength(2)
  })
})
