/* Array.prototype.find() but starts searching at the back */
export const findLast = (array: any[], callback: (arg: any) => boolean) => {
  let last = null;
  for (let i = array.length - 1; i >= 0; i--) {
    const item = array[i];
    if (callback(item)) {
      last = item;
      break;
    }
  }
  return last;
};