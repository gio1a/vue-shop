<template>
    <div>
        <!-- 头部面包屑导航栏 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>参数列表</el-breadcrumb-item>
        </el-breadcrumb>

        <el-card>
            <el-alert
                title="注意: 只允许为第三级分类设置相关参数！"
                :closable="false"
                show-icon
                type="warning">
            </el-alert>

            <el-row class="cat_opt">
                <el-col>
                    <span>选择商品分类: </span>
                    <el-cascader 
                    :options="goodsCateList"
                    v-model="selectedGoods"
                    :props="cascaderProps"
                    @change="handleChanged"
                    clearable></el-cascader>
                </el-col>
            </el-row>

            <!-- tab页签区域 -->
            <el-tabs v-model="tabActiveName" @tab-click="handleTabClick">
                <el-tab-pane label="动态参数" name="many">
                    <el-button 
                    type="primary" size="mini" 
                    :disabled="selectedGoods.length === 3? false:true"
                    @click="addDialogVisible = true"
                    >添加参数</el-button>
                    
                    <!-- 动态参数表格 -->
                    <el-table
                    :data="dynamicTableData" border stripe>
                        <el-table-column type="expand">
                            <template slot-scope="scope">
                                <!-- {{ scope.row.attr_vals }} -->
                                <el-tag 
                                v-for="(item, i) in scope.row.attr_vals" 
                                :key="i"
                                closable
                                @close="handleClose(i,scope.row)">{{ item }}</el-tag>

                                <el-input
                                class="input-new-tag"
                                v-if="scope.row.inputVisible"
                                v-model="scope.row.inputValue"
                                ref="saveTagInput"
                                size="small"
                                @keyup.enter.native="handleInputConfirm(scope.row)"
                                @blur="handleInputConfirm(scope.row)"></el-input>

                                <el-button v-else 
                                class="button-new-tag" 
                                size="small" 
                                @click="showInput(scope.row)">+ New Tag</el-button>
                            </template>
                        </el-table-column>
                        <el-table-column label="#" type="index"></el-table-column>
                        <el-table-column label="参数名称" prop="attr_name"></el-table-column>
                        <el-table-column label="操作">
                            <template slot-scope="scope">
                                <!-- {{ scope.row.attr_id }} -->
                                <el-button 
                                type="primary" size="mini" 
                                icon="el-icon-edit"
                                @click="showEditDialog(scope.row.attr_id)"
                                >修改</el-button>

                                <el-button 
                                type="danger" size="mini" 
                                icon="el-icon-delete"
                                @click="removeAttrById(scope.row.attr_id)"
                                >删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>

                </el-tab-pane>

                <el-tab-pane label="静态属性" name="only">
                    <el-button 
                    type="primary" size="mini" 
                    :disabled="selectedGoods.length === 3? false:true"
                    @click="addDialogVisible = true"
                    >添加属性</el-button>

                    <!-- 静态属性表格 -->
                    <el-table
                    :data="staticTableData" border stripe>
                        <el-table-column type="expand">
                            <template slot-scope="scope">
                                <!-- {{ scope.row.attr_vals }} -->
                                <el-tag 
                                v-for="(item, i) in scope.row.attr_vals" 
                                :key="i"
                                closable
                                @close="handleClose(i,scope.row)">{{ item }}</el-tag>

                                <el-input
                                class="input-new-tag"
                                v-if="scope.row.inputVisible"
                                v-model="scope.row.inputValue"
                                ref="saveTagInput"
                                size="small"
                                @keyup.enter.native="handleInputConfirm(scope.row)"
                                @blur="handleInputConfirm(scope.row)"></el-input>

                                <el-button v-else 
                                class="button-new-tag" 
                                size="small" 
                                @click="showInput(scope.row)">+ New Tag</el-button>
                            </template>
                        </el-table-column>
                        <el-table-column label="#" type="index"></el-table-column>
                        <el-table-column label="属性名称" prop="attr_name"></el-table-column>
                        <el-table-column label="操作">
                            <template slot-scope="scope">
                                <!-- {{ scope.row.attr_id }} -->
                                <el-button 
                                type="primary" 
                                size="mini" 
                                icon="el-icon-edit"
                                @click="showEditDialog(scope.row.attr_id)"
                                >修改</el-button>

                                <el-button 
                                type="danger" 
                                size="mini" 
                                icon="el-icon-delete"
                                @click="removeAttrById(scope.row.attr_id)"
                                >删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>

                </el-tab-pane>
            </el-tabs>
            
        </el-card>

        
        <!-- 添加动态参数/静态属性对话框 -->
        <el-dialog
        :title="'添加' + titleText"
        :visible.sync="addDialogVisible"
        width="50%"
        @close="addDialogClosed">
        
            <el-form 
            :model="addForm" 
            :rules="addFormRules" 
            ref="addRef" 
            label-width="100px" >
                <el-form-item :label="titleText" prop="attr_name">
                    <el-input v-model="addForm.attr_name"></el-input>
                </el-form-item>
            </el-form>

            <span slot="footer" class="dialog-footer">
                <el-button @click="addDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addAttr">确 定</el-button>
            </span>
        </el-dialog>
        
        <!-- 修改动态参数/静态属性对话框 -->
        <el-dialog
        :title="'修改' + titleText"
        :visible.sync="editDialogVisible"
        width="50%"
        @close="editDialogClosed">
        
            <el-form 
            :model="editForm" 
            :rules="editFormRules" 
            ref="editRef" 
            label-width="100px" >
                <el-form-item :label="titleText" prop="attr_name">
                    <el-input v-model="editForm.attr_name"></el-input>
                </el-form-item>
            </el-form>

            <span slot="footer" class="dialog-footer">
                <el-button @click="editDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editAttr">确 定</el-button>
            </span>
        </el-dialog>

    </div>
