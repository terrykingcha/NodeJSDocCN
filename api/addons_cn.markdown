## C/C++ 扩展

扩展即是动态链接共享对象。它们提供了使用C和C++库的能力。目前来说，这些API因为涉及到很多库的知识，
所以比较复杂。

 - V8 Javascript，一个C++库。用于配合JavaScript工作（译者注：即运行JavaSript）：
   创建对象，调用函数等。大部分代码位于`v8.h`的头文件中（在Node源代码中的路径是`deps/v8/include/v8.h`）。

 - [libuv](https://github.com/joyent/libuv)，C的事件循环库。每当需要等待文件描述符（file descriptor）可读，
   或等一个待定时器，抑或等待接受一个信号，都需要用到libuv的接口。也就是说，只要执行了I/O操作，就会用到libuv。

 - 内部Node库。其中最重要的就是被广泛派生的`node::ObjectWrap`基类。

 - 其它库，请参见`deps/`目录。

Node将其所有依赖库静态编译成可执行文件。当编译模块时，不需要担心和这些库的链接问题。

接下来就实现一个和下面JavaScript代码等效的C++扩展：

    exports.hello = function() { return 'world'; };

首先，创建一个`hello.cc`文件：

    #include <node.h>
    #include <v8.h>

    using namespace v8;

    Handle<Value> Method(const Arguments& args) {
      HandleScope scope;
      return scope.Close(String::New("world"));
    }

    void init(Handle<Object> target) {
      NODE_SET_METHOD(target, "hello", Method);
    }
    NODE_MODULE(hello, init)

注意，所有Node扩展都必须导出一个初始化函数：

    void Initialize (Handle<Object> target);
    NODE_MODULE(module_name, Initialize)

这里的`NODE_MODULE`后面并没有分号，是因为它并不是一个函数（见`node.h`）。

此`module_name`必须匹配最终的二进制文件名（除去.node这个后缀）。

源代码需要编译成`hello.node`，也就是二进制扩展。为此，用python创建一个名为`wscript`的文件，如下：

    srcdir = '.'
    blddir = 'build'
    VERSION = '0.0.1'

    def set_options(opt):
      opt.tool_options('compiler_cxx')

    def configure(conf):
      conf.check_tool('compiler_cxx')
      conf.check_tool('node_addon')

    def build(bld):
      obj = bld.new_task_gen('cxx', 'shlib', 'node_addon')
      obj.target = 'hello'
      obj.source = 'hello.cc'

运行`node-waf configure build`就可以创建这个扩展文件`build/default/hello.node`。

`node-waf`即[WAF](http://code.google.com/p/waf)，它是基于python的编译系统。`node-waf`对于使用者来说非常方便。

现在，只要通过`require`来访问刚刚编译好的模块，就可以在Node项目`hello.js`中使用这个二进制扩展。

    var addon = require('./build/Release/hello');

    console.log(addon.hello()); // 'world'

到此为止，就是关于扩展的所有文档。也可以访问<https://github.com/pietern/hiredis-node> 来参考一个真实例子。
