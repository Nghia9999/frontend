import api from "./api";

export type CategoryDto = {
  id?: string;
  name: string;
  parent?: string | null;
};

export const categoryService = {
  async getAll(parent?: string) {
    const params: any = {};
    if (parent) params.parent = parent;
    const res = await api.get("/category", { params });
    return res.data;
  },

  async getOne(id: string) {
    const res = await api.get(`/category/${id}`);
    return res.data;
  },

  async create(dto: CategoryDto) {
    const res = await api.post("/category", dto);
    return res.data;
  },

  async update(id: string, dto: Partial<CategoryDto>) {
    const res = await api.patch(`/category/${id}`, dto);
    return res.data;
  },

  async remove(id: string) {
    const res = await api.delete(`/category/${id}`);
    return res.data;
  },
};

export default categoryService;
