import unittest
from ddt import ddt, data


@ddt
class TestDemo(unittest.TestCase):

    @data('17611110000', '17611112222')
    def test_1(self, phone):
        print('测试电话号码：', phone)


if __name__ == '__main__':
    unittest.main()
