export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  role?: string;
  company?: {
    id: string;
    name: string;
    sector?: string;
  };
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated?: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; user?: User; error?: string } | void>;
  logout: () => Promise<void>;
  refreshToken?: () => Promise<boolean>;
  getToken?: () => string | null;
  checkAuth?: () => Promise<void>;
  fetchWithAuth?: (url: string, options?: RequestInit) => Promise<Response>;
}

export interface AuthProviderProps {
  children: React.ReactNode;
  apiBaseUrl?: string;
}
