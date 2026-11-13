"use client";
import {createContext,useContext} from "react";
export const SharedPreviewChrome=createContext(false);
export function useSharedPreviewChrome(){return useContext(SharedPreviewChrome);}
