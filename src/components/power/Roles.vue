<template>
    <div>
        <!-- 面包屑导航区域 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>权限管理</el-breadcrumb-item>
            <el-breadcrumb-item>角色列表</el-breadcrumb-item>
        </el-breadcrumb>
        
        <el-card>
            <el-row>
                <el-col>
                    <el-button type="primary" @click="addDialogVisible = true">添加角色</el-button>
                </el-col>
            </el-row>

            <!-- 角色列表区域 -->
            <el-table :data="roleList" border stripe>
                <!-- 展开列 -->
                <el-table-column type="expand">
                    <template slot-scope="scope">
                        <!-- 渲染权限 -->
                        <el-row 
                        :class="['bdbottom', i1 === 0?'bdtop':'', 'vcenter']" 
                        v-for="(item1, i1) in scope.row.children" 
                        :key="item1.id">
                            <!-- 渲染一级权限 -->
                            <el-col :span="5">
                                <el-tag 
                                closable
                                @close="removeRightById(scope.row,item1.id)">
                                    {{ item1.authName }}
                                </el-tag>
                                <i class="el-icon-caret-right"></i>
                            </el-col>

                            <!-- 渲染二级和三级权限 -->
                            <el-col :span="19">
                                <el-row 
                                v-for="(item2, i2) in item1.children" 
                                :key="item2.id" 
                                :class="[i2 === 0?'':'bdtop', 'vcenter']">
                                    <!-- 二级权限 -->
                                    <el-col :span="6">
                                        <el-tag 
                                        closable
                                        @close="removeRightById(scope.row,item2.id)"
                                        type="success">
                                            {{ item2.authName }}
                                        </el-tag>
                                        <i class="el-icon-caret-right"></i>
                                    </el-col>
                                    <!-- 三级权限 -->
                                    <el-col :span="18">
                                        <el-tag 
                                        v-for="(item3, i3) in item2.children" 
                                        :key="item3.id" 
                                        type="warning"
                                        closable
                                        @close="removeRightById(scope.row,item3.id)">
                                            {{ item3.authName }}
                                        </el-tag>
                                    </el-col>
                                </el-row>
                            </el-col>
                        </el-row>
                    </template>
                </el-table-column>
                <el-table-column type="index" label="#"></el-table-column>
                <el-table-column label="角色名称" prop="roleName"></el-table-column>
                <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
                <el-table-column label="操作" width="300px">
                    <template slot-scope="scope">
                        <!-- {{ scope.row.id }} -->
                        <!-- 编辑按钮 -->
                        <el-button type="primary" icon="el-icon-edit" size="mini" 
                            @click="showEditDialog(scope.row.id)">编辑</el-button>

                        <!-- 删除按钮 -->
                        <el-button type="danger" icon="el-icon-delete" size="mini"
                            @click="removeRoleById(scope.row.id)">删除</el-button>

                        <!-- 分配权限按钮 -->
                        <el-button type="warning" 
                        icon="el-icon-setting" size="mini"
                        @click="showSetRightDialog(scope.row)">分配权限</el-button>
                    </template>
                </el-table-column>
            </el-table>

        </el-card>

        <!-- 添加角色对话框 -->
        <el-dialog
            title="添加角色"
            :visible.sync="addDialogVisible"
            width="50%"
            @close="addDialogClosed">
            <!-- 内容主体区域 -->
            <el-form :model="addRoleForm" :rules="addRoleFormRules" ref="addRoleFormRef" label-width="80px">
                <el-form-item label="角色名称" prop="roleName">
                    <el-input v-model="addRoleForm.roleName"></el-input>
                </el-form-item>
                <el-form-item label="角色描述" prop="roleDesc">
                    <el-input v-model="addRoleForm.roleDesc"></el-input>
                </el-form-item>
            </el-form>
            <!-- 底部按钮区域 -->
            <span slot="footer" class="dialog-footer">
                <el-button @click="addDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addRole">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 修改角色对话框 -->
        <el-dialog
            title="修改角色"
            :visible.sync="editDialogVisible"
            width="50%"
            @close="editDialogClosed">

            <!-- 内容主体区域 -->
            <el-form 
            :model="editRoleForm" :rules="editRoleFormRules" ref="editRoleFormRef" label-width="80px">
                <el-form-item label="角色名称" prop="roleName">
                    <el-input v-model="editRoleForm.roleName"></el-input>
                </el-form-item>
                <el-form-item label="角色描述" prop="roleDesc">
                    <el-input v-model="editRoleForm.roleDesc"></el-input>
                </el-form-item>
            </el-form>

            <!-- 底部按钮区域 -->
            <span slot="footer" class="dialog-footer">
                <el-button @click="editDialogVisible = false">取 消</el-button>
                <el-button type="primary" 
                @click="editRole">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 分配权限对话框 -->
        <el-dialog
            title="分配权限"
            :visible.sync="setRightDialogVisible"
            width="50%"
            @close="setRightDialogClose">

            <!-- 树形控件 -->
            <el-tree 
            :data="rightsList" 
            :props="treeProps" 
            default-expand-all
            show-checkbox 
            node-key="id"
            :default-checked-keys="defaultKeys"
            @check-change=""
            ref="treeRef"
            >
            </el-tree>

            <!-- 底部按钮区域 -->
            <span slot="footer" class="dialog-footer">
                <el-button @click="setRightDialogVisible = false">取 消</el-button>
                <el-button type="primary" 
                @click="allotRights">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>
