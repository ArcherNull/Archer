/**
 * 前端入口：Vue3 + Tabulator 均来自 CDN 全局变量，不打包进 bundle。
 * Excel 导出逻辑通过动态 import 加载（含 exceljs）。
 */

type MockPayload = {
  title: string;
  leafColumnCount: number;
  mapping: Record<string, unknown>;
  columns: Record<string, unknown>[];
  rows: Record<string, unknown>[];
  summaryRow?: Record<string, unknown>;
};

/** 与 mock/MOCK_STYLE_FIELDS 保持一致（接口不再回传） */
const STYLE_FIELDS = {
  settlementStatus: "t_015",
  lowAmountLike: "n_021",
} as const;
const LOW_AMOUNT_THRESHOLD = 3000;

const SERIAL_FIELD = "__serialNumber__";

function enhanceColumns(
  columns: Record<string, unknown>[],
): Record<string, unknown>[] {
  const settlementField = STYLE_FIELDS.settlementStatus;
  const lowField = STYLE_FIELDS.lowAmountLike;
  const lowThreshold = LOW_AMOUNT_THRESHOLD;

  return columns.map((col) => {
    if (Array.isArray(col.columns)) {
      return {
        ...col,
        columns: enhanceColumns(col.columns as Record<string, unknown>[]),
      };
    }
    if (col.field === SERIAL_FIELD || col.bottomCalcLabel === "合计") {
      return {
        ...col,
        bottomCalc: () => "合计",
        cssClass: "col-serial",
      };
    }

    const field = String(col.field ?? "");
    const next: Record<string, unknown> = { ...col };

    if (field === settlementField) {
      next.formatter = (cell: {
        getValue: () => unknown;
        getElement: () => HTMLElement;
      }) => {
        const v = cell.getValue();
        const el = cell.getElement();
        if (v === "逾期") {
          el.style.backgroundColor = "#ffccc7";
          el.style.color = "#cf1322";
          el.style.fontWeight = "700";
        } else if (v === "已结算") {
          el.style.backgroundColor = "#d9f7be";
          el.style.color = "";
          el.style.fontWeight = "";
        } else {
          el.style.backgroundColor = "";
          el.style.color = "";
          el.style.fontWeight = "";
        }
        return v == null ? "" : String(v);
      };
    }

    if (field.startsWith("n_")) {
      next.formatter = (cell: {
        getValue: () => unknown;
        getElement: () => HTMLElement;
      }) => {
        const v = cell.getValue();
        const el = cell.getElement();
        el.style.color = "";
        el.style.fontWeight = "";
        el.style.backgroundColor = "";
        if (typeof v === "number" && v < 0) {
          el.style.color = "#cf1322";
          el.style.fontWeight = "700";
        }
        if (field === lowField && typeof v === "number" && v < lowThreshold) {
          el.style.backgroundColor = "#fff1b8";
        }
        if (typeof v === "number") {
          return v.toLocaleString("zh-CN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          });
        }
        return v == null ? "" : String(v);
      };
    }

    return next;
  });
}

declare global {
  interface Window {
    Vue: {
      createApp: (...args: any[]) => any;
      defineComponent: (...args: any[]) => any;
      onMounted: (fn: () => void) => void;
      onBeforeUnmount: (fn: () => void) => void;
      ref: <T>(v: T) => { value: T };
      shallowRef: <T>(v: T) => { value: T };
      nextTick: () => Promise<void>;
    };
    Tabulator: new (
      el: HTMLElement | string,
      options: Record<string, unknown>,
    ) => {
      destroy: () => void;
      setColumns: (cols: unknown[]) => void;
      setData: (rows: unknown[]) => Promise<void> | void;
      getData: (activeOnly?: boolean | string) => Record<string, unknown>[];
      getSelectedData: () => Record<string, unknown>[];
      getColumnDefinitions: () => Record<string, unknown>[];
      redraw: (force?: boolean) => void;
    };
  }
}

const {
  createApp,
  defineComponent,
  onMounted,
  onBeforeUnmount,
  ref,
  shallowRef,
  nextTick,
} = window.Vue;

const App = defineComponent({
  name: "NevFinanceApp",
  setup() {
    const title = ref("新能源车辆财务报表");
    const meta = ref("");
    const mapping = ref<Record<string, unknown>>({});
    const summaryRow = ref<Record<string, unknown> | null>(null);
    const rowCount = ref(0);
    const loading = ref(true);
    const exporting = ref(false);
    const message = ref("");
    const tableEl = ref<HTMLElement | null>(null);
    const tableApi = shallowRef<InstanceType<typeof window.Tabulator> | null>(
      null,
    );

    function destroyTable() {
      if (tableApi.value) {
        tableApi.value.destroy();
        tableApi.value = null;
      }
    }

    async function renderTable(
      columns: Record<string, unknown>[],
      rows: Record<string, unknown>[],
    ) {
      await nextTick();
      const el = tableEl.value;
      if (!el) return;

      destroyTable();
      const settlementField = STYLE_FIELDS.settlementStatus;
      tableApi.value = new window.Tabulator(el, {
        data: rows,
        columns: enhanceColumns(columns),
        layout: "fitDataStretch",
        height: "calc(100vh - 130px)",
        renderVertical: "virtual",
        pagination: true,
        paginationSize: 100,
        paginationSizeSelector: [50, 100, 200, 500],
        movableColumns: true,
        selectableRows: true,
        placeholder: "暂无数据",
        columnCalcs: "both",
        rowFormatter: (row: {
          getData: () => Record<string, unknown>;
          getElement: () => HTMLElement;
        }) => {
          const data = row.getData();
          const elRow = row.getElement();
          if (data[settlementField] === "逾期") {
            elRow.style.backgroundColor = "#ffe7e6";
          } else {
            elRow.style.backgroundColor = "";
          }
        },
        locale: true,
        langs: {
          default: {
            pagination: {
              first: "首页",
              first_title: "首页",
              last: "末页",
              last_title: "末页",
              prev: "上一页",
              prev_title: "上一页",
              next: "下一页",
              next_title: "下一页",
              all: "全部",
              page_size: "每页",
            },
          },
        },
      });
    }

    async function loadMock() {
      loading.value = true;
      message.value = "";
      try {
        const res = await fetch("/mock");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as MockPayload;
        title.value = data.title;
        meta.value = `4 级表头 · ${data.leafColumnCount} 列 · ${data.rows.length} 行 · 含合计行`;
        mapping.value = data.mapping;
        summaryRow.value = data.summaryRow ?? null;
        rowCount.value = data.rows.length;
        loading.value = false;
        await renderTable(data.columns, data.rows);
      } catch (e) {
        loading.value = false;
        message.value = `加载 /mock 失败：${String(e)}`;
      }
    }

    async function onFrontendExport() {
      if (!tableApi.value) {
        message.value = "表格尚未就绪";
        return;
      }
      exporting.value = true;
      message.value = "正在前端导出…";
      try {
        const { useExportMultipleHeaderExcel } =
          await import("./hooks/useExportMultipleHeaderExcel");
        const { getNevExcelSheetStyleOptions } =
          await import("../mock/nevFinance");
        const { exportMultipleHeaderExcel, getExcelTableData } =
          useExportMultipleHeaderExcel({
            tableApi,
            onSuccess: (fileName) => {
              message.value = `前端导出成功：${fileName}.xlsx`;
            },
            onError: (err) => {
              message.value = `前端导出失败：${String(err)}`;
            },
          });

        const tableData = await getExcelTableData();
        if (summaryRow.value) {
          tableData.push({ ...summaryRow.value });
        }

        const styleOptions = getNevExcelSheetStyleOptions();

        await exportMultipleHeaderExcel({
          fileName: `新能源车辆财务报表-前端导出-${Date.now()}`,
          tableData,
          tDataMapping: mapping.value as Record<string, string>,
          sheetOptions: {
            defaultColumnWidth: 16,
            enableFilter: true,
            ...styleOptions,
            headerStyle: {
              fill: {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FFE6F3FF" },
              },
            },
            dataCellStyle: {
              alignment: { vertical: "middle", horizontal: "center" },
            },
          },
        });
      } catch (e) {
        message.value = `前端导出失败：${String(e)}`;
      } finally {
        exporting.value = false;
      }
    }

    async function onBackendExport() {
      exporting.value = true;
      message.value = "正在请求后端导出…";
      try {
        const res = await fetch("/excel");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const blob = await res.blob();
        const cd = res.headers.get("Content-Disposition") || "";
        const matched = /filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i.exec(
          cd,
        );
        const rawName = decodeURIComponent(
          matched?.[1] || matched?.[2] || `nev-finance-${Date.now()}.xlsx`,
        );
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = rawName;
        a.click();
        URL.revokeObjectURL(url);
        message.value = `后端导出成功：${rawName}`;
      } catch (e) {
        message.value = `后端导出失败：${String(e)}`;
      } finally {
        exporting.value = false;
      }
    }

    onMounted(loadMock);
    onBeforeUnmount(destroyTable);

    return {
      title,
      meta,
      rowCount,
      loading,
      exporting,
      message,
      tableEl,
      onFrontendExport,
      onBackendExport,
      loadMock,
    };
  },
  template: `
    <div class="page">
      <header class="toolbar">
        <div class="brand">
          <h1>{{ title }}</h1>
          <p class="meta">{{ meta }}</p>
        </div>
        <div class="actions">
          <button class="btn ghost" :disabled="loading || exporting" @click="loadMock">刷新数据</button>
          <button class="btn" :disabled="loading || exporting || rowCount === 0" @click="onFrontendExport">
            前端导出 Excel
          </button>
          <button class="btn primary" :disabled="loading || exporting" @click="onBackendExport">
            后端导出 Excel
          </button>
        </div>
      </header>
      <p v-if="message" class="msg">{{ message }}</p>
      <div v-if="loading" class="hint">加载中…</div>
      <div v-show="!loading" ref="tableEl" class="grid"></div>
    </div>
  `,
});

createApp(App).mount("#app");
