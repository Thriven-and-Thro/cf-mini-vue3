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
