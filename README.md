### xdocs
xdocs can help generate blog posts

### setup
npm install xdocs -g

### usage
``` bash
Usage: xdocs [Options] || xdocs [Options] [Options]

选项：
  --build, -b    xdocs --build 创建基本结构以及生成内容                   [布尔]
  --clean, -c    xdocs --clean 清空生成的内容                             [布尔]
  --deploy, -d   xdocs --deploy 部署到github，请配置 _config.yml中的内容  [布尔]
  --new, -n      xdocs --new 创建新文件                                 [字符串]
  --server, -s   xdocs --server 起一个静态文件的服务                    [字符串]
  --version, -v  xdocs --version 查看版本号                               [布尔]
  --help, -h     显示帮助信息                                             [布尔]

示例：
  xdocs -b
  xdocs -c
  xdocs -d
```

### version:
0.0.1

### change log:
#### 0.0.1
* basic build blog
* basic static server