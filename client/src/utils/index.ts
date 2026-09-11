export const formatCurrency = (amount: string | number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));

export const getSalonKey = (page: number = 1, limit: number = 6) => {
  return `${page}-${limit}`;
};
