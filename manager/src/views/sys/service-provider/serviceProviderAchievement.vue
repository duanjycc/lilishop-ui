<template>
  <div>
    <Card style="height: 240px;padding: 12px 12px 0px">
      <div class="head-title">服务商基本信息</div>
      <div class="detail-body">
        <div class="ant-col-md-6">
          <div class="info">
            <div class="head-info">
              <Avatar size="large" :src="achievement.avatar"/>
              <div>
                <div class="phone">
                   {{achievement.username}}

                </div>
                <div class="phone">
                   {{achievement.mobile}}
                </div>
              </div>
            </div>
            <div class="bottom-info">
              <p>签约时间: {{achievement.signCreateTime}}</p>
            </div>
          </div>
        </div>
        <div class="ant-col-md-6">
          <p class="item">
            <span class="label">签约地区：</span>
            <span class="info">{{achievement.signAreaName}}</span>
          </p>
          <p class="item">
            <span class="label">上级服务商：</span>
            <span class="info"> {{achievement.parentName}}</span>
          </p>
          <p class="item">
            <span class="label">服务商等级：</span>
            <span class="info"> {{achievement.serviceProviderLevel}}</span>
          </p>
          <p class="item">
            <span class="label">让利额：</span>
            <span class="info"> {{achievement.surrenderPrice}}</span>
          </p>
          <p class="item">
            <span class="label">SSD销毁量：</span>
            <span class="info">{{achievement.destroySSD}}</span>
          </p>
          <p class="item">
            <span class="label">店铺数量：</span>
            <span class="info">{{achievement.storeCount}}</span>
          </p>

        </div>

        <div class="ant-col-md-67">
          <Form class="search-form" style="width: 100%;background-color: white;">
            <Form-item>
              <DatePicker v-model="queryDate"  type="datetimerange" format="yyyy-MM-dd" clearable @on-change="queryDateRange" placeholder="选择起始时间" style="width: 400px"></DatePicker>
            </Form-item>

            <Button @click="quyerSearch" type="primary" icon="ios-search" class="search-btn">查询</Button>
          </Form>

          <div class="point-data">
            <p class="p-item">
              <span class="p-label">让利额：</span>
              <span class="p-info">{{queryAchievement.surrenderPrice || 0 }}</span>
              <span class="p-label">销毁数量：</span>
              <span class="p-info"> {{queryAchievement.destroySSD || 0 }}</span>
              <span class="p-label">邀请商家数量：</span>
              <span class="p-info">{{queryAchievement.storeCount || 0 }}</span>
            </p>
          </div>
        </div>
      </div>
    </Card>




    <Card class="mt_10">
      <Tabs value="point">
        <TabPane label="业绩详情" name="point">
          <div class="pointsTitle" style="justify-content: flex-start; text-align: left;">
            <Form :label-width="80" class="search-form" style="width: 100%;">
              <Form-item label="做单时间">
                <DatePicker v-model="selectDate" type="datetimerange" format="yyyy-MM-dd" clearable @on-change="selectDateRange" placeholder="选择起始时间" style="width: 200px"></DatePicker>
              </Form-item>

              <Button @click="handleSearch" type="primary" icon="ios-search" class="search-btn">搜索</Button>
            </Form>
          </div>
          <div class="point-data" style="margin-top: -5px;height: 50%">
             <Table
                :loading="loading"
                border
                :columns="pointsColumns"
                :data="pointData"
                class="mt_10"
                ref="table"
              >
              </Table>
            <Row type="flex" justify="end" class="mt_10" style="margin-top: 10px">
              <Page
                :current="pointSearchForm.pageNumber"
                :total="pointTotal"
                :page-size="pointSearchForm.pageSize"
                @on-change="pointChangePage"
                @on-page-size-change="pointChangePageSize"
                :page-size-opts="[10, 20, 50]"
                size="small"
                show-total
                show-elevator
                show-sizer
              ></Page>
            </Row>
          </div>
        </TabPane>

      </Tabs>
    </Card>

  </div>
