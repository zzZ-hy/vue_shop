<template>
  <div>
    <!--  面包屑导航区  -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>

    <!--  卡片区域  -->
    <el-card>
      <!--   提示区域   -->
      <el-alert
        title="添加商品信息"
        type="info"
        show-icon
        center
        :closable="false">
      </el-alert>

      <!--   步骤条区域   -->
      <el-steps :space="200" :active="activeIndex - 0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <!--   tap栏区域   -->
      <el-form :model="addForm"
               :rules="addFormRules"
               ref="addFormRef"
               label-width="100px"
               label-position="top">
        <el-tabs :tab-position="'left'"
                 v-model="activeIndex"
                 :before-leave="beforeTabLeave" @tab-click="tabClicked">
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                v-model="addForm.goods_cat"
                :options="cateList"
                :props="cateProps"
                @change="handleChange">
              </el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <!--     渲染表单的item项,动态参数       -->
            <el-form-item :label="item.attr_name"
                          v-for="item in manyTableData"
                          :key="item.attr_id">
              <!--       复选框组       -->
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox v-for="(cb,index) in item.attr_vals"
                             :label="cb"
                             :key="index"
                             border></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <!--     渲染表单的item项,静态属性       -->
            <el-form-item :label="item.attr_name"
                          v-for="item in onlyTableData"
                          :key="item.attr_id">
              <!--       input输入框       -->
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <!--      action 标识图片要上传到的后台api地址      -->
            <el-upload
              :action="uploadURL"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="headerObj" :on-success="handleSuccess">
              <el-button size="small" type="primary">点击上传</el-button>
              <!--  <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>  -->
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>
            <el-button type="primary" class="btnAdd" @click="add">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

    <!--  图片预览区域  -->
    <el-dialog
      title="图片预览"
      :visible.sync="previewVisible"
      width="50%">
      <img :src="previewPath" alt="图片" class="previewImg">
    </el-dialog>

  </div>
</template>

