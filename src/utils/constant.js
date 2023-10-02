// In this directIncomeConstant all values to be consider as percentage
const directIncomeConstant = {
  direct: 20, // percentage
};

// In this globalPackageType all values to be consider as coin (Tron)
const globalPackageType = {
  1: 100,
  2: 200,
  3: 400,
  4: 800,
  5: 1600,
  6: 3200,
  7: 6400,
  8: 12800,
};

// In this teamIncomeConstant all values to be consider as percentage
const teamIncomeConstant = {
  1: 3,
  2: 2,
  3: 1,
  4: 1,
  5: 0.5,
  6: 0.5,
  7: 0.5,
  8: 0.5,
  9: 0.5,
  10: 0.5,
};

const boostConstant = {
  admin: 10, // percentage
  coinReserve: 20, // coin
  coinBoostingLevel: 10, // coin
};

module.exports = {
  directIncomeConstant,
  globalPackageType,
  boostConstant,
  teamIncomeConstant,
};
