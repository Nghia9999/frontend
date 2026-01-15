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
    const res = await api.get("/order");
    return res.data;
  },

  async getOne(id: string) {
    const res = await api.get(`/order/${id}`);
    return res.data;
  },

  async create(dto: OrderDto) {
    const res = await api.post("/order", dto);
    return res.data;
  },

  async updateStatus(id: string, status: OrderDto['status']) {
    const res = await api.patch(`/order/${id}/status`, { status });
    return res.data;
  },

  async delete(id: string) {
    const res = await api.delete(`/order/${id}`);
    return res.data;
  },
};

export default orderService;
