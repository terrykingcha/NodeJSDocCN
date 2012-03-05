# 常用工具

这些函数都包含在`'util'`模块中。通过使用`require('util')`可以访问它们。


## util.format()

返回一个格式化后的字符串，第一个参数是类似`printf`的格式。

第一个参数可以包含多个占位符，也可以没有。每个占位符会被替换成其相关参数转换后的值。
支持的占位符如下：

* `%s` - 字符串。
* `%d` - 数字 (包括整型和浮点型)。
* `%j` - JSON。
* `%%` - 百分符（`'%'`）。 这不会被当作参数对待。

如果占位符没有相对应的参数，那么就不会被替换掉。

    util.format('%s:%s', 'foo'); // 'foo:%s'

如果参数的个数多于占位符，多余的参数会通过`util.inspect()`转换成字符串，并以空格分隔符拼接在一起。

    util.format('%s:%s', 'foo', 'bar', 'baz'); // 'foo:bar baz'

如果第一个参数不是带格式的字符串，那么`util.format()`会返回把所有参数用空格分隔拼接后的字符串。
每个参数都用`util.inspect()`转换成字符串。

    util.format(1, 2, 3); // '1 2 3'


## util.debug(string)

一个同步输出函数。它会阻塞进程，并马上输入`string`给`stderr`。

    require('util').debug('message on stderr');


## util.log(string)

在`stdout`上输出带有时间戳的信息。

    require('util').log('Timestamped message.');


## util.inspect(object, [showHidden], [depth], [colors])

返回`object`的一个有助于调试的描述串。

如果`showHidden`设置为`true`，则该对象的不可枚举属性也会显示出来。默认为`false`。

`depth`参数指定了`inspect`在格式化对象时递归的次数。这在显示大而复杂的对象时非常有帮助。

默认是只会递归两次。如果想要无限次递归，那么就传`null`值给`depth`。

如果`colors`设置为`true`，那么就会以ANSI格式的高亮代码来输出。默认为`false`。

显示`util`对象所有属性的例子：

    var util = require('util');

    console.log(util.inspect(util, true, null));


## util.isArray(object)

如果给定的"object"是一个`数组对象（Array）`就返回`true`，否则返回`false`。

    var util = require('util');

    util.isArray([])
      // true
    util.isArray(new Array)
      // true
    util.isArray({})
      // false


## util.isRegExp(object)

如果给定的"object"是一个`正则对象（RegExp）`就返回`true`，否则返回`false`。

    var util = require('util');

    util.isRegExp(/some regexp/)
      // true
    util.isRegExp(new RegExp('another regexp'))
      // true
    util.isRegExp({})
      // false


## util.isDate(object)

如果给定的"object"是一个`日期对象（Date）`就返回`true`，否则返回`false`。

    var util = require('util');

    util.isDate(new Date())
      // true
    util.isDate(Date())
      // false (without 'new' returns a String)
    util.isDate({})
      // false


## util.isError(object)

如果给定的"object"是一个`错误对象（Error）`就返回`true`，否则返回`false`。

    var util = require('util');

    util.isError(new Error())
      // true
    util.isError(new TypeError())
      // true
    util.isError({ name: 'Error', message: 'an error occurred' })
      // false


## util.pump(readableStream, writableStream, [callback])

这还是个在试验阶段的方法（译者注：请慎用）。

从`readableStream`读取数据，并发送给`writableStream`。当`writableStream.write(data)`返回`false`时，
`readableStream`会暂停，直到在`writableStream`上发生`drain`事件。在`writableStream`被关闭或发生错误时，
`callback`被调用，并传入唯一的error参数。


## util.inherits(constructor, superConstructor)

从一个构造器（[constructor](https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Object/constructor)）继承
原型方法到另一个构造器中。新构造器的`constructor`属性会被设置成由`superConstructor`创建的新对象

此外比较便捷的途径，还可以通过`constructor.super_`属性来访问`superConstructor`。

    var util = require("util");
    var events = require("events");

    function MyStream() {
        events.EventEmitter.call(this);
    }

    util.inherits(MyStream, events.EventEmitter);

    MyStream.prototype.write = function(data) {
        this.emit("data", data);
    }

    var stream = new MyStream();

    console.log(stream instanceof events.EventEmitter); // true
    console.log(MyStream.super_ === events.EventEmitter); // true

    stream.on("data", function(data) {
        console.log('Received data: "' + data + '"');
    })
    stream.write("It works!"); // Received data: "It works!"
