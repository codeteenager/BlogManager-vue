<template>
<el-container style="height:100%">
      <el-aside style="width:30%;height:100%">
        <el-menu
          class="el-menu-vertical-demo"
          background-color="#545c64"
          text-color="#fff"
          active-text-color="#ffd04b"
          style="height:100%;width:100%">
          <el-submenu index="1">
            <template slot="title">
              <i class="el-icon-document"></i>
              <span>文章列表</span>
            </template>
            <el-menu-item-group>
              <template v-for="(item,indexl) in articleMenu">
                <el-menu-item :index="'1-'+indexl" @click="editArticle(item)" ><div style="text-overflow: ellipsis;width:100%;overflow:hidden" @contextmenu="showMenu(item)">{{item}}</div></el-menu-item>
              </template>
            </el-menu-item-group>
          </el-submenu>
          <el-submenu index="2">
            <template slot="title">
              <i class="el-icon-setting"></i>
              <span>设置</span>
            </template>
            <el-menu-item-group>
              <el-menu-item index="2-1" @click="dialogFormVisible = true">博客根目录</el-menu-item>
            </el-menu-item-group>
          </el-submenu>
        </el-menu>
      </el-aside>
      <el-main style="width:70%;height:100%;padding:0px;margin:0px;overflow:auto">
        <el-tabs v-model="editableTabsValue" type="card" closable @tab-remove="removeTab" @tab-click="clickTab">
          <el-tab-pane
            v-for="(item, index) in editableTabs"
            :key="item.name"
            :label="item.title"
            :name="item.name"
          >
          </el-tab-pane>
        </el-tabs>
        <div id="editor" v-if="isShow">
          <textarea :value="content" @input="update" style="overflow:scroll"></textarea>
          <div v-html="compiledMarkdown"style="overflow:scroll" ></div>
        </div>
      </el-main>
      <el-dialog title="博客根目录" :visible.sync="dialogFormVisible">
        <el-form :inline="true" :model="form">
          <el-form-item label="路径：">
            <el-input v-model="form.path" :disabled="true" size="medium" style="width:300px"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="selectDir">选择</el-button>
          </el-form-item>
        </el-form>
      </el-dialog>
      <el-dialog
        title="提示"
        :visible.sync="deleteDialog"
        width="30%">
        <span>确认删除{{deleteTitle}}</span>
        <span slot="footer" class="dialog-footer">
          <el-button @click="deleteDialog = false">取 消</el-button>
          <el-button type="primary" @click="deleteArticle()">确 定</el-button>
        </span>
      </el-dialog>
    </el-container>
  
</template>

<script>
import { ipcRenderer } from "electron";
var fs = require("fs");
var path = '';
const remote = require('electron').remote;
const Menu = remote.Menu;
const MenuItem = remote.MenuItem;

export default {
  data() {
    return {
      articleMenu: [],
      editableTabsValue: "",
      editableTabs: [],
      editableContents: [],
      tabIndex: 0,
      content: "",
      isShow: false,
      formLabelWidth: "120px",
      dialogFormVisible: false,
      deleteDialog: false,
      deleteTitle: '',
      form: {
        path: ""
      }
    };
  },
  created() {
    var _this = this;
    ipcRenderer.send("MainMsgFromMain", "getPath");
    ipcRenderer.on("getPath", (event, arg) => {
      _this.form.path = arg;
      path = arg + "/source/_posts";
      fs.readdir(path, function(err, files) {
        _this.articleMenu = files;
      });
    });
    ipcRenderer.on("updateArticle", (event, arg) => {
      fs.readdir(path, function(err, files) {
        _this.articleMenu = files;
      });
    });
    
  },
  methods: {
    update: _.debounce(function(e) {
      this.content = e.target.value;
    }, 300),
    showMenu: function(title) {
      this.deleteTitle = title;
      let _this = this;
      let menu = new Menu();//new一个菜单
      //添加菜单功能  
      menu.append(new MenuItem({ 
        label: '删除', 
        click: function() {
          _this.deleteDialog = true
        } 
        }));
      //添加菜单分割线  
      menu.append(new MenuItem({ type: 'separator' }));
      //添加菜单功能  
      menu.append(new MenuItem({ label: 'MenuItem2', type: 'checkbox', checked: true ,click:function(){}}));
      menu.popup(remote.getCurrentWindow());
    },
    deleteArticle(){
      this.deleteDialog = false;
      let _this = this;
      let tip = '删除'+this.deleteTitle+'成功';
      fs.unlink(path+"/"+this.deleteTitle,function(err){
        if (err) throw err;
        _this.$message({
          message: tip,
          type: 'success'
        });
        fs.readdir(path, function(err, files) {
          _this.articleMenu = files;
        });
      });
    },
    editArticle: function(title) {
      let newTabName = ++this.tabIndex + "";
      this.editableTabsValue = newTabName;
      var _this = this;
      fs.readFile(path + "/" + title, "utf8", (err, data) => {
        if (err) throw err;
        _this.editableTabs.push({
          title: title,
          name: newTabName
        });
        _this.editableContents[_this.editableTabsValue] = {
          title: title,
          content: data
        };
        _this.content = _this.editableContents[_this.editableTabsValue].content;
      });
    },
    clickTab(targetName) {
      this.content = this.editableContents[this.editableTabsValue].content;
    },
    removeTab(targetName) {
      alert(this.editableContents[targetName].title);
      let tabs = this.editableTabs;
      let activeName = this.editableTabsValue;
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
      this.editableTabsValue = activeName;
      this.editableTabs = tabs.filter(tab => tab.name !== targetName);

      this.content = this.editableContents[this.editableTabsValue].content;
    },
    selectDir() {
      let _this = this;
      ipcRenderer.send("MainMsgFromMain", "selectDir");
      ipcRenderer.on("selectDir", (event, arg) => {
        _this.form.path = arg;
        path = arg + "/source/_posts";
        fs.readdir(path, function(err, files) {
          _this.articleMenu = files;
        });
      });
    }
  },
  computed: {
    compiledMarkdown: function() {
      return marked(this.content, { sanitize: true });
    }
  },
  watch: {
    editableTabs: function() {
      this.isShow = this.editableTabs.length > 0;
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
.el-tabs__header {
  margin: 0px;
}
</style>
