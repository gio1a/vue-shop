<template>
    <div class="">
        <el-button type="info" @click="logout">退出</el-button>
    </div>
</template>

<script>

export default {
    methods: {
        logout() {
            // 退出登录：销毁token，强制跳转到登录页，直到登录生成新的token才能访问页面
            window.sessionStorage.clear()
            this.$router.push('/')
        }
    }
}
</script>

<style lang="less" scoped></style>