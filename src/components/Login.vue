<template>
    <div class="login_container">
        <div class="login_box">
            <!-- 头像区域 -->
            <div class="avatar_box">
                <img src="../assets/logo.png" alt="">
            </div>
            <!-- 登陆表单区域 -->
            <el-form ref="loginFormRef" :model="loginForm" :rules="loginFormRules" label-width="0px" class="login_form">
                <el-form-item prop="username">
                    <el-input v-model="loginForm.username" prefix-icon="iconfont icon-user"></el-input>
                </el-form-item>

                <el-form-item prop="password">
                    <el-input type="password" v-model="loginForm.password" prefix-icon="iconfont icon-3702mima"></el-input>
                </el-form-item>

                <el-form-item class="btns">
                    <el-button type="primary" @click="login">登录</el-button>
                    <el-button type="info" @click="resetLoginForm">重置</el-button>
                </el-form-item>
            </el-form>
        </div>
    </div>
</template>

<script>

export default {
    data(){
        return {
            // 登陆表单的数据绑定对象
            loginForm: {
                username: 'admin',
                password: '123456'
            },
            // 表单的验证规则对象
            loginFormRules: {
                username: [
                    { required: true, message: '请输入用户名', trigger: 'blur' },
                    { min: 2, max: 5, message: '长度在 2 到 5 个字符', trigger: 'blur' }
                ],
                password: [
                    { required: true, message: '请输入密码', trigger: 'blur' },
                    { min: 6, max: 20, message: '密码太短了，不够安全哦！', trigger: 'blur' }
                ],
            }
        }
    },
    methods: {
        // 重置表单信息
        resetLoginForm() {
            this.$refs.loginFormRef.resetFields()
        },
        login(){
            // 先进行表单预验证，验证通过后发起登录请求
            this.$refs.loginFormRef.validate(async (valid) => {
                console.log('表单预验证结果-->', valid)
                if(!valid) return
                const {data: res} = await this.$http.post('login',this.loginForm)
                if(res.meta.status !== 200) return this.$message.error('登录失败！')
                this.$message.success('登录成功！')
                // 登录成功后将token保存到客户端的 sessionStorage 中
                window.sessionStorage.setItem('token', res.data.token)
                // 通过编程式导航实现页面跳转
                this.$router.push('/home')
            })
        },
    },
}
</script>

<style lang="less" scoped>
.login_container {
    background-color: #264b6b;
    height: 100%;
}
.login_box {
    width: 450px;
    height: 300px;
    background-color: #fff;
    border-radius: 3px;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    .avatar_box {
        background-color: #fff;
        height: 130px;
        width: 130px;
        border: 1px solid #eee;
        box-shadow: 0 0 10px #eee;
        border-radius: 50%;
        padding: 10px;
        position: absolute;
        left: 50%;
        transform: translate(-50%, -50%);
        img {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            background-color: #eee;
        }
    }
}
.login_form {
    position: absolute;
    width: 100%;
    padding: 0 20px;
    bottom: 0;
    box-sizing: border-box;
}
.btns {
    display: flex;
    justify-content: flex-end;
}

</style>