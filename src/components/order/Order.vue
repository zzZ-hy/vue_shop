<template>
  <div>
    <!--  面包屑导航区  -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!--  卡片视图区域  -->
    <el-card>
      <el-row>
        <el-col :span="8">
          <el-input placeholder="请输入内容">
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
      </el-row>

      <!--   订单列表区域   -->
      <el-table :data="orderList" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="订单编号" prop="order_number"></el-table-column>
        <el-table-column label="订单价格" prop="order_price"></el-table-column>
        <el-table-column label="是否付款" prop="pay_status">
          <template v-slot="scope">
            <el-tag v-if="scope.row.pay_status === '1'" type="success">已付款</el-tag>
            <el-tag v-else type="danger">未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否发货" prop="is_send"></el-table-column>
        <el-table-column label="下单时间">
          <template v-slot="scope">
            {{scope.row.create_time | dateFormat}}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template v-slot="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showBox"></el-button>
            <el-button type="success" icon="el-icon-location" size="mini" @click="showProgressBox"></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!--   分页区域   -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        background>
      </el-pagination>
    </el-card>

    <!--  修改地址的对话框  -->
    <el-dialog
      title="修改地址"
      :visible.sync="addressVisible"
      width="50%"
      @close="addressDialogClosed">
      <el-form :model="addressForm" :rules="addressFormRules" ref="addressFormRef" label-width="100px">
        <el-form-item label="省市区/县" prop="address1">
          <el-cascader :options="cityOptions"
                       v-model="addressForm.address1"
                       :props="{ expandTrigger: 'hover' }">
          </el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="addressForm.address2"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addressVisible = false">取 消</el-button>
        <el-button type="primary" @click="addressVisible = false">确 定</el-button>
      </span>
    </el-dialog>

    <!--  展示物流进度的对话框  -->
    <el-dialog
      title="物流进度"
      :visible.sync="progressVisible"
      width="50%"
      @close="addressDialogClosed">
      <!--   时间线   -->
      <el-timeline>
        <el-timeline-item
          v-for="(activity, index) in progressInfo"
          :key="index"
          :timestamp="activity.time">
          {{activity.context}}
        </el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script>
  import cityOptions from './city_data2017_element'
  import kuaidi from "./kuaidi";

  export default {
    name: "Order",
    data() {
      return {
        queryInfo: {
          query: '',
          pagenum: 1,
          pagesize: 10
        },
        //  订单列表的数据
        orderList: [],
        //  订单列表的总数量
        total: 0,
        //  控制修改地址对话框的显示与隐藏
        addressVisible: false,
        //  存储填写表单信息的对象
        addressForm: {
          address1: [],
          address2: ''
        },
        //  表单验证规则对象
        addressFormRules: {
          address1: [{required: true, message: '请输入选择省市区/县', trigger: 'blur'}],
          address2: [{required: true, message: '请输入详细地址', trigger: 'blur'}]
        },
        //  全部省市联动的数据
        cityOptions,
        //  控制物流进度对话框的显示与隐藏
        progressVisible: false,
        //  物流进度的信息
        progressInfo: []
      }
    },
    created() {
      this.getOrderList()
    },
    methods: {
      //  获取订单的数据
      getOrderList() {
        this.$http.get('orders', {params: this.queryInfo}).then(res => {
          if (res.data.meta.status !== 200) return this.$message.error('获取订单列表失败!')
          // console.log(res.data);
          //  获取订单列表的总数量
          this.total = res.data.data.total
          //  获取订单列表的数据
          this.orderList = res.data.data.goods
        })
      },
      handleSizeChange(newSize) {
        // console.log(newSize);
        this.queryInfo.pagesize = newSize
        this.getOrderList()
      },
      handleCurrentChange(newPage) {
        // console.log(newPage);
        this.queryInfo.pagenum = newPage
        this.getOrderList()
      },
      showBox() {
        this.addressVisible = true
      },
      //  关闭修改地址对话框，就把以前的数据清空
      addressDialogClosed() {
        this.addressForm = {}
        this.$refs.addressFormRef.resetFields()
      },
      showProgressBox() {
        // this.$http.get('/kuaidi/804909574412544580').then(res => {
        //   if (res.data.meta.status !== 200) return this.$message.error('获取物流进度失败!')
        //
        //   this.progressInfo = res.data.data
        // })
        // console.log(kuaidi.data);
        this.progressInfo = kuaidi.data
        this.progressVisible = true
      }
    }
  }
</script>

<style lang="less" scoped>
  .el-cascader {
    width: 100%;
  }
</style>