<script>
  import _ from 'lodash'

  export default {
    name: "Add",
    data() {
      return {
        //  控制步骤条完成项
        activeIndex: '0',
        //  添加商品的表单数据对象
        addForm: {
          goods_name: '',
          goods_price: 0,
          goods_weight: 0,
          goods_number: 0,
          //  商品所属的分类数组
          goods_cat: [],
          //  图片的数组
          pics: [],
          //  商品的详情描述
          goods_introduce: '',
          //  动态静态信息数组
          attrs: []
        },
        //  表单的验证对象
        addFormRules: {
          goods_name: [
            {required: true, message: '请输入商品名称', trigger: 'blur'},
            {min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur'}
          ],
          goods_price: [
            {required: true, message: '请输入商品价格', trigger: 'blur'}
          ],
          goods_weight: [
            {required: true, message: '请输入商品重量', trigger: 'blur'}
          ],
          goods_number: [
            {required: true, message: '请输入商品数量', trigger: 'blur'}
          ],
          goods_cat: [
            {required: true, message: '请选中商品分类', trigger: 'blur'}
          ]
        },
        //  商品分类列表
        cateList: [],
        cateProps: {
          expandTrigger: 'hover',
          label: 'cat_name',
          value: 'cat_id',
          children: 'children'
        },
        //  动态参数列表数据
        manyTableData: [],
        //  静态属性列表数据
        onlyTableData: [],
        //  上传图片的URL地址
        uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
        //  图片上传组件的header请求头对象
        headerObj: {
          Authorization: window.sessionStorage.getItem('token')
        },
        previewPath: '',
        //  控制预览图片对话框的显示与隐藏
        previewVisible: false
      }
    },
    created() {
      this.getCateList()
    },
    methods: {
      //  获取所有商品的分类数据
      getCateList() {
        this.$http.get('categories').then(res => {
          if (res.data.meta.status !== 200) return this.$message.error('获取商品分类数据失败!')
          this.cateList = res.data.data
          // console.log(this.cateList);
        })
      },
      //  级联选择器选中项变化就会触发该函数
      handleChange() {
        if (this.addForm.goods_cat.length !== 3) {
          this.addForm.goods_cat = []
        }
        // console.log(this.addForm.goods_cat);
      },
      beforeTabLeave(activeName, oldActiveName) {
        if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
          this.$message.error('请先选择商品分类!')
          return false
        }
      },
      tabClicked() {
        //  证明访问的是动态参数面板
        if (this.activeIndex === '1') {
          this.$http.get(`categories/${this.cateId}/attributes`, {
            params: {sel: 'many'}
          }).then(res => {
            if (res.data.meta.status !== 200) return this.$message.error('获取动态参数列表失败!')
            // console.log(res.data.data);
            res.data.data.forEach(item => {
              item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
            })
            this.manyTableData = res.data.data
          })
        } else if (this.activeIndex === '2') {
          this.$http.get(`categories/${this.cateId}/attributes`, {
            params: {sel: 'only'}
          }).then(res => {
            if (res.data.meta.status !== 200) return this.$message.error('获取静态属性列表失败!')
            console.log(res.data.data);
            this.onlyTableData = res.data.data
          })
        }
      },
      //  处理图片预览效果
      handlePreview(file) {
        // console.log(file);
        //  存储图片的可预览地址
        this.previewPath = file.response.data.url

        //  显示图片预览对话框
        this.previewVisible = true
      },
      //  处理移除图片的操作
      handleRemove(file) {
        // console.log(file);
        //  1.获取到将要删除的图片的临时路劲
        const filePath = file.response.data.tmp_path
        //  2.从pics数组中，找到这个图片对应的索引值
        const index = this.addForm.pics.findIndex(item => item.pic === filePath)
        //  3.调用数组的splice方法，把图片信息对象，从pics数组中移除
        this.addForm.pics.splice(index, 1)
        // console.log(this.addForm);
      },
      //  监听图片上传成功的事件
      handleSuccess(response) {
        // console.log(response);
        //  1.拼接得到一个图片信息对象
        const picInfo = {pic: response.data.tmp_path}
        //  2.将图片信息对象push到pics数组中
        this.addForm.pics.push(picInfo)
        // console.log(this.addForm);
      },
      //  添加商品按钮点击事件函数
      add() {
        console.log(this.addForm);
        this.$refs.addFormRef.validate(valid => {
          if (!valid) return this.$message.error('请填写必要的表单项!')

          //  执行添加的业务逻辑
          //  lodash  cloneDeep(obj) 深拷贝
          const form = _.cloneDeep(this.addForm)
          form.goods_cat = form.goods_cat.join(',')

          //  处理动态参数
          this.manyTableData.forEach(item => {
            const newInfo = {
              attr_id: item.attr_id,
              attr_value: item.attr_vals.join(' ')
            }
            this.addForm.attrs.push(newInfo)
          })
          //  处理静态属性
          this.onlyTableData.forEach(item => {
            const newInfo = {
              attr_id: item.attr_id,
              attr_value: item.attr_vals
            }
            this.addForm.attrs.push(newInfo)
          })
          form.attrs = this.addForm.attrs
          console.log(form);

          //  发起请求添加商品
          //  商品的名称必须是唯一的
          this.$http.post('goods', form).then(res => {
            if (res.data.meta.status !== 201) return this.$message.error('添加商品失败!')

            this.$message.success(res.data.meta.msg)
            //  添加成功跳转到goods页面中
            this.$router.push('/goods')
          })
        })
      }
    },
    computed: {
      cateId() {
        return this.addForm.goods_cat.length === 3 ? this.addForm.goods_cat[2] : null
      }
    }
  }
</script>

<style lang="less" scoped>
  .el-checkbox {
    margin: 0 10px 0 0 !important;
  }

  .previewImg {
    width: 100%;
  }

  .btnAdd {
    margin-top: 15px;
  }
</style>
