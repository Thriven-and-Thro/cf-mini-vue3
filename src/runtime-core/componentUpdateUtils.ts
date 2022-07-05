// props是否更新（这一版有bug，当点击组件更新后，元素更新在此处会被判断为true）
export const shouldUpdateComponent = (prevVNode, nextVNode) => {
  const { props: prevProps } = prevVNode;
  const { props: nextProps } = nextVNode;

  for (const key in nextProps) {
    if (prevProps[key] !== nextProps) {
      return true;
    }
    return false;
  }
};
