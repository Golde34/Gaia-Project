const serverHost = import.meta.env.SERVER_HOST ?? 'localhost';
const gaiaConnectorPort = parseInt( import.meta.env.GAIA_CONNECTOR_PORT ?? '5000' );
const authenticationServicePort = parseInt( import.meta.env.AUTHENTICATION_SERVICE_PORT ?? '4001' );
const middlewarePort = parseInt( import.meta.env.MIDDLEWARE_PORT ?? '4000')
const chatHubPort = parseInt( import.meta.env.CHAT_HUB_PORT ?? '4002' );
const serverTimeout = parseInt( import.meta.env.SERVER_TIMEOUT ?? '10000' );
const notifyAgentWSHost = import.meta.env.NOTIFICATION_WS_HOST ?? 'localhost:4003';

const REQUIRED_ENV_VARS = [
    'SERVER_HOST',
    'AUTHENTICATION_SERVICE_PORT',
    'GAIA_CONNECTOR_PORT',
    'CHAT_HUB_PORT',
    'SERVER_TIMEOUT',
    'MIDDLEWARE_PORT',
    'NOTIFICATION_WS_HOST',
];

export const config = {
    serverHost: serverHost,
    gaiaConnectorPort: gaiaConnectorPort,
    authenticationServicePort: authenticationServicePort,
    middlewarePort: middlewarePort,
    chatHubPort: chatHubPort,
    serverTimeout: serverTimeout,
    notifyAgentWSHost: notifyAgentWSHost,
};

export const validateEnvironmentVars = () => {
    const missingRequirements = [];
    REQUIRED_ENV_VARS.forEach( ( envVar ) => {
        if ( !process.env[envVar] ) {
            missingRequirements.push( envVar );
        }
    });
    if (missingRequirements.length != 0) {
        throw new Error( `Missing environment variables: ${missingRequirements.join(', ')}` );
    }
}