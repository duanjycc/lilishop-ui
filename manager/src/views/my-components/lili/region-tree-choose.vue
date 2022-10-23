<template>
  <div>
    <Cascader
      v-model="reselectDep"
      :data="regionList"
      @on-change="handleChangeDep"
      change-on-select
      filterable
      clearable
      placeholder="请选择"
    ></Cascader>
  </div>
</template>

<script>
export default {
  name: "regionTreeChoose",
  props: ["regionList","selectDep"],
  data() {
    return {
      reselectDep:this.selectDep
    };
  },
  methods: {
    initRegionData() {

      this.filterData(this.regionList)
    },
    handleChangeDep(value, selectedData) {
      let regionId = "";
      if (value && value.length > 0) {
        regionId = value[value.length - 1];
      }
      this.$emit("on-change", regionId);

    },
    clearSelect() {
      this.reselectDep = [];
    },
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
    regionList(val) {
      this.initRegionData();
    },
    selectDep(v){
      this.reselectDep = v;
    }
  }
};
</script>

<style lang="scss">
</style>
