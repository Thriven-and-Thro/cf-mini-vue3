'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const extend = Object.assign;
const isObject = (target) => {
    return target !== null && typeof target === "object";
};
const hasChange = (value, newValue) => !Object.is(value, newValue);
const hasOwn = (val, key) => Object.prototype.hasOwnProperty.call(val, key);
// otherBtn => onOtherBtn
const camelize = (str) => {
    return str.replace(/-(\w)/g, (_, c) => {
        return c ? c.toUpperCase() : "";
    });
};
const capitalize = (str) => {
    return str.charAt(0).toLocaleUpperCase() + str.slice(1);
};
// other-btn => otherBtn
const toHandlerKey = (str) => {
    return str ? "on" + capitalize(str) : "";
};
const EMPTY_OBJECT = {};

// 全局变量保存执行函数
let activiteEffect;
// 防止重复get进行依赖收集
let shouldTrack = true;
// 封装执行函数
class ActiviteEffect {
    // 通过 public 暴露给外界使用
    constructor(fn, scheduler) {
        this._fn = fn;
        this.deps = [];
        this.active = true;
        this.scheduler = scheduler;
    }
    run() {
        // 防止++操作使stop失效
        if (!this.active) {
            return this._fn();
        }
        shouldTrack = true;
        activiteEffect = this;
        const result = this._fn();
        // 上锁
        shouldTrack = false;
        return result;
    }
    stop() {
        if (this.active) {
            cleanupEffect(this);
            this.active = false;
            return this.onStop && this.onStop();
        }
    }
}
function cleanupEffect(effect) {
    effect.deps.forEach((dep) => {
        dep.delete(effect);
    });
    effect.deps.length = 0;
}
// 执行函数
function effect(fn, option = {}) {
    const activiteFn = new ActiviteEffect(fn);
    // 将Object.assign别名为extend，提高可读性
    extend(activiteFn, option);
    activiteFn.run();
    const runner = activiteFn.run.bind(activiteFn);
    // 将ActiviteEffect实例挂载到runner上，便于stop函数取到实例
    runner.effect = activiteFn;
    return runner;
}
// proxy对象=》对象map
const targetMap = new WeakMap();
// 依赖收集
function track(target, key) {
    if (!isTracking())
        return;
    let depMap = targetMap.get(target);
    if (!depMap) {
        // 对象属性=》函数依赖
        depMap = new Map();
        targetMap.set(target, depMap);
    }
    let effectSet = depMap.get(key);
    if (!effectSet) {
        // 函数依赖
        effectSet = new Set();
        depMap.set(key, effectSet);
    }
    trackEffect(effectSet);
}
// 抽离功能，因为ref不需要以上依赖的数据结构
function trackEffect(effectSet) {
    effectSet.add(activiteEffect);
    // 反向依赖收集，用于 stop
    activiteEffect.deps.push(effectSet);
}
// 是否应该收集：防止重复收集
function isTracking() {
    return activiteEffect !== undefined && shouldTrack;
}
// 触发依赖
function trigger(target, key) {
    let depMap = targetMap.get(target);
    let effectSet = depMap === null || depMap === void 0 ? void 0 : depMap.get(key);
    triggerEffect(effectSet);
}
// 抽离功能，ref
function triggerEffect(effectSet) {
    if (effectSet) {
        for (const effect of effectSet) {
            if (effect.scheduler) {
                effect.scheduler();
            }
            else {
                effect.run();
            }
        }
    }
}

