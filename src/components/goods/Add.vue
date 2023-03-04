<template>
    <div>
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>添加商品</el-breadcrumb-item>
        </el-breadcrumb>

        <el-card>
            <el-alert title="添加商品信息" type="info" center show-icon :closable="false"></el-alert>

            <!-- 步骤条区域 -->
            <el-steps :space="200" :active="activeIndex - 0" finish-status="success" align-center>
                <el-step title="基本信息"></el-step>
                <el-step title="商品参数"></el-step>
                <el-step title="商品属性"></el-step>
                <el-step title="商品图片"></el-step>
                <el-step title="商品内容"></el-step>
                <el-step title="完成"></el-step>
            </el-steps>

            <!-- tab栏区域 -->
            <el-form :model="addGoodsForm" :rules="addGoodsFormRules" ref="addGoodsRef" label-width="100px"
                label-position="top">
                <el-tabs v-model="activeIndex" :tab-position="'left'" @tab-click="tabClickFun"
                    :before-leave="beforeTabLeave">
                    <el-tab-pane label="基本信息" name="0">
                        <!-- 基本信息面板 -->
                        <el-form-item label="商品名称" prop="goods_name">
                            <el-input v-model="addGoodsForm.goods_name"></el-input>
                        </el-form-item>
                        <el-form-item label="商品价格" prop="goods_price">
                            <el-input v-model="addGoodsForm.goods_price" type="number"></el-input>
                        </el-form-item>
                        <el-form-item label="商品重量" prop="goods_weight">
                            <el-input v-model="addGoodsForm.goods_weight" type="number"></el-input>
                        </el-form-item>
                        <el-form-item label="商品数量" prop="goods_number">
                            <el-input v-model="addGoodsForm.goods_number" type="number"></el-input>
                        </el-form-item>
                        <el-form-item label="商品分类" prop="goods_cat">
                            <el-cascader v-model="addGoodsForm.goods_cat" :options="cateList" :props="cateProps"
                                @change="handleChange">
                            </el-cascader>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品参数" name="1">
                        <!-- 商品参数面板 -->
                        <el-form-item v-for="(item) in dynamicTableData" :key="item.attr_id" :label="item.attr_name">
                            <!-- 复选框组 -->
                            <el-checkbox-group v-model="item.attr_vals">
                                <el-checkbox v-for="(val, i) in item.attr_vals" :key="i" :label="val" border>
                                </el-checkbox>
                            </el-checkbox-group>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品属性" name="2">
                        <!-- 商品属性面板 -->
                        <el-form-item :label="item.attr_name" v-for="item in staticTableData" :key="item.attr_id">
                            <el-input v-model="item.attr_vals"></el-input>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品图片" name="3">
                        <!-- 商品图片面板 -->
                        <!-- action 图片要上传到的api地址 -->
                        <el-upload :action="uploadURL" :on-preview="handlePreview" :on-remove="handleRemove"
                            :headers="headerObj" :on-success="handleSuccess" list-type="picture">
                            <el-button size="small" type="primary">点击上传</el-button>
                        </el-upload>
                    </el-tab-pane>
                    <el-tab-pane label="商品内容" name="4">
                        <!-- 商品内容面板 -->
                        <!-- 富文本编辑器组件 -->
                        <quill-editor v-model="addGoodsForm.goods_introduce"></quill-editor>
                        <el-button type="primary" class="btn-add-goods" @click="addGoods">添加商品</el-button>
                    </el-tab-pane>
                </el-tabs>
            </el-form>
        </el-card>

        <!-- 图片预览对话框 -->
        <el-dialog title="图片预览" :visible.sync="previewVisible" width="50%">
            <img :src="previewPath" class="preview-img">
        </el-dialog>

    </div>
</template>

