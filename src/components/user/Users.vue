<template>
    <div>
        <!-- 面包屑导航区域 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>用户管理</el-breadcrumb-item>
            <el-breadcrumb-item>用户列表</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片视图区域 -->
        <el-card class="">
            <!-- 搜索与添加区域 -->
            <el-row :gutter="20">
                <el-col :span="8">
                    <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
                        <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
                    </el-input>
                </el-col>

                <el-col :span="4">
                    <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
                </el-col>
            </el-row>
            <!-- 用户列表区域 -->
            <el-table :data="userList" border stripe>
                <el-table-column type="index" label="#"></el-table-column>
                <el-table-column label="姓名" prop="username"></el-table-column>
                <el-table-column label="邮箱" prop="email"></el-table-column>
                <el-table-column label="电话" prop="mobile"></el-table-column>
                <el-table-column label="角色" prop="role_name"></el-table-column>
                <el-table-column label="状态" prop="mg_state">
                    <template slot-scope="scope">
                        <el-switch v-model="scope.row.mg_state" @change="userStateChanged(scope.row)"></el-switch>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="180px">
                    <template slot-scope="scope">
                        <!-- {{ scope.row.id }} -->
                        <el-button type="primary" icon="el-icon-edit" size="mini" 
                            @click="showEditDialog(scope.row.id)"
                        ></el-button>
                        <el-button type="danger" icon="el-icon-delete" size="mini"
                            @click="removeUserById(scope.row.id)"
                        ></el-button>
                        <!-- 分配角色按钮 -->
                        <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
                            <el-button type="warning" icon="el-icon-setting" size="mini"></el-button>
                        </el-tooltip>
                    </template>
                </el-table-column>
            </el-table>

            <!-- 分页区域 -->
            <el-pagination
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="queryInfo.pagenum"
                :page-sizes="[5,10,20]"
                :page-size="queryInfo.pagesize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total">
            </el-pagination>
        </el-card>

        <!-- 添加用户对话框 -->
        <el-dialog
            title="添加用户"
            :visible.sync="addDialogVisible"
            width="50%"
            @close="addDialogClosed">
            <!-- 内容主体区域 -->
            <el-form :model="addUserForm" :rules="addUserFormRules" ref="addUserFormRef" label-width="70px">
                <el-form-item label="用户名" prop="username">
                    <el-input v-model="addUserForm.username"></el-input>
                </el-form-item>
                <el-form-item label="密码" prop="password">
                    <el-input v-model="addUserForm.password" type="password"></el-input>
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="addUserForm.email"></el-input>
                </el-form-item>
                <el-form-item label="手机号" prop="mobile">
                    <el-input v-model="addUserForm.mobile"></el-input>
                </el-form-item>
            </el-form>
            
            <!-- 底部按钮区域 -->
            <span slot="footer" class="dialog-footer">
                <el-button @click="addDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addUser">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 修改用户对话框 -->
        <el-dialog
            title="修改用户"
            :visible.sync="editDialogVisible"
            width="50%"
            @close="editDialogClosed"
        >
        <!-- 内容主体区域 -->
        <el-form 
        :model="editUserForm" :rules="editUserFormRules" ref="editUserFormRef" label-width="70px">
                <el-form-item label="用户名">
                    <el-input v-model="editUserForm.username" disabled></el-input>
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="editUserForm.email"></el-input>
                </el-form-item>
                <el-form-item label="手机号" prop="mobile">
                    <el-input v-model="editUserForm.mobile"></el-input>
                </el-form-item>
            </el-form>

        <!-- 底部按钮区域 -->
        <span slot="footer" class="dialog-footer">
            <el-button @click="editDialogVisible = false">取 消</el-button>
            <el-button type="primary" 
            @click="editUser">确 定</el-button>
        </span>
        </el-dialog>

        <!-- 删除用户确认 -->
        <!-- <el-dialog
            title="提示"
            :visible.sync="delDialogVisible"
            width="30%"
        >
            <span>是否确认删除用户？</span>
            <span slot="footer" class="dialog-footer">
                <el-button @click="delDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="delUser()">确 定</el-button>
            </span>
        </el-dialog> -->
    </div>
</template>

