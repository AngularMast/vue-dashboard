<template>
  <v-container fluid>
    <v-stepper v-model="e1">
      <v-stepper-header>
        <v-stepper-step :complete="e1 > 1" step="1" editable>Target</v-stepper-step>

        <v-divider></v-divider>

        <v-stepper-step :complete="e1 > 2" step="2" editable>Zone</v-stepper-step>

        <v-divider></v-divider>

        <v-stepper-step :complete="e1 > 3" step="3" editable>Offer</v-stepper-step>
      </v-stepper-header>
      <v-stepper-items>
        <v-stepper-content step="1">
          <v-form ref="form1">
            <v-card class="mb-5">
              <v-flex xs12 sm12 md12>
                <v-checkbox
                  v-model="allInterests"
                  :label="`All Interests`"
                ></v-checkbox>
              </v-flex>
              <v-flex xs12 sm12 md12 v-if="allInterests == false">
                <v-combobox
                  v-model="targetInterests"
                  :items="ctmMatrix"
                  label="Interest Category"
                  chips
                  clearable
                  solo
                  multiple
                  :rules="itemCount"
                >
                  <template v-slot:selection="data">
                    <v-chip :selected="data.selected" close @input="remove(data.item)">
                      <strong>{{ data.item }}</strong>&nbsp;
                      <span>(interest)</span>
                    </v-chip>
                  </template>
                </v-combobox>
              </v-flex>
              <v-flex xs12 sm12 md12>
                Interest is > than (in KMs)
                <v-slider v-model="interest" thumb-label></v-slider>
              </v-flex>
              <v-flex xs12 sm6 md3>
                  <v-layout>
                    <v-checkbox
                      v-model="allFuelPref"
                      :label="`All fuel preferences`"
                    ></v-checkbox>
                    <v-switch v-if="allFuelPref == false" v-model="premium" :label="`${premium? 'Premium' : 'Standard'}`"></v-switch>
                  </v-layout>
              </v-flex>
              <v-flex xs12 sm6 md3>
                  <v-layout>
                  <v-checkbox
                    v-model="brand"
                    :label="`No brand preference`"
                  ></v-checkbox>
                  <v-checkbox
                    v-model="brandCons"
                    :label="`Brand conscious`"
                  ></v-checkbox>
                  </v-layout>
              </v-flex>
            </v-card>

            <v-btn color="primary" @click="targetNext">Continue</v-btn>

            <v-btn flat to="/deals">Cancel</v-btn>
          </v-form>
        </v-stepper-content>

        <v-stepper-content step="2">
          <v-form ref="form2">
            <v-expansion-panel v-model="panel">
              <v-expansion-panel-content>
                <template v-slot:header>
                  <div>Post Code</div>
                </template>
                <v-card style="width: 90%;  margin-left: auto; margin-right: auto; ">
                  <v-combobox
                    v-model="targetPostCode"
                    :items="postCode"
                    label="Post Code(s)"
                    chips
                    clearable
                    solo
                    multiple
                    :rules="itemCount"
                  >
                    <template v-slot:selection="data">
                      <v-chip :selected="data.selected" close @input="removePost(data.item)">
                        <strong>{{ data.item }}</strong>&nbsp;
                        <span></span>
                      </v-chip>
                    </template>
                  </v-combobox>
                </v-card>
              </v-expansion-panel-content>
              <v-expansion-panel-content>
                <template v-slot:header>
                  <div>Location and Radius</div>
                </template>
                <v-card style="width: 90%;  margin-left: auto;   padding: 20px;  background: linear-gradient(45deg, #f3f3f3, transparent); margin-right: auto;    margin-bottom: 20px;">
                  <vuetify-google-autocomplete
                    ref="curLocation"
                    id="map"
                    append-icon="search"
                    placeholder="Input your location"
                    v-on:placechanged="getAddressData"
                  ></vuetify-google-autocomplete>
                  Radius (in Kms)
                  <v-slider v-model="radius" thumb-label></v-slider>
                </v-card>
              </v-expansion-panel-content>
            </v-expansion-panel>
            <!-- -->
            <v-btn color="primary" @click="zoneNext">Continue</v-btn>

            <v-btn flat to="/deals">Cancel</v-btn>
          </v-form>
        </v-stepper-content>

        <v-stepper-content step="3">
          <v-form ref="form3">
            <DropzoneComp ref="dropzone" />
            <v-container>
              <v-layout row wrap>
                <v-flex xs12 sm6>
                  <v-text-field
                    v-model="internalcode"
                    :counter="50"
                    label="Internal Code/Title"
                    required
                    :rules="inputRules"
                  ></v-text-field>
                </v-flex>
                <v-flex xs12 sm6>
                  <v-text-field
                    v-model="custTitle"
                    :counter="150"
                    label="Customer Facing Title"
                    required
                    :rules="inputRules"
                  ></v-text-field>
                </v-flex>
              </v-layout>
              <v-layout row wrap>
                <v-flex xs12 sm6>
                  <v-textarea
                    outline
                    auto-grow
                    v-model="description"
                    label="Description"
                    required
                    height="200"
                  ></v-textarea>
                </v-flex>
                <v-flex xs12 sm6>
                  <v-flex xs12 sm12>
                    Activation
                    <Datetime v-model="dateActivation" type="datetime" format="dd/MM/yyyy HH:mm" style="border-style: dotted;    font-size: 24px;    text-align: center;    line-height: 42px;">
                    </Datetime>
                    
                  </v-flex>
                  <v-flex xs12 sm12>
                    Expires
                    <Datetime v-model="dateExpires" type="datetime" format="dd/MM/yyyy HH:mm" style="border-style: dotted;    font-size: 24px;    text-align: center;    line-height: 42px;">
                    </Datetime>
                  </v-flex>

                  <v-flex xs12 sm12>
                    <v-text-field
                      v-model="URL"
                      :counter="300"
                      label="URL"
                      required
                      :rules="inputRules"
                    ></v-text-field>
                  </v-flex>
                </v-flex>
              </v-layout>
              <v-layout row wrap>
                <v-flex xs12 sm6>
                  <v-checkbox
                    v-model="isNotification"
                    label="Send as Push Notification?"
                    required
                  ></v-checkbox>
                </v-flex>
                <v-flex xs12 sm6>
                  <v-text-field
                    v-model="cta"
                    :counter="150"
                    label="Call to action"
                    required
                  ></v-text-field>
                </v-flex>
              </v-layout>

              <v-flex xs12 sm12>
                <v-textarea
                  v-model="message"
                  auto-grow
                  label="Marketing message for notification"
                  outline
                ></v-textarea>
              </v-flex>

              <v-btn @click="submit" :loading="loading">submit</v-btn>
              <v-btn @click="clear">clear</v-btn>
            </v-container>
          </v-form>
        </v-stepper-content>
      </v-stepper-items>
    </v-stepper>
  </v-container>
