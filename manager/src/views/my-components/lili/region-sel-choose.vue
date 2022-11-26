<template>
  <div>
    <Cascader
      :data="regionCityList"
      @on-change="handleChangeDep"
      change-on-select
      filterable
      clearable
      placeholder="请选择"
    ></Cascader>
  </div>
</template>

<script>
// import { getRegionAll } from "@/api/common";
export default {
  name: "regionTreeChoose",
  props: {
    regionCityList: Array
  },

  data() {
    return {

    };
  },
  methods: {
    // 获取部门数据
    initRegionCityData() {
      this.filterData(this.regionCityList)
    },
    handleChangeDep(value, selectedData) {
      let regionId = "";
      // 获取最后一个值
      if (value && value.length > 0) {
        regionId = value[value.length - 1];
      }
      this.$emit("on-change", regionId);
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
  watch: {
    regionCityList(val) {
        this.initRegionCityData();
    }
  }
};
</script>

<style lang="scss">
</style>
