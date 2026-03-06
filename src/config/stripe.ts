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
          production: 'price_1PwkyVLqZXIo1J6dwuKYUk4I',
        },
      },
      yearly: {
        amount: 133,
        priceIds: {
          test: '',
          production: 'price_1SNu5zLqZXIo1J6dMc9P5vSl',
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
          production: 'price_1PwkzpLqZXIo1J6d8eV0CnuK',
        },
      },
      yearly: {
        amount: 273,
        priceIds: {
          test: '',
          production: 'price_1SNu73LqZXIo1J6dPLNHq0ef', 
        },
      },
    },
  },
  {
    name: 'Business',
    slug: 'business',
    quota: -1,
    price: {
      monthly: {
        amount: 79,
        priceIds: {
          test: '',
          production: 'price_1QNAd5LqZXIo1J6dwEsexReQ',
        },
      },
      yearly: {
        amount: 553,
        priceIds: {
          test: '',
          production: 'price_1SNu85LqZXIo1J6dUq0X5BlH',
        },
      },
    },
  },
]
