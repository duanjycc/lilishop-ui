<template>
  <div>
    <Cascader
      v-model="selectDep"
      :data="department"
      @on-change="handleChangeDep"
      change-on-select
      filterable
      clearable
      placeholder="请选择"
    ></Cascader>
  </div>
</template>

<script>
import { getRegionAll } from "@/api/common.js";
export default {
  name: "departmentChoose",
  props: [
    'selectDep',
  ],
  data() {
    return {
      department: [] // 列表
    };
  },
  methods: {

    // 获取部门数据
    initDepartmentData() {
      getRegionAll().then(res => {
        if (res.success) {
          const arr = res.result;
          this.filterData(arr)
          this.department = arr
        }
      });
    },
    handleChangeDep(value, selectedData) {
      let departmentId = "";
      // 获取最后一个值
      if (value && value.length > 0) {
        departmentId = value[value.length - 1];
      }
      this.$emit("on-change", departmentId);
    },
    // 清空已选列表
    clearSelect() {
      this.selectDep = [];
    },
    // 处理部门数据
    filterData (data) {
      data.forEach(e => {
        e.value = e.id;
        e.label = e.name;
        if (e.children) {
          this.filterData(e.children)
        } else {
          return
        }
      })
    }
  },
  created() {
    this.initDepartmentData();
  }
};
</script>

<style lang="scss">
</style>
