<template>
  <div class="search">
    <Card>
      <Form ref="searchForm" :model="searchForm" inline :label-width="70" class="search-form">
        <Form-item label="地区">
          <regionSelChooseVue @on-change="handleSelectSearchDep" :regionList="regionList"  style="width: 300px;" ref="dep"></regionSelChooseVue>
        </Form-item>
       <Form-item label="是否签约">
         <Select v-model="searchForm.isSignIn" placeholder="请选择" clearable style="width: 200px">
           <Option value="0">签约</Option>
           <Option value="1">未签约</Option>
         </Select>
       </Form-item>
        </Form-item>
        <Form-item label="区域名称">
          <Input
            type="text"
            v-model="searchForm.areaName"
            placeholder="请输入区域名称"
            clearable
            style="width: 200px"
          />
        </Form-item>

        <Button @click="handleSearch" type="primary" icon="ios-search" class="search-btn">搜索</Button>
      </Form>

      <Table
        :loading="loading"
        border
        :columns="columns"
        :data="data"
        sortable="custom"
        ref="table"
      ></Table>
      <Row type="flex" justify="end" class="mt_10">
        <Page
          :current="searchForm.pageNumber"
          :total="total"
          :page-size="searchForm.pageSize"
          @on-change="changePage"
          @on-page-size-change="changePageSize"
          :page-size-opts="[10,20,50]"
          size="small"
          show-total
          show-elevator
          show-sizer
        ></Page>
      </Row>
    </Card>


    <Modal
      :title="modalTitle"
      v-model="userModalVisible"
      :mask-closable="false"
      :width="500"
      :styles="{top: '30px'}"
    >
      <Form ref="signForm" :model="signForm" :label-width="90" :rules="formValidate">
        <FormItem label="签约区域" style="width: 40px" prop="signAreaName">
           <Input v-if="orSigin === true" disabled style="width: 350px" v-model="signForm.signAreaName"/>
           <regionTreeChooseVue  v-if="orSigin === false" @on-change="handleSelectSearchDep" :regionList="regionList" :selectDep="signForm.signAreaIds"  style="width: 350px;" ref="dep"></regionTreeChooseVue>
        </FormItem>

        <FormItem label="上级服务商"  prop="parentServiceProvider">
          <regionTreeChooseVue @on-change="handleSelectDep" :regionList="regionList" :selectDep="signForm.parentAreaIds" style="width: 350px;" ref="dep"></regionTreeChooseVue>
        </FormItem>

        <FormItem label="会员号" prop="mobile">
          <Input style="width: 350px" v-model="signForm.mobile"/>
        </FormItem>
        <FormItem label="联系人" prop="username">
          <Input style="width: 350px" v-model="signForm.username"/>
        </FormItem>

        <FormItem label="服务商等级" prop="serviceProviderLevel">
          <Select v-model="signForm.serviceProviderLevel" style="width: 350px">
            <Option v-for="item in roleList" :value="item.id" :key="item.id" :label="item.roleName">

            </Option>
          </Select>
        </FormItem>

      </Form>
      <div slot="footer">
        <Button type="text" @click="userModalVisible = false">取消</Button>
        <Button type="primary" :loading="submitLoading" @click="submitUser">提交</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import {
  getServiceProvider,
  getUserListData,
  getAllRoleList,
  addSignIn,
  editSignIn,
  getSignDetail,
  checkAreaHavSign,
} from "@/api/index";
import { getRegionAll } from "@/api/common";
import regionTreeChooseVue from "@/views/my-components/lili/region-tree-choose.vue";
import regionSelChooseVue from "@/views/my-components/lili/region-sel-choose.vue";

