export const roundNum = (num: number) => Math.round((num + Number.EPSILON) * 100) / 100;
export const roundNumToStringTwo = (num: number) => String(roundNum(num).toFixed(2));
// Edge case three decimals cents
export const checkExtraCentPaidByEmployer = (
  num: string,
  contribution: number,
  finalRate: string
) => {
  let retVal = num;
  if (contribution === 50 && +num < +finalRate - +num) {
    retVal = roundNumToStringTwo(+finalRate - +num);
  }
  return retVal;
};
