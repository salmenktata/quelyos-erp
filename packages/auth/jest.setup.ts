import "@testing-library/jest-dom";
import { jest } from "@jest/globals";

// Mock Next.js navigation with default implementations
const mockPush: ReturnType<typeof jest.fn> = jest.fn();
const mockReplace: ReturnType<typeof jest.fn> = jest.fn();
const mockRefresh: ReturnType<typeof jest.fn> = jest.fn();
const mockPathname: ReturnType<typeof jest.fn> = jest.fn(() => "/");
const mockSearchParams: ReturnType<typeof jest.fn> = jest.fn(() => new URLSearchParams());

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({
    push: mockPush,
    replace: mockReplace,
    refresh: mockRefresh,
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
  })),
  usePathname: mockPathname,
  useSearchParams: mockSearchParams,
  useParams: jest.fn(() => ({})),
  useSelectedLayoutSegment: jest.fn(),
  useSelectedLayoutSegments: jest.fn(() => []),
  redirect: jest.fn(),
  notFound: jest.fn(),
}));

// Export mocks for use in tests
export { mockPush, mockReplace, mockRefresh, mockPathname, mockSearchParams };
