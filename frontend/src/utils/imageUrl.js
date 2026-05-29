import API from "../api/axios";

const BACKEND_ORIGIN = new URL(API.defaults.baseURL).origin;

export function getImageUrl(image) {
  const value = image?.trim();

  if (!value) return "";

  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("data:") ||
    value.startsWith("blob:")
  ) {
    return value;
  }

  if (value.startsWith("www.")) {
    return `https://${value}`;
  }

  const path = value.startsWith("/") ? value : `/${value}`;
  return encodeURI(`${BACKEND_ORIGIN}${path}`);
}
