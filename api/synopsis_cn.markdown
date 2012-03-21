# 摘要

<!--type=misc-->

先来看下面这个用Node编写的[web服务器](http_cn.html)响应并输出“Hello World”例子：

    var http = require('http');

    http.createServer(function (request, response) {
      response.writeHead(200, {'Content-Type': 'text/plain'});
      response.end('Hello World\n');
    }).listen(8124);

    console.log('Server running at http://127.0.0.1:8124/');

为了运行这个服务器程序，需将上述代码保存为`example.js`的文件，
并用node程序执行它：

    > node example.js
    Server running at http://127.0.0.1:8124/

同样的，这个方法可以运行本文档中的所有示例。
