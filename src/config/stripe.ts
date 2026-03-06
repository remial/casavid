export const PLANS = [
  {
    name: 'Free',
    slug: 'free',
    quota: 0,
    price: {
      monthly: {
        amount: 0,
        priceIds: {
          test: '',
          production: '',
        },
      },
      yearly: {
        amount: 0,
        priceIds: {
          test: '',
          production: '',
        },
      },
    },
  },
  {
    name: 'Starter',
    slug: 'starter',
    quota: 5,
    price: {
      monthly: {
        amount: 19,
        priceIds: {
          test: '',
          production: 'price_1T7sibLHSgRRnn5DBAyNexQu',
        },
      },
      yearly: {
        amount: 133,
        priceIds: {
          test: '',
          production: '',
        },
      },
    },
  },
  {
    name: 'Pro',
    slug: 'pro',
    quota: 20,
    price: {
      monthly: {
        amount: 39,
        priceIds: {
          test: '',
          production: 'price_1T7sjWLHSgRRnn5DionEak0x',
        },
      },
      yearly: {
        amount: 273,
        priceIds: {
          test: '',
          production: '',
        },
      },
    },
  },
  {
    name: 'Premium',
    slug: 'premium',
    quota: 50,
    price: {
      monthly: {
        amount: 79,
        priceIds: {
          test: '',
          production: 'price_1T7spOLHSgRRnn5DgQbnFpIk',
        },
      },
      yearly: {
        amount: 553,
        priceIds: {
          test: '',
          production: '',
        },
      },
    },
  },
]
