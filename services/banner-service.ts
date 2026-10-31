import { API_CONFIG, getImageUrl } from "../constants/api";
import apiClient from "../utils/api";
import { ApiResponse } from "./auth-service";

export interface HomePageBanner {
  id: number;
  image_path: string;
  sort_order: number;
  title: string | null;
  link: string | null;
}

export const bannerService = {
  getBanners: async (): Promise<HomePageBanner[]> => {
    const response = await apiClient.get<ApiResponse<HomePageBanner[]>>(
      API_CONFIG.ENDPOINTS.BANNERS
    );
    return response.data.data ?? [];
  },
};

export function getBannerImageUri(banner: HomePageBanner): string {
  return getImageUrl(banner.image_path);
}
