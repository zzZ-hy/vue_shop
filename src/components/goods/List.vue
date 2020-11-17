<template>
  <div>
    <!--  面包屑导航区  -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!--  卡片区域  -->
    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容"
                    v-model="queryInfo.query"
                    clearable @clear="getGoodsList">
            <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="goAddPage">添加商品</el-button>
        </el-col>
      </el-row>

      <!--   展示商品表格区域   -->
      <el-table :data="goodsList" style="width: 100%" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="goods_name" label="商品名称"></el-table-column>
        <el-table-column prop="goods_price" label="商品价格(元)" width="110%"></el-table-column>
        <el-table-column prop="goods_weight" label="商品重量" width="80%"></el-table-column>
        <el-table-column label="创建时间" width="160%">
          <template v-slot="scope">
            {{ scope.row.add_time | dateFormat}}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="140%">
          <template v-slot="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini"></el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini"
                       @click="removeById(scope.row.goods_id)"></el-button>
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

  </div>
</template>

<script>
  export default {
    name: "List",
    data() {
      return {
        //  查询参数对象
        queryInfo: {
          query: '',
          pagenum: 1,
          pagesize: 10
        },
        //  商品列表
        goodsList: [],
        //  总数居条数
        total: 0
      }
    },
    created() {
      this.getGoodsList()
    },
    methods: {
      //  根据分页获取对应的商品列表
      getGoodsList() {
        this.$http.get('goods', {params: this.queryInfo}).then(res => {
          if (res.data.meta.status !== 200) return this.$message.error('获取商品列表失败!')

          this.$message.success(res.data.meta.msg)
          console.log(res.data);
          this.goodsList = res.data.data.goods
          this.total = res.data.data.total
        })
      },
      //  获取新的表单每页的条数和数据
      handleSizeChange(newSize) {
        this.queryInfo.pagesize = newSize
        this.getGoodsList()
      },
      //  获取新的表单的页数和数据
      handleCurrentChange(newPage) {
        this.queryInfo.pagenum = newPage
        this.getGoodsList()
      },
      //  根据商品id来删除对应的商品
      removeById(goods_id) {
        this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          return this.$http.delete('goods/' + goods_id)
        }).then(res => {
          // console.log(res);
          if (res.data.meta.status !== 200) return this.$message.error('删除商品失败！')
          this.$message.success(res.data.meta.msg)
          this.getGoodsList()
        }).catch(() => {
          this.$message.info('已取消删除')
        })
      },
      //  点击添加商品的事件函数
      goAddPage(){
        this.$router.push('/goods/add')
      }
    }
  }
</script>

<style lang="less" scoped>

</style>
