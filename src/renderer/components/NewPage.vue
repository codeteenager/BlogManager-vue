<template>
<el-container>
<el-form ref="form" :model="form" label-width="100px">
  <el-form-item label="文章名称：">
    <el-input v-model="articleName"></el-input>
  </el-form-item>
  <el-form-item>
    <el-button type="primary" @click="onSubmit">立即创建</el-button>
    <el-button @click="onCancel">取消</el-button>
  </el-form-item>
</el-form>
</el-container>
</template>

<script>
import { ipcRenderer } from "electron";
const { exec } = require("child_process");

export default {
  data() {
    return {
      articleName: ""
    };
  },
  methods: {
    onSubmit() {
      let articleName = this.articleName;
      this.$emit('test', 'hi')
      // exec(
      //   'hexo new "'+articleName+'"',
      //   { cwd: "/Users/jiangshuaijie/Desktop/blog/" },
      //   (error, stdout, stderr) => {
      //     if (error) {
      //       console.error(`exec error: ${error}`);
      //       return;
      //     }
      //     ipcRenderer.send("MainMsgFromNewPage", "cancel");
      //   }
      // );
    },
    onCancel() {
      ipcRenderer.send("MainMsgFromNewPage", "cancel");
    }
  }
};
</script>

<style scoped>
el-container{
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

</style>
