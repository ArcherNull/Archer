/**
 * 回单模板
 * - receiptTemplateJson：德坤回单（zoneId=23）
 * - HYReceiptTemplate：浩运回单（默认）
 * 来源：kpsapp layoutModule.js
 */
export function receiptTemplateJson(params) {
    console.log('德坤模版接收', params)
    var logoUrl = '0000000000000000000000000000000000000000000000000000003F00000000000000FFC0000000000001FFE0000000000003FFF0000000000007FFF800000000000FFFFC00000000001FFFFE00000000003FFFFF00000000007FFFFF8000000000FFFFFFC000000000FFF3FFC0000000007FE1FF80000000003FC0FF000000000C3F807F0C0000001C4F003C9E0000003F8600187F0000007F8000007F800000FFC00000FFC00001FFE00001FFE00003FFE00001FFF00007FFC00000FFF8000FFF8000007FFC000FFF0000003FFC001FFE0000001FFE001FFC0000000FFE001FF800000007FE001FF800000007FE001FFC0000000FFE001FFE0000001FFE000FFF0000003FFC000FFF8000007FFC0007FFC00000FFF80003FFE00001FFF00001FFE00001FFE00000FFC00000FFC000007F8000007F8000003F8600187F0000001E4F003C9E0000000C3F807F0C000000003FC0FF00000000007FE1FF8000000000FFF3FFC000000000FFFFFFC0000000007FFFFF80000000003FFFFF00000000001FFFFE00000000000FFFFC000000000007FFF8000000000003FFF0000000000001FFE0000000000000FFC00000000000003F00000000000000000000000000000000000000000000000000000000'
    var labelTemplate = '';
    labelTemplate += `! 0 200 200 815 1\r\n`,
    labelTemplate += `SETMAG 1 1\r\n`,
    labelTemplate += `SETBOLD 1\r\n`,
    labelTemplate += `EG 8 58 15 650 ${logoUrl}\r\n`,
    labelTemplate += `VB QR 10 630 M 4 U 4\r\n`,
    labelTemplate += `MA,${params.运单号}\r\n`,
    labelTemplate += `ENDQR\r\n`,
    labelTemplate += `LINE 168 128 168 128 1\r\n`,
    labelTemplate += `LINE 168 272 168 272 1\r\n`,
    labelTemplate += `VT 8 0 80 700 德坤\r\n`,
    labelTemplate += `SETMAG 2 2\r\n`,
    labelTemplate += `VT 8 0 40 450 ${params.回单编号 || ''}\r\n`,
    labelTemplate += `SETMAG 1 1\r\n`,
    labelTemplate += `VT 8 0 150 700 ${params.开单网点简称 || ''}->${params.中转地 || ''}/${params.路由目的地 || ''}\r\n`,
    labelTemplate += `VT 3 0 210 700 货物信息：${params.品名 || ''}/${params.计费重量 || 0}KG/${params.计费体积 || 0}方/${params.件数 || 0}件\r\n`,
    labelTemplate += `VT 3 0 250 700 回单要求：${params.回单要求 || ''}/${params.回单份数 || 0}份/${params.签名要求 || 0}\r\n`,
    labelTemplate += `VT 3 0 290 700 发货信息：${params.发货人 || ''}/${params.发货单位 || ''}\r\n`
    var address = `${params.收货人 ? params.收货人 : params.收货单位 || ''}/${params.收货地址 || ''}`
    labelTemplate += `VT 3 0 330 700 收货信息：${address.substring(0, 22)}\r\n`
    labelTemplate += `VT 3 0 370 590 ${address.substring( 22, 44)}\r\n`
    labelTemplate += `VT 3 0 410 590 ${address.substring( 44, address.length)}\r\n`
    labelTemplate += `FORM\r\n`,
    labelTemplate += `PRINT\r\n`
    return labelTemplate;
}

