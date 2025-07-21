const API_BASE_URL = 'https://cc1fbde45ead-in-south-01.backstract.io/practical-tanvi-6986153c661111f092518204c7dc2e0560/api';

export interface User {
  id: number;
  full_name: string;
  email: string;
  is_admin: boolean;
}

export interface Room {
  id: number;
  room_name: string;
  capacity?: number; // Optional field for display purposes
}

export interface Booking {
  id: number;
  project_name: string;
  manager_name: string;
  room_id: number;
  booking_date: string;
  start_time: string;
  end_time: string;
  booked_by: string;
  approval_status?: string;
}

export interface CreateUserRequest {
  full_name: string;
  email: string;
  password: string;
  is_admin: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface CreateBookingRequest {
  project_name: string;
  manager_name: string;
  room_id: number;
  booking_date: string;
  start_time: string;
  end_time: string;
  booked_by: string;
}

export interface LoginResponse {
  user: User;
  message?: string;
}

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Authentication
  async login(credentials: LoginRequest): Promise<any> {
    return this.request('/employee/admin/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(userData: CreateUserRequest): Promise<any> {
    return this.request('/users/', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // Users
  async getUsers(): Promise<User[]> {
    return this.request('/users/');
  }

  async getUser(id: number): Promise<User> {
    return this.request(`/users/id?id=${id}`);
  }

  async updateUser(id: number, userData: Partial<User & { password?: string }>): Promise<any> {
    const params = new URLSearchParams();
    params.append('id', id.toString());
    if (userData.full_name) params.append('full_name', userData.full_name);
    if (userData.email) params.append('email', userData.email);
    if (userData.password) params.append('password', userData.password);
    if (userData.is_admin !== undefined) params.append('is_admin', userData.is_admin.toString());

    return this.request(`/users/id/?${params.toString()}`, {
      method: 'PUT',
    });
  }

  async deleteUser(id: number): Promise<any> {
    return this.request(`/users/id?id=${id}`, {
      method: 'DELETE',
    });
  }

  // Rooms
  async getRooms(): Promise<Room[]> {
    return this.request('/rooms/');
  }

  async getRoom(id: number): Promise<Room> {
    return this.request(`/rooms/id?id=${id}`);
  }

  async createRoom(roomData: { id: number; room_name: string }): Promise<any> {
    const params = new URLSearchParams();
    params.append('id', roomData.id.toString());
    params.append('room_name', roomData.room_name);

    return this.request(`/rooms/?${params.toString()}`, {
      method: 'POST',
    });
  }

  async updateRoom(id: number, roomData: { room_name: string }): Promise<any> {
    const params = new URLSearchParams();
    params.append('id', id.toString());
    params.append('room_name', roomData.room_name);

    return this.request(`/rooms/id/?${params.toString()}`, {
      method: 'PUT',
    });
  }

  async deleteRoom(id: number): Promise<any> {
    return this.request(`/rooms/id?id=${id}`, {
      method: 'DELETE',
    });
  }

  // Bookings
  async getBookings(): Promise<Booking[]> {
    return this.request('/bookings/');
  }

  async getBooking(id: number): Promise<Booking> {
    return this.request(`/bookings/id?id=${id}`);
  }

  async createBooking(bookingData: CreateBookingRequest): Promise<any> {
    const params = new URLSearchParams();
    params.append('project_name', bookingData.project_name);
    params.append('manager_name', bookingData.manager_name);
    params.append('room_id', bookingData.room_id.toString());
    params.append('booking_date', bookingData.booking_date);
    params.append('start_time', bookingData.start_time);
    params.append('end_time', bookingData.end_time);
    params.append('booked_by', bookingData.booked_by);

    return this.request(`/bookings/?${params.toString()}`, {
      method: 'POST',
    });
  }

  async updateBooking(id: number, bookingData: Partial<Booking>): Promise<any> {
    const params = new URLSearchParams();
    params.append('id', id.toString());
    if (bookingData.project_name) params.append('project_name', bookingData.project_name);
    if (bookingData.manager_name) params.append('manager_name', bookingData.manager_name);
    if (bookingData.room_id) params.append('room_id', bookingData.room_id.toString());
    if (bookingData.booking_date) params.append('booking_date', bookingData.booking_date);
    if (bookingData.start_time) params.append('start_time', bookingData.start_time);
    if (bookingData.end_time) params.append('end_time', bookingData.end_time);
    if (bookingData.booked_by) params.append('booked_by', bookingData.booked_by);
    if (bookingData.approval_status) params.append('approval_status', bookingData.approval_status);

    return this.request(`/bookings/id/?${params.toString()}`, {
      method: 'PUT',
    });
  }

  async deleteBooking(id: number): Promise<any> {
    return this.request(`/bookings/id?id=${id}`, {
      method: 'DELETE',
    });
  }
}

export const apiService = new ApiService();
