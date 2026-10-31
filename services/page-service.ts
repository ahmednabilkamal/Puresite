import { API_CONFIG } from "@/constants/api";
import apiClient from "@/utils/api";

export interface LegalPageData {
  slug: string;
  locale: string;
  content: string;
  title: string;
}

export const pageService = {
  getPage: async (slug: "terms" | "privacy", locale?: string): Promise<LegalPageData> => {
    const url = API_CONFIG.ENDPOINTS.PAGE(slug);
    const params = locale ? { locale } : {};
    const response = await apiClient.get(url, { params });
    const data = response.data?.data ?? response.data;
    return data;
  },
};
