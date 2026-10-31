export const API_CONFIG = {
  BASE_URL: "https://puresite.app/api/v1", // Ensure this matches your Laravel env
  // BASE_URL: "http://192.168.100.106:8000/api/v1", // Workspace ip
  // BASE_URL: "http://192.168.1.118:8000/api/v1", // my house ip
  TIMEOUT: 10000,
  ENDPOINTS: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    LOGOUT: "/auth/logout",
    OTP_SEND: "/auth/otp/send",
    OTP_VERIFY: "/auth/otp/verify",
    ME: "/me",
    DELETE_ME: "/me",
    ME_AVATAR: "/me/avatar",
    CARS: "/cars",
    CAR: (id: string) => `/cars/${id}`,
    SERVICES: "/services",
    SERVICE: (id: string) => `/services/${id}`,
    BANNERS: "/banners",
    // Cafe Endpoints
    CAFE: {
      CATEGORIES: "/cafe/categories",
      PRODUCTS: "/cafe/products",
      PRODUCT: (id: string) => `/cafe/products/${id}`,
      ORDERS: "/cafe-orders",
      CREATE_ORDER: "/cafe/orders",
      FREE_FROM_SERVICE_ORDER: "/cafe/orders/free-from-service-order",
    },
    NOTIFICATIONS: "/notifications",
    SERVICE_ORDERS: "/service-orders",
    SERVICE_ORDER: (id: string) => `/service-orders/${id}`,
    BOOKINGS_SLOTS: "/service-orders/slots",
    TRANSACTION: "/transactions",
    TRANSACTION_ORDER: (id: string) => `/orders/${id}/invoice`,
    // Payment
    PAYMENTS_INITIATE: "/payments/initiate",
    SAVED_CARDS: "/saved-cards",
    // Support Tickets
    SUPPORT_TICKETS: "/support-tickets",
    SUPPORT_TICKET: (id: string) => `/support-tickets/${id}`,
    SUPPORT_TICKET_REPLY: (id: string) => `/support-tickets/${id}/reply`,
    SUPPORT_TICKET_CLOSE: (id: string) => `/support-tickets/${id}/close`,
    // Legal pages (public)
    PAGE: (slug: string) => `/pages/${slug}`,
  },
};

const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400";

/** Placeholder for addon/extra service images (car care, detailing, etc.) */
export const ADDON_PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=600";

export function getImageUrl(imagePath: string | null | undefined): string {
  if (!imagePath) return PLACEHOLDER_IMAGE;
  if (imagePath.startsWith("http")) return imagePath;
  const root = API_CONFIG.BASE_URL.replace(/\/api\/v1\/?$/, "").replace(/\/$/, "") || API_CONFIG.BASE_URL;
  return `${root}${imagePath.startsWith("/") ? imagePath : `/${imagePath}`}`;
}

export function getServiceImageSource(imagePath: string | null | undefined): { uri: string } {
  return { uri: getImageUrl(imagePath) };
}

export function getAddonImageSource(imagePath: string | null | undefined): { uri: string } {
  const url = !imagePath
    ? ADDON_PLACEHOLDER_IMAGE
    : imagePath.startsWith("http")
      ? imagePath
      : getImageUrl(imagePath);
  return { uri: url };
}
