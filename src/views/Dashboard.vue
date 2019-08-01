<template>
  <div id="pageDashboard">
    <v-container grid-list-xl fluid>
      <v-layout row wrap>
        <!-- <v-flex lg12 sm12 xs12>
          <h3 style="color: red">{{errMsg }}</h3>
        </v-flex> -->
        <v-flex lg8 sm12 xs12>
          <v-widget title="Site Traffic" content-bg="white">
            <v-btn icon slot="widget-header-action">
              <v-icon class="text--secondary">refresh</v-icon>
            </v-btn>
            <div slot="widget-content">
              <e-chart
                :path-option="[
                  ['dataset.source', siteTrafficData],
                  ['color', [color.lightBlue.base, color.green.lighten1]],
                  ['legend.show', true],
                  ['xAxis.axisLabel.show', true],
                  ['yAxis.axisLabel.show', true],
                  ['grid.left', '2%'],
                  ['grid.bottom', '5%'],
                  ['grid.right', '3%'],
                  ['series[0].type', 'bar'],
                  ['series[0].areaStyle', {}],
                  ['series[0].smooth', true],
                  ['series[1].smooth', true],
                  ['series[1].type', 'bar'],
                  ['series[1].areaStyle', {}]
                ]"
                height="400px"
                width="100%"
              ></e-chart>
            </div>
          </v-widget>
        </v-flex>
        <v-flex lg4 sm12 xs12>
          <v-widget title="Top Location" content-bg="white">
            <div slot="widget-content">
              <e-chart
                :path-option="[
                  ['dataset.source', locationData],
                  ['legend.bottom', '0'],
                  [
                    'color',
                    [
                      color.lightBlue.base,
                      color.indigo.base,
                      color.pink.base,
                      color.green.base,
                      color.cyan.base,
                      color.teal.base
                    ]
                  ],
                  ['xAxis.show', false],
                  ['yAxis.show', false],
                  ['series[0].type', 'pie'],
                  ['series[0].avoidLabelOverlap', true],
                  ['series[0].radius', ['50%', '70%']]
                ]"
                height="400px"
                width="100%"
              ></e-chart>
            </div>
          </v-widget>
        </v-flex>
      </v-layout>
    </v-container>
  </div>
</template>
<style lang="stylus" scoped>
  .my-event {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    border-radius: 2px;
    background-color: #1867c0;
    color: #ffffff;
    border: 1px solid #1867c0;
    font-size: 12px;
    padding: 3px;
    cursor: pointer;
    margin-bottom: 1px;
    left: 4px;
    margin-right: 8px;
    position: relative;

    &.with-time {
      position: absolute;
      right: 4px;
      margin-right: 0px;
    }
  }
</style>
<script>
import API from "@/api";
import EChart from "@/components/chart/echart";
import MiniStatistic from "@/components/widgets/statistic/MiniStatistic";
import ProfileCard from "@/components/widgets/card/ProfileCard";
import PlainTable from "@/components/widgets/list/PlainTable";
import PlainTableOrder from "@/components/widgets/list/PlainTableOrder";
import VWidget from "@/components/VWidget";
import Material from "vuetify/es5/util/colors";
import VCircle from "@/components/circle/VCircle";
import BoxChart from "@/components/widgets/chart/BoxChart";
import ChatWindow from "@/components/chat/ChatWindow";
import CircleStatistic from "@/components/widgets/statistic/CircleStatistic";
import LinearStatistic from "@/components/widgets/statistic/LinearStatistic";
export default {
  components: {
    VWidget,
    MiniStatistic,
    ChatWindow,
    VCircle,
    ProfileCard,
    EChart,
    BoxChart,
    CircleStatistic,
    LinearStatistic,
    PlainTable,
    PlainTableOrder
  },
  data: () => ({
    errMsg: null,
    today: '2019-01-08',
      events: [
        {
          title: 'Weekly Meeting',
          date: '2019-01-07',
          time: '09:00',
          duration: 45
        },
        {
          title: 'Thomas\' Birthday',
          date: '2019-01-10'
        },
        {
          title: 'Mash Potatoes',
          date: '2019-01-09',
          time: '12:30',
          duration: 180
        }
      ],
    color: Material,
    selectedTab: "tab-1",
    linearTrending: [
      {
        subheading: "Sales",
        headline: "2,55",
        caption: "increase",
        percent: 15,
        icon: {
          label: "trending_up",
          color: "success"
        },
        linear: {
          value: 15,
          color: "success"
        }
      },
      {
        subheading: "Revenue",
        headline: "6,553",
        caption: "increase",
        percent: 10,
        icon: {
          label: "trending_down",
          color: "error"
        },
        linear: {
          value: 15,
          color: "error"
        }
      },
      {
        subheading: "Orders",
        headline: "5,00",
        caption: "increase",
        percent: 50,
        icon: {
          label: "arrow_upward",
          color: "info"
        },
        linear: {
          value: 50,
          color: "info"
        }
      }
    ],
    trending: [
      {
        subheading: "Email",
        headline: "15+",
        caption: "email opens",
        percent: 15,
        icon: {
          label: "email",
          color: "info"
        },
        linear: {
          value: 15,
          color: "info"
        }
      },
      {
        subheading: "Tasks",
        headline: "90%",
        caption: "tasks completed.",
        percent: 90,
        icon: {
          label: "list",
          color: "primary"
        },
        linear: {
          value: 90,
          color: "success"
        }
      },
      {
        subheading: "Issues",
        headline: "100%",
        caption: "issues fixed.",
        percent: 100,
        icon: {
          label: "bug_report",
          color: "primary"
        },
        linear: {
          value: 100,
          color: "error"
        }
      }
    ]
  }),
  computed: {
    activity() {
      return API.getActivity();
    },
    posts() {
      return API.getPost(3);
    },
    siteTrafficData() {
      return API.getMonthVisit;
    },
    locationData() {
      return API.getLocation;
    },
    eventsMap () {
        const map = {}
        this.events.forEach(e => (map[e.date] = map[e.date] || []).push(e))
        return map
      }
  },
    mounted () {
      //this.$refs.calendar.scrollToTime('08:00')
      // this.$store.dispatch("app/geterror").then(resp => {
      //   this.errMsg = resp;
      // });
    },
    methods: {
      open (event) {
        alert(event.title)
      }
    }
};
</script>