<script>
import _ from 'lodash'
export default {
    data() {
        return {
            activeIndex: '0',
            addGoodsForm: {
                goods_name: '',
                goods_price: 1,
                goods_weight: 1,
                goods_number: 1,
                goods_cat: [],
                pics: [],
                goods_introduce: '',
                attrs: []
            },
            addGoodsFormRules: {
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
                ],
                goods_cat: [
                    { required: true, message: '请选择商品分类!', trigger: 'blur' }
                ]
            },
            cateList: [],
            cateProps: {
                expandTrigger: 'hover',
                label: 'cat_name',
                value: 'cat_id',
                children: 'children'
            },
            // 动态参数列表数据
            dynamicTableData: [],
            staticTableData: [],
            uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
            // 图片上传组件的headers请求头对象
            headerObj: {
                Authorization: window.sessionStorage.getItem('token')
            },
            previewPath: '',
            previewVisible: false,

        }
    },
    created() {
        this.getGoodsCateList()
    },
    computed: {
        cateId() {
            if (this.addGoodsForm.goods_cat.length === 3) {
                return this.addGoodsForm.goods_cat[2]
            }
            return null
        }
    },
    methods: {
        async getGoodsCateList() {
            const { data: res } = await this.$http.get('categories')
            if (res.meta.status !== 200) {
                return this.$message.error('获取商品分类列表失败！')
            }
            console.log('商品分类列表 => ', res.data)
            this.cateList = res.data
        },
        handleChange() {
            if (this.addGoodsForm.goods_cat.length !== 3) {
                this.addGoodsForm.goods_cat = []
            }
        },
        // tab标签切换限制
        beforeTabLeave(to, from) {
            console.log('即将离开的标签页:', from, '，即将进入的标签页:', to)
            if (from === '0' && this.addGoodsForm.goods_cat.length !== 3) {
                this.$message.error('请先选择要添加的商品所属类别!')
                return false
            }
        },
        async getAttrList(sel) {
            const { data: res } = await this.$http.get(
                `categories/${this.cateId}/attributes`,
                { params: { sel: sel } }
            )
            if (res.meta.status !== 200) {
                return this.$message.error('获取该商品分类的动态参数失败！')
            }
            res.data.forEach(item => {
                item.attr_vals = item.attr_vals === ''
                    ? []
                    : item.attr_vals.split(' ')
            })
            if (sel === 'many') {
                console.log('该商品分类的动态参数--->', res.data)
                this.dynamicTableData = res.data
            } else {
                console.log('该商品分类的静态属性-->', res.data)
                this.staticTableData = res.data
            }
        },
        tabClickFun() {
            if (this.activeIndex === '1') {
                console.log('----- 访问动态参数面板 -----')
                this.getAttrList('many')
            }
            if (this.activeIndex === '2') {
                console.log('----- 访问静态属性面板 -----')
                this.getAttrList('only')
            }
        },
        // 处理图片预览事件
        handlePreview(file) {
            console.log('要预览的图片信息 --> ', file)
            // 拿到图片的url
            this.previewPath = file.response.data.url
            // 显示图片预览窗口
            this.previewVisible = true
        },
        // 处理移除图片操作
        handleRemove(file) {
            console.log('要移除的图片信息 --> ', file)
            const filePath = file.response.data.tmp_path
            const index = this.addGoodsForm.pics.findIndex(x => x.pic === filePath)
            this.addGoodsForm.pics.splice(index, 1)
        },
        // 监听图片上传成功的事件
        handleSuccess(response) {
            console.log('要上传的图片信息 --> ', response)
            const picInfo = { pic: response.data.tmp_path }
            this.addGoodsForm.pics.push(picInfo)
        },
        addGoods() {
            // console.log('添加商品的信息----->', this.addGoodsForm)
            this.$refs.addGoodsRef.validate(async (valid) => {
                if (!valid) return this.$message.error('请先完善商品信息!')

                // 处理动态参数和静态属性，获取attrs数组
                this.dynamicTableData.forEach(item => {
                    const newInfo = {
                        attr_id: item.attr_id,
                        attr_value: item.attr_vals.join(' ')
                    }
                    this.addGoodsForm.attrs.push(newInfo)
                })
                this.staticTableData.forEach(item => {
                    const newInfo = {
                        attr_id: item.attr_id,
                        attr_value: item.attr_vals
                    }
                    this.addGoodsForm.attrs.push(newInfo)
                })

                /** 
                    将goods_cat转换成字符串:
                    如果直接用join，会和级联选择器中的v-model(只能绑定一个数组)产生冲突
                    所以在join之前，将addGoodsForm进行深拷贝，将拷贝所得的对象作为请求参数
                */
                const formObj = _.cloneDeep(this.addGoodsForm)
                formObj.goods_cat = formObj.goods_cat.join(',')
                
                console.log('添加商品的请求参数----->', formObj)

                const { data: res } = await this.$http.post('goods', formObj)
                if (res.meta.status !== 201) {
                    console.log('添加商品失败', res.meta.msg)
                    return this.$message.error('添加商品失败！')
                }

                this.$message.success('添加商品成功！')
                this.$router.push('/goods')
            })
        },
    }
}
</script>

<style lang="less" scoped>
.el-checkbox {
    margin: 0 10px 0 0 !important;
}

.preview-img {
    width: 100%;
}

.btn-add-goods {
    margin-top: 15px;
}
</style>