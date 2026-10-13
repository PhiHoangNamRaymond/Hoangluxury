// Accent-insensitive search for Vietnamese titles/names; no API data changes.
export const adminSearchText = (value) => String(value || "").toLocaleLowerCase("vi")
  .normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d");