<script>
export default {
    data(){
        
        // 邮箱格式校验
        var checkEmail = (rule, val, cb)=>{
            const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
            if(regEmail.test(val)) {
                return cb()
            }
            cb(new Error('请输入合法的邮箱!'))
        }
        // 手机号格式校验
        var checkMobile = (rule, val, cb)=>{
            const regMobile = /^(0|86|17951)?(13[0-9]|14[0-9]|15[0-9]|17[0-9]|18[0-9]|19[0-9]|)[0-9]{8}$/
            if(regMobile.test(val)) {
                return cb()
            }
            cb(new Error('请输入合法的号码!'))
        }

        return{
            // 获取用户列表的参数对象
            queryInfo: {
                query: '',
                pagenum: 1, //当前页数
                pagesize: 5 //当前每页显示多少条数据
            },
            userList: [],
            total: 0,
            addDialogVisible: false, // 控制添加用户对话框的显示与隐藏
            // 添加用户的表单数据
            addUserForm: {
                username: '',
                password:'',
                email:'',
                mobile:''
            },
            // 添加用户的表单验证规则对象
            addUserFormRules: {
                username: [
                    {required: true, message:'用户名不能为空',trigger:'blur'},
                    {min: 3, max: 10, message:'用户名长度在3-10个字符之间',trigger:'blur'}
                ],
                password: [
                    {required: true, message:'密码不能为空',trigger:'blur'},
                    {min: 6, max: 20, message:'密码长度在6-20个字符之间',trigger:'blur'}
                ],
                email: [
                    {required: true, message:'邮箱不能为空',trigger:'blur'},
                    {validator: checkEmail, trigger:'blur'}
                ],
                mobile: [
                    {required: true, message:'手机号不能为空',trigger:'blur'},
                    {validator: checkMobile, trigger:'blur'}
                ],
            },
            editDialogVisible: false, // 控制修改用户对话框的显示与隐藏
            editUserForm: {},
            editUserFormRules:{
                email: [
                    {required: true, message:'邮箱不能为空',trigger:'blur'},
                    {validator: checkEmail, trigger:'blur'}
                ],
                mobile: [
                    {required: true, message:'手机号不能为空',trigger:'blur'},
                    {validator: checkMobile, trigger:'blur'}
                ]
            },
            // delDialogVisible: false,

        }
    },
    created(){
        this.getUserList()
    },
    methods: {
        async getUserList() {
            const {data: res} = await this.$http.get('users', { params: this.queryInfo })
            console.log('获取用户数据 ----> ',res)
            if(res.meta.status !== 200) {
                return this.$message.error('用户数据获取失败！')
            }
            this.userList = res.data.users
            this.total = res.data.total
        },
        // 监听pagesize改变的事件(xx条/页)
        handleSizeChange(newSize) {
            this.queryInfo.pagesize = newSize
            this.getUserList()
        },
        // 监听页码值改变的事件
        handleCurrentChange(newPage){
            this.queryInfo.pagenum = newPage
            this.getUserList()
        },
        // 监听switch开关状态的改变
        async userStateChanged(userInfo) {
            const {data: res} = await this.$http.put(`users/${userInfo.id}/state/:${userInfo.mg_state}`)
            // console.log(res)
            if(res.meta.status !== 200) {
                userInfo.mg_state = !userInfo.mg_state
                return this.$message.error(`更新用户状态失败,${res.meta.msg}`)
            }
            this.$message.success('更新用户状态成功!')
        },
        // 监听添加用户对话框的关闭事件
        addDialogClosed() {
            this.$refs.addUserFormRef.resetFields()
        },
        // 点击按钮添加新用户
        addUser() {
            // 表单内信息预验证
            this.$refs.addUserFormRef.validate(async (valid) => {
                console.log('表单预验证结果-->', valid)
                if(!valid) return
                // 验证通过，发起添加用户的请求
                const {data: res} = await this.$http.post('users',this.addUserForm)
                if(res.meta.status !== 201) {
                    return this.$message.error(`添加用户失败,${res.meta.msg}`)
                }
                this.$message.success('添加用户成功!')
                this.addDialogVisible = false // 隐藏添加用户对话框
                this.getUserList() // 重新获取用户列表
            })
        },
        // 展示编辑用户对话框
        async showEditDialog(id) {
            // 根据id获取该用户的信息
            const {data: res} = await this.$http.get('users/' + id)
            if(res.meta.status !== 200) return this.$message.error('获取用户信息失败！')
            this.editUserForm = res.data
            // 显示编辑用户对话框
            this.editDialogVisible = true
        },
        // 监听修改用户对话框的关闭事件
        editDialogClosed() {
            this.$refs.editUserFormRef.resetFields()
        },
        // 点击按钮完成用户修改
        editUser() {
            // 表单内信息预验证
            this.$refs.editUserFormRef.validate(async (valid) => {
                console.log('表单预验证结果-->', valid)
                if(!valid) return
                // 验证通过，发起请求
                const {data: res} = await this.$http.put('users/' + this.editUserForm.id,{
                    email: this.editUserForm.email,
                    mobile: this.editUserForm.mobile
                })
                if(res.meta.status !== 200) {
                    return this.$message.error(`修改用户失败,${res.meta.msg}`)
                }
                this.editDialogVisible = false 
                this.getUserList()
                this.$message.success('修改用户成功!')
            })
        },
        // 删除数据
        async removeUserById(id) {
            const confirmRes = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).catch(err => err)
            
            // 如果用户确认：返回值为字符串 confirm
            // 如果用户取消：返回值为字符串 cancel
            if(confirmRes !== 'confirm') {
                return this.$message.info('已取消删除！')
            }

            const {data: res} = await this.$http.delete('users/' + id)
            if(res.meta.status !== 200) {
                return this.$message.error(`删除用户失败,${res.meta.msg}`)
            }
            this.$message.success('删除用户成功!')
            this.getUserList()
        }
    }
}
</script>

<style lang="less" scoped>
    
</style>