import { defineAsyncComponent, AsyncComponentLoader, Component } from 'vue'
import { AsyncLoading, AsyncSkeletonLoading } from '@/components/GoLoading'

/**
 * * 动态注册组件
 */
export const componentInstall = <T> (key:string, node: T)  => {
  if(!window['$vue'].component(key) && node) {
    window['$vue'].component(key, node)
  }
}

export type LoadAsyncOptions = {
  /** Show GoLoading while the chunk loads. Default true for non-editor surfaces. */
  loading?: boolean
  delay?: number
  loadingComponent?: Component
}

/**
 * * 异步加载组件
 * @param loader
 * @param options loading=false avoids per-section spinners (prefer one shell loader)
 */
export const loadAsyncComponent = (
  loader: AsyncComponentLoader<any>,
  options: LoadAsyncOptions = {}
) => {
  const { loading = true, delay = 200, loadingComponent = AsyncLoading } = options
  return defineAsyncComponent({
    loader,
    delay,
    ...(loading ? { loadingComponent } : {})
  })
}
  
export const loadSkeletonAsyncComponent = (loader: AsyncComponentLoader<any>) =>
  defineAsyncComponent({
    loader,
    loadingComponent: AsyncSkeletonLoading,
    delay: 200,
  })
