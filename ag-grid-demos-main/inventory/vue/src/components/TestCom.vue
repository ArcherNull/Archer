<script setup>
import {
  createApp,
  defineComponent,
  onBeforeMount,
  ref,
  shallowRef,
} from "vue";
import { AgGridVue } from "ag-grid-vue3";
import {
  CellSpanModule,
  ClientSideRowModelModule,
  ModuleRegistry,
  RowAutoHeightModule,
  ValidationModule,
} from "ag-grid-community";

import {
  ExcelExportModule,
  MasterDetailModule,
  MultiFilterModule,
  SetFilterModule,
  LicenseManager,
  IntegratedChartsModule
} from "ag-grid-enterprise";

ModuleRegistry.registerModules([
  CellSpanModule,
  ClientSideRowModelModule,
  RowAutoHeightModule,
  ValidationModule /* Development Only */,
]);


// 以下代码是破解的api必须要加
LicenseManager.prototype.validateLicense = () => true;
LicenseManager.prototype.isDisplayWatermark = () => false;
LicenseManager.prototype.getWatermarkMessage = () => 'Faker出品';


const lorem = `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`;

const gridApi = shallowRef(null);
const columnDefs = ref([
  {
    field: "lorem",
    spanRows: true,
    wrapText: true,
    autoHeight: true,
    minWidth: 300,
  },
  { field: "athlete" },
  { field: "age" },
  { field: "total" },
]);
const defaultColDef = ref({
  flex: 1,
});
const rowData = ref([]);

const onGridReady = (params) => {
  gridApi.value = params.api;

  const updateData = (data) => {
    data.forEach((row, i) => {
      if (i % 3 === 0) {
        return;
      }
      row.lorem = lorem;
    });
    rowData.value = data;
  };

  fetch("https://www.ag-grid.com/example-assets/olympic-winners.json")
    .then((resp) => resp.json())
    .then((data) => updateData(data));
};
</script>

<template>
  <div style="height: 100%">
    <ag-grid-vue
      style="width: 100%; height: 1000px;"
      @grid-ready="onGridReady"
      :columnDefs="columnDefs"
      :defaultColDef="defaultColDef"
      :enableCellSpan="true"
      :rowData="rowData"
    ></ag-grid-vue>
  </div>
</template>
