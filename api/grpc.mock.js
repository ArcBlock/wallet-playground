// This file is to make the api deployable to netlify functions
const noop = () => ({});
const grpcMock = {
  makeGenericClientConstructor: noop,
  credentials: {
    createInsecure: noop,
  },
};

module.exports = grpcMock;
