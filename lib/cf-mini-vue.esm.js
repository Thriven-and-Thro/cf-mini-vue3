const extend = Object.assign;
const isObject = (target) => {
    return target !== null && typeof target === "object";
};
const hasOwn = (val, key) => Object.prototype.hasOwnProperty.call(val, key);

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

function initProps(instance, rawProps) {
    // 默认值防止shallowReadonly中proxy参数为非对象报错
    instance.props = rawProps || {};
    // attrs
}

function createComponentInstance(vnode) {
    const component = {
        vnode,
        type: vnode.type,
        setupState: {},
        props: {},
    };
    return component;
}
function setupComponent(instance) {
    debugger;
    // initProps
    initProps(instance, instance.vnode.props);
    // initSolts
    // 无状态组件的处理
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    const component = instance.vnode.type;
    const { setup } = component;
    if (setup) {
        // setup的props，需要只读
        const setupResult = setup(shallowReadonly(instance.props));
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

// 封装组件实例上的代理
const PublicPropertiesMap = new Map([
    ["$el", (i) => i.vnode.el],
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

function render(vnode, container) {
    patch(vnode, container);
}
function patch(vnode, container) {
    const { shapeFlag } = vnode;
    // 1.element：type为string
    // 2.component：type为object有setup、render
    if (shapeFlag & 1 /* ShapeFlags.ELEMENT */) {
        processElement(vnode, container);
    }
    else if (shapeFlag & 2 /* ShapeFlags.STATEFUL_COMPONENT */) {
        processComponent(vnode, container);
    }
}
// if element
function processElement(vnode, container) {
    mountElement(vnode, container);
}
// if component
function processComponent(vnode, container) {
    mountComponent(vnode, container);
}
// init Element
function mountElement(vnode, container) {
    // 1.创建
    // 获取element的虚拟节点到vnode
    const el = (vnode.el = document.createElement(vnode.type));
    // 2.处理
    const { props, children, shapeFlag } = vnode;
    // props
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
    // children
    // 1.string 2.array
    if (shapeFlag & 4 /* ShapeFlags.TEXT_CHILDREN */) {
        el.textContent = children;
    }
    else if (shapeFlag & 8 /* ShapeFlags.ARRAY_CHILDREN */) {
        mountChildren(vnode, el);
    }
    // 3.挂载
    container.append(el);
}
// 递归处理子节点
function mountChildren(vnode, container) {
    for (const child of vnode.children) {
        patch(child, container);
    }
}
// init component
function mountComponent(initialVnode, container) {
    const instance = createComponentInstance(initialVnode);
    instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers);
    // 实例组件的处理
    setupComponent(instance);
    setupRenderEffect(instance, container, initialVnode);
}
function setupRenderEffect(instance, container, initialVnode) {
    // 使使用的render中的this指向代理对象
    const subTree = instance.render.call(instance.proxy);
    patch(subTree, container);
    // 当所有子节点挂载完毕，获取该组件的虚拟节点
    initialVnode.el = subTree.el;
}

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
    return vnode;
}
function getShapFlag(type) {
    return typeof type === "string"
        ? 1 /* ShapeFlags.ELEMENT */
        : 2 /* ShapeFlags.STATEFUL_COMPONENT */;
}

// 传入根组件
function createApp(rootComponent) {
    debugger;
    return {
        // 挂载到根容器
        mount(rootContainer) {
            // 所有节点都转为vnode再处理
            // rootComponent -> vnode
            const vnode = createVNode(rootComponent);
            render(vnode, rootContainer);
        },
    };
}

export { createApp, createVNode as h };
