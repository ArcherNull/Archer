<!--
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2025-04-02 17:50:15
 * @LastEditTime: 2025-06-11 10:27:18
 * @Description:
-->

## SQLAlchemy

‌SQLAlchemy 2.0 文档 ‌
链接：https://docs.sqlalchemy.org/en/20/

## UI 官网

https://www.naiveui.com/en-US/os-theme/docs/installation

## 创建虚拟环境，创建一个名为 myenv 的虚拟环境：

python -m venv myenv

## 激活虚拟环境

windows 中执行：myenv\Scripts\activate

## 安装依赖

pip install fastapi uvicorn sqlalchemy aiomysql pyjwt passlib bcrypt pydantic_validation_decorator mysql-connector-python pymysql jinja2 uvicorn captcha python-multipart -i https://pypi.tuna.tsinghua.edu.cn/simple

或者

pip install -r requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple/

生成 requirements.txt
pip freeze > requirements.txt

方法 3：使用 pipreqs 工具
pipreqs 是一个第三方工具，可以自动生成 requirements.txt 文件。首先，你需要安装 pipreqs：

## 生成 requirements.txt

pipreqs 也是一个库，先安装它：pip install pipreqs ，然后使用下面的命令生成 requirements.txt 文件：pipreqs ./ --encoding=utf8 --force

或者

pip freeze > requirements.txt

## 项目启动

```bash

# 创建虚拟环境
python -m venv myenv

# 激活环境
myenv\Scripts\activate

# 安装项目依赖
pip install -r requirements.txt -i https://mirrors.aliyun.com/pypi/simple/

# 后台启动
python .\main.py
```

```bash
# 前端启动
cd .\fastapi-demo-admin

pnpm install

pnpm run dev
```

[补充]升级 pip
python -m pip install --upgrade pip -i https://mirrors.aliyun.com/pypi/simple/

## 账号

管理员账号
991584844@qq.com
123456

员工账号
991584828@qq.com
123456

## 新增数据

```python
# User是数据表模型
# add 单条数据
db_user = User(username = "Tom",password = "1234567" )
db.add(db_user)
db.commit()

#add 批量数据
db_user1 = User(username = "Tom",password = "1234567" )
db_user2 = User(username = "Jack",password = "123456" )
db.add_all([db_user1,db_user2])
db.commit()

```

## 单表查询

```python
# 搜索user表第一条数据
result = db.query(User).first()
# 搜索user表所有数据
result = db.query(User).all()
# filter过滤条件搜索
result = db.query(User).filter(User.username=='admin').first()
# filter_by过滤条件搜索，注意filter_by不支持非等值查询
result = db.query(User).filter_by(username='admin').all()

# 从第5条记录开始（即跳过前4条），获取接下来的10条记录
result = db.query(User).offset(4).limit(10).all()

# order_by，排序倒序desc(),正序asc()
result = db.query(User).order_by(User.create_time.desc()).all()

# group_by,查看使用相同昵称的用户有几个
from sqlalchemy import func
result = db.query(User.nickname,func.count(User.username).label('total_nickname')).group_by(User.nickname).all()

# 搜索不等于
result = db.query(User).filter(User.username != 'admin').all()

# like
result = db.query(User).filter(User.username.like('%ad%')).all()

# in
result = db.query(User).filter(User.username.in_(['root','admin','jack'])).all()
# 同时，in也可以作用于一个Query
result = db.query(User).filter(User.username.in_(db.query(User.username).filter(User.username.like('%ad%')))).all()

# not in
result = db.query(User).filter(~User.username.in_(['root','admin','jack'])).all()

# and
result = db.query(User).filter(User.username == 'admin', User.nickname == '哈哈')..all()
# 或者是通过多次filter操作
result = db.query(User).filter(User.username == 'admin').filter(User.nickname == '哈哈').all()

# 只搜索数据库部分字段
result = db.query(User.username).filter(User.username == 'admin').all()

# 搜索数据库字段设置别名，类似sql的 select nickname as name from User
result = db.query(User.nickname.label('name')).filter(User.username == 'admin').all()

```

## 连表查询

```python
# user和group表,通过User.group_id和Group.id关联
result = db.query(User, Group).join(Group, User.group_id == Group.id).all()
for user, group in result:
    print(user.username, group.name)
```

## 更新数据

