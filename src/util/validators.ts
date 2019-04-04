export function PositiveNumberValidator(value: any) {
  if (Number(value) <= 0) {
    throw Error(`${value} must be a positive number.`);
  }
}

export function ISBNValidator(value: string | undefined) {
  function calculateChecksum(arr: string[], weights: number[]) {
    return arr
      .reduce((accumulated, digit, i) => {
        digit = digit === "X" ? "10" : digit;
        accumulated.push([Number(digit), weights[i]]);
        return accumulated;
      }, [])
      .reduce((sum, a) => {
        return sum + a[0] * a[1];
      }, 0);
  }

  const ISBN10_WEIGHTS = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1];
  const ISBN13_WEIGHTS = [1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1];

  // sanitize the input
  value = typeof value === "string" ? value : "";
  value = value.replace(/[\s\-]+/g, "");

  // ISBN length is either 10 or 13
  if (!value || (value.length !== 10 && value.length !== 13)) {
    throw Error(`The ISBN must be either 10 or 13 digits long.`);
  }

  if (value.length === 10) {
    if (calculateChecksum(value.split(""), ISBN10_WEIGHTS) % 11 !== 0) {
      throw Error(`${value} is not a valid ISBN.`);
    }
  }

  if (value.length === 13) {
    if (calculateChecksum(value.split(""), ISBN13_WEIGHTS) % 10 !== 0) {
      throw Error(`${value} is not a valid ISBN.`);
    }
  }
}
