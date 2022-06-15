export const extend = Object.assign;

export const isObject = (target: any): boolean => {
  return target !== null && typeof target === "object";
};

export const hasChange = (value: any, newValue: any): boolean =>
  !Object.is(value, newValue);

export const hasOwn = (val, key) =>
  Object.prototype.hasOwnProperty.call(val, key);

// otherBtn => onOtherBtn
export const camelize = (str: string) => {
  return str.replace(/-(\w)/g, (_, c: string) => {
    return c ? c.toUpperCase() : "";
  });
};

const capitalize = (str: string) => {
  return str.charAt(0).toLocaleUpperCase() + str.slice(1);
};

// other-btn => otherBtn
export const toHandlerKey = (str: string) => {
  return str ? "on" + capitalize(str) : "";
};
