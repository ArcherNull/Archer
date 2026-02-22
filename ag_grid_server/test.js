
const ExcelJS = require('exceljs')
// const { saveAs } = require('file-saver')


async function exportExcel() {
    console.log('创建工作簿和工作表')
    // 创建工作簿和工作表
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('多级列头示例');

    // 定义多级表头
    const columns = [
        { header: '一级列头1', key: 'col1', width: 20 },
        { header: '一级列头2', key: 'col2', width: 20 },
        {
            header: '一级列头3',
            key: 'col3',
            width: 20,
            children: [
                { header: '二级列头3-1', key: 'col3_1', width: 15 },
                { header: '二级列头3-2', key: 'col3_2', width: 15 },
            ],
        },
    ];

    // 设置表头
    worksheet.columns = columns.map((col) => ({
        title: col.header,
        key: col.key,
        width: col.width,
    }));

    // 合并单元格实现多级表头
    worksheet.mergeCells('C1:D1'); // 合并一级列头3的单元格

    // 添加数据
    worksheet.addRow({ col1: '数据1', col2: '数据2', col3_1: '数据3-1', col3_2: '数据3-2' });
    worksheet.addRow({ col1: '数据4', col2: '数据5', col3_1: '数据6-1', col3_2: '数据6-2' });

    // 导出 Excel 文件
    const buffer = await workbook.xlsx.writeFile('./多级列头示例.xlsx');
    // const blob = new Blob([buffer], {
    //     type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    // });
    // saveAs(blob, '多级列头示例.xlsx');
}

exportExcel();