</template>

<script>
  import * as API_Member from "@/api/member.js";

  export default {
    name: "serviceProviderAchievement",
    data() {
      return {
        mobile: "",//会员id
        loading: true, // 表单加载状态
        memberInfo: {},//会员信息
        signAreaId:null,
        achievement:{},// 业绩信息
        queryAchievement:{},
        selectDate: null, // 选择时间段
        queryDate:[],
        //历史积分表格
        pointsColumns: [
          {
            title: "店主",
            key: "memberName",
            width: 150,
          },
          {
            title: "店铺",
            key: "storeName",
            width: 150,
          },
          {
            title: "总让利金额",
            key: "surrenderPrice",
            width: 200
          },
          {
            title: "总做单总数",
            key: "makeCount",
            width: 150,
          },
          {
            title: "总做单销毁数",
            key: "destroyCount",
            width: 150,
          }
        ],
        pointData: [],//历史积分数据
        pointTotal: 0,//历史积分总条数
        //历史积分数据查询form
        pointSearchForm: {
          pageNumber: 1, // 当前页数
          pageSize: 10, // 页面大小
          startDate: null,
          endDate:null,
        },
        queryForm:{
          mobile:"",
          startDate: this.getNowTime(1),
          endDate:this.getNowTime(0),
        }
      };
    },
    methods: {
      init() {
        //查询会员的历史积分数据
        this.getPointData();
        //查询服务商业绩
        this.getAchievement();
         //查询服务商业绩left
        this.quyerSearch();
        this.queryDate.push(this.getNowTime(1))
        this.queryDate.push(this.getNowTime(0))

      },
      quyerSearch(){
        this.queryForm.mobile = this.mobile;
        API_Member.getAchievementLeft(this.queryForm).then((res) => {
          this.$set(this, "queryAchievement", res.result);
        });
      },
      handleQuyerSearch(){
        this.quyerSearch();
      },
      // 搜索
      handleSearch() {
        this.pointSearchForm.pageNumber = 1;
        this.pointSearchForm.pageSize = 10;
        this.getPointData();
      },
      getAchievement(){
        API_Member.getAchievement(this.mobile).then((res) => {
          this.$set(this, "achievement", res.result);
        });
      },
      //查询TA的历史积分数据
      getPointData() {
        this.loading = true;
        this.pointSearchForm.areaId =  this.signAreaId;
        API_Member.getStoreAchievement(this.pointSearchForm).then((res) => {
          this.loading = false;
          if (res.success) {
            this.pointData = res.result.records;
            this.pointTotal = res.result.total;
          }
        });
        this.loading = false;
      },

      //积分记录页数变化
      pointChangePage(v) {
        this.pointSearchForm.pageNumber = v;
        this.getPointData();
      },
      //积分记录页数变化
      pointChangePageSize(v) {
        this.pointSearchForm.pageNumber = 1;
        this.pointSearchForm.pageSize = v;
        this.getPointData();
      },
      queryDateRange(v){
        console.log( v)
        if (v) {
          this.queryForm.startDate = v[0];
          this.queryForm.endDate = v[1];
        }
      },
      selectDateRange(v) {
        if (v) {
          this.pointSearchForm.startDate = v[0];
          this.pointSearchForm.endDate = v[1];
        }
      },
      getNowTime(co){
        const yy = new Date().getFullYear()
        const MM = ((new Date().getMonth()-co) + 1) < 10 ? '0' + ((new Date().getMonth()-co) + 1) : ((new Date().getMonth()-co) + 1)
        const dd = new Date().getDate() < 10 ? '0' + new Date().getDate() : new Date().getDate()
        let time = yy + '-' + MM + '-' + dd;
        return time;
      },
    },

    mounted() {
      this.mobile = this.$route.query.mobile;
      this.signAreaId = this.$route.query.signAreaId;
      this.init();
    },
  };
</script>
<style lang="scss" scoped>
  @import "serviceProviderAchievement.scss";
</style>
