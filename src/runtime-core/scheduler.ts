const queue: any[] = [];

export function queueJobs(job: any) {
  // 重复操作不需要重复进队列
  if (!queue.includes(job)) {
    queue.push(job);
  }

  queueFlush();
}

// 优化点：只创建一次promise
const p = Promise.resolve();

// 实际上就是一个异步任务而已
export function nextTick(fn: (...arg: any) => any): any {
  return fn ? p.then(fn) : p;
}

// 锁，只需在同步任务执行完后执行一次异步任务
let isFlushPending = false;

// 将patch渲染放入异步任务
function queueFlush() {
  if (!isFlushPending) {
    isFlushPending = true;

    nextTick(() => {
      isFlushPending = false;
      let job;

      while ((job = queue.shift())) {
        job && job();
      }
    });
  }
}
