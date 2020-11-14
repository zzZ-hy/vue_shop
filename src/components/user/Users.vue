<template>
  <div>
    <!--  面包屑导航区  -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!--  卡片视图区域  -->
    <el-card>
      <!--   搜索与添加区域   -->
      <el-row :gutter="20">
        <el-col :span="9">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible=true">添加用户</el-button>
        </el-col>
      </el-row>
      <!--   用户列表区域   -->
      <el-table :data="userlist" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.mg_state" @change="userStateChanged(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <!--     修改按钮       -->
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)"></el-button>
            <!--     删除按钮       -->
            <el-button type="danger" icon="el-icon-delete" size="mini"
                       @click="removeUserById(scope.row.id)"></el-button>
            <!--      分配角色按钮      -->
            <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" size="mini"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!--   分页区域   -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>

    <!--  添加用户的对话框  -->
    <el-dialog
      title="添加用户"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClosed">
      <!--   内容主体区域   -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!--   底部按钮区域   -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>

    <!--  修改用户的对话框  -->
    <el-dialog
      title="修改用户"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClosed">
      <!--   内容主体区域   -->
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!--   底部按钮区域   -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    name: "Users",
    data() {
      //  验证邮箱的规则
      const checkEmail = (rule, value, callback) => {
        const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/

        if (regEmail.test(value)) {
          //  合法邮箱
          return callback()
        }
        callback(new Error('请输入合法邮箱'))
      }
      //  验证手机的规则
      const checkMobile = (rule, value, callback) => {
        const regMobile = /^(0|86|17951)?(13[0-9]|15[0123456789]|17[678]|18[0-9]|14[57])[0-9]{8}$/

        if (regMobile.test(value)) {
          //  合法邮箱
          return callback()
        }
        callback(new Error('请输入合法手机号'))
      }
      return {
        //  获取用户列表的参数对象
        queryInfo: {
          query: '',
          //  当前的页数
          pagenum: 1,
          //  当前每页显示多少条数据
          pagesize: 2
        },
        userlist: [],
        total: 0,
        //  控制添加用户对话框的显示与隐藏
        addDialogVisible: false,
        //  添加用户的表单数据
        addForm: {
          username: '',
          password: '',
          email: '',
          mobile: ''
        },
        //  添加表单规则验证对象
        addFormRules: {
          username: [
            {required: true, message: '请输入用户名', trigger: 'blur'},
            {min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur'}
          ],
          password: [
            {required: true, message: '请输入登录密码', trigger: 'blur'},
            {min: 6, max: 16, message: '长度在 6 到 16 个字符', trigger: 'blur'}
          ],
          email: [
            {required: true, message: '请输入邮箱地址', trigger: 'blur'},
            // {type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change']}
            {validator: checkEmail, trigger: 'blur'}
          ],
          mobile: [
            {required: true, message: '请输入手机号', trigger: 'blur'},
            {validator: checkMobile, trigger: 'blur'}
          ]
        },
        //  控制修改用户对话框的显示与隐藏
        editDialogVisible: false,
        //  查询到的用户信息对象
        editForm: {},
        //  修改表单的验证规则对象
        editFormRules: {
          email: [
            {required: true, message: '请输入邮箱地址', trigger: 'blur'},
            // {type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change']}
            {validator: checkEmail, trigger: 'blur'}
          ],
          mobile: [
            {required: true, message: '请输入手机号', trigger: 'blur'},
            {validator: checkMobile, trigger: 'blur'}
          ]
        }
      }
    },
    created() {
      this.getUserList()
    },
    methods: {
      async getUserList() {
        const {data: res} = await this.$http.get('users', {params: this.queryInfo})
        // console.log(res);
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        this.userlist = res.data.users
        this.total = res.data.total
      },
      //  监听pagesize改变的事件
      handleSizeChange(newSize) {
        // console.log(newSize);
        this.queryInfo.pagesize = newSize
        this.getUserList()
      },
      //  监听页码值改变的事件
      handleCurrentChange(newPage) {
        // console.log(newPage);
        this.queryInfo.pagenum = newPage
        this.getUserList()
      },
      //  监听switch开关状态的改变
      async userStateChanged(userInfo) {
        // console.log(userInfo);
        const {data: res} = await this.$http.put(`users/${userInfo.id}/state/${userInfo.mg_state}`)
        if (res.meta.status !== 200) {
          userInfo.mg_state = !userInfo.mg_state
          return this.$message.error(res.meta.msg)
        }
        this.$message.success(res.meta.msg)
      },
      //  监听添加用户对话框关闭事件
      addDialogClosed() {
        this.$refs.addFormRef.resetFields()
      },
      //  点击按钮添加新用户
      addUser() {
        this.$refs.addFormRef.validate(async valid => {
          // console.log(valid);
          if (!valid) return
          //  发起添加用户的网络请求
          const {data: res} = await this.$http.post('users', this.addForm)
          if (res.meta.status !== 201) return this.$message.error(res.meta.msg)
          this.$message.success(res.meta.msg)
          //  隐藏添加用户的对话框
          this.addDialogVisible = false
        })
      },
      //  展现编辑用户信息的对话框
      async showEditDialog(id) {
        const {data: res} = await this.$http.get('users/' + id)
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        this.editForm = res.data
        this.editDialogVisible = true
        // console.log(id);
      },
      editDialogClosed() {
        this.$refs.editFormRef.resetFields()
      },
      editUserInfo() {
        this.$refs.editFormRef.validate(async valid => {
          // console.log(valid);
          if (!valid) return
          //  发起修改用户的网络请求
          const {data: res} = await this.$http.put('users/' + this.editForm.id, {
            email: this.editForm.email,
            mobile: this.editForm.mobile
          })
          if (res.meta.status !== 200) return this.$message.error('修改用户信息失败！')
          //  隐藏添加用户的对话框
          this.editDialogVisible = false
          //  刷新数据列表
          this.getUserList()
          //  提示修改成功
          this.$message.success(res.meta.msg)
        })
      },
      //  根据id删除对应的用户信息
      removeUserById(id) {
        this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          return this.$http.delete('users/' + id)
        }).then(res=>{
          console.log(res);
          if (res.data.meta.status !== 200) return this.$message.error('删除用户失败！')
          this.$message.success(res.data.meta.msg)
          this.getUserList()
        }).catch(() => {
          this.$message.info('已取消删除')
        })
      }
    }
  }
</script>

<style scoped>

</style>
