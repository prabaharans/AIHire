import { format, formatDistanceToNow } from "date-fns";

export function formatDate(dateString: string | undefined | null) {
  if (!dateString) return "N/A";
  try {
    return format(new Date(dateString), "MMM d, yyyy");
  } catch (e) {
    return "Invalid date";
  }
}

export function formatDateTime(dateString: string | undefined | null) {
  if (!dateString) return "N/A";
  try {
    return format(new Date(dateString), "MMM d, yyyy h:mm a");
  } catch (e) {
    return "Invalid date";
  }
}

export function formatRelativeDate(dateString: string | undefined | null) {
  if (!dateString) return "N/A";
  try {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  } catch (e) {
    return "Invalid date";
  }
}

export function formatCurrency(amount: number | undefined | null) {
  if (amount === undefined || amount === null) return "N/A";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}
