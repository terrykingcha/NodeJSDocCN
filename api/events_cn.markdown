# 事件模块

<!--type=module-->

Node中很多对象都会触发事件：例如`net.Server`会在每个客户端连接时触发事件，
又如`fs.readStream`会在文件打开时触发事件。所有能够触发事件的对象都是`events.EventEmitter`的实例。
可以通过`require("events");`访问这个模块。

通常，事件名称是camel格式的字符串，但并不是严格限制的。任何字符串都能做为事件名。

随后，将函数注册给对象，使其在事件触发时执行。此类函数被称作_监听器_。

## 类：events.EventEmitter

通过`require('events').EventEmitter`来访问EventEmitter类。

一旦`EventEmitter`实例遇到错误，就会触发一个`'error'`事件。在Node中Error事件有着特殊待遇。
如果没有监听它的监听器，那么默认的处理方式就是输出调用堆栈后退出程序。

每当添加监听器时，所有事件触发器实例都会触发`'newListener'`事件。

### emitter.addListener(event, listener)
### emitter.on(event, listener)

添加一个监听器到指定事件的监听器队列末尾。

    server.on('connection', function (stream) {
      console.log('someone connected!');
    });

### emitter.once(event, listener)

给事件添加**一次性**监听器。这个监听器只在事件下一次触发时被调用，过后就被移除了。

    server.once('connection', function (stream) {
      console.log('Ah, we have our first user!');
    });

### emitter.removeListener(event, listener)

从指定事件的监听器队列中移除一个监听器。
**警告**：这将改变监听器队列中此监听器之后的数组下标。

    var callback = function(stream) {
      console.log('someone connected!');
    };
    server.on('connection', callback);
    // ...
    server.removeListener('connection', callback);

### emitter.removeAllListeners([event])

移除所有事件的所有监听器，或者指定事件的所有监听器。

### emitter.setMaxListeners(n)

默认情况下，在给某一事件添加超过10个监听器后，事件触发器会输出一个警告。这个默认配置将有助于你查找内存泄露问题。
显然，并不是所有触发器都非得限制为10个监听器。这个函数允许设置监听器个数，设置为0的时候表示无个数限制。


### emitter.listeners(event)

返回指定事件的监听器队列。可以对该数组进行操作，比如删除监听器。

    server.on('connection', function (stream) {
      console.log('someone connected!');
    });
    console.log(util.inspect(server.listeners('connection'))); // [ [Function] ]

### emitter.emit(event, [arg1], [arg2], [...])

顺序执行每个监听器，传入提供的参数列表。

### 事件： 'newListener'

* `event` {String} 事件名
* `listener` {Function} 事件处理函数

每当添加一个新监听器时，就会触发该事件。
