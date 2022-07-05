export class StringHelper {
  static capitalize(str: string, delimiter: string = ' '): string {
    const arr = str.split(delimiter);
    for (let i = 0; i < arr.length; i++) {
      arr[i] = arr[i].charAt(0).toUpperCase() + arr[i].slice(1);
    }

    return arr.join(delimiter);
  }
}
