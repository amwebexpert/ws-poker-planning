import { APP_VERSION_INFO, LONG_VERSION_DATE } from './constants';

export const SECURITY_HEADERS_OTHERS = [
  { name:  'Cache-Control',
    value: 'public, max-age=30672000'
  },
  { name:   `X-${APP_VERSION_INFO.NAME}`,
    value:  `v${LONG_VERSION_DATE}`
  },
];

// https://stackoverflow.com/a/34320684/704681
// TODO: try to use npm helmet (analyse source code to make usage without express framework)
export const SECURITY_HEADERS = [
    ...SECURITY_HEADERS_OTHERS,
    { name:   'Strict-Transport-Security',
      value:  'max-age=31536000; includeSubDomains; preload'
    },
    { name:   'X-Content-Type-Options',
      value:  'nosniff'
    },
    { name:   'X-Frame-Options',
      value:  'SAMEORIGIN'
    },
    { name:   'X-XSS-Protection',
      value:  '1; mode=block'
    }
  ];
