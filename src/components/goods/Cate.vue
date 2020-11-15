<template>
  <div>
    <!--  面包屑导航区  -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!--  卡片视图区域  -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>
      <!--  表格区域  -->
      <tree-table
        :data="cateList"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index
        index-text="#"
        border
        class="treeTable">
        <!--   是否有效     -->
        <template v-slot:isok="scope">
          <i class="el-icon-success" v-if="!scope.row.cat_deleted" style="color: lightgreen"></i>
          <i class="el-icon-error" v-else style="color: red"></i>
        </template>
        <!--    排序    -->
        <template v-slot:order="scope">
          <el-tag size="mini" v-if="scope.row.cat_level===0">一级</el-tag>
          <el-tag size="mini" type="success" v-else-if="scope.row.cat_level===1">二级</el-tag>
          <el-tag size="mini" type="warning" v-else>三级</el-tag>
        </template>
        <!--    操作    -->
        <template v-slot:opt="scope">
          <el-button type="primary" size="mini" icon="el-icon-edit">编辑</el-button>
          <el-button type="danger" size="mini" icon="el-icon-delete">删除</el-button>
        </template>
      </tree-table>
      <!--  分页区域  -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[3, 5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>

    <!--  添加分类的对话框  -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      width="50%"
      @close="addCateDialogClosed">
      <!--   添加分类的表单   -->
      <el-form ref="addCateFormRef" :rules="addCateFormRules" :model="addCateForm" label-width="100px">
        <el-form-item label="分类名称:" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类:">
          <!--    options 用来指定数据源      -->
          <!--    props 用来指定配置对象      -->
          <el-cascader
            v-model="selectedKeys"
            :options="parentCateList"
            :props="cascaderProps"
            @change="parentCateChanged"
            clearable>
          </el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
         <el-button @click="addCateDialogVisible = false">取 消</el-button>
         <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    name: "Cate",
    data() {
      return {
        //  查询条件
        queryInfo: {
          type: 3,
          pagenum: 1,
          pagesize: 5
        },
        //  商品分类数据列表，默认为空
        cateList: [],
        //  总数据条数
        total: 0,
        //  为table指定列的定义
        columns: [
          {label: '分类名称', prop: 'cat_name'},
          {
            label: '是否有效',
            //  将当前列定义为模板列
            type: 'template',
            //  标识当前这一列使用的模板名称
            template: 'isok'
          },
          {
            label: '排序',
            //  将当前列定义为模板列
            type: 'template',
            //  标识当前这一列使用的模板名称
            template: 'order'
          },
          {
            label: '操作',
            //  将当前列定义为模板列
            type: 'template',
            //  标识当前这一列使用的模板名称
            template: 'opt'
          }
        ],
        //  控制添加分类对话框的显示与隐藏
        addCateDialogVisible: false,
        //  添加分类的表单数据对象
        addCateForm: {
          //  将要添加的分类名称
          cat_name: '',
          //  父级分类的id
          cat_pid: 0,
          //  分类的等级，默认一级分类
          cat_level: 0
        },
        addCateFormRules: {
          cat_name: [
            {required: true, message: '请输入分类名称', trigger: 'blur'}
          ]
        },
        //  父级分类的列表
        parentCateList: [],
        //  指定级联选择器的配置对象
        cascaderProps: {
          expandTrigger: 'hover',
          checkStrictly: true,
          label: 'cat_name',
          value: 'cat_id',
          children: 'children'
        },
        //  选中的父级分类的id数组
        selectedKeys: []
      }
    },
    created() {
      this.getCateList()
    },
    methods: {
      //  获取商品分类数据
      getCateList() {
        this.$http.get('categories', {params: this.queryInfo}).then(res => {
          if (res.data.meta.status !== 200) return this.$message.error(res.data.meta.msg)
          // console.log(res.data.data);
          //  把数据列表赋值给cateList
          this.cateList = res.data.data.result
          //  获取总数据条数
          this.total = res.data.data.total
        })
      },
      //  监听pagesize改变的事件
      handleSizeChange(newSize) {
        this.queryInfo.pagesize = newSize
        this.getCateList()
      },
      //  监听pagenum改变的事件
      handleCurrentChange(newPage) {
        this.queryInfo.pagenum = newPage
        this.getCateList()
      },
      //  点击按钮展示添加分类的对话框
      showAddCateDialog() {
        //  先获取父级分类的对话框
        this.getParentCateList()
        //  在展示出对话框
        this.addCateDialogVisible = true
      },
      //  获取父级分类的数据列表
      getParentCateList() {
        this.$http.get('categories', {params: {type: 2}}).then(res => {
          if (res.data.meta.status !== 200) return this.$message.error('获取父级分类数据失败!')
          //  父级分类的数据赋值给ParentCateList数组
          this.parentCateList = res.data.data
        })
      },
      //  选择项发生变化触发这个事件
      parentCateChanged() {
        //  如果selectedKeys数组中的length大于0，则证明选中了父级分类
        //  反之，没有选中任何的父级分类
        if (this.selectedKeys.length > 0) {
          //  父级分类的id
          this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
          //  为当前的分类等级赋值
          this.addCateForm.cat_level = this.selectedKeys.length
          return
        }
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      },
      //  点击按钮添加新的分类
      addCate() {
        // console.log(this.addCateForm);
        this.$refs.addCateFormRef.validate(valid =>{
          if (!valid) return
          this.$http.post('categories', this.addCateForm).then(res=>{
            if (res.data.meta.status !== 201) return this.$message.error('添加分类失败!')

            this.$message.success(res.data.meta.msg)

            this.getCateList()

            this.addCateDialogVisible = false
          })
        })
      },
      //  监听对话框的关闭事件，重置表单数据
      addCateDialogClosed(){
        this.$refs.addCateFormRef.resetFields()
        this.selectedKeys = []
        this.addCateForm = {
          //  将要添加的分类名称
          cat_name: '',
          //  父级分类的id
          cat_pid: 0,
          //  分类的等级，默认一级分类
          cat_level: 0
        }
      }
    }
  }
</script>

<style lang="less" scoped>
  .treeTable {
    margin-top: 15px;
  }

  .el-cascader {
    width: 100%;
  }
</style>