```python
# 修改对象：首先从数据库中查找对象，然后将这条数据修改为你想要的数据，最后做commit操作就可以修改数据了
user = db.query(User).first()
user.username = 'lucy'
db.commit()
```

或者

```python
session.query(Users).filter_by(id=1).update({'name': "Jack"})
```

## 删除数据

```python
# 删除对象：将需要删除的数据从数据库中查找出来，然后使用`db.delete`方法将这条数据从db中删除，最后做commit操作就可以了
delete_users = db.query(User).filter(Users.name == "test").first()
if delete_users:
    db.delete(delete_users)
    db.commit()
```

或者

```python
db.query(Users).filter(Users.name == "test").delete()
db.commit()

```

批量删除时推荐使用第二种。

## 批量插入数据方法

#### 方法 1：使用 bulk_insert_mappings【推荐】

bulk_insert_mappings 是 SQLAlchemy 中一个非常高效的方法，它允许你直接从字典列表中插入数据，避免了每次插入都创建新的会话对象，从而减少了数据库的往返次数。

```python
from sqlalchemy.orm import Session
from your_model import YourModel  # 假设你的模型名为YourModel

# 创建一个session
session = Session(your_engine)

# 准备数据
data = [
    {'column1': value1, 'column2': value2},
    {'column1': value3, 'column2': value4},
    # 更多数据...
]

# 批量插入
session.bulk_insert_mappings(YourModel, data)
session.commit()
```

#### 方法 2：使用 execute 方法结合 INSERT 语句

如果你需要更细粒度的控制（例如，插入特定的列或者使用特定的 SQL 语句），你可以使用 execute 方法。

```python
from sqlalchemy import text
from sqlalchemy.orm import Session

# 创建一个session
session = Session(your_engine)

# 准备数据
data = [
    (value1, value2),
    (value3, value4),
    # 更多数据...
]

# 构建INSERT语句
stmt = text("INSERT INTO your_table (column1, column2) VALUES (:column1, :column2)")

# 批量插入
session.execute(stmt, data)
session.commit()
```

#### 方法 3：使用 add_all 结合 bulk_save_objects（适用于 ORM）

如果你使用的是 SQLAlchemy ORM，并且想利用 ORM 的特性（例如，模型关系管理等），可以使用 add_all 方法结合 bulk_save_objects。不过，请注意，从 SQLAlchemy 1.4 开始，推荐使用 bulk_insert_mappings 或直接使用原生 SQL 进行批量插入，因为 bulk_save_objects 在一些情况下可能会引发问题。

```python
from sqlalchemy.orm import Session
from your_model import YourModel  # 假设你的模型名为YourModel

# 创建一个session
session = Session(your_engine)

# 准备数据对象列表
objects = [
    YourModel(column1=value1, column2=value2),
    YourModel(column1=value3, column2=value4),
    # 更多对象...
]

# 批量插入（注意：在某些版本中可能需要额外的配置或已弃用）
session.bulk_save_objects(objects)
session.commit()

```

## 事务使用

在 SQLAlchemy 中，通常我们不会对单个会话（session）进行多次 commit 操作，尤其是在单个事务中。这是因为 commit 操作在 SQLAlchemy 中是用来提交当前事务的所有更改到数据库的。如果你在同一个会话（session）中对多个更改进行了多次 commit，实际上只有最后一次 commit 会成功，之前的 commit 操作会被忽略，因为它们已经被包含在上一个 commit 操作的事务中了。

#### 正确的做法

- 一次性提交所有更改：在大多数情况下，你应该在会话结束前一次性提交所有更改
- 使用 flush 而非 commit 进行部分提交：如果你需要在事务中分阶段提交更改（尽管这不是 SQLAlchemy 的标准用法），你可以使用 flush()方法。flush()会提交当前会话到数据库的更改，但不结束事务。这对于处理需要分阶段验证的复杂逻辑很有用。

## 插入数据存在则更新，不存在则插入

在 SQLAlchemy 中，你可以使用 session.merge()方法来实现“如果存在则更新，不存在就插入”的逻辑。这个方法会检查主键或唯一约束，如果记录已经存在，则更新它；如果不存在，则插入新的记录。

以下是使用 session.merge()的一个示例：

