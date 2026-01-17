import api from './api';

export interface UserDto {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  isActive: boolean;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  role?: 'user' | 'admin';
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  role?: 'user' | 'admin';
  isActive?: boolean;
  avatar?: string;
}

const userService = {
  async getAllUsers(): Promise<UserDto[]> {
    const res = await api.get('/user');
    return res.data;
  },

  async getUserById(id: string): Promise<UserDto> {
    const res = await api.get(`/user/${id}`);
    return res.data;
  },

  async createUser(userData: CreateUserDto): Promise<UserDto> {
    const res = await api.post('/user', userData);
    return res.data;
  },

  async updateUser(id: string, userData: UpdateUserDto): Promise<UserDto> {
    const res = await api.patch(`/user/${id}`, userData);
    return res.data;
  },

  async deleteUser(id: string): Promise<void> {
    await api.delete(`/user/${id}`);
  },
};

export default userService;
