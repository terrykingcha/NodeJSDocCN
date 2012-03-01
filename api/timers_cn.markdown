# 定时器

所有关于定时器的函数都是全局的。在使用它们时，不需要通过`require()`来加载这个模块。

## setTimeout(callback, delay, [arg], [...])

用于设定在`delay`毫秒后执行一次`callback`回调函数的操作。
返回的`timeoutId`可以被`clearTimeout()`使用。
也可以选择为回调函数传递所需要的参数。

需要重点提醒的是，执行回调函数的时机，可能不会精确到`delay`毫秒。
那是因为，Node.js并不保证触发回调的确切时机，也不保证触发顺序的确切时机。
只能尽量在指定时间点左右执行回调函数。

## clearTimeout(timeoutId)

阻止触发指定的timeout（超时）定时器（译者注：已经触发后，不能中断其执行）。

## setInterval(callback, delay, [arg], [...])

用于设定在每过`delay`毫秒后重复执行`callback`回调函数的操作。
返回的`intervalId`可以被`clearInterval()`使用。
也可以选择为回调函数传递所需要的参数

## clearInterval(intervalId)

停止触发指定的interval（间隔）定时器（译者注：已经触发后，不能中断其执行）。