```python
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# 定义数据库连接
engine = create_engine('sqlite:///example.db')
Base = declarative_base()

# 定义模型
class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True)
    name = Column(String)
    age = Column(Integer)

# 创建表
Base.metadata.create_all(engine)

# 创建Session
Session = sessionmaker(bind=engine)
session = Session()

# 示例数据
user_data = {'id': 1, 'name': 'Alice', 'age': 30}

# 使用session.merge()
merged_user = session.merge(User(**user_data))
session.commit()

print(f"Merged user ID: {merged_user.id}, Name: {merged_user.name}, Age: {merged_user.age}")

```

批量插入,存在则更新，不存在则插入的 sql 语句

```sql
INSERT INTO USER ( id, nick_name, email )
VALUES
	(2,'李四3','会飞的猪','员工','791584844@qq.com','$2b$12$c5WSa3j8GjyfmNE.47h7QeXAP0SJqo541m8ZyxMgk3P1QOzvsmTDW','2025-04-16 16:47:03','2025-04-15 16:47:03'),

	ON DUPLICATE KEY UPDATE nick_name =VALUES( nick_name ),email =VALUES( email )
```

## 通过 sql 实现批量更新

#### 方法一原生 SQL 批量更新

```python
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

async def bulk_update_via_rawsql(db: AsyncSession):
    update_stmt = text("UPDATE users SET name = :new_name WHERE id IN :ids")
    await db.execute(update_stmt, {"new_name": "李四", "ids": (1, 2, 3)})
    await db.commit()

```

特点 ‌：直接执行原生 SQL，性能最高，适用于简单条件更新 ‌

#### 方法二 update() 语句批量更新

```python
from sqlalchemy import update
from sqlalchemy.ext.asyncio import AsyncSession

async def bulk_update_via_core(db: AsyncSession):
    stmt = (
        update(User)
        .where(User.id.in_([1, 2, 3]))
        .values(name="李四")
    )
    await db.execute(stmt)
    await db.commit()

```

‌ 特点 ‌：通过 SQLAlchemy Core 构建语句，兼顾性能与可读性 ‌,

#### 方法三 bulk_update_mappings() 方法

```python
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import bulk_update_mappings

async def bulk_update_via_orm(db: AsyncSession):
    users = [
        {"id": 1, "name": "李四"},
        {"id": 2, "name": "王五"}
    ]
    await db.execute(bulk_update_mappings(User, users))
    await db.commit()

```

‌ 特点 ‌：基于 ORM 对象或字典映射更新，灵活性高，适合复杂数据 ‌

## 多条件查询

在 SQLAlchemy 中，使用 filter() 方法筛选多个条件时，可以通过 ‌ 链式调用 ‌ 或 ‌ 逻辑运算符（and*、or*）‌ 组合条件。

#### 方法一 链式调用多个条件（默认 AND 逻辑）

```python
# 示例：查询 age > 18 且 city = 'New York' 的用户
results = session.query(User).filter(
    User.age > 18,
    User.city == 'New York'
).all()

# 等效写法（链式调用）
results = session.query(User)
    .filter(User.age > 18)
    .filter(User.city == 'New York')
    .all()
```

#### 方法二 显式使用 and* 或 or*‌

```python
from sqlalchemy import and_, or_

# 示例1：AND 组合
results = session.query(User)
    .filter(and_(
        User.age > 18,
        User.city == 'New York'
    ))
    .all()

# 示例2：OR 组合
results = session.query(User)
    .filter(or_(
        User.city == 'New York',
        User.city == 'London'
    ))
    .all()

# 示例3：混合 AND 和 OR
results = session.query(User)
    .filter(and_(
        User.age > 18,
        or_(
            User.city == 'New York',
            User.city == 'London'
        )
    ))
    .all()


```

#### 方法三 ‌ 动态条件构建

```python
# 动态条件示例
conditions = []
if min_age:
    conditions.append(User.age >= min_age)
if city_filter:
    conditions.append(User.city == city_filter)

results = session.query(User)
    .filter(*conditions)
    .all()

```

#### 常用条件运算符

除了 ==、>、<，SQLAlchemy 还支持其他运算符

```python
# 模糊查询（LIKE）
results = session.query(User)\
    .filter(User.name.like('%John%'))\
    .all()

# 包含在列表中（IN）
valid_ages = [18, 25, 30]
results = session.query(User)\
    .filter(User.age.in_(valid_ages))\
    .all()

# 不等于（!=）
results = session.query(User)\
    .filter(User.city != 'Paris')\
    .all()

```

#### filter_by vs filter

- ‌filter_by‌：直接通过关键字参数匹配（仅支持等值条件）

