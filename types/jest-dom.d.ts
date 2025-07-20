/// <reference types="@testing-library/jest-dom" />

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R
      toHaveAttribute(attr: string, value?: string): R
      toBeDisabled(): R
      toBeEnabled(): R
      toBeVisible(): R
      toHaveClass(className: string): R
      toHaveTextContent(text: string): R
      toHaveValue(value: string | number): R
    }
  }
}

export {} 