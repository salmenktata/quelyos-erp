import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useFormState } from '../useFormState'

interface TestForm {
  name: string
  email: string
  age: number
}

const initialValues: TestForm = {
  name: '',
  email: '',
  age: 0,
}

describe('useFormState', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('initializes with provided values', () => {
    const { result } = renderHook(() =>
      useFormState({ initialValues })
    )

    expect(result.current.values).toEqual(initialValues)
    expect(result.current.errors).toEqual({})
    expect(result.current.touched).toEqual({})
    expect(result.current.isSubmitting).toBe(false)
    expect(result.current.isDirty).toBe(false)
  })

  it('updates field value with setFieldValue', () => {
    const { result } = renderHook(() =>
      useFormState({ initialValues })
    )

    act(() => {
      result.current.setFieldValue('name', 'John')
    })

    expect(result.current.values.name).toBe('John')
  })

  it('marks form as dirty when values change', async () => {
    const { result } = renderHook(() =>
      useFormState({ initialValues })
    )

    expect(result.current.isDirty).toBe(false)

    act(() => {
      result.current.setFieldValue('name', 'Jane')
    })

    // isDirty is updated via useEffect, need to wait
    await vi.waitFor(() => {
      expect(result.current.isDirty).toBe(true)
    })
  })

  it('clears field error on value change', () => {
    const { result } = renderHook(() =>
      useFormState({ initialValues })
    )

    // Set an error first
    act(() => {
      result.current.setFieldError('name', 'Required')
    })

    expect(result.current.errors.name).toBe('Required')

    // Change value should clear error
    act(() => {
      result.current.setFieldValue('name', 'Test')
    })

    expect(result.current.errors.name).toBeUndefined()
  })

  it('sets field touched state', () => {
    const { result } = renderHook(() =>
      useFormState({ initialValues })
    )

    act(() => {
      result.current.setFieldTouched('email', true)
    })

    expect(result.current.touched.email).toBe(true)
  })

  it('handles handleChange for text input', () => {
    const { result } = renderHook(() =>
      useFormState({ initialValues })
    )

    const mockEvent = {
      target: { type: 'text', value: 'test@example.com' },
    } as React.ChangeEvent<HTMLInputElement>

    act(() => {
      result.current.handleChange('email')(mockEvent)
    })

    expect(result.current.values.email).toBe('test@example.com')
  })

  it('handles handleBlur and runs validation', () => {
    const validate = vi.fn().mockReturnValue({ name: 'Name is required' })

    const { result } = renderHook(() =>
      useFormState({
        initialValues,
        validate,
      })
    )

    act(() => {
      result.current.handleBlur('name')()
    })

    expect(result.current.touched.name).toBe(true)
    expect(validate).toHaveBeenCalledWith(initialValues)
    expect(result.current.errors.name).toBe('Name is required')
  })

  it('handleSubmit validates and prevents submit on errors', async () => {
    const onSubmit = vi.fn()
    const validate = vi.fn().mockReturnValue({ name: 'Required' })

    const { result } = renderHook(() =>
      useFormState({
        initialValues,
        onSubmit,
        validate,
      })
    )

    await act(async () => {
      await result.current.handleSubmit()
    })

    expect(validate).toHaveBeenCalled()
    expect(onSubmit).not.toHaveBeenCalled()
    expect(result.current.errors.name).toBe('Required')
    // All fields should be touched after submit attempt
    expect(result.current.touched.name).toBe(true)
    expect(result.current.touched.email).toBe(true)
  })

  it('handleSubmit calls onSubmit when valid', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    const validate = vi.fn().mockReturnValue({})

    const { result } = renderHook(() =>
      useFormState({
        initialValues: { ...initialValues, name: 'Valid' },
        onSubmit,
        validate,
      })
    )

    await act(async () => {
      await result.current.handleSubmit()
    })

    expect(onSubmit).toHaveBeenCalledWith({ ...initialValues, name: 'Valid' })
    expect(result.current.isSubmitting).toBe(false)
  })

  it('handleSubmit prevents default event', async () => {
    const onSubmit = vi.fn()
    const mockEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent

    const { result } = renderHook(() =>
      useFormState({
        initialValues,
        onSubmit,
      })
    )

    await act(async () => {
      await result.current.handleSubmit(mockEvent)
    })

    expect(mockEvent.preventDefault).toHaveBeenCalled()
  })

  it('handleReset restores initial values', async () => {
    const { result } = renderHook(() =>
      useFormState({ initialValues })
    )

    // Modify form
    act(() => {
      result.current.setFieldValue('name', 'Changed')
      result.current.setFieldTouched('name')
      result.current.setFieldError('email', 'Error')
    })

    // Reset
    act(() => {
      result.current.handleReset()
    })

    expect(result.current.values).toEqual(initialValues)
    expect(result.current.errors).toEqual({})
    expect(result.current.touched).toEqual({})
    expect(result.current.isDirty).toBe(false)
  })

  it('resetOnSubmitSuccess resets after successful submit', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)

    const { result } = renderHook(() =>
      useFormState({
        initialValues,
        onSubmit,
        resetOnSubmitSuccess: true,
      })
    )

    act(() => {
      result.current.setFieldValue('name', 'Test')
    })

    await act(async () => {
      await result.current.handleSubmit()
    })

    expect(result.current.values).toEqual(initialValues)
  })

  it('setValues replaces all values', () => {
    const { result } = renderHook(() =>
      useFormState({ initialValues })
    )

    const newValues = { name: 'New', email: 'new@test.com', age: 25 }

    act(() => {
      result.current.setValues(newValues)
    })

    expect(result.current.values).toEqual(newValues)
  })
})
