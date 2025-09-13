// components/ToastContainer.tsx
import { hideToast } from '@/Redux/slices/toastSlice'
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Toast from './Toast'

export default function ToastContainer () {
  const dispatch = useDispatch()
  const { visible, message, type } = useSelector((state: any) => state.toast)

  console.log('Displaying toast')

  const handleHide = () => {
    dispatch(hideToast())
  }

  return (
    <Toast
      message={message}
      type={type}
      visible={visible}
      onHide={handleHide}
    />
  )
}
