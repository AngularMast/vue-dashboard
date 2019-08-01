import axios from "axios";

import auth from "../../auth/authService";

const state = {
  items: [],
  error: null,
  checkoutStatus: null,
  showDrawer: true,
  status: "",
  token: localStorage.getItem("token") || "",
  user: {},
  offer: [],
  offer_data: [],
  user_data: [],
  claims: [],
  image: null,
  azure_name: "",
  api_key : "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6Ik1VTkdNa05GUVRsRVJqRTVOakJEUkRVNU9UVTRRakV3T0VORU1USkJNVU5EUVVRM01qSTNNZyJ9.eyJpc3MiOiJodHRwczovL2VudmlzYWdlLWRldi1jdG0uYXUuYXV0aDAuY29tLyIsInN1YiI6ImF1dGgwfDVkMmVhMGE1OTQ5NTI2MGViYzVkNjk5NSIsImF1ZCI6WyJodHRwOi8vY3RtLWFwaS1kZXYuYXp1cmV3ZWJzaXRlcy5uZXQvIiwiaHR0cHM6Ly9lbnZpc2FnZS1kZXYtY3RtLmF1LmF1dGgwLmNvbS91c2VyaW5mbyJdLCJpYXQiOjE1NjM2MjkyMjQsImV4cCI6MTU2MzYzNjQyNCwiYXpwIjoiRWFRN28yRFA1cEdtMGE1dk92VlZ6SElYaXdKRllwMXciLCJzY29wZSI6Im9wZW5pZCBwcm9maWxlIGVtYWlsIiwicGVybWlzc2lvbnMiOlsiYXBwLW9mZmVycyIsImFwcC11c2VycyJdfQ.gPE8X2kFvIDSyvBQ7-3NmXgrjBZ4JAZE7TmHNRM8aSyfOCNo2v02eOCs_vnolBYpL6s6jqLdlE30GVsuI_eJT7v_X6YD4dahmAVYD35XnQ-HWn5i0ZcUjFzXrPhF192Y7ESzaWue-zfnN4KVngDz0PYn6K-B7PofRvmmDKAb3SDWerAl-5L4EujM51L4Y7PJcSmBJ39nmUO7w5I6NVeYaD4MiIykNkseFOp-k_ReqrYwx5cm364FE_RxdZyteewNHyreAhMa5iuCp5ETtpc3T3bAIl-rkDTDRr3-5KT4LN3e_3rNkmVrY8W21O2R2VQS_23BuECvDiJsCalu5W_NVg"
};

