function createComponentInstance(vnode) {
    const component = {
        vnode,
    };
    return component;
}
function setupComponent(instance) {
    // 无状态组件的处理
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    const component = instance.vnode.type;
    const { setup } = component;
    if (setup) {
        const setupResult = setup();
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

function render(vnode, container) {
    patch(vnode, container);
}
function patch(vnode, container) {
    // 1.element 2.component
    if (typeof vnode.type === "string") {
        processElement(vnode, container);
    }
    else if (typeof vnode.type === "object") {
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
    const el = document.createElement(vnode.type);
    // 2.处理
    const { props, children } = vnode;
    // props
    for (const key in props) {
        el.setAttribute(key, props[key]);
    }
    // children
    // 1.string 2.array
    if (typeof children === "string") {
        el.textContent = children;
    }
    else if (Array.isArray(children)) {
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
function mountComponent(vnode, container) {
    const instance = createComponentInstance(vnode);
    // 实例组件的处理
    setupComponent(instance);
    setupRenderEffect(instance, container);
}
function setupRenderEffect(instance, container) {
    const subTree = instance.render();
    patch(subTree, container);
}

function createVNode(type, props, children) {
    return {
        type,
        props,
        children,
    };
}

// 传入根组件
function createApp(rootComponent) {
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
