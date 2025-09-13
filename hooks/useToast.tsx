import { showToast } from '@/Redux/slices/toastSlice'
import { useDispatch } from 'react-redux'

export const useToast = () => {
  const dispatch = useDispatch()

  const success = (message: string) => {
    dispatch(showToast({ message, type: 'success' }))
  }

  const error = (message: string) => {
    dispatch(showToast({ message, type: 'error' }))
  }

  const info = (message: string) => {
    dispatch(showToast({ message, type: 'info' }))
  }

  return { success, error, info }
}
