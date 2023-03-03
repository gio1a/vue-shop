<template>
    <div>
        <!-- 头部面包屑导航栏 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>商品管理</el-breadcrumb-item>
        <el-breadcrumb-item>商品分类</el-breadcrumb-item>
        </el-breadcrumb>

        <el-card>
            <el-row>
                <el-col>
                    <el-button 
                    type="primary" 
                    @click="showAddCateDialog">添加分类</el-button>
                </el-col>
            </el-row>

            <tree-table
            class="treeTable"
            :data="cateList"
            :columns="columns"
            :selection-type="false"
            :expand-type="false"
            show-index
            index-text="#"
            border
            :show-row-hover="false">
                <template slot="isOk" slot-scope="scope">
                    <i class="el-icon-success"
                    v-if="!scope.row.cat_deleted" 
                    style="color: lightgreen"></i>
                    <i class="el-icon-error"
                    v-else 
                    style="color: red"></i>
                </template>
                <template slot="level" slot-scope="scope">
                    <el-tag v-if="scope.row.cat_level === 0">一级</el-tag>
                    <el-tag v-else-if="scope.row.cat_level === 1" type="success">二级</el-tag>
                    <el-tag v-else type="warning">三级</el-tag>
                </template>
                <template slot="options" slot-scope="scope">
                    <el-button 
                    type="primary" 
                    icon="el-icon-edit" size="mini"
                    @click="showUpdateDialog(scope.row.cat_id)"
                    >编辑</el-button>
                    <el-button 
                    type="danger" 
                    icon="el-icon-delete" size="mini" 
                    @click="removeCateById(scope.row.cat_id)">删除</el-button>
                </template>

            </tree-table>

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

        <!-- 添加分类对话框 -->
        <el-dialog
        title="添加分类"
        :visible.sync="addCateDialogVisible"
        width="50%"
        @close="addCateDialogClosed">
        
            <el-form 
            :model="addCateForm" 
            :rules="addCateFormRules" 
            ref="addCateRef" 
            label-width="100px" >
                <el-form-item label="分类名称" prop="cat_name">
                    <el-input v-model="addCateForm.cat_name"></el-input>
                </el-form-item>
                <el-form-item label="父级分类" >
                    <el-cascader style="width: 100%;"
                    :options="parentCateList"
                    v-model="selectedKeys"
                    :props="cascaderProps"
                    @change="selectedCateChanged"
                    clearable
                    filterable
                    change-on-select></el-cascader>
                </el-form-item>
            </el-form>

            <span slot="footer" class="dialog-footer">
                <el-button @click="addCateDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addCate">确 定</el-button>
            </span>
        </el-dialog>

        
        <!-- 修改分类对话框 -->
        <el-dialog
        title="修改分类"
        :visible.sync="updateCateDialogVisible"
        width="50%"
        @close="updateCateDialogClosed">
        
            <el-form 
            :model="updateCateForm" 
            :rules="updateCateFormRules" 
            ref="updateCateRef" 
            label-width="100px" >
                <el-form-item label="分类名称" prop="cat_name">
                    <el-input v-model="updateCateForm.cat_name"></el-input>
                </el-form-item>
            </el-form>

            <span slot="footer" class="dialog-footer">
                <el-button @click="updateCateDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="updateCate">确 定</el-button>
            </span>
        </el-dialog>


    </div>
