<template>
    <el-container class="home_container">
        <!-- 头部区域 -->
        <el-header>
            <div>
                <img src="../assets/heima.png" alt="">
                <span>电商后台管理系统</span>
            </div>
            <el-button type="info" @click="logout">退出</el-button>
        </el-header>

        <!-- 页面主体区域 -->
        <el-container>
            <!-- 侧边栏 -->
            <el-aside :width="this.isCollapse ? '64px':'200px'">
                <!-- 侧边栏菜单区域 -->
                <div class="toggle-button" @click="toggleCollapse">{{ this.isCollapse ? '▷':'◁' }}</div>
                <el-menu background-color="#333744" text-color="#fff" 
                    active-text-color="#409eff" 
                    unique-opened 
                    :collapse="isCollapse" 
                    :collapse-transition="false"
                    :default-active="activePath"
                    router>  <!-- 为整个menu菜单都开启路由模式 -->
                    <!-- 一级菜单 -->
                    <el-submenu :index="item.id+''" v-for="item in menuList" :key="item.id">
                        <!-- 一级菜单的模板区域 -->
                        <template slot="title">
                            <!-- 图标 -->
                            <i :class="iconsObj[item.id]"></i>
                            <!-- 文本 -->
                            <span>{{ item.authName }}</span>
                        </template>

                        <!-- 二级菜单 -->
                        <el-menu-item 
                            :index="'/' + subItem.path" 
                            v-for="subItem in item.children" 
                            :key="subItem.id"
                            @click="saveNavState('/' + subItem.path)"
                        >
                            <template slot="title">
                                <!-- 图标 -->
                                <i class="el-icon-menu"></i>
                                <!-- 文本 -->
                                <span>{{ subItem.authName }}</span>
                            </template>
                        </el-menu-item>

                    </el-submenu>

                </el-menu>
            </el-aside>

            <!-- 右侧内容主体 -->
            <el-main>
                <router-view></router-view>
            </el-main>
        </el-container>
    </el-container>
</template>

<script>

export default {
    data(){
        return {
            // 左侧菜单数据
            menuList: [],
            iconsObj:{
                '125': 'iconfont icon-users',
                '103': 'iconfont icon-tijikongjian',
                '101': 'iconfont icon-shangpin',
                '102': 'iconfont icon-danju',
                '145': 'iconfont icon-baobiao'
            },
            isCollapse: false,
            activePath: null, // 被激活的菜单地址
        }
    },
    created(){
        this.getMenuList()
        // 将sessionStorage中的激活状态赋值给default-active，使当前激活菜单一直高亮
        this.activePath =  window.sessionStorage.getItem('activePath')
    },
    methods: {
        logout() {
            // 退出登录：销毁token，强制跳转到登录页，直到登录生成新的token才能访问页面
            window.sessionStorage.clear()
            this.$router.push('/')
        },
        async getMenuList() {
            const {data: res} = await this.$http.get('menus')
            console.log('getMenuList res ----> ',res)
            if(res.meta.status !== 200) return this.$message.error(res.meta.msg)
            this.menuList = res.data
        },
        // 菜单栏的折叠与展开
        toggleCollapse(){
            this.isCollapse = !this.isCollapse
        },
        // 点击二级菜单时，把index值(router)存入sessionStorage，每次点击都重新赋值
        saveNavState(activePath){
            // 保存二级菜单的激活状态
            window.sessionStorage.setItem('activePath', activePath)
            this.activePath =  window.sessionStorage.getItem('activePath')
        }
    }
}
</script>

<style lang="less" scoped>
.home_container {
    height: 100%;
}

.el-header {
    background-color: #373d41;
    display: flex;
    justify-content: space-between;
    padding-left: 0;
    align-items: center;
    color: #fff;
    font-size: 20px;

    >div {
        display: flex;
        align-items: center;

        span {
            margin-left: 15px;
        }
    }
}

.el-aside {
    background-color: #333744;
    .el-menu {
        border-right: none;
    }
}

.el-main {
    background-color: #eaedf1;
}
.iconfont {
    padding-right: 10px;
    align-items: center;
}
.toggle-button {
    font-size: 16px;
    line-height: 24px;
    color: #eee;
    text-align: center;
    letter-spacing: 0.2em;
    cursor: pointer;
}
</style>