<script>
export default {
    data() {
        return {
            roleList:[],
            addDialogVisible: false,
            editDialogVisible: false,
            addRoleForm: {
                roleName:'',
                roleDesc:''
            },
            addRoleFormRules:{
                roleName: [
                    {required: true, message:'角色名称不能为空！',trigger: 'blur'}
                ]
            },
            editRoleForm:{},
            editRoleFormRules:{
                roleName: [
                    {required: true, message:'角色名称不能为空！',trigger: 'blur'}
                ]
            },
            setRightDialogVisible: false,
            rightsList: [],
            // 树形控件的属性绑定对象：
            treeProps: {
                label: 'authName',
                children: 'children'
            },
            // 默认选中的节点id值数组
            defaultKeys:[],
            // 当前即将分配角色权限的id
            roleId: ''
        }
    },
    created() {
        this.getRolesList()
    },
    methods: {
        async getRolesList() {
            const {data: res} = await this.$http.get('roles')
            if(res.meta.status !== 200) {
                return this.$message.error('获取角色列表失败！')
            }
            console.log('角色列表----->',res.data)
            this.roleList = res.data
        },
        async addRole(){
            // 表单内信息预验证
            this.$refs.addRoleFormRef.validate(async (valid) => {
                if(!valid) return
                const {data: res} = await this.$http.post('roles', this.addRoleForm)
                if(res.meta.status !== 201) {
                    return this.$message.error('添加角色失败！')
                }
                this.$message.success('添加角色成功！')
                this.addDialogVisible = false
                this.getRolesList()
            })
        },
        // 监听添加用户对话框的关闭事件
        addDialogClosed() {
            this.$refs.addRoleFormRef.resetFields()
        },
        async showEditDialog(id) {
            const {data: res} = await this.$http.get('roles/' + id)
            if(res.meta.status !== 200) {
                return this.$message.error('获取角色失败！')
            }
            console.log('search by id ----> ',res.data)
            this.editRoleForm = res.data
            this.editDialogVisible = true
        },
        editRole() {
            this.$refs.editRoleFormRef.validate(async (valid) => {
                console.log('表单验证结果---->',valid)
                if(!valid) return
                console.log('要修改的内容----->',this.editRoleForm)
                const {data: res} = await this.$http.put('roles/' + this.editRoleForm.roleId, {
                    roleName: this.editRoleForm.roleName,
                    roleDesc: this.editRoleForm.roleDesc
                })
                console.log('====',res)
                if(res.meta.status !== 200) {
                    return this.$message.error('修改角色信息失败！')
                }
                this.$message.success('修改角色信息成功！')
                this.editDialogVisible = false
                this.getRolesList()
            })
        },
        // 监听修改用户对话框的关闭事件
        editDialogClosed() {
            this.$refs.editRoleFormRef.resetFields()
        },
        // 删除
        async removeRoleById(id) {
            const confirmRes = await this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).catch(err => err)
            
            // 如果用户确认：返回值为字符串 confirm
            // 如果用户取消：返回值为字符串 cancel
            if(confirmRes !== 'confirm') {
                return this.$message.info('已取消删除！')
            }

            const {data: res} = await this.$http.delete('roles/' + id)
            if(res.meta.status !== 200) {
                return this.$message.error(`删除角色失败,${res.meta.msg}`)
            }
            this.$message.success('删除角色成功!')
            this.getRolesList()
        },
        // 根据id删除对应权限
        async removeRightById(role, rightId) {
            const confirmRes = await this.$confirm('此操作将删除该权限, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).catch(err => err)
            if(confirmRes !== 'confirm') {
                return this.$message.info('已取消删除')
            }
            const {data: res} = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
            if(res.meta.status !== 200) {
                return this.$message.error('删除权限失败！')
            }
            this.$message.success('删除权限成功！')
            // 为当前角色重新赋值权限,防止列表重新刷新
            role.children = res.data
        },
        // 展示分配权限对话框
        async showSetRightDialog(role) {
            // 先将role的id保存，分配权限时使用
            this.roleId = role.id
            // 获取所有权限的数据 type:tree
            const {data: res} = await this.$http.get('rights/tree')
            if(res.meta.status !== 200) {
                return this.$message.error('获取权限失败！')
            }
            this.rightsList = res.data
            // 默认勾选所有三级权限
            this.getLeafKeys(role, this.defaultKeys)
            this.setRightDialogVisible = true
        },
        // 通过递归的形式获取角色下所有三级权限的id，并保存到defaultKeys中
        getLeafKeys(node, arr){
            if(!node.children) {
                // 不包含children属性，是三级节点
                return arr.push(node.id)
            } 
            // 不是三级节点
            node.children.forEach(item => {
                this.getLeafKeys(item, arr)
            })
        },
        // 监听分配权限对话框的关闭事件
        setRightDialogClose() {
            this.defaultKeys = []
        },
        // 为角色分配权限
        async allotRights(id) {
            // 树形控件中被选中和半选中的id
            const keys = [
                ...this.$refs.treeRef.getCheckedKeys(),
                ...this.$refs.treeRef.getHalfCheckedKeys()
            ]
            const idStr = keys.join(',')

            const {data: res} = await this.$http.post(
                `roles/${this.roleId}/rights`, 
                {rids: idStr}
            )
            if(res.meta.status !== 200) {
                return this.$message.error('分配权限失败')
            }
            
            this.$message.success('分配权限成功！')
            this.getRolesList()
            this.setRightDialogVisible = false
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