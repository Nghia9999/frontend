import api from "./api";
import { trackingService } from './tracking.service';

type LoginDto = { email: string; password: string };
type RegisterDto = { email: string; password: string; name?: string };

const ACCESS_KEY = "accessToken";
const USER_ROLE_KEY = "userRole";

const isBrowser = () => typeof window !== "undefined";

export const authService = {
  async login(dto: LoginDto) {
    const res = await api.post("/auth/login", dto);
    const { accessToken, user } = res.data;
    
    // Store tokens and user info
    if (isBrowser()) {
      localStorage.setItem(ACCESS_KEY, accessToken);
      localStorage.setItem(USER_ROLE_KEY, user.role);
      localStorage.setItem('userInfo', JSON.stringify(user)); // Lưu user info
      document.cookie = `${USER_ROLE_KEY}=${user.role}; path=/; max-age=86400; SameSite=Lax`;
    }
    
    // Merge anonymous tracking data with user ID
    const sessionId = isBrowser() ? sessionStorage.getItem('tracking_session_id') : null;
    if (sessionId && user._id) {
      try {
        await trackingService.mergeTracking(sessionId, user._id);
        if (isBrowser()) sessionStorage.removeItem('tracking_session_id'); // Clean up after merge
      } catch (error) {
        console.error('Failed to merge tracking data:', error);
      }
    }
    return res.data;
  },

  async register(dto: RegisterDto) {
    const res = await api.post("/auth/register", dto);
    const token = res?.data?.accessToken;
    const user = res?.data?.user;
    
    if (token) {
      if (isBrowser()) {
        localStorage.setItem(ACCESS_KEY, token);
        localStorage.setItem('userInfo', JSON.stringify(user)); // Lưu user info
        // Set token cookie for middleware
        document.cookie = `token=${token}; path=/; max-age=86400; SameSite=Lax`;
        
        if (user?.role) {
          localStorage.setItem(USER_ROLE_KEY, user.role);
          document.cookie = `userRole=${user.role}; path=/; max-age=86400; SameSite=Lax`;
        }
      }
    }
    return res.data;
  },

  async logout() {
    await api.post("/auth/logout");
    if (isBrowser()) {
      localStorage.removeItem(ACCESS_KEY);
      localStorage.removeItem(USER_ROLE_KEY);
      localStorage.removeItem('userInfo'); // Xóa user info
      // Clear cookies
      document.cookie = "userRole=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie = "refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
  },

  async refreshTokens() {
    try {
      const res = await api.post("/auth/refresh");
      const { accessToken, user } = res.data;
      
      // Cập nhật access token và user info
      if (isBrowser()) {
        localStorage.setItem(ACCESS_KEY, accessToken);
        localStorage.setItem('userInfo', JSON.stringify(user));
      }
      
      return { accessToken, user };
    } catch (error) {
      console.error('Refresh token error:', error);
      throw error;
    }
  },

  async me() {
    const res = await api.get("/auth/me");
    return res.data;
  },

  getRole() {
    if (!isBrowser()) return null;
    return localStorage.getItem(USER_ROLE_KEY);
  },

  isAdmin() {
    return this.getRole() === 'admin';
  },

  getCurrentUser() {
    if (!isBrowser()) {
      return {
        token: null,
        role: null,
        user: null,
        isAuthenticated: false,
        userId: 'anonymous'
      };
    }

    const token = localStorage.getItem(ACCESS_KEY);
    const role = localStorage.getItem(USER_ROLE_KEY);
    // Lấy user info từ localStorage (được lưu khi login/register)
    const userStr = localStorage.getItem('userInfo');
    const user = userStr ? JSON.parse(userStr) : null;
    
    return {
      token,
      role,
      user,
      isAuthenticated: !!token,
      userId: user?._id || 'anonymous'
    };
  },
};

export default authService;
