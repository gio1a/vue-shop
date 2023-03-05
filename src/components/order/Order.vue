<template>
    <div>
        <!-- 面包屑导航区域 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>订单管理</el-breadcrumb-item>
            <el-breadcrumb-item>订单列表</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片视图区域 -->
        <el-card class="">

            <el-row :gutter="20">
                <el-col :span="8">
                    <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getOrderList">
                        <el-button slot="append" icon="el-icon-search" @click="getOrderList"></el-button>
                    </el-input>
                </el-col>
            </el-row>
            
            <el-table :data="orderList" border stripe>
                <el-table-column type="index" label="#"></el-table-column>
                <el-table-column label="订单编号" prop="order_number"></el-table-column>
                <el-table-column label="订单价格" prop="order_price" width="90px"></el-table-column>
                <el-table-column label="是否付款" prop="order_pay" width="100px">
                    <template slot-scope="scope">
                        <!-- {{ scope.row.order_pay }} -->
                        <el-tag v-if="scope.row.order_pay === '0'" type="danger">未付款</el-tag>
                        <el-tag v-else type="success">已付款</el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="是否发货" prop="is_send" width="80px"></el-table-column>
                <el-table-column label="下单时间" prop="create_time" width="150px"></el-table-column>
                <el-table-column label="操作" width="150px">
                    <template slot-scope="scope">
                        <!-- {{ scope.row.order_id }} -->
                        <el-button type="primary" icon="el-icon-edit" size="mini" 
                            @click="showUpdateDialog(scope.row.order_id)"
                        ></el-button>

                        <el-button type="success" icon="el-icon-location" size="mini"
                            @click="showProgressDialog(scope.row.order_id)"
                        ></el-button>
                        
                    </template>
                </el-table-column>
            </el-table>

            <el-pagination
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="queryInfo.pagenum"
                :page-sizes="[10,20,30]"
                :page-size="queryInfo.pagesize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total"
                background>
            </el-pagination>
        </el-card>


        <!-- 修改对话框 -->
        <el-dialog
        title="修改订单信息"
        :visible.sync="updateAddressDialogVisible"
        width="50%"
        @close="updateAddressDialogClosed">

            <el-form 
            :model="updateAddressForm" :rules="updateAddressFormRules" ref="updateAddressRef" label-width="80px">

                <el-form-item label="省/市/区" prop="addressIndex">
                    <el-cascader v-model="updateAddressForm.addressIndex"
                    :options="cityData"
                    :props="{ expandTrigger: 'hover' }">
                    </el-cascader>
                </el-form-item>
                <el-form-item label="具体地址" prop="address">
                    <el-input v-model="updateAddressForm.address"></el-input>
                </el-form-item>
            </el-form>

            <span slot="footer" class="dialog-footer">
                <el-button @click="updateAddressDialogVisible = false">取 消</el-button>
                <el-button type="primary" 
                @click="updateAddress">确 定</el-button>
            </span>
        </el-dialog>

        <el-dialog title="物流进度" width="50%" :visible.sync="progressDialogVisible">
        
            <el-timeline>
                <el-timeline-item
                v-for="(activity, index) in progressInfo"
                :key="index"
                :timestamp="activity.time">
                {{activity.context}}
                </el-timeline-item>
            </el-timeline>

            <span slot="footer" class="dialog-footer">
                <el-button type="primary" @click="progressDialogVisible = false">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>