export default {
  name: "service-provider",
  components: {   regionTreeChooseVue,regionSelChooseVue },
  data() {
    return {
      loading: true, // 加载状态
      selectList: [], // 已选数据列表
      regionList: [],// 地区列表
      roleList: [], // 角色列表
      orSigin: false,
      searchForm: { // 请求参数
        areaName: "",
        areaId: "",
        isSignIn: "0",
        pageNumber: 1,
        pageSize: 20,
        sort: "",
        order: ""
      },
      modalType: 0, // 新增编辑标识
      userModalVisible: false, // 用户modal显隐
      modalTitle: "", // modal标题
      signForm: { // 请求参数
        signAreaId:"",
        signAreaName:"",
        signAreaIds:[],
        parentServiceProvider:"",
        parentAreaIds:[],
        username: "",
        mobile: "",
        serviceProviderLevel:""
      },
      errorPass: "", // 错误提示
      formValidate: { // 验证规则
        signAreaId: [
          {required: true, message: "签约区域不能为空", trigger: "blur",}
        ],
        parentServiceProvider: [
          {required: true, message: "上级服务商不能为空", trigger: "blur"}
        ],
        username: [
          {required: true, message: "会员号不能为空", trigger: "blur"},
        ],
        mobile: [
          {required: true, message: "联系人不能为空", trigger: "blur"},
        ],
        serviceProviderLevel: [
          {required: true, message: "服务商等级不能为空",trigger: "blur"},
        ],
      },
      submitLoading: false, // 提交状态
      columns: [ // 表头
        {
          title: "区域名称",
          key: "areaName",
          minWidth: 120,
          fixed: "left"
        },
        {
          title: "上级区域名称",
          key: "parentName",
          minWidth: 120,
          align: "center"
        },
        {
          title: "区域服务商号码",
          key: "areaServiceProviderMobile",
          width: 180
        },
        {
          title: "服务商联系人",
          key: "areaServiceProviderName",
          minWidth: 180
        },

        {
          title: "签约时间",
          key: "signCreateTime",
          width: 180
        },
        {
          title: "签约状态",
          key: "isSignIn",
          align: "center",
          width: 110,
          render: (h, params) => {
            if (params.row.isSignIn == '0') {
              return h("div", [
                h("Badge", {
                  props: {
                    status: "success",
                    text: "签约"
                  }
                })
              ]);
            } else if (params.row.isSignIn == '1') {
              return h("div", [
                h("Badge", {
                  props: {
                    status: "error",
                    text: "未签约"
                  }
                })
              ]);
            }
          },
          filters: [
            {
              label: "签约",
              value: true
            },
            {
              label: "未签约",
              value: false
            }
          ],
          filterMultiple: false,
          filterMethod(value, row) {
            return row.status == value;
          }
        },
        {
          title: "操作",
          key: "action",
          width: 200,
          align: "center",
          fixed: "right",
          render: (h, params) => {
            let enableOrDisable = "";
            if (params.row.isSignIn == '1') {
              return h("div", [
                  h(
                    "Button",
                    {
                      props: {
                        type: "info",
                        size: "small"
                      },
                      style: {
                        marginRight: "5px"
                      },
                      on: {
                        click: () => {
                          this.signIn(params.row,true);
                        }
                      }
                    },
                    "签约"
                  )
                ]);
            } else {
              return h("div", [
                  h(
                    "Button",
                    {
                      props: {
                        type: "info",
                        size: "small"
                      },
                      style: {
                        marginRight: "5px"
                      },
                      on: {
                        click: () => {
                          this.signIn(params.row,false);
                        }
                      }
                    },
                    "编辑"
                  ),
                  enableOrDisable,
                  h(
                    "Button",
                    {
                      props: {
                        type: "error",
                        size: "small"
                      },style: {
                        marginRight: "5px"
                      },
                      on: {
                        click: () => {
                          this.remove(params.row);
                        }
                      }
                    },
                    "删除"
                  ),
                  enableOrDisable,
                  h(
                    "Button",
                    {
                      props: {
                        type: "info",
                        size: "small"
                      },
                      on: {
                        click: () => {
                          this.detail(params.row);
                        }
                      }
                    },
                    "业绩查询"
                  )
                ]);
              }
            }
        }
      ],
      data: [], // 用户数据
      total: 0, // 总数
    };
  },
  methods: {
    // 初始化数据
    init() {
      this.getServiceProvider();
      this.initRegionData();
    },
    handleSelectDep(v) {
      // if(!this.orSigin){
      //   checkAreaHavSign(v).then((res) =>{
      //      if (res.success) {
      //        let status = res.result;
      //        if(status){
      //         this.$Message.error("所选上级服务商未签约，请选择其他上级服务商");
      //        }else{
      //        this.parentServiceProvider = v;
      //        }
      //      }
      //   })
      // }else{
        this.parentServiceProvider = v;
      //}
    },
    handleSelectSearchDep(v){
      // if(!this.orSigin){
      //   checkAreaHavSign(v).then((res) =>{
      //      if (res.success) {
      //        let status = res.result;
      //        if(status){
      //          this.searchForm.areaId = v;
      //        }else{
      //          this.$Message.error("所选区域已被签约，请选择其他区域");
      //        }
      //      }
      //   })
      // }else{
        this.searchForm.areaId = v;
     // }
    },
    // 分页 修改页码
    changePage(v) {
      this.searchForm.pageNumber = v;
      this.getServiceProvider();
      this.clearSelectAll();
    },
    // 分页 修改页数
    changePageSize(v) {
      this.searchForm.pageSize = v;
      this.searchForm.pageNumber = 1;
      this.getServiceProvider();
    },
    getServiceProvider() {
      // 多条件搜索用户列表
      this.loading = true;
      getServiceProvider(this.searchForm).then(res => {
        this.loading = false;
        if (res.success) {
          this.data = res.result.records;
          this.total = res.result.total;
        }
      });
    },
    // 搜索
    handleSearch() {
      this.searchForm.pageNumber = 1;
      this.searchForm.pageSize = 10;
      this.getServiceProvider();
    },
    // 获取角色列表
    getRoleList() {
      let params = {
        pageSize: 100
      }
      getAllRoleList(params).then(res => {
        if (res.success) {
          this.roleList = res.result.records;
          this.$delete(this.roleList,5)
        }
      });
    },
    initRegionData() {
      getRegionAll().then(res => {
        if (res.success) {
          const arr = res.result;
          this.regionList = arr
        }
      });
    },
    // 确认提交
    submitUser() {
      this.$refs.signForm.validate(valid => {
        if (valid) {
          if (this.modalType == 0) {
            const params = JSON.parse(JSON.stringify(this.signForm))
            addSignIn(params).then(res => {
              this.submitLoading = false;
              if (res.success) {
                this.$Message.success("操作成功");
                this.getServiceProvider();
                this.userModalVisible = false;
              }
            });
          } else {
            const params = JSON.parse(JSON.stringify(this.signForm));

            editSignIn(params).then(res => {
              this.submitLoading = false;
              if (res.success) {
                this.$Message.success("操作成功");
                this.getServiceProvider();
                this.userModalVisible = false;
              }
            });
          }
        }
      });
    },
    //查看服务商业绩
    detail(row) {
      this.$router.push({ name: "service-provider-achievement", query: { mobile: row.areaServiceProviderMobile,signAreaId: row.areaId } });
    },

    //查看服务商业绩
    edit(row) {
      this.$router.push({ name: "service-provider-update", query: { mobile: row.areaServiceProviderMobile,signAreaId: row.areaId } });
    },
    checkArea(){

    },
    checkParentArea(){

    },
    // 签约
    signIn(v,t) {
      this.orSigin = t;
      this.$refs.signForm.resetFields();
      if(t){
        this.modalTitle = "签约服务商";
        this.signForm = {
          parentServiceProvider:"",
          username: "",
          mobile: "",
          serviceProviderLevel:""
        };
        this.modalType = 0;
        this.signForm.signAreaId = v.areaId;
        this.signForm.signAreaName = v.parentName +"/"+ v.areaName;
        this.userModalVisible = true;
      }else{
        this.getSignDetail(v.areaId);
        this.modalTitle = "编辑服务商";
        this.modalType = 1;

        this.signForm.username = v.areaServiceProviderName;
        this.signForm.mobile = v.areaServiceProviderMobile;
        this.userModalVisible = true;
      }
    },

    getSignDetail(areaId){
      getSignDetail(areaId).then((res) => {
         this.loading = false;
         if (res.success) {
            let signData = res.result;
            this.signForm.signAreaIds = signData.signAreaIds;
            this.signForm.parentAreaIds = signData.parentAreaIds;
            this.signForm.serviceProviderLevel = signData.serviceLevel;
            this.signForm.signAreaId = areaId;
            this.signForm.parentServiceProvider = signData.parentAreaId;
         }
      });
    },
    // 删除用户
    remove(v) {
      this.$Modal.confirm({
        title: "确认删除",
        content: "您确认要删除该签约区域 " + v.areaName + " ?",
        loading: true,
        onOk: () => {
          delSignIn(v.areaId).then(res => {
            this.$Modal.remove();
            if (res.success) {
              this.$Message.success("删除成功");
              this.getServiceProvider();
            }
          });
        }
      });
    },
  },
  mounted() {
    this.init();
    this.getRoleList();
  }
};
</script>
