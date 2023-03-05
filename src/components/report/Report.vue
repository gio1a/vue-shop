<template>
    <div>
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>数据统计</el-breadcrumb-item>
            <el-breadcrumb-item>数据报表</el-breadcrumb-item>
        </el-breadcrumb>

        <el-card>
            <div ref="user_ref" style="width: 600px;height:400px;"></div>
        </el-card>
    </div>
</template>
<script>
import * as echarts from 'echarts'
import _ from 'lodash'

export default {
    data(){
        return {
            chartInstance: null,
            initOption:{
                title: {
                    text: '用户来源'
                },
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'cross',
                        label: {
                        backgroundColor: '#E9EEF3'
                        }
                    }
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true
                },
                xAxis: [
                    {
                        boundaryGap: false
                    }
                ],
                yAxis: [
                    {
                        type: 'value'
                    }
                ]
            }
        }
    },
    mounted(){
        this.initChart()
    },
    methods:{
        async initChart(){
            const { data: res } = await this.$http.get('reports/type/1')
            if (res.meta.status !== 200) {
                return this.$message.error('获取数据失败！')
            }
            console.log('图表数据---->',res.data)

            const option = _.merge(res.data, this.initOption)

            this.chartInstance = echarts.init(this.$refs.user_ref)//, 'light')
            this.chartInstance.setOption(option)
        }
    }
}
</script>
