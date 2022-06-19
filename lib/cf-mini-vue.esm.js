const extend = Object.assign;
const isObject = (target) => {
    return target !== null && typeof target === "object";
};
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

// proxy对象=》对象map
const targetMap = new WeakMap();
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
        instance.setupState = setupResult;
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
        children,
        el: null,
        // 节点类型
        shapeFlag: getShapFlag(type),
    };
    if (typeof children === "string") {
        vnode.shapeFlag |= 4 /* ShapeFlags.TEXT_CHILDREN */;
    }
    else if (Array.isArray(children)) {
        vnode.shapeFlag |= 8 /* ShapeFlags.ARRAY_CHILDREN */;
    }
    // 插槽类型
    if (vnode.shapeFlag & 2 /* ShapeFlags.STATEFUL_COMPONENT */) {
        if (typeof vnode.children === "object") {
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
    const { createElement: hostCreateElement, patchProp: hostPatchProps, insert: hostInsert, } = options;
    function render(vnode, container, parentComponent) {
        patch(vnode, container, parentComponent);
    }
    function patch(vnode, container, parentComponent) {
        const { shapeFlag } = vnode;
        switch (vnode.type) {
            case Fragment:
                processFragment(vnode, container, parentComponent);
                break;
            case Text:
                processText(vnode, container);
                break;
            default:
                // 1.element：type为string
                // 2.component：type为object有setup、render
                if (shapeFlag & 1 /* ShapeFlags.ELEMENT */) {
                    processElement(vnode, container, parentComponent);
                }
                else if (shapeFlag & 2 /* ShapeFlags.STATEFUL_COMPONENT */) {
                    processComponent(vnode, container, parentComponent);
                }
                break;
        }
    }
    // if Fragment
    function processFragment(vnode, container, parentComponent) {
        mountChildren(vnode, container, parentComponent);
    }
    // if Text
    function processText(vnode, container) {
        // 注意为vnode.el挂载
        const textNode = (vnode.el = document.createTextNode(vnode.children));
        container.append(textNode);
    }
    // if element
    function processElement(vnode, container, parentComponent) {
        mountElement(vnode, container, parentComponent);
    }
    // if component
    function processComponent(vnode, container, parentComponent) {
        mountComponent(vnode, container, parentComponent);
    }
    // init Element
    function mountElement(vnode, container, parentComponent) {
        // 1.创建
        // 获取element的虚拟节点到vnode
        const el = (vnode.el = hostCreateElement(vnode.type));
        // 2.处理
        const { props, children, shapeFlag } = vnode;
        // props
        hostPatchProps(el, props);
        // children
        // 1.string 2.array
        if (shapeFlag & 4 /* ShapeFlags.TEXT_CHILDREN */) {
            el.textContent = children;
        }
        else if (shapeFlag & 8 /* ShapeFlags.ARRAY_CHILDREN */) {
            mountChildren(vnode, el, parentComponent);
        }
        // 3.挂载
        hostInsert(el, container);
    }
    // 递归处理子节点
    function mountChildren(vnode, container, parentComponent) {
        for (const child of vnode.children) {
            patch(child, container, parentComponent);
        }
    }
    // init component
    function mountComponent(initialVnode, container, parentComponent) {
        const instance = createComponentInstance(initialVnode, parentComponent);
        instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers);
        // 实例组件的处理
        setupComponent(instance);
        setupRenderEffect(instance, container, initialVnode);
    }
    function setupRenderEffect(instance, container, initialVnode) {
        // 使使用的render中的this指向代理对象
        const subTree = instance.render.call(instance.proxy);
        patch(subTree, container, instance);
        // 当所有子节点挂载完毕，获取该组件的虚拟节点
        initialVnode.el = subTree.el;
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
function patchProp(el, props) {
    for (const key in props) {
        const isOn = (key) => /^on[A-Z]/.test(key);
        if (isOn(key)) {
            // event
            const event = key.slice(2).toLocaleLowerCase();
            el.addEventListener(event, props[key]);
        }
        else {
            // props
            el.setAttribute(key, props[key]);
        }
    }
}
function insert(el, parent) {
    parent.append(el);
}
// 默认的renderer
const renderer = createRenderer({
    createElement,
    patchProp,
    insert,
});
// 将renderer对象上的createApp暴露出去
function createApp(...arg) {
    return renderer.createApp(...arg);
}

export { createApp, createRenderer, createTextVNode, getCurrentInstance, createVNode as h, inject, provide, renderSlots };
