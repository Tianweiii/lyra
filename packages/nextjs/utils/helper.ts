export const splitDecimal = (amount: number, type: "full" | "decimal") => {
  const [full, decimal] = amount.toString().split(".");

  return type === "full" ? full.replace(/\B(?=(\d{3})+(?!\d))/g, ",") : decimal;
};
