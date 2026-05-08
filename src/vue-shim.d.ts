declare module "vue" {
  export interface Ref<T = unknown> {
    value: T;
  }

  export interface App {
    provide<T>(key: unknown, value: T): void;
  }

  export function ref<T>(value: T): Ref<T>;
  export function shallowRef<T>(value: T): Ref<T>;
  export function readonly<T extends object>(value: T): T;
  export function computed<T>(getter: () => T): Readonly<Ref<T>>;
  export function watch<T>(source: Ref<T>, callback: (value: T, oldValue: T) => void): () => void;
  export function onMounted(callback: () => void): void;
  export function onUnmounted(callback: () => void): void;
  export function getCurrentInstance(): object | null;
  export function provide<T>(key: unknown, value: T): void;
  export function inject<T>(key: unknown): T | undefined;
  export function inject<T>(key: unknown, defaultValue: T): T;
}
