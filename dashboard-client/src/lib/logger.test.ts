import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { logger, getUserFriendlyErrorMessage } from './logger'
import * as health from './health'

// Mock health module
vi.mock('./health', () => ({
  logError: vi.fn(),
  logWarning: vi.fn(),
}))

describe('logger', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(console, 'info').mockImplementation(() => {})
    vi.spyOn(console, 'debug').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('logger.error', () => {
    it('devrait appeler console.error en dev', () => {
      logger.error('Test error', { code: 500 })

      expect(console.error).toHaveBeenCalledWith('Test error', { code: 500 })
    })

    it('devrait logger dans le health check', () => {
      logger.error('Test error')

      expect(health.logError).toHaveBeenCalledWith('Test error')
    })
  })

  describe('logger.warn', () => {
    it('devrait appeler console.warn en dev', () => {
      logger.warn('Test warning')

      expect(console.warn).toHaveBeenCalledWith('Test warning')
    })

    it('devrait logger dans le health check', () => {
      logger.warn('Test warning')

      expect(health.logWarning).toHaveBeenCalledWith('Test warning')
    })
  })

  describe('logger.info', () => {
    it('devrait toujours appeler console.info', () => {
      logger.info('Test info')

      expect(console.info).toHaveBeenCalledWith('Test info')
    })
  })

  describe('logger.debug', () => {
    it('devrait appeler console.debug en dev', () => {
      logger.debug('Test debug', { data: 'value' })

      expect(console.debug).toHaveBeenCalledWith('[DEBUG]', 'Test debug', { data: 'value' })
    })
  })
})

describe('getUserFriendlyErrorMessage', () => {
  it('devrait retourner le message pour une string en dev', () => {
    const result = getUserFriendlyErrorMessage('Simple error')

    // En dev, retourne le message original
    expect(result).toBe('Simple error')
  })

  it('devrait retourner error.message pour une Error en dev', () => {
    const error = new Error('Error message')
    const result = getUserFriendlyErrorMessage(error)

    // En dev, retourne le message original
    expect(result).toBe('Error message')
  })

  it('devrait retourner le message pour erreur réseau en dev', () => {
    const error = { message: 'network error occurred' }
    const result = getUserFriendlyErrorMessage(error)

    // En dev, retourne le message original
    expect(result).toContain('network error')
  })

  it('devrait retourner le message pour timeout en dev', () => {
    const error = { message: 'Request timeout exceeded' }
    const result = getUserFriendlyErrorMessage(error)

    // En dev, retourne le message original
    expect(result).toContain('timeout')
  })

  it('devrait retourner un message pour erreur générique', () => {
    const error = { something: 'unknown' }
    const result = getUserFriendlyErrorMessage(error)

    // En dev, retourne le message par défaut
    expect(result).toBe('Une erreur est survenue')
  })
})
