# 全局对象

<!-- type=misc -->

这些对象在所有模块中都是可见的。需要注意的是，有些对象并不真正在全局作用域中，而是在模块作用域中。


## global

<!-- type=global -->

* {Object} 全局命名空间对象

在浏览器中，顶级作用域即全局作用域。也就是说浏览器中，在全局作用域下（译者注：原文这里是in global scope，
觉得应该是in top-level scope才能说明浏览器中顶级域和全局域是同一个域）
通过`var something`，就可以定义一个全局变量。但是在Node中并不如此，顶级作用域并非是全局作用域。
在Node模块中通过`var something`定义的变量仅作用于该模块。

## process

<!-- type=global -->

* {Object}

进程对象。 参见[进程对象](process_cn.html#process)章节。

## console

<!-- type=global -->

* {Object}

用于向stdout和stderr打印信息。参见[标准输入输出](stdio_cn.html)章节。

## Buffer

<!-- type=global -->

* {Object}

用于处理二进制数据。 参见[缓冲类](buffer_cn.html)章节。

## require()

<!-- type=var -->

* {Function}

用于加载模块。参见[模块](modules_cn.html#modules)章节。
`require`并不是全局函数，而是每个模块的顶级函数。

## require.resolve()

使用内部函数`require()`的机制查找模块的位置，然而它并不加载这个模块，仅返回解析后的文件名。

## require.cache

* {Object}

当模块加载后，会被缓存在这个对象当中。
通过删除这个对象中的键值对，可以在下一次使用`require`时重新加载这个模块。

## __filename

<!-- type=var -->

* {String}

当前正在执行的脚本的文件名。它是这个脚本文件经过解析后的绝对路径。
在主程序中，它并不一定和命令行中调用的文件名相同。而在模块中，就是这个模块文件的路径。

例如：在`/Users/mjr`目录下运行`node example.js`

    console.log(__filename);
    // /Users/mjr/example.js

`__filename`并不是全局变量，而是每个模块的顶级变量。

## __dirname

<!-- type=var -->

* {String}

当前正在执行的脚本所在的目录名。

例如：在`/Users/mjr`目录下运行`node example.js`

    console.log(__dirname);
    // /Users/mjr

`__dirname`并不是全局变量，而是每个模块的顶级变量。


## module

<!-- type=var -->

* {Object}


指向当前模块的引用。其中的`module.exports`与`exports`引用的是同一个对象。
`module`并不是全局变量，而是每个模块的顶级变量。

参见[module system documentation](modules_cn.html)可以获得更多信息。


## exports

<!-- type=var -->

一个被当前模块的所有实例共享的对象，并通过`require()`来访问这个对象。
`exports`和`module.exports`引用的是同一个对象。
`exports`并不是全局变量，而是每个模块的顶级变量。

参见[module system documentation](modules_cn.html)可以获得更多信息。

参见[module section](modules_cn.html)可以获得更多信息。

## setTimeout(cb, ms)
## clearTimeout(t)
## setInterval(cb, ms)
## clearInterval(t)

<!--type=global-->

这些定时器函数都是全局函数。参见[定时器](timers_cn.html)章节。
