<template>
<el-container style="height:100%">
      <el-aside style="width:30%;height:100%">
            <el-menu
              default-active="2"
              class="el-menu-vertical-demo"
              background-color="#545c64"
              text-color="#fff"
              active-text-color="#ffd04b"
              style="height:100%;width:100%">
              <el-submenu index="1">
                <template slot="title">
                  <i class="el-icon-document"></i>
                  <span>主页</span>
                </template>
                <el-menu-item-group>
                  
                </el-menu-item-group>
              </el-submenu>
              <el-submenu index="2">
                <template slot="title">
                  <i class="el-icon-document"></i>
                  <span>文章列表</span>
                </template>
                <el-menu-item-group>
                  <template v-for="item in articleMenu">
                    <el-menu-item style="text-overflow: ellipsis;width:100%;overflow:hidden" index="1-1" @click="editArticle(item)">{{item}}</el-menu-item>
                  </template>
                </el-menu-item-group>
              </el-submenu>
            </el-menu>
      </el-aside>
      <el-main style="width:70%;height:100%;padding:0px;margin:0px">
        <el-tabs style="height:100%" v-model="editableTabsValue2" type="card" closable @tab-remove="removeTab">
          <el-tab-pane
            v-for="(item, index) in editableTabs2"
            :key="item.name"
            :label="item.title"
            :name="item.name"
            style="height:100%"
          >
            <div id="editor" style="height:100%">
              <textarea :value="item.content" @input="update" style="height:100%"></textarea>
              <div v-html="compiledMarkdown"></div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </el-main>
    </el-container>
  
</template>

<script>
var fs = require("fs");
var path = "/Users/jiangshuaijie/Desktop/blog/source/_posts";
export default {
  data() {
    return {
      articleMenu: [],
      input: "",
      editableTabsValue2: "",
      editableTabs2: [],
      tabIndex: 0
    };
  },
  created() {
    var _this = this;
    fs.readdir(path, function(err, files) {
      _this.articleMenu = files;
    });
    this.$on('test', function (msg) {
      console.log(msg)
      alert(msg);
    })
  },
  methods: {
    update: _.debounce(function(e) {
      this.input = e.target.value;
    }, 300),
    editArticle: function(title) {
      let newTabName = ++this.tabIndex + "";
      this.editableTabsValue2 = newTabName;
      var _this = this;
      fs.readFile(path + "/" + title, "utf8", (err, data) => {
        if (err) throw err;
        _this.editableTabs2.push({
          title: title,
          name: newTabName,
          content: data
        });
      });
    },
    removeTab(targetName) {
      let tabs = this.editableTabs2;
      let activeName = this.editableTabsValue2;
      if (activeName === targetName) {
        tabs.forEach((tab, index) => {
          if (tab.name === targetName) {
            let nextTab = tabs[index + 1] || tabs[index - 1];
            if (nextTab) {
              activeName = nextTab.name;
            }
          }
        });
      }
      this.editableTabsValue2 = activeName;
      this.editableTabs2 = tabs.filter(tab => tab.name !== targetName);
    }
  },
  computed: {
    compiledMarkdown: function() {
      return marked(this.input, { sanitize: true });
    }
  }
};
</script>

<style>
html,
body,
#editor {
  margin: 0;
  height: 100%;
  font-family: "Helvetica Neue", Arial, sans-serif;
  color: #333;
}

textarea,
#editor div {
  display: inline-block;
  width: 49%;
  height: 100%;
  vertical-align: top;
  box-sizing: border-box;
  padding: 0 20px;
}

textarea {
  border: none;
  border-right: 1px solid #ccc;
  resize: none;
  outline: none;
  background-color: #f6f6f6;
  font-size: 14px;
  font-family: "Monaco", courier, monospace;
  padding: 20px;
}

code {
  color: #f66;
}
.el-tabs__content{
  height: 100%;
}
</style>
