export function PositiveNumberValidator(value: any) {
  if (Number(value) <= 0) {
    throw Error(`${value} must be a positive number.`);
  }
}
