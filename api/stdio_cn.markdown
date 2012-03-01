# console

* {Object}

<!--type=global-->

用于在stdout和stderr打印信息。就像大多数web浏览器提供的控制台对象函数那样，
用这个输出的信息会被发送到stdout或stderr中。


## console.log()

在stdout中另起一行打印信息。这个函数，可以像`printf()`方法那样接受多个参数，例如：

    console.log('count: %d', count);

如果在第一个字符串中并没有找到格式化标签，那么会对之后的每个参数使用`util.inspect`方法。
参见[util.format()](util.html#util.format)获取更多信息。

## console.info()

和`console.log`相同。

## console.warn()
## console.error()

和`console.log`类似，只是在stderr中打印信息.

## console.dir(obj)

对`obj`执行`util.inspect`方法，并把返回的结果字符串打印到stderr。

## console.time(label)

创建计时器。

## console.timeEnd(label)

终止计时器，并输出结果。例如：

    console.time('100-elements');
    for (var i = 0; i < 100; i++) {
      ;
    }
    console.timeEnd('100-elements');

（译者注：最后将打印运行这个循环所使用的时间）

## console.trace()

在stderr中打印当前脚本执行位置的调用堆栈。

## console.assert()

和`assert.ok()`相同。