// 优化：减少调用次数
const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);
const shallowReadonlyGet = createGetter(true, true);
// 抽取：proxy的get操作
function createGetter(isReadonly = false, isShallow = false) {
    return (target, key, receiver) => {
        if (key === "__v_isReactive" /* ReactiveFlag.IS_REACTIVE */) {
            return !isReadonly;
        }
        else if (key === "__V_isReadonly" /* ReactiveFlag.IS_READONLY */) {
            return isReadonly;
        }
        const res = Reflect.get(target, key, receiver);
        if (isShallow)
            return res;
        // 嵌套对象的响应式处理
        if (isObject(res)) {
            return isReadonly ? readonly(res) : reactive(res);
        }
        // 依赖收集
        if (!isReadonly)
            track(target, key);
        return res;
    };
}
// 抽取：proxy的set操作
function createSetter() {
    return (target, key, value, receiver) => {
        const res = Reflect.set(target, key, value, receiver);
        // 触发依赖
        trigger(target, key);
        return res;
    };
}
// 抽取：reactive的get、set操作
const mutableHandler = {
    get,
    set,
};
// 抽取：readonly的get、set操作
const readonlyHandler = {
    get: readonlyGet,
    set: (target, key, value, receiver) => {
        console.warn(`readonly的值不能被修改 ${String(key)}-${value}`);
        return true;
    },
};
const shallowReadonlyHandler = extend({}, readonlyHandler, {
    get: shallowReadonlyGet,
});

// 抽取：new proxy的重复操作
function createAvtiveObject(raw, baseHandlers) {
    return new Proxy(raw, baseHandlers);
}
function reactive(target) {
    return createAvtiveObject(target, mutableHandler);
}
function readonly(target) {
    return createAvtiveObject(target, readonlyHandler);
}
function shallowReadonly(target) {
    return createAvtiveObject(target, shallowReadonlyHandler);
}

// 类：值类型需要对象包裹，所以用类封装
class RefImpl {
    constructor(value) {
        this._value = convert(value);
        this.dep = new Set();
        this._raw = value;
        this._v__isRef = true;
    }
    get value() {
        trackRefValue(this.dep);
        return this._value;
    }
    set value(newValue) {
        if (!hasChange(newValue, this._raw))
            return;
        this._value = convert(newValue);
        this._raw = newValue;
        triggerEffect(this.dep);
    }
}
function convert(value) {
    return isObject(value) ? reactive(value) : value;
}
function trackRefValue(dep) {
    // 需收集
    if (isTracking()) {
        trackEffect(dep);
    } // 只读值
}
function ref(value) {
    return new RefImpl(value);
}
function isRef(ref) {
    return !!ref._v__isRef;
}
function unRef(ref) {
    return isRef(ref) ? ref.value : ref;
}
// 浅解包
function proxyRefs(objectWithRefs) {
    // 利用proxy
    return new Proxy(objectWithRefs, {
        get(target, key, receiver) {
            // 通过 unRef 实现 当有value时取value，没有时直接返回
            return unRef(Reflect.get(target, key, receiver));
        },
        set(target, key, value, receiver) {
            if (isRef(target[key]) && !isRef(value)) {
                // 特殊处理 赋值为ref对象
                return (target[key].value = value);
            }
            else {
                // 其他情况 直接赋值
                return Reflect.set(target, key, value, receiver);
            }
        },
    });
}

function emit(instance, event, ...args) {
    // TPP
    // 具体 -> 通用
    // other-btn => otherBtn => onOtherBtn
    const handlerName = toHandlerKey(camelize(event));
    const { props } = instance;
    if (handlerName in props) {
        props[handlerName](...args);
    }
}

function initProps(instance, rawProps) {
    // 默认值防止shallowReadonly中proxy参数为非对象报错
    instance.props = rawProps || {};
    // attrs
}

// 初始化插槽，执行对应插槽将值存到slots
function initSlots(instance, children) {
    if (instance.vnode.shapeFlag & 16 /* ShapeFlags.SLOTS_CHILDREN */) {
        normalizeObjectSlots(children, instance.slots);
    }
}
function normalizeObjectSlots(children, slots) {
    for (const key in children) {
        const value = children[key];
        slots[key] = (props) => normalizeSlotValue(value(props));
    }
}
function normalizeSlotValue(value) {
    return Array.isArray(value) ? value : [value];
}

