# 商城表

# 商城订单表




http://127.0.0.1:3002/v1/api/plan/create

```
{

    "planName": "计划1名称1",
    "planStartDoTime": "2023-10-01 10:00:00",
    "planEndDoTime": "2023-10-04 10:00:00",
    "createBy": "faker1",
    "createById": "1",
    "planState": 1,
    "planType": "日计划",
    "planTag": "生活"
}
```

http://127.0.0.1:3002/v1/api/task/create

```
{
    "taskName": "任务称1",
    "taskStartTime": "2023-10-01 10:00:00",
    "taskEndTime": "2023-10-04 10:00:00",
    "createBy": "faker1",
    "createById": "1",
    "taskType": "重要",
    "taskTag": "生活"
}
```

http://127.0.0.1:3002/v1/api/rewPun/create

```
{
    "rpName": "奖励2",
    "rpType": "奖励",
    "rpTag": "学习",
    "createBy": "faker1",
    "createById": "1",
    "bindPlanId": 2
}
```

http://127.0.0.1:3002/v1/api/wks/create

```
{
    "wksCNContent": "永不言败",
    "wksENContent": "Never say never",
    "createBy": "faker1",
    "createById": "1",
    "wksTag": "励志",
    "wksType": "哲学",
    "wksState": 1
}

```
