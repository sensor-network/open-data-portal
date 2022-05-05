/* capitalize given string using RegEx */
const capitalize = (string: string) =>
  string?.replace(/^\w/, (ch) => ch.toUpperCase());

export default capitalize;