let currentInstacne = null;
function createComponentInstance(vnode, parent) {
    const component = {
        vnode,
        type: vnode.type,
        setupState: {},
        props: {},
        parent,
        provides: parent.provides || {},
        slots: {},
        emit: () => { },
        isMounted: false,
        subTree: {},
    };
    // 使用bind为emit绑定第一个参数
    component.emit = emit.bind(null, component);
    return component;
}
function setupComponent(instance) {
    // initProps
    initProps(instance, instance.vnode.props);
    // initSolts
    initSlots(instance, instance.vnode.children);
    // 无状态组件的处理
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    const component = instance.vnode.type;
    const { setup } = component;
    if (setup) {
        setCurrentInstance(instance);
        // setup的props，需要只读
        const setupResult = setup(shallowReadonly(instance.props), {
            emit: instance.emit,
        });
        setCurrentInstance(null);
        handleSetupResult(instance, setupResult);
    }
}
function handleSetupResult(instance, setupResult) {
    // setup返回值的两种情况：对象、函数
    if (typeof setupResult === "object") {
        // proxyRefs浅解包
        instance.setupState = proxyRefs(setupResult);
    }
    finishComponentSetup(instance);
}
function finishComponentSetup(instance) {
    const component = instance.vnode.type;
    // 将render函数挂载到实例上
    if (component.render) {
        instance.render = component.render;
    }
}
function getCurrentInstance() {
    return currentInstacne;
}
// 将变更状态的操作封装，便于debug该操作的更改
function setCurrentInstance(instance) {
    currentInstacne = instance;
}

// 封装组件实例上的代理
const PublicPropertiesMap = new Map([
    ["$el", (i) => i.vnode.el],
    ["$slots", (i) => i.slots],
]);
const PublicInstanceProxyHandlers = {
    get({ _: instance }, key) {
        var _a;
        const { setupState, props } = instance;
        if (hasOwn(setupState, key)) {
            return instance.setupState[key];
        }
        else if (hasOwn(props, key)) {
            return instance.props[key];
        }
        if (PublicPropertiesMap.has(key)) {
            return (_a = PublicPropertiesMap.get(key)) === null || _a === void 0 ? void 0 : _a(instance);
        }
    },
};

const Fragment = Symbol("Fragment");
const Text = Symbol("Text");
function createVNode(type, props, children) {
    const vnode = {
        type,
        props,
        key: props === null || props === void 0 ? void 0 : props.key,
        children,
        el: null,
        // 节点类型
        shapeFlag: getShapFlag(type),
    };
    // 坑：
    // if (typeof children === "string" || "number") {
    if (typeof children === "string" || typeof children === "number") {
        vnode.shapeFlag |= 4 /* ShapeFlags.TEXT_CHILDREN */;
    }
    else if (Array.isArray(children)) {
        vnode.shapeFlag |= 8 /* ShapeFlags.ARRAY_CHILDREN */;
    }
    // 插槽类型
    if (vnode.shapeFlag & 2 /* ShapeFlags.STATEFUL_COMPONENT */) {
        if (isObject(vnode.children)) {
            vnode.shapeFlag |= 16 /* ShapeFlags.SLOTS_CHILDREN */;
        }
    }
    return vnode;
}
function getShapFlag(type) {
    return typeof type === "string"
        ? 1 /* ShapeFlags.ELEMENT */
        : 2 /* ShapeFlags.STATEFUL_COMPONENT */;
}
function createTextVNode(children) {
    return createVNode(Text, {}, children);
}

// import { render } from "./renderer";
// 定制化renderer后就没有直接暴露render，故需通过该函数传递render
function createAppAPI(render) {
    // 传入根组件
    return function createApp(rootComponent) {
        return {
            // 挂载到根容器
            mount(rootContainer) {
                // 所有节点都转为vnode再处理
                // rootComponent -> vnode
                const vnode = createVNode(rootComponent);
                render(vnode, rootContainer, {});
            },
        };
    };
}

