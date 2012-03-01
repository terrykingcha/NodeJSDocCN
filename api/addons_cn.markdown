# C/C++ 扩展

扩展即是动态链接共享对象。它们提供了使用C和C++库的能力。目前来说，这些API因为涉及到很多库的知识，
所以比较复杂。

 - V8 Javascript，一个C++库。用于配合JavaScript工作（译者注：即运行JavaSript）：
   创建对象，调用函数等。大部分代码位于`v8.h`的头文件中（在Node源代码中的路径是`deps/v8/include/v8.h`）,
   也可以在线阅览文档(http://izs.me/v8-docs/main.html)。

 - [libuv](https://github.com/joyent/libuv)，C的事件循环库。每当需要等待文件描述符（file descriptor）可读，
   或等待待定时器，抑或等待接受一个信号，都需要用到libuv的接口。也就是说，只要执行了I/O操作，就会用到libuv。

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
      target->Set(String::NewSymbol("hello"),
          FunctionTemplate::New(Method)->GetFunction());
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

要获取更多信息，请参见本文下面的扩展模式（译者注：保留英文原文），或访问<https://github.com/pietern/hiredis-node> 参考产品中的一个例子。

## Addon patterns

Below are some addon patterns to help you get started. Consult the online
[v8 reference](http://izs.me/v8-docs/main.html) for help with the various v8
calls, and v8's [Embedder's Guide](http://code.google.com/apis/v8/embed.html)
for an explanation of several concepts used such as handles, scopes,
function templates, etc.

To compile these examples, create the `wscript` file below and run
`node-waf configure build`:

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
      obj.target = 'addon'
      obj.source = ['addon.cc']

In cases where there is more than one `.cc` file, simply add the file name to the
`obj.source` array, e.g.:

    obj.source = ['addon.cc', 'myexample.cc']


### Function arguments

The following pattern illustrates how to read arguments from JavaScript
function calls and return a result. This is the main and only needed source
`addon.cc`:

    #define BUILDING_NODE_EXTENSION
    #include <node.h>

    using namespace v8;

    Handle<Value> Add(const Arguments& args) {
      HandleScope scope;

      if (args.Length() < 2) {
        ThrowException(Exception::TypeError(String::New("Wrong number of arguments")));
        return scope.Close(Undefined());
      }

      if (!args[0]->IsNumber() || !args[1]->IsNumber()) {
        ThrowException(Exception::TypeError(String::New("Wrong arguments")));
        return scope.Close(Undefined());
      }

      Local<Number> num = Number::New(args[0]->NumberValue() +
          args[1]->NumberValue());
      return scope.Close(num);
    }

    void Init(Handle<Object> target) {
      target->Set(String::NewSymbol("add"),
          FunctionTemplate::New(Add)->GetFunction());
    }

    NODE_MODULE(addon, Init)

You can test it with the following JavaScript snippet:

    var addon = require('./build/Release/addon');

    console.log( 'This should be eight:', addon.add(3,5) );


### Callbacks

You can pass JavaScript functions to a C++ function and execute them from
there. Here's `addon.cc`:

    #define BUILDING_NODE_EXTENSION
    #include <node.h>

    using namespace v8;

    Handle<Value> RunCallback(const Arguments& args) {
      HandleScope scope;

      Local<Function> cb = Local<Function>::Cast(args[0]);
      const unsigned argc = 1;
      Local<Value> argv[argc] = { Local<Value>::New(String::New("hello world")) };
      cb->Call(Context::GetCurrent()->Global(), argc, argv);

      return scope.Close(Undefined());
    }

    void Init(Handle<Object> target) {
      target->Set(String::NewSymbol("runCallback"),
          FunctionTemplate::New(RunCallback)->GetFunction());
    }

    NODE_MODULE(addon, Init)

To test it run the following JavaScript snippet:

    var addon = require('./build/Release/addon');

    addon.runCallback(function(msg){
      console.log(msg); // 'hello world'
    });


### Object factory

You can create and return new objects from within a C++ function with this
`addon.cc` pattern, which returns an object with property `msg` that echoes
the string passed to `createObject()`:

    #define BUILDING_NODE_EXTENSION
    #include <node.h>

    using namespace v8;

    Handle<Value> CreateObject(const Arguments& args) {
      HandleScope scope;

      Local<Object> obj = Object::New();
      obj->Set(String::NewSymbol("msg"), args[0]->ToString());

      return scope.Close(obj);
    }

    void Init(Handle<Object> target) {
      target->Set(String::NewSymbol("createObject"),
          FunctionTemplate::New(CreateObject)->GetFunction());
    }

    NODE_MODULE(addon, Init)

To test it in JavaScript:

    var addon = require('./build/Release/addon');

    var obj1 = addon.createObject('hello');
    var obj2 = addon.createObject('world');
    console.log(obj1.msg+' '+obj2.msg); // 'hello world'


### Function factory

This pattern illustrates how to create and return a JavaScript function that
wraps a C++ function:

    #define BUILDING_NODE_EXTENSION
    #include <node.h>

    using namespace v8;

    Handle<Value> MyFunction(const Arguments& args) {
      HandleScope scope;
      return scope.Close(String::New("hello world"));
    }

    Handle<Value> CreateFunction(const Arguments& args) {
      HandleScope scope;

      Local<FunctionTemplate> tpl = FunctionTemplate::New(MyFunction);
      Local<Function> fn = tpl->GetFunction();
      fn->SetName(String::NewSymbol("theFunction")); // omit this to make it anonymous

      return scope.Close(fn);
    }

    void Init(Handle<Object> target) {
      target->Set(String::NewSymbol("createFunction"),
          FunctionTemplate::New(CreateFunction)->GetFunction());
    }

    NODE_MODULE(addon, Init)


To test:

    var addon = require('./build/Release/addon');

    var fn = addon.createFunction();
    console.log(fn()); // 'hello world'


### Wrapping C++ objects

Here we will create a wrapper for a C++ object/class `MyObject` that can be
instantiated in JavaScript through the `new` operator. First prepare the main
module `addon.cc`:

    #define BUILDING_NODE_EXTENSION
    #include <node.h>
    #include "myobject.h"

    using namespace v8;

    void InitAll(Handle<Object> target) {
      MyObject::Init(target);
    }

    NODE_MODULE(addon, InitAll)

Then in `myobject.h` make your wrapper inherit from `node::ObjectWrap`:

    #ifndef MYOBJECT_H
    #define MYOBJECT_H

    #include <node.h>

    class MyObject : public node::ObjectWrap {
     public:
      static void Init(v8::Handle<v8::Object> target);

     private:
      MyObject();
      ~MyObject();

      static v8::Handle<v8::Value> New(const v8::Arguments& args);
      static v8::Handle<v8::Value> PlusOne(const v8::Arguments& args);
      double counter_;
    };

    #endif

And in `myobject.cc` implement the various methods that you want to expose.
Here we expose the method `plusOne` by adding it to the constructor's
prototype:

    #define BUILDING_NODE_EXTENSION
    #include <node.h>
    #include "myobject.h"

    using namespace v8;

    MyObject::MyObject() {};
    MyObject::~MyObject() {};

    void MyObject::Init(Handle<Object> target) {
      // Prepare constructor template
      Local<FunctionTemplate> tpl = FunctionTemplate::New(New);
      tpl->SetClassName(String::NewSymbol("MyObject"));
      tpl->InstanceTemplate()->SetInternalFieldCount(1);
      // Prototype
      tpl->PrototypeTemplate()->Set(String::NewSymbol("plusOne"),
          FunctionTemplate::New(PlusOne)->GetFunction());

      Persistent<Function> constructor = Persistent<Function>::New(tpl->GetFunction());
      target->Set(String::NewSymbol("MyObject"), constructor);
    }

    Handle<Value> MyObject::New(const Arguments& args) {
      HandleScope scope;

      MyObject* obj = new MyObject();
      obj->counter_ = args[0]->IsUndefined() ? 0 : args[0]->NumberValue();
      obj->Wrap(args.This());

      return args.This();
    }

    Handle<Value> MyObject::PlusOne(const Arguments& args) {
      HandleScope scope;

      MyObject* obj = ObjectWrap::Unwrap<MyObject>(args.This());
      obj->counter_ += 1;

      return scope.Close(Number::New(obj->counter_));
    }

Test it with:

    var addon = require('./build/Release/addon');

    var obj = new addon.MyObject(10);
    console.log( obj.plusOne() ); // 11
    console.log( obj.plusOne() ); // 12
    console.log( obj.plusOne() ); // 13


### Factory of wrapped objects

This is useful when you want to be able to create native objects without
explicitly instantiating them with the `new` operator in JavaScript, e.g.

    var obj = addon.createObject();
    // instead of:
    // var obj = new addon.Object();

Let's register our `createObject` method in `addon.cc`:

    #define BUILDING_NODE_EXTENSION
    #include <node.h>
    #include "myobject.h"

    using namespace v8;

    Handle<Value> CreateObject(const Arguments& args) {
      HandleScope scope;
      return scope.Close(MyObject::NewInstance(args));
    }

    void InitAll(Handle<Object> target) {
      MyObject::Init();

      target->Set(String::NewSymbol("createObject"),
          FunctionTemplate::New(CreateObject)->GetFunction());
    }

    NODE_MODULE(addon, InitAll)

In `myobject.h` we now introduce the static method `NewInstance` that takes
care of instantiating the object (i.e. it does the job of `new` in JavaScript):

    #define BUILDING_NODE_EXTENSION
    #ifndef MYOBJECT_H
    #define MYOBJECT_H

    #include <node.h>

    class MyObject : public node::ObjectWrap {
     public:
      static void Init();
      static v8::Handle<v8::Value> NewInstance(const v8::Arguments& args);

     private:
      MyObject();
      ~MyObject();

      static v8::Persistent<v8::Function> constructor;
      static v8::Handle<v8::Value> New(const v8::Arguments& args);
      static v8::Handle<v8::Value> PlusOne(const v8::Arguments& args);
      double counter_;
    };

    #endif

The implementation is similar to the above in `myobject.cc`:

    #define BUILDING_NODE_EXTENSION
    #include <node.h>
    #include "myobject.h"

    using namespace v8;

    MyObject::MyObject() {};
    MyObject::~MyObject() {};

    Persistent<Function> MyObject::constructor;

    void MyObject::Init() {
      // Prepare constructor template
      Local<FunctionTemplate> tpl = FunctionTemplate::New(New);
      tpl->SetClassName(String::NewSymbol("MyObject"));
      tpl->InstanceTemplate()->SetInternalFieldCount(1);
      // Prototype
      tpl->PrototypeTemplate()->Set(String::NewSymbol("plusOne"),
          FunctionTemplate::New(PlusOne)->GetFunction());

      constructor = Persistent<Function>::New(tpl->GetFunction());
    }

    Handle<Value> MyObject::New(const Arguments& args) {
      HandleScope scope;

      MyObject* obj = new MyObject();
      obj->counter_ = args[0]->IsUndefined() ? 0 : args[0]->NumberValue();
      obj->Wrap(args.This());

      return args.This();
    }

    Handle<Value> MyObject::NewInstance(const Arguments& args) {
      HandleScope scope;

      const unsigned argc = 1;
      Handle<Value> argv[argc] = { args[0] };
      Local<Object> instance = constructor->NewInstance(argc, argv);

      return scope.Close(instance);
    }

    Handle<Value> MyObject::PlusOne(const Arguments& args) {
      HandleScope scope;

      MyObject* obj = ObjectWrap::Unwrap<MyObject>(args.This());
      obj->counter_ += 1;

      return scope.Close(Number::New(obj->counter_));
    }

Test it with:

    var addon = require('./build/Release/addon');

    var obj = addon.createObject(10);
    console.log( obj.plusOne() ); // 11
    console.log( obj.plusOne() ); // 12
    console.log( obj.plusOne() ); // 13

    var obj2 = addon.createObject(20);
    console.log( obj2.plusOne() ); // 21
    console.log( obj2.plusOne() ); // 22
    console.log( obj2.plusOne() ); // 23


### Passing wrapped objects around

In addition to wrapping and returning C++ objects, you can pass them around
by unwrapping them with Node's `node::ObjectWrap::Unwrap` helper function.
In the following `addon.cc` we introduce a function `add()` that can take on two
`MyObject` objects:

    #define BUILDING_NODE_EXTENSION
    #include <node.h>
    #include "myobject.h"

    using namespace v8;

    Handle<Value> CreateObject(const Arguments& args) {
      HandleScope scope;
      return scope.Close(MyObject::NewInstance(args));
    }

    Handle<Value> Add(const Arguments& args) {
      HandleScope scope;

      MyObject* obj1 = node::ObjectWrap::Unwrap<MyObject>(
          args[0]->ToObject());
      MyObject* obj2 = node::ObjectWrap::Unwrap<MyObject>(
          args[1]->ToObject());

      double sum = obj1->Val() + obj2->Val();
      return scope.Close(Number::New(sum));
    }

    void InitAll(Handle<Object> target) {
      MyObject::Init();

      target->Set(String::NewSymbol("createObject"),
          FunctionTemplate::New(CreateObject)->GetFunction());

      target->Set(String::NewSymbol("add"),
          FunctionTemplate::New(Add)->GetFunction());
    }

    NODE_MODULE(addon, InitAll)

To make things interesting we introduce a public method in `myobject.h` so we
can probe private values after unwrapping the object:

    #define BUILDING_NODE_EXTENSION
    #ifndef MYOBJECT_H
    #define MYOBJECT_H

    #include <node.h>

    class MyObject : public node::ObjectWrap {
     public:
      static void Init();
      static v8::Handle<v8::Value> NewInstance(const v8::Arguments& args);
      double Val() const { return val_; }

     private:
      MyObject();
      ~MyObject();

      static v8::Persistent<v8::Function> constructor;
      static v8::Handle<v8::Value> New(const v8::Arguments& args);
      double val_;
    };

    #endif

The implementation of `myobject.cc` is similar as before:

    #define BUILDING_NODE_EXTENSION
    #include <node.h>
    #include "myobject.h"

    using namespace v8;

    MyObject::MyObject() {};
    MyObject::~MyObject() {};

    Persistent<Function> MyObject::constructor;

    void MyObject::Init() {
      // Prepare constructor template
      Local<FunctionTemplate> tpl = FunctionTemplate::New(New);
      tpl->SetClassName(String::NewSymbol("MyObject"));
      tpl->InstanceTemplate()->SetInternalFieldCount(1);

      constructor = Persistent<Function>::New(tpl->GetFunction());
    }

    Handle<Value> MyObject::New(const Arguments& args) {
      HandleScope scope;

      MyObject* obj = new MyObject();
      obj->val_ = args[0]->IsUndefined() ? 0 : args[0]->NumberValue();
      obj->Wrap(args.This());

      return args.This();
    }

    Handle<Value> MyObject::NewInstance(const Arguments& args) {
      HandleScope scope;

      const unsigned argc = 1;
      Handle<Value> argv[argc] = { args[0] };
      Local<Object> instance = constructor->NewInstance(argc, argv);

      return scope.Close(instance);
    }

Test it with:

    var addon = require('./build/Release/addon');

    var obj1 = addon.createObject(10);
    var obj2 = addon.createObject(20);
    var result = addon.add(obj1, obj2);

    console.log(result); // 30