// utils/productHelpers.ts

export const sanitizeTitle = (title: string) =>
    title.replace(/[^a-zA-Z0-9 ]/g, "").trim();
  
  export const validateTitle = (title: string) => {
    let sanitized = sanitizeTitle(title);
    if (sanitized.length > 60) {
      sanitized = sanitized.slice(0, 60);
    }
    return sanitized;
  };
  