</template>

<script>
// import DateField from "@/components/helper/DateField";
import DropzoneComp from "@/components/DropzoneComp";
import { Datetime } from 'vue-datetime';

export default {
  name: "Deals",
  components: {
    //DateField,
    DropzoneComp,
    Datetime
  },
  data() {
    return {
      loading: false,
      e1: 0,
      clipped: false,
      drawer: true,
      fixed: false,
      interest: 10,
      radius: 0,

      panel: [true, true],

      custTitle: "Custome Title",
      ctmMatrix: [
        "Travel",
        "Car",
        "Health",
        "Home",
        "Pet",
        "Life",
        "Income",
        "Business",
        "Card",
        "Landlord",
        "Money",
        "Roadside",
        "Electricity",
        "Contents",
        "Hotels",
      ],
      targetInterests: [],

      fuelType: ["Premium", "Regular"],
      targetFuelType: ["Premium", "Regular"],

      fuelBrand: ["BP", "Shell", "Caltex", "Freedom", "Puma"],
      targetFuelBrand: ["BP", "Shell", "Caltex", "Freedom", "Puma"],

      targetPostCode: [],
      postCode: [],

      allInterests: true,
      miniVariant: true,
      right: true,
      rightDrawer: true,
      internalcode: "Offer test",
      gradient: "to top, #1c3e94, #1c3e94",

      items: [],
      search: null,
      curLocation: null,
      states: ["Brisbane", "Sydney", "Melbourne"],

      dateActivation: "2019-06-30",
      dateExpires: "2019-06-30",
      inputRules: [v => v.length > 0 || "Input value please."],
      itemCount: [v => v.length > 0 || "Select more than 1"],

      description: "This is an offer",
      URL:
        "https://",

      isNotification: true,
      cta: "Submit an Offer",
      message: "Message",
      name: "",
      premium: true,
      brand: true,
      brandCons: false,
      allFuelPref: true,
    };
  },
  watch: {
    brand(val) {
      this.brandCons = !val;
    },
    brandCons( val ) {

      this.brand = !val;
    },
    targetPostCode (val) {
      let diff = this.difference(val, this.postCode);
      this.postCode = this.postCode.concat(diff);
    }
  },
  methods: {
    difference(a1, a2) {
      var result = [];
      for (var i = 0; i < a1.length; i++) {
        if (a2.indexOf(a1[i]) === -1) {
          result.push(a1[i]);
        }
      }
      return result;
    },
    getAddressData: function(addressData, placeResultData, id) {
      this.curLocation = addressData;
      console.log(addressData, placeResultData, id);
    },
    remove(item) {
      this.targetInterests.splice(this.targetInterests.indexOf(item), 1);
      this.targetInterests = [...this.targetInterests];
    },
    removePost(item) {
      this.targetPostCode.splice(this.targetPostCode.indexOf(item), 1);
      this.targetPostCode = [...this.targetPostCode];
    },
    sendData() {
      this.loading = true;

      let files = this.$refs.dropzone.getFiles();
      let file = files[0];

      return new Promise((resolve, reject) => {
        this.$store
          .dispatch("app/upload_image", {
            file
          })
          .then(resp => {
            console.log("Upload Success!");
            let data = {
              offer: {
                type: "Offer",
                imageUrl:
                  "https://ctmdevblobstore.blob.core.windows.net/offers/" +
                  resp,
                title: this.custTitle,
                content: "This is a content",
                openUrl: this.URL,
                active: new Date(this.dateActivation).toISOString(),
                expire: new Date(this.dateExpires).toISOString()
              },
              target: {
                internal: this.internalcode,
                type: "Offer",
                location: "Home",
                interests: this.targetInterests,
                interestMin: this.interest,
                premium: true,
                brand: true,
                postCodes: this.targetPostCode,
                geoTarget: {
                  latitude: 0,
                  longitude: 0,
                  radius: this.radius
                },
                sendNotification: new Date().toISOString(),
                message: this.message
              }
            };

            console.log(data);

            this.$store
              .dispatch("app/sendoffer", {
                data
              })
              .then(() => {
                this.loading = false;
                this.$router.push("/deals");
              })
              .catch(err => {
                this.loading = false;
                console.log(err);
              });
            resolve(resp);
          })
          .catch(err => {
            this.loading = false;
            console.log(err);
            reject(err);
            return;
          });
      });
    },
    querySelections(v) {
      this.loading = true;
      // Simulated ajax query
      setTimeout(() => {
        this.items = this.states.filter(e => {
          return (e || "").toLowerCase().indexOf((v || "").toLowerCase()) > -1;
        });
        this.loading = false;
      }, 500);
    },
    submit() {
      this.selectErrors = [];
      if (!this.$refs.form1.validate()) {
        this.e1 = 1;
      } else if (!this.$refs.form2.validate()) {
        if (this.select == null) {
          this.selectErrors.push("Input your location");
        } else {
          this.e1 = 2;
        }
      } else if (this.$refs.form3.validate()) {
        //upload
        this.sendData();
      }
    },
    targetNext() {
      if (this.$refs.form1.validate()) {
        this.e1 = 2;
      }
    },
    zoneNext() {
      if (this.$refs.form2.validate()) {
        //if (this.select != null) {
        this.e1 = 3;
        //}
      }
    },
    clear() {
      this.$refs.form2.reset();
      this.$refs.form3.reset();
      this.e1 = 1;
    }
  }
};
</script>

<style lang="stylus"></style>
