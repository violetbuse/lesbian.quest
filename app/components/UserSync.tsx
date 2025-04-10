"use client";

import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { syncUser } from "../actions/user";

export function UserSync() {
    const { isLoaded, isSignedIn } = useAuth();

    useEffect(() => {
        if (isLoaded && isSignedIn) {
            syncUser();
        }
    }, [isLoaded, isSignedIn]);

    return null;
} 