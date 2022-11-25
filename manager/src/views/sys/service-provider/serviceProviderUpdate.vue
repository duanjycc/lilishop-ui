<template>
  <div>
    <Card>
      <Form ref="form" :model="form" :label-width="120" :rules="formRule">
        <div class="base-info-item">
          <h4>服务商基础信息信息</h4>
          <div class="form-item-view">
            <FormItem label="会员手机号">
              <Input type="text" v-model="form.mobile" disabled placeholder="会员手机号"  style="width: 300px" />
            </FormItem>
            <FormItem label="会员名称">
              <Input type="text" v-model="form.nickName" disabled placeholder="会员名称"  style="width: 300px" />
            </FormItem>
            
            <Form-item label="区域名称">
              <regionTreeChooseVue @on-change="handleSelectDep" :regionList="regionList" :selectDep="form.selected" style="width: 300px;" ref="dep"></regionTreeChooseVue>
            </Form-item>
            <FormItem label="上级服务商">
             <regionTreeChooseVue @on-change="handleSelectDep" :regionList="regionList" :selectDep="form.parentSelected" style="width: 300px;" ref="dep"></regionTreeChooseVue>
            </FormItem>
        
            <FormItem label="设置等级">
              <Select v-model="form.level" style="width: 300px">
                <Option v-for="item in roleList" :value="item.id" :key="item.id" :label="item.roleName">

                </Option>
              </Select>
            </FormItem>
          </div>
        </div>

        <div class="base-info-item">
          <h4>下级服务商</h4>
          <div class="children-list" v-for="(item, index) in parentList">
            <FormItem label="会员名称">
              <Input type="text" v-model="item.mobile" disabled placeholder="会员名称" style="width: 260px" />
            </FormItem>
            <Form-item label="区域名称">
              <regionTreeChooseVue @on-change="handleSelectDep" :regionList="regionList" :selectDep="item.selected" style="width: 300px;" ref="dep"></regionTreeChooseVue>
            </Form-item>
          </div>
        </div>

        <div class="footer">
          <Button @click="closeCurrentPage" style="margin-right: 5px">返回</Button>
          <Button type="primary" :loading="submitLoading" @click="handleSubmit">保存</Button>
        </div>
      </Form>
    </Card>
  </div>
</template>

<script>
  import {
    getAllRoleList
  } from "@/api/index";
  import * as API_Member from "@/api/member.js";
  import { getRegionAll2 } from "@/api/common";
  import regionChoose from "@/views/lili-components/region-choose";
  import regionTreeChooseVue from "../../my-components/lili/region-tree-choose.vue";
  export default {
    name: "serviceProviderUpdate",
    components: {
      regionChoose,
      regionTreeChooseVue
    },
    data() {
      return {
        roleList: [], // 角色列表
        regionList: [],// 地区列表
        parentList:[
          {mobile:"173435666660",selected: ['1401797451697881277', '1401797451702076092', '1401797451706269736']},
          // {mobile:"173435666661",selected: ['1401797451697881277', '1401797451702076092', '1401797451706269736']},
          // {mobile:"173435666662",selected: ['1401797451697881277', '1401797451702076092', '1401797451706269736']},
          // {mobile:"173435666663",selected: ['1401797451697881277', '1401797451702076092', '1401797451706269736']},
          // {mobile:"173435666664",selected: ['1401797451697881277', '1401797451702076092', '1401797451706269736']},
        ],
        mobile: "", //会员id
        signAreaId: null,
        submitLoading: false, // 添加或编辑提交状态
        form: {
          selected: [],
          areaName: null,
          parentSelected: [],
          parentAreaName: null,
          level: null,
          mobile: null,
          username: null,
          serviceProviderLevel: null
        },
        formRule: {

        }
      };
    },
    methods: {
      init() {
        this.initRegionData();
        this.getRoleList();
        this.getAchievement();
      },
      handleSelectDep(v) {
        this.form.parentAreaName = v;
      },
      // 关闭当前页面
      closeCurrentPage() {
        this.$store.commit("removeTag", "edit-points-goods");
        localStorage.pageOpenedList = JSON.stringify(this.$store.state.app.pageOpenedList);
        this.$router.go(-1);
      },
      handleSubmit() {

      },
      initRegionData() {
        getRegionAll2().then(res => {
          if (res.success) {
            const arr = res.result;
            this.regionList = arr
          }
        });
      },
      // 获取角色列表
      getRoleList() {
        getAllRoleList({
          pageSize: 100
        }).then(res => {
          if (res.success) {
            this.roleList = res.result.records;
            this.$delete(this.roleList,5)
          }
        });
      },
      getAchievement() {
        API_Member.getAchievement(this.mobile).then((res) => {
          this.$set(this, "form", res.result);
          this.$set(this.form, "selected", ['1401797451697881277', '1401797451702076092', '1401797451706269736']);
          this.$set(this.form, "parentSelected", ['1401797451697881277', '1401797451702076092', '1401797451706269736']);
          this.$set(this.form, "level", '1553590211053273089');
        });
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
  div.base-info-item {
    h4 {
      margin-bottom: 10px;
      padding: 0 10px;
      border: 1px solid #ddd;
      background-color: #f8f8f8;
      font-weight: bold;
      color: #333;
      font-size: 14px;
      line-height: 40px;
      text-align: left;
    }
    .children-list{
      display: flex;
      align-items: center;
      border-radius: 0.4em;
      margin: 0;
      flex-wrap: wrap;
    }
    .form-item-view {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      justify-content: space-between;
    }

    .form-item {
      display: flex;
      align-items: center;
    }

  }

  /*商品描述*/
  .goods-intro {
    line-height: 40;
  }

  /** 底部步骤 */
  .footer {
    width: 100%;
    padding: 10px;
    background-color: #ffc;
    position: fixed;
    bottom: 0px;
    right: 0;
    text-align: center;
    z-index: 9999;
  }
</style>
