import api from "./api";

export type ProductQuery = {
  category?: string;
  limit?: number;
  skip?: number;
  search?: string;
};

export const productService = {
  async getAll(q: ProductQuery = {}) {
    const params: any = {};
    if (q.category) params.category = q.category;
    if (typeof q.limit !== "undefined") params.limit = q.limit;
    if (typeof q.skip !== "undefined") params.skip = q.skip;
    if (q.search) params.search = q.search;
    const res = await api.get("/product", { params });
    return res.data;
  },

  async getOne(id: string) {
    const res = await api.get(`/product/${id}`);
    return res.data;
  },

  async create(dto: any) {
    const res = await api.post("/product", dto);
    return res.data;
  },

  async update(id: string, dto: any) {
    const res = await api.patch(`/product/${id}`, dto);
    return res.data;
  },

  async remove(id: string) {
    const res = await api.delete(`/product/${id}`);
    return res.data;
  },

  async count(q: Omit<ProductQuery, 'limit' | 'skip'> = {}) {
    const params: any = {};
    if (q.category) params.category = q.category;
    if (q.search) params.search = q.search;
    const res = await api.get("/product/count", { params });
    return res.data;
  },
};

export default productService;
