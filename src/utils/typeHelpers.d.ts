/* eslint-disable @typescript-eslint/no-explicit-any */

export type ArrayType<T extends Array<any>> = T extends Array<infer U> ? U : never;

export type PromiseType<T extends Promise<any>> = T extends Promise<infer U> ? U : never;