```python
results = session.query(User)
    .filter_by(name='John', age=30)
    .all()
```

- filter‌：支持更复杂的条件（如比较、逻辑组合等）

## 创建流程请求示例

```json
{
  "id": 13,
  "title": "测试流程8",
  "content": "测试流程1测试流程1测试流程1测试流程1测试流程1",
  "remark": "测试流程1测试流程1测试流程1测试流程1测试流程1测试流程1测试流程1测试流程1",
  "processNodeList": [
    {
      "id": 1,
      "order": 1,
      "description": "需要去现场考察1",
      "remark": "目的地深圳市罗湖区2",
      "is_original_node": 1,
      "approve_user_ids": "1,2"
    },
    {
      "id": 2,
      "order": 2,
      "description": "报销审查1",
      "remark": "需要提供发票23",
      "is_original_node": 1,
      "approve_user_ids": "3,4"
    },
    {
      "order": 3,
      "description": "最终审核",
      "remark": "拨款以及成本核算",
      "is_original_node": 1,
      "approve_user_ids": "5,6"
    }
  ]
}
```

## get 请求入参查询

#### 方式一

```python
from fastapi import FastAPI, Request, HTTPException, Depends
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy import create_engine
from collections import defaultdict
from your_app.models import User  # 替换为你的模型

app = FastAPI()

# 配置数据库
DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 依赖注入获取数据库会话
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/users")
async def get_users(request: Request, db: Session = Depends(get_db)):
    # 获取所有查询参数（支持多值）
    query_params = request.query_params.multi_items()

    # 按参数名分组，处理多值情况（例如：?name=John&name=Jane）
    grouped_params = defaultdict(list)
    for key, value in query_params:
        grouped_params[key].append(value)

    filters = []
    for key, values in grouped_params.items():
        # 检查模型是否存在该字段
        if hasattr(User, key):
            column = getattr(User, key)
            try:
                # 处理多值：转换为IN查询
                if len(values) > 1:
                    typed_values = [column.type.python_type(v) for v in values]
                    filters.append(column.in_(typed_values))
                # 单值：等值查询
                else:
                    typed_value = column.type.python_type(values[0])
                    filters.append(column == typed_value)
            except ValueError as e:
                raise HTTPException(
                    status_code=400,
                    detail=f"参数 '{key}' 的值无效：{str(e)}"
                )
            except Exception as e:
                raise HTTPException(
                    status_code=500,
                    detail=f"处理参数 '{key}' 时出错：{str(e)}"
                )

    # 执行查询
    users = db.query(User).filter(*filters).all()
    return users

```

#### 方式二

get 请求链接： http://127.0.0.1:8000/user/list?name=%E6%9D%8E&state=1

```python
@router.get("/list")
async def get_all_users(name: Optional[str] = None,
                        state: Optional[Literal['0', '1']] = None):
    session = database.get_db_session(engine)
    data = session.query(User).filter(
        User.name.like(f'%{name}%') if name else True,
        User.state == int(state) if state in ['0', '1'] else True,
    ).options(defer(User.password)).order_by(User.updated_at.asc(),
                                             User.created_at.asc()).all()

    return response_builder(data, 200, "All User retrieved successfully.",
                            False)

```

或者

```python

@router.get("/list", response_model=ListResponseModel)
async def read_all_users(name: Optional[str] = None,
                         nick_name: Optional[str] = None,
                         role: Optional[str] = None,
                         email: Optional[str] = None,
                         state: Optional[Literal['0', '1']] = None):
    '''
    description: 获取用户列表
    return {*}
    '''
    session = database.get_db_session(engine)
    try:
        data = session.query(User).filter(
            User.name.like(f'%{name}%') if name else True,
            User.nick_name.like(f'%{nick_name}%') if nick_name else True,
            User.role == role if role else True,
            User.email.like(f'%{email}%') if email else True,
            User.state == state if state else True,
        ).options(defer(User.password)).order_by(User.updated_at.asc(),
                                                 User.created_at.asc()).all()
        return response_builder(data, 200)
    except Exception as e:
        session.rollback()
        return response_builder(None, 500, str(e))
    finally:
        session.close()
```

## 流程设置相关数据

上门测绘定制安装流程，对于特殊的安装场景以及用户的个性化需求，需要通过准确的测绘报告，制定安装计划
1、上门预约测绘，用户确定上门时间，测绘师傅电话/微信语音沟通确定准确时间
2、测绘现场签到，用于保证测绘师傅按时上门，用于收集相关测绘数据
3、测绘完毕，生成测绘报告与用户确认测绘数据
4、电话回访，用于收集，用户对测绘师傅的安装过程，安装结果的满意度收集

