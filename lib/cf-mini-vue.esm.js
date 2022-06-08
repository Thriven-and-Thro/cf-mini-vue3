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
    patch(vnode);
}
function patch(vnode, container) {
    processComponent(vnode);
}
function processComponent(vnode, container) {
    mountComponent(vnode);
}
function mountComponent(vnode, container) {
    const instance = createComponentInstance(vnode);
    // 实例组件的处理
    setupComponent(instance);
    setupRenderEffect(instance);
}
function setupRenderEffect(instance, container) {
    const subTree = instance.render();
    patch(subTree);
}

function createVNode(type, prop, children) {
    return {
        type,
        prop,
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
            render(vnode);
        },
    };
}

export { createApp, render as h, render };