function createRenderer(options) {
    // 重命名方便调试
    const { createElement: hostCreateElement, patchProp: hostPatchProp, insert: hostInsert, remove: hostRemove, setElementText: hostSetElementText, } = options;
    function render(vnode, container, parentComponent) {
        patch(null, vnode, container, parentComponent, null);
    }
    function patch(n1, n2, container, parentComponent, anchor) {
        const { shapeFlag, type } = n2;
        switch (type) {
            case Fragment:
                processFragment(n1, n2, container, parentComponent, anchor);
                break;
            case Text:
                processText(n1, n2, container);
                break;
            default:
                // 1.element：type为string
                // 2.component：type为object有setup、render
                if (shapeFlag & 1 /* ShapeFlags.ELEMENT */) {
                    processElement(n1, n2, container, parentComponent, anchor);
                }
                else if (shapeFlag & 2 /* ShapeFlags.STATEFUL_COMPONENT */) {
                    processComponent(n1, n2, container, parentComponent, anchor);
                }
                break;
        }
    }
    // if Fragment
    function processFragment(n1, n2, container, parentComponent, anchor) {
        mountChildren(n2.children, container, parentComponent, anchor);
    }
    // if Text
    function processText(n1, n2, container) {
        // 注意为vnode.el挂载
        const textNode = (n2.el = document.createTextNode(n2.children));
        container.append(textNode);
    }
    // if element
    function processElement(n1, n2, container, parentComponent, anchor) {
        if (!n1) {
            // init tree
            mountElement(n2, container, parentComponent, anchor);
        }
        else {
            // patch tree
            patchElement(n1, n2, container, parentComponent, anchor);
        }
    }
    function patchElement(n1, n2, container, parentComponent, anchor) {
        console.log("patchElement", n1, n2);
        // 带上默认值
        // 使用EMPTY_OBJECT，是因为后续情况3的优化要根据同个对象进行判断
        const oldProps = n1.props || EMPTY_OBJECT;
        const newProps = n2.props || EMPTY_OBJECT;
        // 此处 n2.el = n1.el 是因为n2不走mountElement，故其节点上el没有赋值
        // 而后续n2需要比较则不能没有el
        // 而且n2是替换n1的，是同一个节点所以el可以赋值
        const el = (n2.el = n1.el);
        // patch children
        // 坑
        // 此处container参数应该传el，否则子节点中的container依然是当前节点的
        patchChildren(n1, n2, el, parentComponent, anchor);
        // patch props
        patchProps(el, oldProps, newProps);
    }
    function patchChildren(n1, n2, container, parentComponent, anchor) {
        const prevShapFlag = n1.shapeFlag;
        const c1 = n1.children;
        const nextShapFlag = n2.shapeFlag;
        const c2 = n2.children;
        // to Text
        if (nextShapFlag & 4 /* ShapeFlags.TEXT_CHILDREN */) {
            //  Array
            if (prevShapFlag & 8 /* ShapeFlags.ARRAY_CHILDREN */) {
                unmountChildren(c1);
            }
            // Array/Text
            if (c1 !== c2) {
                hostSetElementText(container, c2);
            }
            // to Array
        }
        else {
            // Text
            if (prevShapFlag & 4 /* ShapeFlags.TEXT_CHILDREN */) {
                hostSetElementText(container, "");
                mountChildren(c2, container, parentComponent, anchor);
            }
            else {
                patchKeyedChildren(c1, c2, container, parentComponent, anchor);
            }
        }
    }
    // 双端对比算法
    // 目的：锁定中间乱序部分
    function patchKeyedChildren(c1, c2, container, parentComponent, parentAnchor) {
        function isSomeVNodeType(n1, n2) {
            return n1.type === n2.type && n1.key === n2.key;
        }
        const l1 = c1.length, l2 = c2.length;
        // 利用三个变量进行定位比较
        // 循环结束条件为某一组节点的尾结点或头节点
        // 遇到不同节点则停止
        // 最后结果三个变量会停留在两组节点不相同的节点位置上
        let i = 0, e1 = l1 - 1, e2 = l2 - 1;
        // 左侧
        while (i <= e1 && i <= e2) {
            // 控制变量i
            const n1 = c1[i], n2 = c2[i];
            if (isSomeVNodeType(n1, n2)) {
                patch(n1, n2, container, parentComponent, parentAnchor);
            }
            else {
                break;
            }
            i++;
        }
        // 右侧
        while (i <= e1 && i <= e2) {
            // 控制变量e1，e2
            const n1 = c1[e1], n2 = c2[e2];
            if (isSomeVNodeType(n1, n2)) {
                patch(n1, n2, container, parentComponent, parentAnchor);
            }
            else {
                break;
            }
            e1--;
            e2--;
        }
        // 新增
        if (i > e1) {
            if (i <= e2) {
                // 不使用i是因为i会改变，对于新增多个节点时顺序会出错
                const nextProps = e2 + 1;
                // 锚点，节点将会在锚点之前插入
                const anchor = nextProps < l2 ? c2[nextProps].el : null;
                while (i <= e2) {
                    patch(null, c2[i], container, parentComponent, anchor);
                    i++;
                }
            }
            // 删除
        }
        else if (i > e2) {
            while (i <= e1) {
                hostRemove(c1[i].el);
                i++;
            }
        }
        else ;
    }
    function unmountChildren(children) {
        for (const child of children) {
            hostRemove(child.el);
        }
    }
    function patchProps(el, oldProps, newProps) {
        if (oldProps !== newProps) {
            for (const key in newProps) {
                const nextProp = newProps[key];
                const prevProp = oldProps[key];
                if (prevProp !== nextProp) {
                    // 情况1
                    hostPatchProp(el, key, prevProp, nextProp);
                }
            }
            if (oldProps !== EMPTY_OBJECT) {
                // 情况3
                for (const key in oldProps) {
                    if (!(key in newProps)) {
                        // 手动让属性值为null，模拟情况2
                        hostPatchProp(el, key, oldProps[key], null);
                    }
                }
            }
        }
    }
    // if component
    function processComponent(n1, n2, container, parentComponent, anchor) {
        mountComponent(n2, container, parentComponent, anchor);
    }
    // init Element
    function mountElement(vnode, container, parentComponent, anchor) {
        // 1.创建
        // 获取element的虚拟节点到vnode
        const el = (vnode.el = hostCreateElement(vnode.type));
        // 2.处理
        const { props, children, shapeFlag } = vnode;
        // props
        for (const key in props) {
            hostPatchProp(el, key, null, props[key]);
        }
        // children
        // 1.string 2.array
        if (shapeFlag & 4 /* ShapeFlags.TEXT_CHILDREN */) {
            el.textContent = children;
        }
        else if (shapeFlag & 8 /* ShapeFlags.ARRAY_CHILDREN */) {
            mountChildren(vnode.children, el, parentComponent, anchor);
        }
        // 3.挂载
        hostInsert(el, container, anchor);
    }
    // 递归处理子节点
    function mountChildren(children, container, parentComponent, anchor) {
        for (const child of children) {
            patch(null, child, container, parentComponent, anchor);
        }
    }
    // init component
    function mountComponent(initialVnode, container, parentComponent, anchor) {
        const instance = createComponentInstance(initialVnode, parentComponent);
        instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers);
        // 实例组件的处理
        setupComponent(instance);
        setupRenderEffect(instance, container, initialVnode, anchor);
    }
    function setupRenderEffect(instance, container, initialVnode, anchor) {
        // 使用effect对依赖进行收集
        effect(() => {
            if (!instance.isMounted) {
                // 第一次渲染
                // 使使用的render中的this指向代理对象
                const subTree = (instance.subTree = instance.render.call(instance.proxy));
                patch(null, subTree, container, instance, null);
                // 当所有子节点挂载完毕，获取该组件的虚拟节点
                initialVnode.el = subTree.el;
                instance.isMounted = true;
            }
            else {
                // 更新
                const subTree = instance.render.call(instance.proxy);
                const preSubTree = instance.subTree;
                initialVnode.el = subTree.el;
                instance.subTree = subTree;
                patch(preSubTree, subTree, container, instance, anchor);
            }
        });
    }
    // 将createApp函数过载在renderer对象上
    // 在src\runtime-dom\index.ts暴露给客户使用
    // 调用createAppAPI传递render
    return {
        createApp: createAppAPI(render),
    };
}

