export function boolean(val: any): boolean {
  switch (typeof val) {
    case 'boolean':
      return val;
    case 'string':
      return !!+val || val.trim() === 'true';
    default:
      return !!val;
  }
}
