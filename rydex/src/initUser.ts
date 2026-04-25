'use client'

"use client";

import { useSession } from 'next-auth/react'
import useGetMe from './hooks/useGetMe'
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { setUserData } from "@/redux/userSlice";
import { useEffect } from "react";

function InitUser() {
  const { status } = useSession()
  const dispatch = useDispatch<AppDispatch>();

  // ✅ hook always called
  useGetMe(status === 'authenticated')

  // Ensure redux user is cleared on logout/session expiry
  // (useGetMe only populates data when authenticated)
  useEffect(() => {
    if (status !== "authenticated") dispatch(setUserData(null));
  }, [status, dispatch]);

  return null
}

export default InitUser