上门安装流程, 用于用户上门预约安装电器的服务流程
1、上门预约审核，用户确定上门时间，安装师傅电话/微信语音沟通确定准确时间
2、安装前现场签到审核，用于保留安装前的场地，在安装过程中如果造成对用户原场地损坏作为定损依据；也确保安装师傅能够在约定时间到达安装场地
3、安装完毕，用于收集，安装师傅是否是在在指定时间内安装；用户需缴纳安装额外造成的费用等
4、电话回访，用于收集，用户对安装师傅的安装过程，安装结果的满意度收集

## 关联查询

#### 方法一 使用 EXISTS 子查询【推荐】

适用于未定义模型关系或需要灵活控制条件的情况。

```python
@router.get('/available')
async def get_available_process():
    '''
    description: 获取可使用的的流程, 存在原始流程节点，并且是
    return {*}
    '''
    session = database.get_db_session(engine)

    try:
        data = session.query(ProcessSetting).filter(
            ProcessSetting.process_state == 1,
            exists().where(ProcessSetting.id == ProcessNode.ps_id,
                           ProcessNode.pn_state == 1,
                           ProcessNode.is_original_node == 1)).all()
        session.commit()
        return response_builder(data, 200)

    except Exception as e:
        session.rollback()
        return response_builder(None, 500, str(e))
    finally:
        session.close()

```

#### 方法二 利用 ORM 关系（如已定义）

如果模型间通过 relationship 定义了关联，可直接使用 any() 方法：

```python
from models import User

# 查询所有有至少一个订单的用户
results = session.query(User).filter(User.orders.any()).all()

```

#### 方法三 使用 JOIN 并去重

通过内连接并去重确保结果唯一：

```python
from models import User, Order

# 内连接用户和订单表，去重
results = session.query(User).join(Order).distinct().all()

```

#### 详细说明

- EXISTS 子查询 ‌：高效检查是否存在关联记录，无需处理重复数据。
- ORM 关系 any()‌：简洁直观，前提是模型已正确定义关联。
- JOIN + DISTINCT‌：明确连接表，适合需要基于关联表其他字段过滤的情况。根据模型是否定义关系及具体需求选择合适的方法。推荐优先使用 ORM 关系的 any()，更简洁且符合 ORM 设计模式。

#### 场景查询

python 使用 sqlalchemy 比较创建时间 create_at 加上 时间失效时间 expire_diff 是否大于当前时间的查询

```python
from sqlalchemy import text

# 使用原生SQL表达式进行查询
expired_records = session.execute(text("SELECT * FROM my_table WHERE create_at + INTERVAL expire_diff SECOND < NOW()")).fetchall()
```

使用 orm 查询

```python
# 使用时间间隔（需数据库支持）
async def validate_captcha(code):
    """
    description: 校验验证码
    param {str} code 验证码
    return {*}
    """
    if code:
        database = Database()
        async_engine = database.get_db_async_connection()
        AsySession = database.get_db_async_session(async_engine)
        today = datetime.now()
        """
                    CaptchaCodeInfo.created_at.between(
                        today, today +
                        timedelta(seconds=CaptchaCodeInfo.expire_diff))
        """

        async with AsySession() as session:
            result = await session.execute(
                select(CaptchaCodeInfo).where(
                    CaptchaCodeInfo.code == code,
                    func.date_add(CaptchaCodeInfo.created_at,
                                  text("INTERVAL expire_diff SECOND"))
                    >= func.now()))
            c_info = result.scalars().first()
            # 清空过时的验证码
            if c_info:
                await session.execute(
                    delete(CaptchaCodeInfo).where((CaptchaCodeInfo.created_at
                                                   < func.now())))
                return True
            else:
                return '无效验证码'
    else:
        return '请输入验证码'

```

```python
# 使用时间戳计算（推荐，通用性较强）
from sqlalchemy import func

# 将时间转换为秒级时间戳后计算
condition = (func.extract('epoch', Info.created_at) - Info.expire_diff) >= func.extract('epoch', func.now())

# 数据库方言适配‌：若使用 MySQL，需替换 func.extract('epoch', ...) 为 func.unix_timestamp(...)
```