export const HYReceiptTemplate = function (params) {
    console.log('浩运模版接收', params)
    var logoUrl = '0000000000000000000000000000000000000000000000000000003F00000000000000FFC0000000000001FFE0000000000003FFF0000000000007FFF800000000000FFFFC00000000001FFFFE00000000003FFFFF00000000007FFFFF8000000000FFFFFFC000000000FFF3FFC0000000007FE1FF80000000003FC0FF000000000C3F807F0C0000001C4F003C9E0000003F8600187F0000007F8000007F800000FFC00000FFC00001FFE00001FFE00003FFE00001FFF00007FFC00000FFF8000FFF8000007FFC000FFF0000003FFC001FFE0000001FFE001FFC0000000FFE001FF800000007FE001FF800000007FE001FFC0000000FFE001FFE0000001FFE000FFF0000003FFC000FFF8000007FFC0007FFC00000FFF80003FFE00001FFF00001FFE00001FFE00000FFC00000FFC000007F8000007F8000003F8600187F0000001E4F003C9E0000000C3F807F0C000000003FC0FF00000000007FE1FF8000000000FFF3FFC000000000FFFFFFC0000000007FFFFF80000000003FFFFF00000000001FFFFE00000000000FFFFC000000000007FFF8000000000003FFF0000000000001FFE0000000000000FFC00000000000003F00000000000000000000000000000000000000000000000000000000'
    var labelTemplate = '';
    labelTemplate += `! 0 200 200 730 1\r\n`,
    labelTemplate += `GAP-SENSE\r\n`,
    labelTemplate += `SETMAG 1 1\r\n`,
    labelTemplate += `SETBOLD 1\r\n`,
    labelTemplate += `EG 8 58 15 600 ${logoUrl}\r\n`,
    labelTemplate += `VB QR 10 100 M 3 U 3\r\n`,
    labelTemplate += `MA,${params.运单号}\r\n`,
    labelTemplate += `ENDQR\r\n`,
    labelTemplate += `LINE 168 128 168 128 1\r\n`,
    labelTemplate += `LINE 168 272 168 272 1\r\n`,
    labelTemplate += `VT 8 0 80 650 德坤\r\n`,
    labelTemplate += `SETMAG 2 2\r\n`,
    
    labelTemplate += `VT 8 0 40 480 ${params.回单编号 || ''}\r\n`,
    labelTemplate += `SETMAG 1 1\r\n`,
    labelTemplate += `VT 8 0 150 660 ${params.开单网点简称 || ''}->${params.中转地 || ''}/${params.路由目的地 || ''}\r\n`,
    labelTemplate += `VT 3 0 210 660 货物信息：${params.品名}/${params.计费重量 || 0}KG/${params.计费体积 || 0}方/${params.件数 || 0}件\r\n`,
    labelTemplate += `VT 3 0 250 660 回单要求：${params.回单要求 || ''}/${params.回单份数 || 0}份/${params.签名要求 || ''}\r\n`,
    labelTemplate += `VT 3 0 290 660 发货信息：${params.发货人 || ''}/${params.发货单位 || ''}\r\n`
    var address = `${params.收货人 ? params.收货人 : params.收货单位 || ''}/${params.收货地址 || ''}` 
    labelTemplate += `VT 3 0 330 660 收货信息：${address.substring(0, 20)}\r\n`
    labelTemplate += `VT 3 0 370 550 ${address.substring( 20, 40)}\r\n`
    labelTemplate += `VT 3 0 410 550 ${address.substring( 40, address.length)}\r\n`
    labelTemplate += `FORM\r\n`,
    labelTemplate += `PRINT\r\n`
    labelTemplate += `FEED 1\r\n` // 强制走纸1张标签的高度，精准走到下一张起点
    labelTemplate += `PRINTFEED 1\r\n` // 双重保障：打印后走纸，适配不同打印机型号
    labelTemplate += `CUT\r\n` // 切纸指令（热敏机通用，无切刀则仅走纸不切纸）
    return labelTemplate;
}
