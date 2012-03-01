## 翻译斟酌

###module_cn

  - 关于`module.require`的作用(line 313)：

>Note that in order to do this, you must get a reference to the `module`
>object.  Since `require()` returns the `exports`, and the `module` is
>typically *only* available within a specific module's code, it must be
>explicitly exported in order to be used.

>注意，为了使用require方法，必须先获得对`module`对象的引用。因为`require()`会返回`exports`，
>并且`module`通常只在特殊的模块代码中有效，所以只在需要用到时才导出。
