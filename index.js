const fetch = (...args) => import("node-fetch").then(({default: f}) => f(...args));
