<template>
    <div>
        <!-- 面包屑导航区域 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品列表</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片视图区域 -->
        <el-card class="">
            <!-- 搜索与添加区域 -->
            <el-row :gutter="20">
                <el-col :span="8">
                    <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getGoodsList">
                        <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
                    </el-input>
                </el-col>

                <el-col :span="4">
                    <el-button type="primary" @click="goToAddPage">添加商品</el-button>
                </el-col>
            </el-row>
            
            <!-- 商品列表区域 -->
            <el-table :data="goodsList" border stripe>
                <el-table-column type="index" label="#"></el-table-column>
                <el-table-column label="商品名称" prop="goods_name"></el-table-column>
                <el-table-column label="商品价格(元)" prop="goods_price" width="95px"></el-table-column>
                <el-table-column label="商品重量" prop="goods_weight" width="70px"></el-table-column>
                <el-table-column label="创建时间" prop="add_time" width="140px"></el-table-column>
                <el-table-column label="操作" width="130px">
                    <template slot-scope="scope">
                        <!-- {{ scope.row.goods_id }} -->
                        <el-button type="primary" icon="el-icon-edit" size="mini" 
                            @click="showEditDialog(scope.row.goods_id)"
                        ></el-button>

                        <el-button type="danger" icon="el-icon-delete" size="mini"
                            @click="removeGoodsById(scope.row.goods_id)"
                        ></el-button>
                        
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
                :total="total"
                background>
            </el-pagination>
        </el-card>


        <!-- 修改商品对话框 -->
        <el-dialog
            title="修改用户"
            :visible.sync="editGoodsDialogVisible"
            width="50%"
            @close="editGoodsDialogClosed">

            <!-- 内容主体区域 -->
            <el-form 
            :model="editGoodsForm" :rules="editGoodsFormRules" ref="editGoodsRef" label-width="80px">
                <el-form-item label="商品名称" prop="goods_name">
                    <el-input v-model="editGoodsForm.goods_name"></el-input>
                </el-form-item>
                <el-form-item label="商品价格" prop="goods_price">
                    <el-input v-model="editGoodsForm.goods_price"></el-input>
                </el-form-item>
                <el-form-item label="商品重量" prop="goods_weight">
                    <el-input v-model="editGoodsForm.goods_weight"></el-input>
                </el-form-item>
                <el-form-item label="商品数量" prop="goods_number">
                    <el-input v-model="editGoodsForm.goods_number"></el-input>
                </el-form-item>
                <el-form-item label="商品图片">
                    <el-upload :action="uploadURL" :on-remove="handleRemove"
                    :headers="headerObj" :on-success="handleSuccess" list-type="picture">
                        <el-button size="small" type="primary">点击上传</el-button>
                    </el-upload>
                </el-form-item>
                <el-form-item label="商品描述">
                    <quill-editor v-model="editGoodsForm.goods_introduce"></quill-editor>
                </el-form-item>
                
            </el-form>

            <!-- 底部按钮区域 -->
            <span slot="footer" class="dialog-footer">
                <el-button @click="editGoodsDialogVisible = false">取 消</el-button>
                <el-button type="primary" 
                @click="editGoods">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>
<script>
import moment from 'moment'