function get_token() {
  return new Promise((resolve, reject) => {
    auth.getResult().then((authResult) => {
      resolve(authResult.accessToken)
    })
  })
}
// getters
const getters = {
  isLoggedIn: state => !!state.token,
  authStatus: state => state.status
};
// actions
const actions = {
  upload_image({
    commit
  }, image) {
    commit("upload_image_request");
    return new Promise((resolve, reject) => {
      get_token()
        .then(resp => {
          const token = resp;
          localStorage.setItem("token", token);
          axios.defaults.headers.common["Authorization"] = token;

          let file = image.file

          var blobUri = 'https://ctmdevblobstore.blob.core.windows.net';
          var blobService = AzureStorage.Blob.createBlobServiceWithSas(blobUri, 'sv=2018-03-28&ss=b&srt=sco&sp=rwdlac&se=2019-08-31T07:59:25Z&st=2019-06-27T23:59:25Z&spr=https&sig=XlOMbfvTtajJ5P7hJt9425vLOaDefMAbYfOl%2F4Z5lcc%3D').withFilter(new AzureStorage.Blob.ExponentialRetryPolicyFilter());

          if (!blobService)
            return;

          // Make a smaller block size when uploading small blobs
          var blockSize = file.size > 1024 * 1024 * 32 ? 1024 * 1024 * 4 : 1024 * 512;
          var options = {
            storeBlobContentMD5: false,
            blockSize: blockSize
          };
          blobService.singleBlobPutThresholdInBytes = blockSize;

          var finishedOrError = false;

          var s = [];
          var hexDigits = "0123456789abcdef";
          for (var i = 0; i < 36; i++) {
            s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
          }
          s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010
          s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
          s[8] = s[13] = s[18] = s[23] = "-";

          var uuid = s.join("");

          var arr = file.name.split('.');
          state.azure_name = arr[0] + '.' + uuid + '.' + arr[1];
          var speedSummary = blobService.createBlockBlobFromBrowserFile('offers', state.azure_name, file, options, function (error, result, response) {
            finishedOrError = true;
            if (error) {
              commit("upload_image_failure");
            } else {
              commit("upload_image_success", file);
              resolve(state.azure_name);
            }
          });
        })
        .catch(err => {
          localStorage.removeItem("token");
        });

    });
  },
  sendoffer({
    commit
  }, offerBinding) {
    return new Promise((resolve, reject) => {
      commit("offer_request");
      axios({
          url: "https://ctm-api-dev.azurewebsites.net/api/offers/target?api_key=" + state.api_key,
          method: "post",
          data: JSON.stringify(offerBinding.data),
          headers: {
            "Content-Type": "application/json-patch+json",
            "Authorization": `Bearer ${localStorage.token}`
          }
        })
        .then(resp => {
          commit("send_offer_success", offerBinding);
          resolve(resp);
        })
        .catch(err => {
          commit("send_offer_failed");
          reject(err);
        });
    });
  },
  getoffer({
    commit
  }, params) {
    return new Promise((resolve, reject) => {
      commit("get_offer_request");
      get_token()
        .then(resp => {
          const token = resp;
          localStorage.setItem("token", token);
          axios({
              url: "https://ctm-api-dev.azurewebsites.net/api/offers/filter?Count=" + params.params.Count + "&Page=" + params.params.Page + "&Sort=" + params.params.Sort + "&api_key=" + state.api_key,
              method: "post",
              data: JSON.stringify({
                "hasFilter": true,
                "filters": [{
                  "fieldName": "title",
                  "value": params.params.Search,
                  "operator": 3,
                  "tablePrefix": "FT"
                }]
              }),
              headers: {
                "Content-Type": "application/env.app.ctm.superadmin-v1+json",
                "Authorization": `Bearer ${localStorage.token}`
              },
            })
            .then(resp => {
              commit("get_offer_success", resp.data);
              resolve(resp);
            })
            .catch(err => {
              commit("get_offer_failed");
              reject(err);
            });
        })
        .catch(err => {
          commit("get_offer_failed");
          reject(err);
        });
    })

  },
  getuser({
    commit
  }, params) {
    return new Promise((resolve, reject) => {
      commit("get_user_request");
      get_token()
        .then(resp => {
          const token = resp;
          localStorage.setItem("token", token);
          axios({
              url: "https://ctm-api-dev.azurewebsites.net/api/users/filter?Count=" + params.params.Count + "&Page=" + params.params.Page + "&Sort=" + params.params.Sort + "&api_key=" + state.api_key,
              method: "post",
              data: JSON.stringify({
                "hasFilter": true,
                "filters": [{
                  "fieldName": "email",
                  "value": params.params.Search,
                  "operator": 3,
                  "tablePrefix": "FT"
                }]
              }),
              headers: {
                "Content-Type": "application/env.app.ctm.superadmin-v1+json",
                "Authorization": `Bearer ${localStorage.token}`
              },
            })
            .then(resp => {
              commit("get_user_success", resp.data);
              resolve(resp);
            })
            .catch(err => {
              commit("get_user_failed");
              reject(err);
            });
        });
    })

  },
  getclaims({
    commit
  }) {
    return new Promise((resolve, reject) => {
      commit("get_claims_request");
      get_token()
        .then(resp => {
          const token = resp;
          localStorage.setItem("token", token);
          axios({
              url: "https://ctm-api-dev.azurewebsites.net/claims?" + "api_key="  + state.api_key,
              method: "get",
              headers: {
                "Content-Type": "application/env.app.ctm.superadmin-v1+json",
                "Authorization": `Bearer ${localStorage.token}`
              },
            })
            .then(resp => {
              commit("get_claims_success", resp.data);
              resolve(resp);
            })
            .catch(err => {
              commit("get_claims_failed");
              reject(err);
            });
        });
    })

  },
  seterror({
    commit
  }, err) {
      commit("set_error", err);
  },
  geterror({
    commit
  }) {
      commit("get_error");
      return new Promise(resolve => {
        resolve(state.error);
      });
  },
  logout({
    commit
  }) {
    return new Promise(resolve => {
      commit("logout");
      localStorage.removeItem("token");
      delete axios.defaults.headers.common["Authorization"];
      resolve();
    });
  }
};

// mutations
const mutations = {
  upload_image_request(state) {
    state.status = "upload_image_request";
  },
  set_error(state, err) {
    state.status = "set_error";
    state.error = err;
  },
  get_error(state) {
    state.status = "get_error";
  },
  upload_image_success(state, file) {
    state.status = "upload_image_success";
    state.image = file;
  },
  upload_image_failure(state) {
    state.status = "upload_image_failure";
  },
  get_offer_request(state) {
    state.status = "sending_offer_request";
  },
  get_offer_success(state, offer) {
    state.status = "get_offer_success";
    state.offer_data = offer;
  },
  get_offer_failed(state) {
    state.status = "get_offer_failed";
  },
  get_user_request(state) {
    state.status = "sending_offer_request";
  },
  get_user_success(state, user_data) {
    state.status = "get_offer_success";
    state.user_data = user_data;
  },
  get_user_failed(state) {
    state.status = "get_offer_failed";
  },
  get_claims_request(state) {
    state.status = "sending_claims_request";
  },
  get_claims_success(state, data) {
    state.status = "get_claims_success";
    state.claims = data;
  },
  get_claims_failed(state) {
    state.status = "get_claims_failed";
  },
  offer_request(state) {
    state.status = "sending_offer";
  },
  send_offer_success(state, offerBinding) {
    state.status = "sending_offer_success";
    state.offer = offerBinding;
  },
  send_offer_failed(state) {
    state.status = "sending_offer_failed";
  },
  logout(state) {
    state.status = "";
    state.token = "";
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};