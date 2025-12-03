/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest as BaseNextRequest, NextResponse } from 'next/server';

declare module 'next/server' {
  export interface NextRequest {
    cookies: {
      get(name: string): { value: string } | undefined;
      has(name: string): boolean;
    };
    headers: Headers;
    nextUrl: URL;
    url: string;
  }

  export class NextResponse extends Response {
    static redirect(url: string | URL, init?: ResponseInit): NextResponse;
    static rewrite(url: string | URL, init?: ResponseInit): NextResponse;
    static next(init?: ResponseInit): NextResponse;
  }
} 

// import type { NextRequest as BaseNextRequest, NextResponse } from 'next/server';

// declare module 'next/server' {
//   export interface NextRequest {
//     cookies: {
//       get(name: string): { value: string } | undefined;
//       has(name: string): boolean;
//     };
//     headers: Headers;
//     nextUrl: URL;
//     url: string;
//   }

//   export class NextResponse extends Response {
//     static redirect(url: string | URL, init?: ResponseInit): NextResponse;
//     static rewrite(url: string | URL, init?: ResponseInit): NextResponse;
//     static next(init?: ResponseInit): NextResponse;
//   }
// }