// 使用插槽函数：从$slots中取值
function renderSlots(slots, name = "default", props = {}) {
    const slot = slots[name];
    if (slot) {
        if (typeof slot === "function") {
            // Fragment
            return createVNode(Fragment, {}, slot(props));
        }
    }
}

function provide(key, value) {
    var _a;
    const currentInstacne = getCurrentInstance();
    if (currentInstacne) {
        let { provides } = currentInstacne;
        const parentProvides = (_a = currentInstacne.parent) === null || _a === void 0 ? void 0 : _a.provides;
        // 第一次调用provide
        if (provides === parentProvides) {
            // 利用原型链的查找实现多层组件provide的查找
            provides = currentInstacne.provides = Object.create(parentProvides);
        }
        provides[key] = value;
    }
}
// 注意：当前组件的provide在本组件是获取不到的
// 参数2为默认值，可以为普通值或函数
function inject(key, defaultValue) {
    var _a;
    const currentInstacne = getCurrentInstance();
    if (currentInstacne) {
        const parentProvides = (_a = currentInstacne.parent) === null || _a === void 0 ? void 0 : _a.provides;
        if (key in parentProvides) {
            return parentProvides[key];
        }
        else {
            if (typeof defaultValue === "function") {
                return defaultValue();
            }
            return defaultValue;
        }
    }
}

