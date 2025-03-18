'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('orders', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      searchValue: {
        type: Sequelize.STRING(50)
      },
      params: {
        type: Sequelize.STRING(50)
      },
      pageSize: {
        type: Sequelize.STRING(50)
      },
      pageNum: {
        type: Sequelize.STRING(50)
      },
      orderByColumn: {
        type: Sequelize.STRING(50)
      },
      isAsc: {
        type: Sequelize.STRING(50)
      },
      fieldSort: {
        type: Sequelize.STRING(50)
      },
      likeField: {
        type: Sequelize.STRING(50)
      },
      prodivisionIds: {
        type: Sequelize.STRING(50)
      },
      startTime: {
        type: Sequelize.DATE
      },
      endTime: {
        type: Sequelize.DATE
      },
      objectIdList: {
        type: Sequelize.STRING(50)
      },
      commonTime: {
        type: Sequelize.DATE
      },
      objectStrList: {
        type: Sequelize.STRING(50)
      },
      yesOrNoField: {
        type: Sequelize.STRING(50)
      },
      inField: {
        type: Sequelize.STRING(50)
      },
      gtField: {
        type: Sequelize.STRING(50)
      },
      ltField: {
        type: Sequelize.STRING(50)
      },
      commStrValue: {
        type: Sequelize.STRING(50)
      },
      orderBy: {
        type: Sequelize.STRING(50)
      },
      isTrue: {
        type: Sequelize.STRING(50)
      },
      companyIds: {
        type: Sequelize.STRING(50)
      },
      notNeedLimit: {
        type: Sequelize.STRING(50)
      },
      orderId: {
        type: Sequelize.INTEGER
      },
      revision: {
        type: Sequelize.STRING(50)
      },
      createdById: {
        type: Sequelize.INTEGER
      },
      createdBy: {
        type: Sequelize.STRING(50)
      },
      createdTime: {
        type: Sequelize.DATE
      },
      updatedById: {
        type: Sequelize.INTEGER
      },
      updatedBy: {
        type: Sequelize.STRING(50)
      },
      updatedTime: {
        type: Sequelize.DATE
      },
      orderNo: {
        type: Sequelize.STRING(50)
      },
      customerNo: {
        type: Sequelize.STRING(50)
      },
      sourceNo: {
        type: Sequelize.STRING(50)
      },
      orderDate: {
        type: Sequelize.DATE
      },
      orderState: {
        type: Sequelize.STRING(50)
      },
      orderStates: {
        type: Sequelize.STRING(50)
      },
      calculationFormula: {
        type: Sequelize.STRING(50)
      },
      serviceFormula: {
        type: Sequelize.STRING(50)
      },
      carType: {
        type: Sequelize.STRING(50)
      },
      carLength: {
        type: Sequelize.DECIMAL(19,3)
      },
      handoverMode: {
        type: Sequelize.STRING(50)
      },
      nowPay: {
        type: Sequelize.DECIMAL(19,3)
      },
      fetchPay: {
        type: Sequelize.DECIMAL(19,3)
      },
      monthPay: {
        type: Sequelize.DECIMAL(19,3)
      },
      paymentMode: {
        type: Sequelize.STRING(50)
      },
      customerId: {
        type: Sequelize.INTEGER
      },
      customerName: {
        type: Sequelize.STRING(50)
      },
      customerCompany: {
        type: Sequelize.STRING(50)
      },
      beginCompany: {
        type: Sequelize.STRING(50)
      },
      beginMan: {
        type: Sequelize.STRING(50)
      },
      beginPhone: {
        type: Sequelize.STRING(50)
      },
      beginAddress: {
        type: Sequelize.STRING(50)
      },
      beginProvince: {
        type: Sequelize.STRING(50)
      },
      beginProvinceid: {
        type: Sequelize.STRING(50)
      },
      beginCity: {
        type: Sequelize.STRING(50)
      },
      beginCityid: {
        type: Sequelize.STRING(50)
      },
      beginArea: {
        type: Sequelize.STRING(50)
      },
      beginAreaid: {
        type: Sequelize.STRING(50)
      },
      beginStreet: {
        type: Sequelize.STRING(50)
      },
      beginStreetid: {
        type: Sequelize.STRING(50)
      },
      endCompany: {
        type: Sequelize.STRING(50)
      },
      endMan: {
        type: Sequelize.STRING(50)
      },
      endPhone: {
        type: Sequelize.STRING(50)
      },
      endAddress: {
        type: Sequelize.STRING(50)
      },
      endProvince: {
        type: Sequelize.STRING(50)
      },
      endProvinceid: {
        type: Sequelize.STRING(50)
      },
      endCity: {
        type: Sequelize.STRING(50)
      },
      endCityid: {
        type: Sequelize.STRING(50)
      },
      endArea: {
        type: Sequelize.STRING(50)
      },
      endAreaid: {
        type: Sequelize.STRING(50)
      },
      endStreet: {
        type: Sequelize.STRING(50)
      },
      endStreetid: {
        type: Sequelize.STRING(50)
      },
      salesMan: {
        type: Sequelize.STRING(50)
      },
      salesManPhone: {
        type: Sequelize.STRING(50)
      },
      deliveryDate: {
        type: Sequelize.DATE
      },
      arriveDate: {
        type: Sequelize.DATE
      },
      isReceipt: {
        type: Sequelize.STRING(50)
      },
      receiptNum: {
        type: Sequelize.DECIMAL(19,3)
      },
      receiptRequirement: {
        type: Sequelize.STRING(50)
      },
      taxRate: {
        type: Sequelize.STRING(50)
      },
      cancelMan: {
        type: Sequelize.STRING(50)
      },
      cancelDate: {
        type: Sequelize.DATE
      },
      orderRemark: {
        type: Sequelize.STRING(50)
      },
      deliveryFee: {
        type: Sequelize.DECIMAL(19,3)
      },
      trunklineFee: {
        type: Sequelize.DECIMAL(19,3)
      },
      terminalFee: {
        type: Sequelize.DECIMAL(19,3)
      },
      basicFee: {
        type: Sequelize.DECIMAL(19,3)
      },
      totalFee: {
        type: Sequelize.DECIMAL(19,3)
      },
      surplusTotalFee: {
        type: Sequelize.DECIMAL(19,3)
      },
      otherFee: {
        type: Sequelize.DECIMAL(19,3)
      },
      otherFeeRemark: {
        type: Sequelize.STRING(50)
      },
      planCostFee: {
        type: Sequelize.DECIMAL(19,3)
      },
      planProfitFee: {
        type: Sequelize.DECIMAL(19,3)
      },
      addCutFee: {
        type: Sequelize.DECIMAL(19,3)
      },
      operationType: {
        type: Sequelize.STRING(50)
      },
      billState: {
        type: Sequelize.STRING(50)
      },
      surplusNowPay: {
        type: Sequelize.DECIMAL(19,3)
      },
      surplusFetchPay: {
        type: Sequelize.DECIMAL(19,3)
      },
      surplusMonthPay: {
        type: Sequelize.DECIMAL(19,3)
      },
      prodivisionName: {
        type: Sequelize.STRING(50)
      },
      prodivisionId: {
        type: Sequelize.INTEGER
      },
      financialId: {
        type: Sequelize.INTEGER
      },
      companyId: {
        type: Sequelize.INTEGER
      },
      orderStateList: {
        type: Sequelize.STRING(50)
      },
      augmentIds: {
        type: Sequelize.STRING(50)
      },
      augmentNos: {
        type: Sequelize.STRING(50)
      },
      augmentFee: {
        type: Sequelize.STRING(50)
      },
      busOrderCustomerVoList: {
        type: Sequelize.STRING(50)
      },
      busOrderDetailVoList: {
        type: Sequelize.STRING(50)
      },
      busOrderOtherfeeVoList: {
        type: Sequelize.STRING(50)
      },
      confirm: {
        type: Sequelize.STRING(50)
      },
      orderAuditMan: {
        type: Sequelize.STRING(50)
      },
      orderAuditDate: {
        type: Sequelize.DATE
      },
      orderNum: {
        type: Sequelize.DECIMAL(19,3)
      },
      orderWeight: {
        type: Sequelize.DECIMAL(19,3)
      },
      orderVolume: {
        type: Sequelize.DECIMAL(19,3)
      },
      calculationWeight: {
        type: Sequelize.DECIMAL(19,3)
      },
      calculationVolume: {
        type: Sequelize.DECIMAL(19,3)
      },
      orderIds: {
        type: Sequelize.STRING(50)
      },
      receiptPay: {
        type: Sequelize.DECIMAL(19,3)
      },
      receiptState: {
        type: Sequelize.STRING(50)
      },
      transitType: {
        type: Sequelize.STRING(50)
      },
      noteNo: {
        type: Sequelize.STRING(50)
      },
      beginSite: {
        type: Sequelize.STRING(50)
      },
      endSite: {
        type: Sequelize.STRING(50)
      },
      declaredValue: {
        type: Sequelize.DECIMAL(19,3)
      },
      payMan: {
        type: Sequelize.STRING(50)
      },
      productType: {
        type: Sequelize.STRING(50)
      },
      trackState: {
        type: Sequelize.STRING(50)
      },
      billingDepartment: {
        type: Sequelize.STRING(50)
      },
      costAndFreight: {
        type: Sequelize.STRING(50)
      },
      verifyoffMoney: {
        type: Sequelize.DECIMAL(19,3)
      },
      verifyoffState: {
        type: Sequelize.STRING(50)
      },
      salesDept: {
        type: Sequelize.STRING(50)
      },
      goodsNature: {
        type: Sequelize.STRING(50)
      },
      homeType: {
        type: Sequelize.STRING(50)
      },
      isAccountBill: {
        type: Sequelize.STRING(50)
      },
      mainId: {
        type: Sequelize.INTEGER
      },
      invoiceMain: {
        type: Sequelize.STRING(50)
      },
      supplierId: {
        type: Sequelize.INTEGER
      },
      supplierName: {
        type: Sequelize.STRING(50)
      },
      isMiddle: {
        type: Sequelize.STRING(50)
      },
      costShare: {
        type: Sequelize.DECIMAL(19,3)
      },
      costRate: {
        type: Sequelize.DECIMAL(19,3)
      },
      orderSplitCount: {
        type: Sequelize.STRING(50)
      },
      kilometers: {
        type: Sequelize.STRING(50)
      },
      financeAuditState: {
        type: Sequelize.STRING(50)
      },
      financeAuditUser: {
        type: Sequelize.STRING(50)
      },
      financeAuditUserId: {
        type: Sequelize.INTEGER
      },
      financeAuditDate: {
        type: Sequelize.DATE
      },
      auditStatus: {
        type: Sequelize.STRING(50)
      },
      deliveryCost: {
        type: Sequelize.DECIMAL(19,3)
      },
      trunklineCost: {
        type: Sequelize.DECIMAL(19,3)
      },
      vehicleCost: {
        type: Sequelize.DECIMAL(19,3)
      },
      terminalCost: {
        type: Sequelize.DECIMAL(19,3)
      },
      isInsure: {
        type: Sequelize.DECIMAL(19,3)
      },
      insureCount: {
        type: Sequelize.STRING(50)
      },
      insureWaybill: {
        type: Sequelize.STRING(50)
      },
      distance: {
        type: Sequelize.DECIMAL(19,3)
      },
      aging: {
        type: Sequelize.DECIMAL(19,3)
      },
      calculationPrice1: {
        type: Sequelize.DECIMAL(19,3)
      },
      calculationPrice2: {
        type: Sequelize.DECIMAL(19,3)
      },
      deliveryPrice1: {
        type: Sequelize.DECIMAL(19,3)
      },
      deliveryPrice2: {
        type: Sequelize.DECIMAL(19,3)
      },
      sendPrice1: {
        type: Sequelize.DECIMAL(19,3)
      },
      sendPrice2: {
        type: Sequelize.DECIMAL(19,3)
      },
      calculateMode: {
        type: Sequelize.STRING(50)
      },
      calculateStandardId: {
        type: Sequelize.INTEGER
      },
      calculateStandardName: {
        type: Sequelize.STRING(50)
      },
      ladderType: {
        type: Sequelize.STRING(50)
      },
      calculateJson: {
        type: Sequelize.STRING(50)
      },
      calculateResult: {
        type: Sequelize.STRING(50)
      },
      notTaxMoney: {
        type: Sequelize.DECIMAL(19,3)
      },
      isDelete: {
        type: Sequelize.STRING(50)
      },
      assignPerson: {
        type: Sequelize.STRING(50)
      },
      assignTime: {
        type: Sequelize.DATE
      },
      acceptPerson: {
        type: Sequelize.STRING(50)
      },
      acceptTime: {
        type: Sequelize.DATE
      },
      deliverType: {
        type: Sequelize.STRING(50)
      },
      supplierHierarchy: {
        type: Sequelize.STRING(50)
      },
      secondSupplierId: {
        type: Sequelize.INTEGER
      },
      secondSupplierName: {
        type: Sequelize.STRING(50)
      },
      acceptState: {
        type: Sequelize.STRING(50)
      },
      joinCompanyId: {
        type: Sequelize.INTEGER
      },
      joinCompanyName: {
        type: Sequelize.STRING(50)
      },
      joinProdivisionName: {
        type: Sequelize.STRING(50)
      },
      joinProdivisionId: {
        type: Sequelize.INTEGER
      },
      isSystemInside: {
        type: Sequelize.STRING(50)
      },
      isJoin: {
        type: Sequelize.STRING(50)
      },
      isPushHgj: {
        type: Sequelize.STRING(50)
      },
      mhbDeviceNo: {
        type: Sequelize.STRING(50)
      },
      mhbDeviceState: {
        type: Sequelize.STRING(50)
      },
      taxType: {
        type: Sequelize.STRING(50)
      },
      trunkLineFeeNoTax: {
        type: Sequelize.DECIMAL(19,3)
      },
      assistFee: {
        type: Sequelize.DECIMAL(19,3)
      },
      assistFeeRate: {
        type: Sequelize.STRING(50)
      },
      assistFeeNoTax: {
        type: Sequelize.DECIMAL(19,3)
      },
      surplusAssistFee: {
        type: Sequelize.DECIMAL(19,3)
      },
      surplusAssistFeeMonth: {
        type: Sequelize.DECIMAL(19,3)
      },
      surplusAssistFeeFetch: {
        type: Sequelize.DECIMAL(19,3)
      },
      surplusAssistFeeNow: {
        type: Sequelize.DECIMAL(19,3)
      },
      agencyFee: {
        type: Sequelize.DECIMAL(19,3)
      },
      agencyFeeRate: {
        type: Sequelize.STRING(50)
      },
      agencyFeeNoTax: {
        type: Sequelize.DECIMAL(19,3)
      },
      surplusAgencyFee: {
        type: Sequelize.DECIMAL(19,3)
      },
      realTax: {
        type: Sequelize.DECIMAL(19,3)
      },
      serviceCost: {
        type: Sequelize.DECIMAL(19,3)
      },
      goodsNameOne: {
        type: Sequelize.STRING(50)
      },
      waybillNo: {
        type: Sequelize.STRING(50)
      },
      orderGrossProfit: {
        type: Sequelize.STRING(50)
      },
      totalIn: {
        type: Sequelize.DECIMAL(19,3)
      },
      blat: {
        type: Sequelize.STRING(50)
      },
      blon: {
        type: Sequelize.STRING(50)
      },
      elon: {
        type: Sequelize.STRING(50)
      },
      elat: {
        type: Sequelize.STRING(50)
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('orders');
  }
};