export default {
    data(){
        return {
            goodsList:[],
            queryInfo: {
                query:'',
                pagenum: 1,
                pagesize: 5
            },
            total:0,
            editGoodsDialogVisible: false,
            editGoodsForm:{
                goods_id: 0,
                goods_name: '',
                goods_price: 1,
                goods_weight: 1,
                goods_number: 1,
                pics: [],
                goods_introduce: '',
                attrs: []
            },
            editGoodsFormRules: {
                goods_name: [
                    { required: true, message: '商品名称不能为空!', trigger: 'blur' }
                ],
                goods_price: [
                    { required: true, message: '商品价格不能为空!', trigger: 'blur' }
                ],
                goods_weight: [
                    { required: true, message: '商品重量不能为空!', trigger: 'blur' }
                ],
                goods_number: [
                    { required: true, message: '商品数量不能为空!', trigger: 'blur' }
                ]
            },
            uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
            // 图片上传组件的headers请求头对象
            headerObj: {
                Authorization: window.sessionStorage.getItem('token')
            },
        }
    },
    created(){
        this.getGoodsList()
    },
    methods: {
        async getGoodsList(){
            const {data: res} = await this.$http.get('goods',{params: this.queryInfo})
            if(res.meta.status !== 200) {
                console.log(res.meta.msg)
                return this.$message.error('获取商品列表失败！')
            }
            res.data.goods.forEach((item) => {
                item.add_time = moment(parseInt(item.add_time)).format('YYYY-MM-DD HH:mm:ss')
            })
            console.log('商品列表---->',res.data.goods)
            this.goodsList = res.data.goods
            this.total = res.data.total
        },
        handleSizeChange(newSize){
            this.queryInfo.pagesize = newSize
            this.getGoodsList()
        },
        handleCurrentChange(newPage){
            this.queryInfo.pagenum = newPage
            this.getGoodsList()
        },
        async removeGoodsById(goodsId){
            const confirmRes = await this.$confirm('此操作将永久删除该商品，是否继续？','提示',{
                confirmButtonText:'确认',
                cancelButtonText: '取消',
                type: 'warning'
            }).catch(err => err)

            if(confirmRes !== 'confirm') {
                this.$message.info('已取消删除！')
            } 

            const {data: res} = await this.$http.delete(`goods/${goodsId}`)
            if(res.meta.status !== 200) {
                return this.$message.error('删除商品失败！')
            }
            
            this.$message.success('删除商品成功！')
            this.getGoodsList()
        },
        async showEditDialog(goodsId){
            // 获取商品信息
            const {data: res} = await this.$http.get(`goods/${goodsId}`)
            if(res.meta.status !== 200) {
                return this.$message.error('获取商品信息失败！')
            }
            
            console.log('获取商品信息----',res.data)
            this.editGoodsForm = res.data
            this.editGoodsDialogVisible = true
        },
        // 处理移除图片操作
        handleRemove(file) {
            console.log('要移除的图片信息 --> ', file)
            const filePath = file.response.data.tmp_path
            const index = this.editGoodsForm.pics.findIndex(x => x.pic === filePath)
            this.editGoodsForm.pics.splice(index, 1)
        },
        // 监听图片上传成功的事件
        handleSuccess(response) {
            console.log('要上传的图片信息 --> ', response)
            const picInfo = { pic: response.data.tmp_path }
            this.editGoodsForm.pics.push(picInfo)
        },
        editGoods(){
            this.$refs.editGoodsRef.validate(async (valid) => {
                if(!valid) return 
                const {data: res} = await this.$http.put(
                    `goods/${this.editGoodsForm.goods_id}`, 
                    {
                        goods_name: this.editGoodsForm.goods_name,
                        goods_price: this.editGoodsForm.goods_price,
                        goods_weight: this.editGoodsForm.goods_weight,
                        goods_number: this.editGoodsForm.goods_number,
                        pics: this.editGoodsForm.pics,
                        goods_introduce: this.editGoodsForm.goods_introduce,
                        attrs: this.editGoodsForm.attrs
                    }
                )
                console.log('--------',res)
                if(res.meta.status !== 200) {
                    console.log('更新商品信息失败！',res.meta.msg)
                    return this.$message.error('更新商品信息失败！')
                }
                
                this.$message.success('更新商品信息成功！')
                this.editGoodsDialogVisible = false
                this.getGoodsList()
            })
        },
        editGoodsDialogClosed(){
            this.$refs.editGoodsRef.resetFields()
            this.editGoodsForm.goods_introduce = ''
        },
        goToAddPage(){
            this.$router.push('./goods/add')
        },
    }
}
</script>
<style lang="less" scoped>
    
</style>