</template>
<script>
export default {
    data(){
        return {
            goodsCateList: [],
            selectedGoods: [],
            cascaderProps:{
                expandTrigger: 'hover',
                value:'cat_id',
                label: 'cat_name',
                children: 'children'
            },
            // 被激活的页签名
            tabActiveName:'many',
            // 动态参数数据
            dynamicTableData: [],
            // 静态属性数据
            staticTableData: [],
            addDialogVisible: false,
            addForm: {
                attr_name:''
            },
            addFormRules: {
                attr_name: [
                    {required: true, message:'属性名不能为空！',trigger:'blur'}
                ]
            },
            editDialogVisible: false,
            editForm: {
                attr_name:''
            },
            editFormRules: {
                attr_name: [
                    {required: true, message:'属性名不能为空！',trigger:'blur'}
                ]
            },
        }
    },
    created(){
        this.getCateList()
    },
    computed: {
        // 当前选中的三级分类的id
        cateId(){
            if(this.selectedGoods.length === 3) {
                return this.selectedGoods[this.selectedGoods.length - 1]
            }
            return null
        },
        titleText(){
            if(this.tabActiveName === 'many') {
                return '动态参数'
            } else {
                return '静态属性'
            }
        },
    },
    methods:{
        async getCateList(){
            const {data: res} = await this.$http.get('categories')
            if(res.meta.status !== 200) {
                return this.$message.error('获取商品分类失败！')
            }
            console.log('商品分类列表 ---> ',res.data)
            this.goodsCateList = res.data
        },
        async getParamsData(){
            // 根据id和所选面板，获取参数列表
            const {data: res} = await this.$http.get(
                `categories/${this.cateId}/attributes`, 
                {params: {sel: this.tabActiveName}}
            )
            if(res.meta.status !== 200) {
                return this.$message.error('获取参数失败！')
            }
            res.data.forEach(item => {
                item.attr_vals = item.attr_vals 
                    ? item.attr_vals.split(' ') 
                    : []
                // 控制本属性下文本框的显示与隐藏
                item.inputVisible = false
                // 本属性下文本框输入的值
                item.inputValue = ''
            })
            console.log('根据id和所选面板，获取参数---->',res.data)
            
            if(this.tabActiveName === 'many') {
                // 动态参数
                this.dynamicTableData = res.data
            } else {
                this.staticTableData = res.data
            }
        },
        handleChanged(){
            if(this.selectedGoods.length !== 3) {
                // 选中的不是三级分类
                this.selectedGoods = []
                this.staticTableData = []
                this.dynamicTableData = []
                return
            }
            // 选中的是三级分类
            console.log('选中的商品 ----> ',this.selectedGoods)
            this.getParamsData()
        },
        // tab页签点击事件
        handleTabClick(){
            console.log('选择的页签为 ----> ',this.tabActiveName)
            this.getParamsData()
        },
        addAttr(){
            this.$refs.addRef.validate( async (valid) => {
                if(!valid) return
                const {data: res} = await this.$http.post(
                    `categories/${this.cateId}/attributes`,
                    {
                        attr_name: this.addForm.attr_name,
                        attr_sel: this.tabActiveName,
                        attr_vals: ''
                    }
                )
                if(res.meta.status !== 201) {
                    return this.$message.error(`添加${this.titleText}失败！`)
                }
                
                this.$message.success(`添加${this.titleText}成功！`)
                this.addDialogVisible = false
                this.getParamsData()
            })
        },
        addDialogClosed(){
            this.$refs.addRef.resetFields()
        },
        async showEditDialog(attrId){
            const {data: res} = await this.$http.get(
                `categories/${this.cateId}/attributes/${attrId}`,
                {params: {attr_sel: this.tabActiveName}}
            )
            if(res.meta.status !== 200) {
                return this.$message.error('获取参数名失败！')
            }
            this.editForm.attr_name = res.data.attr_name
            this.editForm.attr_id = attrId
            this.editDialogVisible = true
        },
        editAttr(){
            this.$refs.editRef.validate( async (valid) => {
                if(!valid) return

                const {data: res} = await this.$http.put(
                    `categories/${this.cateId}/attributes/${this.editForm.attr_id}`,
                    {
                        attr_name: this.editForm.attr_name,
                        attr_sel: this.tabActiveName
                    }
                )
                if(res.meta.status !== 200) {
                    return this.$message.error(`修改${this.titleText}失败！`)
                }
                
                this.$message.success(`修改${this.titleText}成功！`)
                this.editDialogVisible = false
                this.getParamsData()
            })
        },
        editDialogClosed(){
            this.$refs.editRef.resetFields()
        },
        async removeAttrById(attrId){
            const confirmRes = await this.$confirm(`此操作将永久删除该${this.titleText}，是否继续？`, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).catch(err => err)

            if(confirmRes !== 'confirm') {
                return this.$message.info('已取消删除!')
            }

            const {data: res} = await this.$http.delete(`categories/${this.cateId}/attributes/${attrId}`)
            if(res.meta.status !== 200) {
                return this.$message.error(`删除${this.titleText}失败！`)
            }
            
            this.$message.success(`删除${this.titleText}成功！`)
            this.getParamsData()
        },
        showInput(row){
            row.inputVisible = true

            // 让文本框自动获得焦点
            this.$nextTick(_ => {
                this.$refs.saveTagInput.$refs.input.focus()
            })
        },
        // 文本框失去焦点/按enter
        handleInputConfirm(row){
            if(row.inputValue.trim().length === 0) {
                row.inputVisible = false
                row.inputValue = ''
                return
            }
            
            row.attr_vals.push(row.inputValue.trim())
            row.inputValue = ''
            row.inputVisible = false

            this.saveAttrVals(row)
        },
        // 将对attr_vals的操作保存到数据库
        async saveAttrVals(row){
            const {data: res} = await this.$http.put(
                `categories/${this.cateId}/attributes/${row.attr_id}`,
                {
                    attr_name: row.attr_name,
                    attr_sel: row.attr_sel,
                    attr_vals: row.attr_vals.join(' ') // 转换成字符串
                }
            )
            if(res.meta.status !== 200) {
                return this.$message.error(`修改参数项失败！`)
            }
            
            this.$message.success(`修改参数项成功！`)
            this.getParamsData()
        },
        // 通过数组中的索引删除对应参数
        handleClose(index, row){
            row.attr_vals.splice(index, 1)
            this.saveAttrVals(row)
        }
    }
}
</script>
<style lang="less" scoped>
    .cat_opt {
        margin: 15px 0;
    }
    .el-tag {
        margin: 10px;
    }
    .input-new-tag {
        width: 150px;
    }
</style>