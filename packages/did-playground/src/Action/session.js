/* eslint-disable object-curly-newline */
import createSessionContext from '../Session';

const { SessionProvider, SessionContext, SessionConsumer, withSession } = createSessionContext('did.playground.token');
export { SessionProvider, SessionContext, SessionConsumer, withSession };
