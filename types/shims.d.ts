declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}

declare module 'react' {
  export type ReactNode = any;
}

declare module 'next' {
  export type Route<T extends string = string> = T;
  export interface Metadata {
    title?: string;
    description?: string;
  }
  export interface NextConfig {
    experimental?: Record<string, unknown>;
  }
}

declare module 'next/link' {
  const Link: (props: any) => any;
  export default Link;
}

declare module 'next/navigation' {
  export function redirect(url: string): never;
  export function notFound(): never;
  export function usePathname(): string;
}

declare module 'next/cache' {
  export function revalidatePath(path: string): void;
}

declare module 'next/server' {
  export class NextResponse {
    static json(data: unknown): unknown;
  }
}

declare module 'node:fs/promises' {
  export function mkdir(path: string, options?: any): Promise<void>;
  export function readFile(path: string, encoding: string): Promise<string>;
  export function writeFile(path: string, data: string, encoding: string): Promise<void>;
}

declare module 'node:path' {
  const path: {
    join: (...parts: string[]) => string;
    dirname: (input: string) => string;
  };
  export default path;
}

declare const process: {
  cwd(): string;
};

declare const crypto: {
  randomUUID(): string;
};
