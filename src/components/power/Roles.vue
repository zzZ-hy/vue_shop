<template>
  <div>
    <!--  面包屑导航区  -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!--  卡片视图区域  -->
    <el-card>
      <!--  添加角色按钮区域  -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addRoleDialogVisible=true">添加角色</el-button>
        </el-col>
      </el-row>
      <!--  角色列表区域  -->
      <el-table :data="roleList" border stripe>
        <!--    角色权限展开列    -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row :class="['bdbottom',index1 === 0 ? 'bdtop' : '','vcenter']"
                    v-for="(item1,index1) in scope.row.children"
                    :key="item1.id">
              <!--      一级权限列表        -->
              <el-col :span="5">
                <el-tag closable @close="removeRightById(scope.row,item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!--      二级和三级权限列表        -->
              <el-col :span="19">
                <!--       二级权限列表         -->
                <el-row v-for="(item2,index2) in item1.children"
                        :key="item2.id"
                        :class="[index2 === 0 ? '' : 'bdtop','vcenter']">
                  <el-col :span="6">
                    <el-tag type="success" closable @close="removeRightById(scope.row,item2.id)">{{item2.authName}}
                    </el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag type="warning"
                            closable
                            v-for="(item3) in item2.children"
                            :key="item3.id"
                            @close="removeRightById(scope.row,item3.id)">
                      {{item3.authName}}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
            <!--            <pre>-->
            <!--              {{scope.row}}-->
            <!--            </pre>-->
          </template>
        </el-table-column>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditRoleDialog(scope.row.id)">编辑
            </el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeRoleUserById(scope.row.id)">删除
            </el-button>
            <el-button type="warning" icon="el-icon-setting" size="mini" @click="showSetRightDialog(scope.row)">分配权限
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!--  添加用户的对话框  -->
    <el-dialog
      title="添加角色"
      :visible.sync="addRoleDialogVisible"
      width="50%"
      @close="addRoleDialogClosed">
      <!--   内容主体区域   -->
      <el-form :model="addRoleForm" :rules="addRoleFormRules" ref="addRoleFormRef" label-width="70px">
        <el-form-item label="角色名" prop="roleName">
          <el-input v-model="addRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="描述" prop="roleDesc">
          <el-input v-model="addRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!--   底部按钮区域   -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRoleUser">确 定</el-button>
      </span>
    </el-dialog>

    <!--  修改用户的对话框  -->
    <el-dialog
      title="修改用户"
      :visible.sync="editRoleDialogVisible"
      width="50%"
      @close="editRoleDialogClosed">
      <!--   内容主体区域   -->
      <el-form :model="editRoleForm" :rules="editRoleFormRules" ref="editRoleFormRef" label-width="70px">
        <el-form-item label="角色名" prop="roleName">
          <el-input v-model="editRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="描述" prop="roleDesc">
          <el-input v-model="editRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!--   底部按钮区域   -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRoleUserInfo">确 定</el-button>
      </span>
    </el-dialog>

    <!--  分配权限的对话框  -->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightDialogVisible"
      width="50%"
      @close="setRightDialogClosed">
      <!--   内容主体区域&&树形控件   -->
      <el-tree :data="rightsList" :props="treeProps"
               show-checkbox node-key="id"
               default-expand-all
               :default-checked-keys="defKeys"
               ref="treeRef"></el-tree>
      <!--   底部按钮区域   -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    name: "Roles",
    data() {
      return {
        roleList: [],
        //  添加用户的表单数据
        addRoleForm: {
          roleName: '',
          roleDesc: ''
        },
        //  添加表单规则验证对象
        addRoleFormRules: {
          roleName: [
            {required: true, message: '请输入角色名', trigger: 'blur'},
            {min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur'}
          ],
          roleDesc: [
            {required: true, message: '请输入描述信息', trigger: 'blur'},
            {min: 0, max: 16, message: '长度在 0 到 66 个字符', trigger: 'blur'}
          ]
        },
        //  控制添加角色对话框的显示与隐藏
        addRoleDialogVisible: false,
        //  控制修改角色对话框的显示与隐藏
        editRoleDialogVisible: false,
        //  查询到的角色信息对象
        editRoleForm: {},
        //  修改表单的验证规则对象
        editRoleFormRules: {
          roleName: [
            {required: true, message: '请输入角色名', trigger: 'blur'},
            {min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur'}
          ],
          roleDesc: [
            {required: true, message: '请输入描述信息', trigger: 'blur'},
            {min: 0, max: 66, message: '长度在 0 到 66 个字符', trigger: 'blur'}
          ]
        },
        //  控制分配角色权限对话框的显示与隐藏
        setRightDialogVisible: false,
        //  所有权限的数据
        rightsList: [],
        //  树形控件的属性绑定对象
        treeProps: {
          label: 'authName',
          children: 'children'
        },
        //  默认选中的节点id值
        defKeys: [],
        //  当前即将分配权限的角色id
        roleId: ''
      }
    },
    created() {
      this.getRolesList()
    },
    methods: {
      getRolesList() {
        this.$http.get('roles').then(res => {
          // console.log(res);
          if (res.data.meta.status !== 200) return this.$message.error('获取角色列表失败')
          this.roleList = res.data.data
          // console.log(this.roleList);
        })
      },
      //  监听添加角色对话框关闭事件
      addRoleDialogClosed() {
        this.$refs.addRoleFormRef.resetFields()
      },
      //  点击按钮添加新用户
      addRoleUser() {
        this.$refs.addRoleFormRef.validate(async valid => {
          // console.log(valid);
          if (!valid) return
          //  发起添加用户的网络请求
          const {data: res} = await this.$http.post('roles', this.addRoleForm)
          if (res.meta.status !== 201) return this.$message.error(res.meta.msg)
          //  添加角色数据刷新
          this.getRolesList()
          //  提示删除成功
          this.$message.success(res.meta.msg)
          //  隐藏添加用户的对话框
          this.addRoleDialogVisible = false
        })
      },
      //  展现编辑角色信息的对话框
      async showEditRoleDialog(id) {
        const {data: res} = await this.$http.get('roles/' + id)
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        this.editRoleForm = res.data
        this.editRoleDialogVisible = true
        // console.log(id);
      },
      editRoleDialogClosed() {
        this.editRoleForm = {}
        this.$refs.editRoleFormRef.resetFields()
      },
      editRoleUserInfo() {
        this.$refs.editRoleFormRef.validate(async valid => {
          // console.log(valid);
          if (!valid) return
          //  发起修改用户的网络请求
          const {data: res} = await this.$http.put('roles/' + this.editRoleForm.roleId, {
            roleName: this.editRoleForm.roleName,
            roleDesc: this.editRoleForm.roleDesc
          })
          // console.log(this.editRoleForm);
          if (res.meta.status !== 200) return this.$message.error('修改角色信息失败！')
          //  隐藏添加用户的对话框
          this.editRoleDialogVisible = false
          //  刷新数据列表
          this.getRolesList()
          //  提示修改成功
          this.$message.success(res.meta.msg)
        })
      },
      //  根据id删除对应的用户信息
      removeRoleUserById(id) {
        this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          return this.$http.delete('roles/' + id)
        }).then(res => {
          console.log(res);
          if (res.data.meta.status !== 200) return this.$message.error('删除角色失败！')
          this.$message.success(res.data.meta.msg)
          this.getRolesList()
        }).catch(() => {
          this.$message.info('已取消删除')
        })
      },
      removeRightById(role, rightId) {
        this.$confirm('此操作将永久删除该角色权限, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          return this.$http.delete(`roles/${role.id}/rights/${rightId}`)
        }).then(res => {
          // console.log(res);
          if (res.data.meta.status !== 200) return this.$message.error('删除权限失败！')
          this.$message.success(res.data.meta.msg)
          // this.getRolesList()
          role.children = res.data.data
        }).catch(() => {
          this.$message.info('已取消删除')
        })
      },
      //  展示分配权限的对话框
      async showSetRightDialog(role) {
        this.roleId = role.id
        const {data: res} = await this.$http.get('rights/tree')
        if (res.meta.status !== 200) return this.$message.error('获取权限数据失败!')
        //  保存权限数据
        this.rightsList = res.data
        console.log(this.rightsList);

        //  清空原有的数据
        // this.defKeys = []
        this.getLeafKeys(role, this.defKeys)
        this.setRightDialogVisible = true
      },
      //  通过递归的形式，获取角色下所有三级权限的id，并保存到defKeys数组中
      getLeafKeys(node, arr) {
        //  如果当前node节点不包含children属性，则是三级节点
        if (!node.children) return arr.push(node.id)

        node.children.forEach(item => this.getLeafKeys(item, arr))

      },
      //  监听分配权限对话框的关闭事件
      setRightDialogClosed() {
        //  清除原有的数据
        this.defKeys = []
      },
      //  点击为角色分配权限
      allotRights() {
        const keys = [...this.$refs.treeRef.getCheckedKeys(), ...this.$refs.treeRef.getHalfCheckedKeys()]
        const idStr = keys.join(',')
        this.$http.post(`roles/${this.roleId}/rights`, {rids: idStr}).then(res => {
          if (res.data.meta.status !== 200) return this.$message.error('分配权限失败!')
          this.$message.success(res.data.meta.msg)

          this.getRolesList()

          this.setRightDialogVisible = false
        })
      }
    }
  }
</script>

<style lang="less" scoped>
  .el-tag {
    margin: 7px;
  }

  .bdtop {
    border-top: 1px solid #eee;
  }

  .bdbottom {
    border-bottom: 1px solid #eee;
  }

  .vcenter {
    display: flex;
    align-items: center;
  }
</style>
