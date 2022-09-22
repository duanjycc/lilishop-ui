<template>
  <div class="search">
    <Card>
      <Form ref="searchForm" :model="searchForm" inline :label-width="70" class="search-form">

        <Form-item label="地区">
          <region-choose @on-change="handleSelectDep" style="width: 300px;" ref="dep"></region-choose>
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
        @on-sort-change="changeSort"
        @on-selection-change="showSelect"
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
           <Input disabled style="width: 350px" v-model="signForm.signAreaName"/>
        </FormItem>

        <FormItem label="上级服务商"  prop="parentServiceProvider">
          <department-choose @on-change="handleSelectDep" style="width: 350px;" ref="dep"></department-choose>
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
  editOtherUser,
  enableUser,
  deleteUser,
  delSignIn,
  resetPassword
} from "@/api/index";
import {validateMobile} from "@/libs/validate";
import departmentChoose from "@/views/my-components/lili/department-choose";
import uploadPicInput from "@/views/my-components/lili/upload-pic-input";
import regionChoose from "@/views/lili-components/region-choose";
import region from "@/views/lili-components/region";

export default {
  name: "user-manage",
  components: {
    region,
    regionChoose,
    departmentChoose,
    uploadPicInput,
  },
  data() {
    return {
      loading: true, // 加载状态
      selectCount: 0, // 已选数量
      selectList: [], // 已选数据列表
      minLevel:"district",
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
        parentServiceProvider:"",
        username: "",
        mobile: "",
        serviceProviderLevel:""
      },
      roleList: [], // 角色列表
      errorPass: "", // 错误提示
      formValidate: { // 验证规则
        signAreaId: [
          {required: true, message: "签约区域不能为空", trigger: "blur"}
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
          title: "上级区域",
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
                          this.signIn(params.row);
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
                          this.edit(params.row);
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
    },
    handleSelectDep(v) {
      this.signForm.parentServiceProvider = v;
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
      // console.log( this.searchForm )
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
    // 排序
    changeSort(e) {
      this.searchForm.sort = e.key;
      this.searchForm.order = e.order;
      if (e.order == "normal") {
        this.searchForm.order = "";
      }
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
        }
      });
    },

    // 确认提交
    submitUser() {
      this.$refs.signForm.validate(valid => {
        if (valid) {
          if (this.modalType == 0) {
            // 添加用户 避免编辑后传入id
            const params = JSON.parse(JSON.stringify(this.signForm))
                console.log( params )
            //this.submitLoading = true;
            addSignIn(params).then(res => {
              this.submitLoading = false;
              if (res.success) {
                this.$Message.success("操作成功");
                this.getServiceProvider();
                this.userModalVisible = false;
              }
            });
          } else {
            // 编辑
            this.submitLoading = true;
            editOtherUser(this.form).then(res => {
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

    // 签约
    signIn(v) {
      this.modalTitle = "签约服务商";
      this.$refs.signForm.resetFields();
      // 签约参数
      this.signForm = {
        parentServiceProvider:"",
        username: "",
        mobile: "",
        serviceProviderLevel:""
      };

      this.modalType == 0;
      this.signForm.signAreaId = v.areaId;
      this.signForm.signAreaName = v.parentName +"/"+ v.areaName;
      this.userModalVisible = true;
    },
    // 删除用户
    remove(v) {
      this.$Modal.confirm({
        title: "确认删除",
        content: "您确认要删除改签约区域 " + v.areaName + " ?",
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
    // 选中状态
    showSelect(e) {
      this.exportData = e;
      this.selectList = e;
      this.selectCount = e.length;
    },
    // 清除选中状态
    clearSelectAll() {
      this.$refs.table.selectAll(false);
    },

  },
  mounted() {
    this.init();
    this.getRoleList();
  }
};
</script>
