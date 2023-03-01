export const USERLINKACTIVEANDHELPSEND = {
  3: {
    active: 30,
    sendHelp: 60,
  },
  5: {
    active: 50,
    sendHelp: 100,
  },
  11: {
    active: 110,
    sendHelp: 220,
  },
};

export const PER_LINK_HELP_AMOUNT = 40.0;

export const FIRST_LEVEL_AWARD = 25.0;

export const ADMIN_ID = 1;

export function getUserLevel(direct: any, links: any) {
  if (direct >= 32 && links >= 5000) {
    return 'LEVEL_6';
  } else if (direct >= 32 && links >= 2500) {
    return 'LEVEL_5';
  } else if (direct >= 8 && links >= 1000) {
    return 'LEVEL_4';
  } else if (direct >= 6 && links >= 400) {
    return 'LEVEL_3';
  } else if (direct >= 4 && links >= 200) {
    return 'LEVEL_2';
  } else if (direct >= 3 && links >= 0) {
    return 'LEVEL_1';
  } else {
    return null;
  }
}

export const LEVEL_PRICES = {
  LEVEL_1: {
    levelIncome: 0.5,
    awardOrReward: 20,
  },
  LEVEL_2: {
    levelIncome: 1,
    awardOrReward: 100,
  },
  LEVEL_3: {
    levelIncome: 1.5,
    awardOrReward: 200,
  },
  LEVEL_4: {
    levelIncome: 2,
    awardOrReward: 500,
  },
  LEVEL_5: {
    levelIncome: 2.5,
    awardOrReward: 1250,
  },
  LEVEL_6: {
    levelIncome: 3,
    awardOrReward: 2500,
  },
};

export function generateTransactionId() {
  const chars =
    '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const length = 40;
  let transactionId = '';

  for (let i = 0; i < length; i++) {
    transactionId += chars[Math.floor(Math.random() * chars.length)];
  }

  return transactionId;
}


