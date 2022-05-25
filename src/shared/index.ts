export const extend = Object.assign;
export const isObject = (target: any): boolean => {
  return target !== null && typeof target === "object";
};