```python

from sqlalchemy import text, select

async def check_expired(session: AsyncSession, record_id: int) -> bool:
    # 构造时间比较条件
    query = select(YourModel).where(
        text("create_at + interval '1 second' * expire_diff < NOW()")  # 不同数据库需调整时间函数‌:ml-citation{ref="2,6" data="citationList"}
    ).where(YourModel.id == record_id)

    # 执行异步查询
    result = await session.execute(query)
    expired_record = result.scalar_one_or_none()
    return expired_record is not None

```

```sql
SELECT captcha_code_info.id, captcha_code_info.code, captcha_code_info.type, captcha_code_info.expire_diff, captcha_code_info.updated_at, captcha_code_info.created_at
FROM captcha_code_info
WHERE captcha_code_info.code = 'AcBj'
  AND captcha_code_info.created_at + INTERVAL 300 SECOND > NOW() LIMIT 100

```

```sql
SELECT *
FROM user
WHERE created_at < DATE_SUB(NOW(), INTERVAL 1 DAY);

# 或者

SELECT * from captcha_code_info WHERE created_at < DATE_SUB(NOW(), INTERVAL 1 DAY) LIMIT 100

```

### 重定向登录

访问获取 key
http://127.0.0.1:8006/auth/secret_key?pwd=123456

访问重定向地址
http://127.0.0.1:8006/auth/redirect?email=991584844@qq.com&secretkey=35:$1$W2Tfbagc$PYgUrDI0.5DImDW8UVIeK/&redirectUrl=http://localhost:3200

### 数据库新增字段 sql

```sql
ALTER TABLE process_node
ADD COLUMN `approve_user_names` varchar(255) COMMENT '可执行审批人名称集合，可多个英文逗号分隔' AFTER `approve_user_ids`;


ALTER TABLE process_node
ADD COLUMN `ap_remark` varchar(500) COMMENT '执行审批通过备注' AFTER `ap_by_id`;

ALTER TABLE process_node
ADD COLUMN `anp_remark` varchar(500) COMMENT '执行审批不通过备注' AFTER `anp_by_id`;

```

## 查询 userIds 中含有某 userId 数据

python 中使用 sqlalchemy，查询 mysql 某个 userIds 字段中存入多个用户 id 使用英文逗号拼接的字符串，如何查询该字符串中含有某用户 id 的数据

#### 使用字符串分割函数

如果你的 MySQL 版本支持字符串分割函数（例如 FIND_IN_SET），你可以直接在 SQL 查询中使用这些函数。

```python
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# 创建数据库连接
engine = create_engine('mysql+pymysql://user:password@localhost/dbname')
Session = sessionmaker(bind=engine)
session = Session()

# 查询示例
user_id = 2
query = text("SELECT * FROM your_table WHERE FIND_IN_SET(:user_id, userIds)")
result = session.execute(query, {'user_id': str(user_id)}).fetchall()

for row in result:
    print(row)
```

## 去重

‌ 方法 ‌ ‌ 适用场景 ‌ ‌ 优点 ‌ ‌ 缺点 ‌
distinct() 快速获取字段唯一值 简单高效 无法保留其他字段信息
group_by() 需保留特定记录（如最大/最小 id） 结合聚合函数灵活性强 需子查询配合
窗口函数 复杂分组逻辑（如多字段去重排序） 支持复杂条件筛选 语法较复杂
物理删除 永久清理冗余数据 彻底解决数据冗余 需谨慎操作，避免误删

#### distinct 方法

直接对指定字段进行去重，适用于仅需获取字段唯一值的场景：

```python
from sqlalchemy import distinct

# 对单字段去重
session.query(distinct(Table.column_name)).all()  # :ml-citation{ref="3,4" data="citationList"}

# 对多字段联合去重
session.query(distinct(Table.column1), distinct(Table.column2)).all()  # :ml-citation{ref="3,4" data="citationList"}

```

#### group_by() 分组去重

结合聚合函数（如 func.max）保留重复组中的特定记录：

```python
from sqlalchemy import func

# 按name分组，保留每组中最大id的记录
subquery = session.query(
    func.max(Table.id).label('max_id')
).group_by(Table.name).subquery()

result = session.query(Table).join(
    subquery, Table.id == subquery.c.max_id
).all()  # :ml-citation{ref="2,3" data="citationList"}

```