// 抽取原runtime-core中创建节点、处理节点属性、插入节点的操作，使其可自定义renderer
function createElement(type) {
    return document.createElement(type);
}
function patchProp(el, key, prevProp, nextProp) {
    const isOn = (key) => /^on[A-Z]/.test(key);
    if (isOn(key)) {
        // event
        const event = key.slice(2).toLocaleLowerCase();
        el.addEventListener(event, nextProp);
    }
    else if (!nextProp) {
        // props 为 undefined或null
        el.removeAttribute(key);
    }
    else {
        // nextProp
        el.setAttribute(key, nextProp);
    }
}
// 此类对dom元素操作的也放入该文件
function insert(el, parent, anchor = null) {
    // 重写
    // parent.append(el);
    parent.insertBefore(el, anchor);
}
function remove(child) {
    const parent = child.parentNode;
    if (parent) {
        parent.removeChild(child);
    }
}
function setElementText(el, text) {
    el.textContent = text;
}
// 默认的renderer
const renderer = createRenderer({
    createElement,
    patchProp,
    insert,
    remove,
    setElementText,
});
// 将renderer对象上的createApp暴露出去
function createApp(...arg) {
    return renderer.createApp(...arg);
}

exports.Fragment = Fragment;
exports.createApp = createApp;
exports.createRenderer = createRenderer;
exports.createTextVNode = createTextVNode;
exports.effect = effect;
exports.getCurrentInstance = getCurrentInstance;
exports.h = createVNode;
exports.inject = inject;
exports.provide = provide;
exports.proxyRefs = proxyRefs;
exports.ref = ref;
exports.renderSlots = renderSlots;
