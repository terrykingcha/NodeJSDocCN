# 流接口

在Node中，流是一个抽象接口，有不少对象会去实现这个接口。例如，对HTTP服务器的请求是一个流，事实上，
它就是一个标准输出。流本身可读、可写或者两者皆可。所有流也是`EventEmitter`的实例。

借由执行`require('stream')`，可以加载Stream基类。

## 可读流

<!--type=class-->

可读流的方法、成员和事件如下：

### 事件： 'data'

`function (data) { }`

`'data'`事件触发后，回调函数默认接收到一个`缓冲器`对象，而在使用`setEncoding()`时则会接收到一个字符串。

必须注意的是，如果不存这个事件的监听器，那么在`可读流`触发`'data'`事件时_就会丢失数据_。

### 事件： 'end'

`function () { }`

在流接收到EOF（在TCP中是FIN）时触发。这表明，不会再有任何`'data'`事件发生。
如果流也是可写的，那么还可继续写操作。


### 事件： 'error'

`function (exception) { }`

在接收数据错误时触发。

### 事件： 'close'

`function () { }`

当底层的文件描述符被关闭时触发。并不是所有的流都会触发这个事件。（例如，一个达到的HTTP请求就不会触发`'close'`。）

### stream.readable

默认为`true`，在发生`错误`、触发`'end'`事件或调用`destroy()`后变为`false`。

### stream.setEncoding(encoding)

这会使data事件回调函数接收到一个字符串，而不是原本的一个`缓冲器`对象。
`encoding`可以是`'utf8'`，`'ascii'`或者`'base64'`。

### stream.pause()

暂停`'data'`事件的触发。

### stream.resume()

恢复被`pause()`暂停的`'data'`事件的触发。

### stream.destroy()

关闭底层文件描述符。流不再触发任何事件。

### stream.destroySoon()

在写操作队列清空后，关闭文件描述符。

### stream.pipe(destination, [options])

这是一个`Stream.prototype`的方法，可以被所有流对象调用。

连接读操作流和作为目标`destinaion`的写操作流。传入这个流的数据会被写入到`destination`中。
在需要时，可以通过暂停和恢复操作来保持目标流和源流的同步。

这个方法会返回`destination`流。

模拟Unix的`cat`命令：

    process.stdin.resume();
    process.stdin.pipe(process.stdout);


默认情况下，当源流触发`end`事件时，目标流回调用`end()`，于是`destination`就不可写了。
设置`options`为`{end: false}`，可以保持目标流的始终处于打开状态。

这样做可以让`process.stdout`仍打开着，以便在最后输出"Goodbye"。

    process.stdin.resume();

    process.stdin.pipe(process.stdout, { end: false });

    process.stdin.on("end", function() {
      process.stdout.write("Goodbye\n");
    });


## 可写流

<!--type=class-->

可写流的方法、成员和事件如下：

### 事件： 'drain'

`function () { }`

在`write()`方法返回`false`后，触发这个事件，表明可以放心进行写操作了。

### 事件： 'error'

`function (exception) { }`

发送错误时触发，回调函数接收一个`exception`异常。

### 事件： 'close'

`function () { }`

在底层文件描述符被关闭时触发。

### 事件： 'pipe'

`function (src) { }`

在把可写流传递给可写流的pipe方法时触发。

### stream.writable

默认为`true`，在发生`错误`、调用`end()`或`destroy()`后变为`false`。

### stream.write(string, [encoding], [fd])

用指定的`encoding`把`string`写入到流中。返回`true`，表示字符串被成功刷入内核缓冲器中。
返回`false`表示内核缓冲器已满，且会在今后的操作中发送这个数据。在内核缓冲器重新清空时，会触发`'drean'`事件。
`encoding`默认为`utf8`。

如果指定了`fd`参数，`string`就会被解释成完整的文件描述符而发送给流。仅有UNIX流才支持这个参数，其它流则会忽略掉它。
如此写入一个文件描述符时，在流清空前关闭这个描述符，会有风险使其发送一个无效（已关闭）的FD。

### stream.write(buffer)

用`缓冲器`对象代替字符串，其余同上。

### stream.end()

用EOF或FIN终止流。
这个方法允许在关闭流之前把等待写入的数据都发送给流。

### stream.end(string, encoding)

用给定的`encoding`发送`string`，之后用EOF或FIN终止流。这有助于减少包发送的次数。

### stream.end(buffer)

用`缓冲器`对象代替字符串，其余同上。

### stream.destroy()

关闭底层文件描述符。流不再触发任何事件。待写入的数据也不会被发送。

### stream.destroySoon()

在写队列清空后，关闭文件描述符。 `destroySoon()`也是可以直接销毁流的，只要写队列中不再存在数据。
