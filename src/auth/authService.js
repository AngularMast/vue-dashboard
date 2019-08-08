import auth0 from "auth0-js";
import { EventEmitter } from "events";
import authConfig from "../../auth_config.json";

const webAuth = new auth0.WebAuth({
  domain: authConfig.domain,
  redirectUri: `${window.location.origin}/callback`,
  clientID: authConfig.clientId,
  audience: authConfig.apiIdentifier,
  responseType: /*"code id_token */"token",
  scope: "openid profile email"
});

const localStorageKey = "loggedIn";
const loginEvent = "loginEvent";

class AuthService extends EventEmitter {
  idToken = null;
  profile = null;
  tokenExpiry = null;
  result = null;

  login(customState) {
    webAuth.authorize({
      //connection: "Mobile App Development",
      appState: customState
    });
  }

  logOut() {
    localStorage.removeItem(localStorageKey);

    this.idToken = null;
    this.tokenExpiry = null;
    this.profile = null;
    this.result = null;

    webAuth.logout({
      returnTo: `${window.location.origin}`
    });

    this.emit(loginEvent, { loggedIn: false });
  }

  getHashValue(key) {
    var matches = window.location.hash.match(new RegExp(key+'=([^&]*)'));
    return matches ? matches[1] : null;
  }

  handleAuthentication() {
    return new Promise((resolve, reject) => {
      webAuth.parseHash({hash: window.location.hash}, (err, authResult) => {
        authResult.code = this.getHashValue("code");
        if (err) {
          this.emit(loginEvent, {
            loggedIn: false,
            error: err,
            errorMsg: err.statusText
          });
          reject(err);
        } else {
          this.localLogin(authResult);
          resolve(authResult.idToken);
        }
      });
    });
  }

  isAuthenticated() {
    return (
      Date.now() < this.tokenExpiry &&
      localStorage.getItem(localStorageKey) === "true"
    );
  }

  isIdTokenValid() {
    return this.idToken && this.tokenExpiry && Date.now() < this.tokenExpiry;
  }

  isResultValid() {
    return this.result && this.tokenExpiry && Date.now() < this.tokenExpiry;
  }

  getResult() {
    return new Promise((resolve, reject) => {
      if (this.isResultValid()) {
        resolve(this.result);
      } else if (this.isAuthenticated()) {
        this.renewTokens().then(authResult => {
          resolve(authResult);
        }, reject);
      } else {
        resolve();
      }
    });
  }

  getIdToken() {
    return new Promise((resolve, reject) => {
      if (this.isIdTokenValid()) {
        resolve(this.idToken);
      } else if (this.isAuthenticated()) {
        this.renewTokens().then(authResult => {
          resolve(authResult.idToken);
        }, reject);
      } else {
        resolve();
      }
    });
  }

  localLogin(authResult) {
    this.idToken = authResult.idToken;
    this.profile = authResult.idTokenPayload;
    this.result = authResult;
    // Convert the expiry time from seconds to milliseconds,
    // required by the Date constructor
    this.tokenExpiry = new Date(this.profile.exp * 1000);

    localStorage.setItem(localStorageKey, "true");

    this.emit(loginEvent, {
      loggedIn: true,
      profile: authResult.idTokenPayload,
      state: authResult.appState || {}
    });
  }

  renewTokens() {
    return new Promise((resolve, reject) => {
      if (localStorage.getItem(localStorageKey) !== "true") {
        return reject("Not logged in");
      }

      webAuth.checkSession({}, (err, authResult) => {
        if (err) {
          reject(err);
        } else {
          this.localLogin(authResult);
          resolve(authResult);
        }
      });
    });
  }
}

const service = new AuthService();

service.setMaxListeners(5);

export default service;
