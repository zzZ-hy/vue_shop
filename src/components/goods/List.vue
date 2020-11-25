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
            <el-button type="primary" icon="el-icon-edit" size="mini"
                       @click="showEditGoodDialog(scope.row.goods_id)"></el-button>
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

    <!--  修改用户的对话框  -->
    <el-dialog
      title="修改商品"
      :visible.sync="editGoodDialogVisible"
      width="50%"
      @close="editGoodDialogClosed">
      <!--   内容主体区域   -->
      <el-form :model="editGoodForm" :rules="editGoodFormRules" ref="editGoodFormRef" label-width="70px">
        <el-form-item label="商品名称" prop="goods_name">
          <el-input v-model="editGoodForm.goods_name"></el-input>
        </el-form-item>
        <el-form-item label="商品价格" prop="goods_price">
          <el-input v-model="editGoodForm.goods_price"></el-input>
        </el-form-item>
        <el-form-item label="商品数量" prop="goods_number">
          <el-input v-model="editGoodForm.goods_number"></el-input>
        </el-form-item>
        <el-form-item label="商品重量" prop="goods_weight">
          <el-input v-model="editGoodForm.goods_weight" type="number"></el-input>
        </el-form-item>
        <el-form-item label="商品分类" prop="goods_cat">
          <el-cascader
            v-model="editGoodForm.goods_cat"
            :options="cateList"
            :props="cateProps"
            @change="handleChange">
          </el-cascader>
        </el-form-item>
        <el-form-item label="商品介绍">
          <quill-editor v-model="editGoodForm.goods_introduce"></quill-editor>
        </el-form-item>
        <el-form-item label="商品图片">
          <el-upload
            :action="uploadURL"
            :on-preview="handlePreview"
            :on-remove="handleRemove"
            list-type="picture"
            :headers="headerObj" :on-success="handleSuccess">
            <el-button size="small" type="primary">点击上传</el-button>
            <!--  <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>  -->
          </el-upload>
        </el-form-item>
      </el-form>
      <!--   底部按钮区域   -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editGoodInfo">确 定</el-button>
      </span>
    </el-dialog>

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
  import _ from "lodash";

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
        total: 0,
        //  控制显示修改商品对话框的显示与隐藏
        editGoodDialogVisible: false,
        //  商品的信息
        editGoodForm: {},
        //  表单的验证规则对象
        editGoodFormRules: {
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
          ]
        },
        //  图片上传的URL地址
        uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
        //  图片上传组件的header请求头对象
        headerObj: {
          Authorization: window.sessionStorage.getItem('token')
        },
        //  控制图片预览对话框的显示与隐藏
        previewVisible: false,
        //  图片预览的路劲
        previewPath: '',
        //  商品分类列表
        cateList: [],
        cateProps: {
          expandTrigger: 'hover',
          label: 'cat_name',
          value: 'cat_id',
          children: 'children'
        }
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
          // console.log(res.data);
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
      goAddPage() {
        this.$router.push('/goods/add')
      },
      //  获取商品信息和商品分类信息，显示修改商品对话框
      showEditGoodDialog(id) {
        //  全部分类信息
        this.$http.get('categories').then(res => {
          if (res.data.meta.status !== 200) return this.$message.error('获取商品分类数据失败!')
          this.cateList = res.data.data
          // console.log(this.cateList);
        })

        //  商品信息
        this.$http.get('goods/' + id).then(res => {
          // console.log(res.data);
          if (res.data.meta.status !== 200) return this.$message.error('获取商品信息失败!')
          //  将分类转为数组
          res.data.data.goods_cat = res.data.data.goods_cat.split(',')
          const cat = []
          //  再将数组里的值转为number类型
          res.data.data.goods_cat.forEach(item => {
            cat.push(item - 0)
          })
          //  在将数组赋值给goods_cat
          res.data.data.goods_cat = cat
          // console.log(res.data.data.goods_cat);
          this.editGoodForm = res.data.data
        })

        this.editGoodDialogVisible = true
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
        const index = this.editGoodForm.pics.findIndex(item => item.pic === filePath)
        //  3.调用数组的splice方法，把图片信息对象，从pics数组中移除
        this.editGoodForm.pics.splice(index, 1)
        // console.log(this.addForm);
      },
      //  监听图片上传成功的事件
      handleSuccess(response) {
        // console.log(file);
        //  1.拼接得到一个图片信息对象
        const picInfo = {pic: response.data.tmp_path}
        //  2.将图片信息对象push到pics数组中
        this.editGoodForm.pics.push(picInfo)
        // console.log(this.editGoodForm);
      },
      editGoodDialogClosed() {
        // this.editGoodForm = {}
        this.$refs.editGoodFormRef.resetFields()
      },
      //  级联选择器选中项变化就会触发该函数
      handleChange() {
        if (this.editGoodForm.goods_cat.length !== 3) {
          this.editGoodForm.goods_cat = []
        }
        // console.log(this.editGoodForm.goods_cat);
      },
      editGoodInfo() {
        this.$refs.editGoodFormRef.validate(async valid => {
          // console.log(valid);
          if (!valid) return
          //  将cat分类变为字符串
          //  lodash  cloneDeep(obj) 深拷贝
          const editForm = _.cloneDeep(this.editGoodForm)
          editForm.goods_cat = editForm.goods_cat.join(',')
          //  发起修改用户的网络请求
          const {data: res} = await this.$http.put('goods/' + this.editGoodForm.goods_id, {
            goods_name: editForm.goods_name,
            goods_price: editForm.goods_price,
            goods_number: editForm.goods_number,
            goods_weight: editForm.goods_weight,
            goods_cat: editForm.goods_cat,
            goods_introduce: editForm.goods_introduce,
            pics: editForm.pics,
            attrs: editForm.attrs,
          })
          if (res.meta.status !== 200) return this.$message.error('修改商品信息失败！')
          //  隐藏修改商品的对话框
          this.editGoodDialogVisible = false
          //  刷新数据列表
          this.getGoodsList()
          //  提示修改成功
          this.$message.success('修改商品信息成功!')
        })
      }
    }
  }
</script>

<style lang="less" scoped>
  .previewImg {
    width: 100%;
  }
</style>
