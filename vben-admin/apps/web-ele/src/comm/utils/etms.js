/**
 * @description: 处理事业部数据转换成前端可用的级联框数据
 * @param {*} arr
 * @return {*}
 */
export function dealBusFun(arr) {
  const newArr = [];
  const proList = [];
  if (arr?.length) {
    arr.forEach((ele) => {
      const obj = {
        data: ele,
        id: ele.busdivisionId,
        label: ele.busdivisionName,
        name: ele.busdivisionName,
        nameAndIdObj: {
          id: [ele.busdivisionId],
          name: [ele.busdivisionName],
        },
        value: ele.busdivisionId,
      };
      if (ele.baseTeamVoList?.length) {
        obj.children = [];
        ele.baseTeamVoList?.forEach((e) => {
          const sobj = {
            data: e,
            id: e.teamId,
            label: e.teamName,
            name: e.teamName,
            nameAndIdObj: {
              id: [ele.busdivisionId, e.teamId],
              name: [ele.busdivisionName, e.teamName],
            },
            value: e.teamId,
          };
          if (e.baseProdivisionVoList?.length) {
            sobj.children = [];
            e.baseProdivisionVoList.forEach((item) => {
              const dobj = {
                data: item,
                id: item.prodivisionId,
                label: item.prodivisionName,
                name: item.prodivisionName,
                nameAndIdObj: {
                  id: [ele.busdivisionId, e.teamId, item.prodivisionId],
                  name: [ele.busdivisionName, e.teamName, item.prodivisionName],
                },
                value: item.prodivisionId,
              };
              proList.push(dobj);
              sobj.children.push(dobj);
            });
          }
          obj.children.push(sobj);
        });
      }
      newArr.push(obj);
    });
  }

  return {
    newArr,
    proList,
  };
}