</template>
<script>
export default {
    data(){
        return{
            cateList:[],
            // 查询条件
            queryInfo: {
                type: 3, // 获取1、2、3层分类列表,不传递默认全部
                pagenum:1,
                pagesize: 3
            },
            total: 0, // 总数据条数
            // 为table指定列的定义
            columns: [
                {
                    label: '分类名称',
                    prop: 'cat_name'
                },
                {
                    label: '是否有效',
                    prop: 'cat_deleted',
                    type: 'template', // 将当前列定义为模板列
                    template: 'isOk' // 当前列使用的模板名称
                },
                {
                    label: '排序',
                    prop: 'cat_level',
                    type: 'template', // 将当前列定义为模板列
                    template: 'level'
                },
                {
                    label: '操作',
                    type: 'template', // 将当前列定义为模板列
                    template: 'options'
                },
            ], 
            addCateDialogVisible: false,
            addCateForm: {
                cat_name:'',
                cat_pid: 0,
                cat_level: 0
            },
            addCateFormRules: {
                cat_name: [
                    {required: true, message:'分类名称不能为空！',trigger:'blur'}
                ]
            },
            // 父级分类列表
            parentCateList:[],
            // 指定级联选择器的配置对象
            cascaderProps:{
                expandTrigger: 'hover',
                value:'cat_id',
                label: 'cat_name',
                children: 'children'
            },
            // 级联选择器中选中的父级分类的id数组
            selectedKeys:[],
            updateCateDialogVisible: false,
            updateCateForm:{
                cat_name:''
            },
            updateCateFormRules: {
                cat_name: [
                    {required: true, message:'分类名称不能为空！',trigger:'blur'}
                ]
            },
        }
    },
    created(){
        this.getGoodsCateList()
    },
    methods: {
        async getGoodsCateList(){
            const {data: res} = await this.$http.get('categories', { params: this.queryInfo})
            if(res.meta.status !== 200) {
                return this.$message.error('失败！')
            }
            console.log('商品分类列表----->',res.data)
            this.cateList = res.data.result
            this.total = res.data.total
        },
        // 监听pagesize改变
        handleSizeChange(newSize){
            this.queryInfo.pagesize = newSize
            this.getGoodsCateList()
        },
        // 监听pagenum改变
        handleCurrentChange(newPage){
            this.queryInfo.pagenum = newPage
            this.getGoodsCateList()
        },
        showAddCateDialog(){
            // 获取1、2级分类列表
            this.getParentCateList()
            this.addCateDialogVisible = true
        },
        async getParentCateList(){
            const {data: res} = await this.$http.get('categories', { params: { type: 2 }})
            if(res.meta.status !== 200) {
                return this.$message.error('失败！')
            }
            console.log('二级分类列表 ---> ',res.data)
            this.parentCateList = res.data
        },
        // 级联选择器中选择器发生变化
        selectedCateChanged(){
            console.log(this.selectedKeys)
            if(this.selectedKeys.length > 0) {
                // 选中了父级分类
                this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
                this.addCateForm.cat_level = this.selectedKeys.length
            } else {
                // 没有选中任何父级分类
                this.addCateForm.cat_pid = 0
                this.addCateForm.cat_level = 0
            }
            
        },
        addCate(){
            console.log('请求参数--->',this.addCateForm)
            // 表单预验证
            this.$refs.addCateRef.validate( async (valid) => {
                if(!valid) return
                const {data: res} = await this.$http.post('categories', this.addCateForm)
                if(res.meta.status !== 201) {
                    return this.$message.error('添加分类失败！')
                }
                this.$message.success('添加分类成功！')
                this.getGoodsCateList()
                this.addCateDialogVisible = false
            })
            
        },
        addCateDialogClosed(){
            this.$refs.addCateRef.resetFields()
            this.selectedKeys = []
            this.addCateForm.cat_pid = 0
            this.addCateForm.cat_level = 0
        },
        async showUpdateDialog(id) {
            const {data: res} = await this.$http.get(`categories/${id}`)
            if(res.meta.status !== 200) {
                return this.$message.error('获取分类失败！')
            }
            console.log('根据id获取分类---->',res.data)
            this.updateCateForm.cat_name = res.data.cat_name
            this.updateCateForm.cat_id = res.data.cat_id
            console.log('this.updateCateForm === >',this.updateCateForm)
            this.updateCateDialogVisible = true
        },
        updateCate(){
            this.$refs.updateCateRef.validate( async (valid) => {
                if(!valid) return
                const {data: res} = await this.$http.put(
                    `categories/${this.updateCateForm.cat_id}`, 
                    {cat_name: this.updateCateForm.cat_name}
                )
                if(res.meta.status !== 200) {
                    return this.$message.error('更新分类失败！')
                }
                this.$message.success('更新分类成功！')
                this.getGoodsCateList()
                this.updateCateDialogVisible = false
            })
        },
        updateCateDialogClosed(){
            this.$refs.updateCateRef.resetFields()
        },
        async removeCateById(id) {
            const confirmRes = await this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).catch(err => err)
            
            // 如果用户确认：返回值为字符串 confirm
            // 如果用户取消：返回值为字符串 cancel
            if(confirmRes !== 'confirm') {
                return this.$message.info('已取消删除！')
            }

            const {data: res} = await this.$http.delete('categories/' + id)
            if(res.meta.status !== 200) {
                return this.$message.error(`删除分类失败!`)
            }
            this.$message.success('删除分类成功!')
            this.getGoodsCateList()
        }
    }
}
</script>
<style lang="less" scoped>
.treeTable {
    margin-top: 15px;
}
</style>