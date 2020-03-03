/* eslint-disable object-curly-newline */
async function createSwapOrder(api) {
  const res = await api.post('/api/did/swap', {});
  return { tid: res.data.traceId };
}

const getValidPayAmount = (payAmount, price) => {
  if (payAmount !== undefined) {
    return payAmount;
  }

  if (price !== undefined) {
    return price;
  }

  return 1;
};

// https://github.com/ArcBlock/gatsby-extensions/issues/56
export const actions = {
  // Currency
  receive_local_token: {
    action: 'receive_token',
    extraParams: props => ({ chain: 'local', amount: props.amount || 1 }),
  },
  receive_foreign_token: {
    action: 'receive_token',
    extraParams: props => ({ chain: 'foreign', amount: props.amount || 1 }),
  },
  send_local_token: {
    action: 'send_token',
    extraParams: props => ({ chain: 'local', amount: props.amount || 1 }),
  },
  send_foreign_token: {
    action: 'send_token',
    extraParams: props => ({ chain: 'foreign', amount: props.amount || 1 }),
  },
  exchange_to_foreign_token: {
    action: 'swap_token',
    onStart: createSwapOrder,
    extraParams: props => ({ action: 'buy', rate: props.exchangeRate, amount: props.amount || 1 }),
  },
  exchange_to_local_token: {
    action: 'swap_token',
    onStart: createSwapOrder,
    extraParams: props => ({ action: 'sell', rate: props.exchangeRate, amount: props.amount || 1 }),
  },

  // Cross chain assets and tokens
  buy_foreign_certificate_with_local_token: {
    action: 'swap_asset',
    onStart: createSwapOrder,
    extraParams: props => ({
      action: 'buy',
      type: 'certificate',
      pfc: 'local',
      price: props.price || 1,
      name: props.name,
      desc: props.description,
      loc: props.location,
      bg: props.backgroundUrl,
      logo: props.logoUrl,
    }),
  },
  buy_foreign_badge_with_local_token: {
    action: 'swap_asset',
    onStart: createSwapOrder,
    extraParams: props => ({
      action: 'buy',
      type: 'badge',
      pfc: 'local',
      price: props.price || 1,
      name: props.name,
      desc: props.description,
      loc: props.location,
      bg: props.backgroundUrl,
      logo: props.logoUrl,
    }),
  },
  buy_foreign_ticket_with_local_token: {
    action: 'swap_asset',
    onStart: createSwapOrder,
    extraParams: props => ({
      action: 'buy',
      type: 'ticket',
      pfc: 'local',
      price: props.price || 1,
      name: props.name,
      desc: props.description,
      loc: props.location,
      bg: props.backgroundUrl,
      logo: props.logoUrl,
    }),
  },
  sell_foreign_certificate_for_local_token: {
    action: 'swap_asset',
    onStart: createSwapOrder,
    extraParams: props => ({
      action: 'sell',
      type: 'certificate',
      pfc: 'local',
      price: props.price || 1,
      name: props.name,
    }),
  },
  sell_foreign_badge_for_local_token: {
    action: 'swap_asset',
    onStart: createSwapOrder,
    extraParams: props => ({ action: 'sell', type: 'badge', pfc: 'local', price: props.price || 1, name: props.name }),
  },
  sell_foreign_ticket_for_local_token: {
    action: 'swap_asset',
    onStart: createSwapOrder,
    extraParams: props => ({ action: 'sell', type: 'ticket', pfc: 'local', price: props.price || 1, name: props.name }),
  },

  buy_local_certificate_with_foreign_token: {
    action: 'swap_asset',
    onStart: createSwapOrder,
    extraParams: props => ({
      action: 'buy',
      type: 'certificate',
      pfc: 'foreign',
      price: props.price || 1,
      name: props.name,
      desc: props.description,
      loc: props.location,
      bg: props.backgroundUrl,
      logo: props.logoUrl,
    }),
  },
  buy_local_badge_with_foreign_token: {
    action: 'swap_asset',
    onStart: createSwapOrder,
    extraParams: props => ({
      action: 'buy',
      type: 'badge',
      pfc: 'foreign',
      price: props.price || 1,
      name: props.name,
      desc: props.description,
      loc: props.location,
      bg: props.backgroundUrl,
      logo: props.logoUrl,
    }),
  },
  buy_local_ticket_with_foreign_token: {
    action: 'swap_asset',
    onStart: createSwapOrder,
    extraParams: props => ({
      action: 'buy',
      type: 'ticket',
      pfc: 'foreign',
      price: props.price || 1,
      name: props.name,
      desc: props.description,
      loc: props.location,
      bg: props.backgroundUrl,
      logo: props.logoUrl,
    }),
  },
  sell_local_certificate_for_foreign_token: {
    action: 'swap_asset',
    onStart: createSwapOrder,
    extraParams: props => ({
      action: 'sell',
      type: 'certificate',
      pfc: 'foreign',
      price: props.price || 1,
      name: props.name,
    }),
  },
  sell_local_badge_for_foreign_token: {
    action: 'swap_asset',
    onStart: createSwapOrder,
    extraParams: props => ({
      action: 'sell',
      type: 'badge',
      pfc: 'foreign',
      price: props.price || 1,
      name: props.name,
    }),
  },
  sell_local_ticket_for_foreign_token: {
    action: 'swap_asset',
    onStart: createSwapOrder,
    extraParams: props => ({
      action: 'sell',
      type: 'ticket',
      pfc: 'foreign',
      price: props.price || 1,
      name: props.name,
    }),
  },

  // Exchange Scenarios
  buy_local_certificate_with_local_token: {
    action: 'exchange_assets',
    extraParams: props => ({
      pa: getValidPayAmount(props.payAmount, props.price),
      pt: 'token',
      ra: props.receiveAmount || 1,
      rt: 'certificate',
      name: props.name,
      desc: props.description,
      loc: props.location,
      bg: props.backgroundUrl,
      logo: props.logoUrl,
    }),
  },
  sell_local_certificate_for_local_token: {
    action: 'exchange_assets',
    extraParams: props => ({
      pa: props.payAmount || 1,
      pt: 'certificate',
      ra: props.receiveAmount || props.price || 1,
      rt: 'token',
      name: props.name,
    }),
  },
  buy_local_badge_with_local_token: {
    action: 'exchange_assets',
    extraParams: props => ({
      pa: getValidPayAmount(props.payAmount, props.price),
      pt: 'token',
      ra: props.receiveAmount || 1,
      rt: 'badge',
      name: props.name,
      desc: props.description,
      loc: props.location,
      bg: props.backgroundUrl,
      logo: props.logoUrl,
    }),
  },
  sell_local_badge_for_local_token: {
    action: 'exchange_assets',
    extraParams: props => ({
      pa: props.payAmount || 1,
      pt: 'badge',
      ra: props.receiveAmount || props.price || 1,
      rt: 'token',
      name: props.name,
    }),
  },
  buy_local_ticket_with_local_token: {
    action: 'exchange_assets',
    extraParams: props => ({
      pa: getValidPayAmount(props.payAmount, props.price),
      pt: 'token',
      ra: props.receiveAmount || 1,
      rt: 'ticket',
      name: props.name,
      desc: props.description,
      loc: props.location,
      bg: props.backgroundUrl,
      logo: props.logoUrl,
    }),
  },
  sell_local_ticket_for_local_token: {
    action: 'exchange_assets',
    extraParams: props => ({
      pa: props.payAmount || 1,
      pt: 'ticket',
      ra: props.receiveAmount || props.price || 1,
      rt: 'token',
      name: props.name,
    }),
  },
  buy_local_ticket_with_local_certificate: {
    action: 'exchange_assets',
    extraParams: props => ({
      pa: props.payAmount || 1,
      pt: 'certificate',
      ra: props.receiveAmount || 1,
      rt: 'ticket',
      name: props.name,
    }),
  },
  buy_local_certificate_with_local_ticket: {
    action: 'exchange_assets',
    extraParams: props => ({
      pa: props.payAmount || 1,
      pt: 'ticket',
      ra: props.receiveAmount || 1,
      rt: 'certificate',
      name: props.name,
    }),
  },
  consume_asset: {
    action: 'consume_asset',
    extraParams: ({ type, pfc, typeUrl, name, did }) => ({
      pfc,
      type,
      tu: typeUrl,
      name,
      did,
    }),
  },
  consume_asset_by_did: {
    action: 'consume_asset',
    extraParams: ({ pfc, type, did }) => ({
      pfc,
      type,
      did,
    }),
  },
};

export const getActionName = (config, props) => {
  if (typeof config === 'string') {
    return config;
  }

  if (typeof config.action === 'string') {
    return config.action;
  }

  if (typeof config.action === 'function') {
    return config.action(props);
  }

  throw new Error('Cannot determine playground button action');
};

export const getActionParams = (config, props) => {
  if (typeof config === 'string') {
    return {};
  }

  if (!config.extraParams) {
    return {};
  }

  if (typeof config.extraParams === 'function') {
    return config.extraParams(props);
  }

  if (typeof config.extraParams === 'object') {
    return config.extraParams;
  }

  return {};
};
