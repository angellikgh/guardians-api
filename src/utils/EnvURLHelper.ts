const { PUBLIC_ENVIRONMENT } = process.env;

export default class EnvURLHelper {
  static getFEBaseURL() {
    let retVal = '';
    switch (PUBLIC_ENVIRONMENT) {
      case 'development':
        retVal = `http://localhost:3000`;
        break;
      case 'uat':
        retVal = `https://benworks-client.g12tdev.com`;
        break;
      case 'production':
        retVal = `https://benworks.io`;
        break;
      default:
        retVal = 'http://localhost:3000';
        break;
    }
    return retVal;
  }

  static getBEBaseURL() {
    let retVal = '';
    switch (PUBLIC_ENVIRONMENT) {
      case 'development':
        retVal = 'http://localhost:3000/api/proxy';
        break;
      case 'uat':
        retVal = `https://benworks-client.g12tdev.com/api/proxy`;
        break;
      case 'production':
        retVal = `https://benworks.io/api/proxy`;
        break;
      default:
        retVal = 'http://localhost:3000/api/proxy';
        break;
    }
    return retVal;
  }
}