```python
@router.get('/approval_process', response_model=ListResponseModel)
async def get_work_order_approval_process(
        current_user=Depends(get_current_user)):
    '''
    description: 获取工单待审批流程
    return {*}
    '''
    session = database.get_db_session(engine)
    try:
        # query = text(
        #     "SELECT * FROM process_node WHERE FIND_IN_SET(:user_id, userIds)")
        userId = current_user.id
        # 获取待审批界面的工单id数据,
        woIds = session.query(ProcessNode.bind_wo_id).filter(
            ProcessNode.is_original_node == 0,
            ProcessNode.bind_wo_id != None,
            func.find_in_set(ProcessNode.approve_user_ids, str(userId)),
            ProcessNode.pn_state == 1,
        ).group_by(ProcessNode.bind_wo_id).all()
        # 提取 id 值（从元组第一个元素）; [(1,), (6,), (7,)]
        id_list = [id_tuple[0] for id_tuple in woIds]  # 得到 [1, 6, 7]
        woList = session.query(WorkOrder).filter(
            WorkOrder.id.in_(id_list)).all()
        session.commit()
        return response_builder(woList, 200)
    except Exception as e:
        session.rollback()
        return response_builder(None, 500, str(e))
    finally:
        session.close()
```

#### 窗口函数去重（复杂场景）

使用窗口函数（如 row_number()）标记重复行，筛选出需要的记录：

```python
from sqlalchemy import over, func, column

subquery = session.query(
    Table.id,
    Table.name,
    func.row_number().over(
        partition_by=Table.name,
        order_by=Table.id.desc()
    ).label('row_num')
).subquery()

# 筛选每个name分组中row_num=1的记录（即id最大的行）
result = session.query(subquery).filter(subquery.c.row_num == 1).all()  # :ml-citation{ref="3,7" data="citationList"}

```

#### 直接删除重复数据

若需从数据库中物理删除重复数据，可通过子查询定位冗余记录

```python
from sqlalchemy import and_

# 创建子查询确定保留的id（如每组最大id）
subquery = session.query(func.max(Table.id)).group_by(Table.name).subquery()

# 删除不在子查询中的记录
session.query(Table).filter(
    ~Table.id.in_(subquery)
).delete(synchronize_session=False)  # :ml-citation{ref="2,6" data="citationList"}
session.commit()
```

## 子查询

```python
subquery = session.query(User.id).filter(User.status == 'active').subquery()
result = session.query(User.name).filter(User.id.in_(subquery)).all()  # :ml-citation{ref="8" data="citationList"}

```

```python
@router.get('/approval_process', response_model=ListResponseModel)
async def get_work_order_approval_process(
        current_user=Depends(get_current_user)):
    '''
    description: 获取工单待审批流程
    return {*}
    '''
    session = database.get_db_session(engine)
    try:
        # query = text(
        #     "SELECT * FROM process_node WHERE FIND_IN_SET(:user_id, userIds)")
        userId = current_user.id
        # ,子查询，查出当前用户审批拒绝的节点数据
        subquery = session.query(ProcessNode.bind_wo_id).filter(
                ProcessNode.is_original_node == 0,
                ProcessNode.bind_wo_id != None,
                ProcessNode.pn_state== 3,
                func.find_in_set(ProcessNode.approve_user_ids, str(userId))
                ).distinct()

        # 排除条件
        exclude_condition = or_(
            # 条件1：state=3 且 bind_id 非空
            and_(ProcessNode.pn_state == 3, ProcessNode.bind_wo_id.isnot(None)),
            # 条件2：state≠3 但 bind_id 存在于子查询结果中
            and_(ProcessNode.pn_state != 3, ProcessNode.bind_wo_id.in_(subquery))
        )

        # 完整查询：取反排除条件
        woIds = session.query(ProcessNode.bind_wo_id).filter(
            ProcessNode.pn_state == 1,
            ~exclude_condition  # 使用 ~ 运算符排除满足条件的记录
        ).group_by(ProcessNode.bind_wo_id).all()


        print('woIds', woIds)

        # 提取 id 值（从元组第一个元素）; [(1,), (6,), (7,)]
        id_list = [id_tuple[0] for id_tuple in woIds]  # 得到 [1, 6, 7]
        woList = session.query(WorkOrder).filter(
            WorkOrder.id.in_(id_list)).all()
        session.commit()
        return response_builder(woList, 200)
    except Exception as e:
        session.rollback()
        return response_builder(None, 500, str(e))
    finally:
        session.close()
```
