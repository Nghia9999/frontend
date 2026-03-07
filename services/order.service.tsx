import api from "./api";

export type OrderDto = {
  _id?: string;
  id?: string;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
  };
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    size?: string;
    color?: string;
    image: string;
  }>;
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  stripeSessionId?: string;
};

export const orderService = {
  async getAll() {
    const res = await api.get("/orders");
    return res.data;
  },

  async getAllAdmin() {
    const res = await api.get("/orders/admin/all");
    return res.data;
  },

  async getOne(id: string) {
    const res = await api.get(`/orders/${id}`);
    return res.data;
  },

  async create(dto: OrderDto) {
    const res = await api.post("/orders", dto);
    return res.data;
  },

  async updateStatus(id: string, status: OrderDto['status']) {
    const res = await api.patch(`/orders/${id}/status`, { status });
    return res.data;
  },

  async delete(id: string) {
    const res = await api.delete(`/orders/${id}`);
    return res.data;
  },

  async cancel(id: string) {
    const res = await api.post(`/orders/${id}/cancel`);
    return res.data;
  },
};

export default orderService;