<script>
import moment from 'moment'
import cityData from './citydata'
export default {
    data(){
        return{
            orderList:[],
            queryInfo: {
                query:'',
                pagenum: 1,
                pagesize: 10
            },
            total: 0,
            updateAddressDialogVisible: false,
            updateAddressForm:{
                addressIndex:[],
                address:''
            },
            cityData,
            updateAddressFormRules:{
                addressIndex: [
                    { required: true, message: '请选择省市县/区', trigger: 'blur' }
                ],
                address: [
                    { required: true, message: '具体地址不能为空', trigger: 'blur' }
                ]
            },
            progressDialogVisible: false,

            // 后台未提供，用假数据
            progressInfo: [
                {
                    time: '2018-05-10 09:39:00',
                    ftime: '2018-05-10 09:39:00',
                    context: '已签收,感谢使用顺丰,期待再次为您服务',
                    location: ''
                },
                {
                    time: '2018-05-10 08:23:00',
                    ftime: '2018-05-10 08:23:00',
                    context: '[北京市]北京海淀育新小区营业点派件员 顺丰速运 95338正在为您派件',
                    location: ''
                },
                {
                    time: '2018-05-10 07:32:00',
                    ftime: '2018-05-10 07:32:00',
                    context: '快件到达 [北京海淀育新小区营业点]',
                    location: ''
                },
                {
                    time: '2018-05-10 02:03:00',
                    ftime: '2018-05-10 02:03:00',
                    context: '快件在[北京顺义集散中心]已装车,准备发往 [北京海淀育新小区营业点]',
                    location: ''
                },
                {
                    time: '2018-05-09 23:05:00',
                    ftime: '2018-05-09 23:05:00',
                    context: '快件到达 [北京顺义集散中心]',
                    location: ''
                },
                {
                    time: '2018-05-09 21:21:00',
                    ftime: '2018-05-09 21:21:00',
                    context: '快件在[北京宝胜营业点]已装车,准备发往 [北京顺义集散中心]',
                    location: ''
                },
                {
                    time: '2018-05-09 13:07:00',
                    ftime: '2018-05-09 13:07:00',
                    context: '顺丰速运 已收取快件',
                    location: ''
                },
                {
                    time: '2018-05-09 12:25:03',
                    ftime: '2018-05-09 12:25:03',
                    context: '卖家发货',
                    location: ''
                },
                {
                    time: '2018-05-09 12:22:24',
                    ftime: '2018-05-09 12:22:24',
                    context: '您的订单将由HLA（北京海淀区清河中街店）门店安排发货。',
                    location: ''
                },
                {
                    time: '2018-05-08 21:36:04',
                    ftime: '2018-05-08 21:36:04',
                    context: '商品已经下单',
                    location: ''
                }
            ],
        }
    },
    created(){
        this.getOrderList()
    },
    methods:{
        async getOrderList(){
            // console.log('this.queryInfo---',this.queryInfo)
            const {data: res} = await this.$http.get('orders', { params: this.queryInfo })
            if(res.meta.status !== 200) {
                console.log('获取订单列表失败',res.meta.msg)
                return this.$message.error('获取订单列表失败！')
            }
            
            res.data.goods.forEach((item) => {
                item.create_time = moment(parseInt(item.create_time)).format('YYYY-MM-DD HH:mm:ss')
            })
            console.log('订单列表 ------> ', res.data)
            this.orderList = res.data.goods
            this.total = res.data.total
        },
        handleSizeChange(newSize){
            this.queryInfo.pagesize = newSize
            this.getOrderList()
        },
        handleCurrentChange(newPage){
            this.queryInfo.pagenum= newPage
            this.getOrderList()
        },
        showUpdateDialog(orderId){
            // 后台无接口
            /** 
                1.根据订单号查询出订单信息
                2.通过v-model绑定在输入框
            */
            this.updateAddressDialogVisible = true
        },
        updateAddress(){
            // 后台无接口
            
            this.updateAddressDialogVisible = false
        },
        updateAddressDialogClosed(){
            this.$refs.updateAddressRef.resetFields()
        },
        async showProgressDialog(orderId){
            // 后台未提供，用假数据
            // const {data: res} = await this.$http.get(`kuaidi/${orderId}`)
            // if(res.meta.status !== 200) {
            //     return this.$message.error('获取物流信息失败！')
            // }
            // console.log('物流信息----->',res.data)
            // this.progressInfo = res.data
            this.progressDialogVisible = true
        },
    }
}
</script>
<style lang="less" scoped>
    
</style>