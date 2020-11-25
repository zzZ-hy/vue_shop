<template>
  <div>
    <!--  面包屑导航区  -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!--  卡片视图区域  -->
    <el-card>
      <!--   警告区域   -->
      <el-alert
        title="注意:只允许为第三级分类设置相关参数!"
        type="warning"
        :closable="false"
        show-icon>
      </el-alert>
      <!--   选择商品分类区域   -->
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类:</span>
          <!--     选择商品分类的级联选择框     -->
          <el-cascader
            v-model="selectedCateKeys"
            :options="cateList"
            :props="cateProps"
            @change="handleChange">
          </el-cascader>
        </el-col>
      </el-row>

      <!--   tab 页签区域   -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <!--    添加动态参数面板    -->
        <el-tab-pane label="动态参数" name="many">
          <!--     添加参数的按钮     -->
          <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible = true">添加参数
          </el-button>
          <!--     动态参数的表格     -->
          <el-table :data="manyTableData" border stripe>
            <!--      展开行      -->
            <el-table-column type="expand">
              <template v-slot="scope">
                <!--       循环渲染tag标签         -->
                <el-tag v-for="(item,index) in scope.row.attr_vals"
                        :key="index"
                        closable
                        @close="handleClosed(index,scope.row)">{{item}}
                </el-tag>
                <!--       输入的文本框         -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)">
                </el-input>
                <!--        添加的按钮        -->
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag
                </el-button>
              </template>
            </el-table-column>
            <!--      索引列      -->
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template v-slot="scope">
                <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.attr_id)">
                  编辑
                </el-button>
                <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeParams(scope.row.attr_id)">删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!--    添加静态属性面板    -->
        <el-tab-pane label="静态属性" name="only">
          <!--     添加属性的按钮     -->
          <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible = true">添加属性
          </el-button>
          <!--     静态属性的表格     -->
          <el-table :data="onlyTableData" border stripe>
            <!--      展开行      -->
            <el-table-column type="expand">
              <template v-slot="scope">
                <!--       循环渲染tag标签         -->
                <el-tag v-for="(item,index) in scope.row.attr_vals"
                        :key="index"
                        closable
                        @close="handleClosed(index,scope.row)">{{item}}
                </el-tag>
                <!--       输入的文本框         -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)">
                </el-input>
                <!--        添加的按钮        -->
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag
                </el-button>
              </template>
            </el-table-column>
            <!--      索引列      -->
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column label="属性名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template v-slot="scope">
                <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.attr_id)">
                  编辑
                </el-button>
                <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeParams(scope.row.attr_id)">删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>

    </el-card>

    <!--  添加参数的对话框  -->
    <el-dialog
      :title="'添加'+titleText"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClosed">
      <!--   添加参数的对话框   -->
      <el-form ref="addFormRef" :model="addForm" :rules="addFormRules" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>

    <!--  修改参数的对话框  -->
    <el-dialog
      :title="'修改'+titleText"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClosed">
      <!--   修改参数的对话框   -->
      <el-form ref="editFormRef" :model="editForm" :rules="editFormRules" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>
  export default {
    name: "Params",
    data() {
      return {
        //  商品分类列表
        cateList: [],
        //  级联选择框的配置对象
        cateProps: {
          expandTrigger: 'hover',
          label: 'cat_name',
          value: 'cat_id',
          children: 'children'
        },
        //  级联选择框双向绑定到的数组
        selectedCateKeys: [],
        //  被激活的页签的名称
        activeName: 'many',
        //  动态参数的数据
        manyTableData: [],
        //  静态属性的数据
        onlyTableData: [],
        //  控制添加对话框的显示与隐藏
        addDialogVisible: false,
        //  添加参数的表单数据对象
        addForm: {},
        //  添加表单的验证规则对象
        addFormRules: {
          attr_name: [
            {required: true, message: '请输入参数名称/属性名称', trigger: 'blur'}
          ]
        },
        //  控制修改对话框的显示与隐藏
        editDialogVisible: false,
        //  修改的表单数据对象
        editForm: {},
        editFormRules: {
          attr_name: [
            {required: true, message: '请输入参数名称/属性名称', trigger: 'blur'}
          ]
        }
        // //  控制按钮与文本框的切换显示
        // inputVisible: false,
        // //  文本框输入的内容
        // inputValue: ''
      }
    },
    created() {
      this.getCateList()
    },
    methods: {
      //  获取所有的商品分类列表
      getCateList() {
        this.$http.get('categories').then(res => {
          if (res.data.meta.status !== 200) return this.$message.error('获取商品分类数据失败!')
          this.cateList = res.data.data

          // console.log(this.cateList);
        })
      },
      //  级联选择框选中项变化，会触发该事件
      handleChange() {
        //  情况之前的数据
        this.manyTableData = []
        this.onlyTableData = []
        this.getParamsData()
      },
      //  tab 页签的点击事件的处理函数
      handleTabClick() {
        // console.log(this.activeName);
        this.getParamsData()
      },
      getParamsData() {
        //  证明选中的不是三级分类
        if (this.selectedCateKeys.length !== 3) {
          this.selectedCateKeys = []
          // //  清空之前的数据
          // this.manyTableData = []
          // this.onlyTableData = []
          return
        }

        //  证明选中的是三级分类
        // console.log(this.selectedCateKeys);
        //  根据所选分类的id和当前所处的面板获取对应的参数
        this.$http.get(`categories/${this.cateId}/attributes`, {params: {sel: this.activeName}}).then(res => {
          if (res.data.meta.status !== 200) return this.$message.error('获取参数列表失败!')
          // console.log(res.data.data);
          res.data.data.forEach(item => {
            item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
            //  控制文本框的显示与隐藏
            item.inputVisible = false
            //  文本框中输入的值，动态绑定的值
            item.inputValue = ''
          })
          // console.log(res.data.data);
          if (this.activeName === 'many') {
            this.manyTableData = res.data.data
          } else {
            this.onlyTableData = res.data.data
          }
        })
      },
      //  监听对话框的关闭事件
      addDialogClosed() {
        this.addForm = {}
        this.$refs.addFormRef.resetFields()
      },
      addParams() {
        this.$refs.addFormRef.validate(valid => {
          if (!valid) return
          this.$http.post(`categories/${this.cateId}/attributes`, {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName
          }).then(res => {
            // console.log(res);
            if (res.data.meta.status !== 201) return this.$message.error('添加参数失败!')
            this.$message.success(res.data.meta.msg)
            this.addDialogVisible = false
            this.getParamsData()
          })
        })
      },
      //  点击按钮展示修改的对话框
      showEditDialog(attr_id) {
        //  查询当前参数的信息
        this.$http.get(`categories/${this.cateId}/attributes/${attr_id}`, {
          params: {attr_sel: this.activeName}
        }).then(res => {
          if (res.data.meta.status !== 200) return this.$message.error('获取参数信息失败!')

          this.editForm = res.data.data
        })
        this.editDialogVisible = true
      },
      //  重置修改表单
      editDialogClosed() {
        this.editForm = {}
        this.$refs.editFormRef.resetFields()
      },
      //  点击按钮修改参数信息
      editParams() {
        this.$refs.editFormRef.validate(valid => {
          if (!valid) return
          this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`, {
            attr_name: this.editForm.attr_name,
            attr_sel: this.activeName
          }).then(res => {
            // console.log(res);
            if (res.data.meta.status !== 200) return this.$message.error('修改参数失败!')
            this.$message.success(res.data.meta.msg)
            this.getParamsData()
            this.editDialogVisible = false
          })
        })
      },
      //  根据id删除对应的参数项
      removeParams(attr_id) {
        this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          return this.$http.delete(`categories/${this.cateId}/attributes/${attr_id}`)
        }).then(res => {
          // console.log(res);
          if (res.data.meta.status !== 200) return this.$message.error('删除分类失败！')
          this.$message.success(res.data.meta.msg)
          this.getParamsData()
        }).catch(() => {
          this.$message.info('已取消删除')
        })
      },
      //  文本框失去焦点或按下了enter键都会触发的事件
      handleInputConfirm(row) {
        if (row.inputValue.trim().length === 0) {
          row.inputValue = ''
          row.inputVisible = false
          return
        }
        //  如果没有return则证明输入的内容需要做后续的处理
        row.attr_vals.push(row.inputValue.trim())

        row.inputValue = ''

        row.inputVisible = false
        //  保存到数据库中，持久化存储
        this.saveAttrVals(row)
      },
      //  将对attr_vals的操作保存到数据库
      saveAttrVals(row) {
        //  需要发送请求，保存这次操作
        this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(' ')
        }).then(res => {
          if (res.data.meta.status !== 200) return this.$message.error('修改参数项失败!')
          this.$message.success(res.data.meta.msg)
        })
      },
      //  点击按钮展示文本输入框
      showInput(row) {
        row.inputVisible = true
        //  让文本框自动获得焦点
        //  $nextTick 方法的作用，就是当页面上的元素被重新渲染之后，才会执行回调函数中的代码
        this.$nextTick(_ => {
          this.$refs.saveTagInput.$refs.input.focus()
        })
      },
      //  删除对应的参数可选项
      handleClosed(index, row) {
        row.attr_vals.splice(index, 1)
        this.saveAttrVals(row)
      }
    },
    computed: {
      //  如果按钮需要被禁用，则返回true，否则返回false
      isBtnDisabled() {
        return this.selectedCateKeys.length !== 3
      },
      //  当前选中的三级分类的id
      cateId() {
        return this.selectedCateKeys.length === 3 ? this.selectedCateKeys[2] : null
      },
      //  动态计算标题的文本
      titleText() {
        return this.activeName === 'many' ? '动态参数' : '静态属性'
      }
    }
  }
</script>

<style lang="less" scoped>
  .cat_opt {
    margin: 15px 0;
  }

  .el-tag {
    margin: 5px;
  }

  .input-new-tag {
    width: 25%;
  }
</style>
