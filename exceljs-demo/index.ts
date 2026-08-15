import { Elysia } from 'elysia';
import { join } from 'node:path';

import {
  exportExcelWorkbook,
  type MappingInput,
  type RowInput,
} from './excel/index';
import {
  getNevExcelSheetStyleOptions,
  getNevFinanceMock,
} from './mock/nevFinance';

const ROOT = import.meta.dir;
const PORT = 6984;
const CACHE_DIR = join(ROOT, '.cache');

/** 打包前端：Vue/Tabulator 来自 CDN 全局，仅打包本地代码 + exceljs 等 */
async function buildFrontend(): Promise<void> {
  await Bun.write(join(CACHE_DIR, '.keep'), '');
  const result = await Bun.build({
    entrypoints: [join(ROOT, 'frontend/main.ts')],
    target: 'browser',
    format: 'esm',
    minify: false,
    sourcemap: 'none',
    splitting: true,
    outdir: CACHE_DIR,
    naming: {
      entry: 'main.js',
      chunk: 'chunk-[hash].js',
    },
    // Vue / Tabulator 由 index.html CDN 注入，勿打进包
    external: [],
    define: {},
  });

  if (!result.success) {
    const msg = result.logs.map((l) => String(l)).join('\n');
    throw new Error(`前端打包失败:\n${msg}`);
  }
}

/**
 * 参考 excel/index.ts runDemo：用 /mock 假数据构建 Workbook 并返回二进制。
 * 行列样式与前端导出共用 getNevExcelSheetStyleOptions（不改 excel/ 封装）。
 */
export async function exportNevFinanceExcelBuffer(): Promise<{
  buffer: ArrayBuffer;
  fileName: string;
}> {
  const mock = getNevFinanceMock();
  const fileName = `新能源车辆财务报表-${Date.now()}.xlsx`;
  const {
    rowStyle,
    columnStyle,
    columnWidths,
    columnNumFmts,
  } = getNevExcelSheetStyleOptions();

  const workbook = await exportExcelWorkbook({
    fileName: fileName.replace(/\.xlsx$/i, ''),
    sheets: [
      {
        sheetName: '新能源车辆财务报表',
        mapping: mock.mapping as MappingInput,
        rows: [...mock.rows, mock.summaryRow] as RowInput[],
        enableFilter: true,
        defaultColumnWidth: 16,
        // 显式传入，避免被后续同名项覆盖
        columnWidths,
        columnNumFmts,
        rowStyle,
        columnStyle,
        headerStyle: {
          fill: {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFFF100' },
          },
        },
        dataCellStyle: {
          alignment: { vertical: 'middle', horizontal: 'center' },
        },
      },
    ],
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return {
    buffer: buffer as ArrayBuffer,
    fileName,
  };
}

function safeCacheName(name: string): boolean {
  return !!name && !name.includes('..') && !name.includes('/') && !name.includes('\\');
}

await buildFrontend();
console.log('前端已打包到 .cache/');

const app = new Elysia()
  .get('/', async () => {
    const html = await Bun.file(join(ROOT, 'index.html')).text();
    return new Response(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  })
  .get('/frontend/main.js', async () => {
    try {
      await buildFrontend();
      return new Response(Bun.file(join(CACHE_DIR, 'main.js')), {
        headers: {
          'Content-Type': 'application/javascript; charset=utf-8',
          'Cache-Control': 'no-store',
        },
      });
    } catch (e) {
      console.error(e);
      return new Response(String(e), {
        status: 500,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    }
  })
  .get('/frontend/:name', async ({ params }) => {
    const name = params.name;
    if (!safeCacheName(name)) {
      return new Response('Bad Request', { status: 400 });
    }
    // chunk 与动态 import 产物都在 .cache 下；main.js 已单独处理
    const file = Bun.file(join(CACHE_DIR, name));
    if (!(await file.exists())) {
      // 兼容动态 import 相对路径 ./chunk-*.js（从 /frontend/main.js 发出）
      return new Response('Not Found', { status: 404 });
    }
    return new Response(file, {
      headers: {
        'Content-Type': 'application/javascript; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    });
  })
  .get('/mock', () => getNevFinanceMock())
  .get('/excel', async ({ set }) => {
    const { buffer, fileName } = await exportNevFinanceExcelBuffer();
    const encoded = encodeURIComponent(fileName);
    set.headers['Content-Type'] =
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    set.headers['Content-Disposition'] =
      `attachment; filename="nev-finance.xlsx"; filename*=UTF-8''${encoded}`;
    return new Response(buffer);
  })
  .listen(PORT);

console.log(
  `Elysia 服务已启动: http://localhost:${app.server?.port ?? PORT}`,
);
console.log(`  GET /       → 前端界面（Vue + Tabulator CDN）`);
console.log(`  GET /mock   → 模拟报表数据`);
console.log(`  GET /excel  → 后端导出 Excel`);
